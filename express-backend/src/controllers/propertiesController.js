const { query, pool } = require("../db/pool");
const {
  parseFitur,
  toInt,
  toFloat,
  serializeProperty,
  isAllowedImage,
} = require("../utils/helpers");
const { uploadImageFile, removeImagesFromStorage } = require("../storage/supabaseStorage");

async function getPropertyImages(kodeRumah) {
  const rows = await query(
    "SELECT filename FROM properti_gambar WHERE kode_rumah = $1 ORDER BY id ASC",
    [kodeRumah]
  );
  return rows.map((row) => row.filename);
}

async function getPropertyStatus(kodeRumah) {
  const rows = await query(
    "SELECT status FROM booking WHERE kode_rumah = $1 ORDER BY id DESC LIMIT 1",
    [kodeRumah]
  );
  const row = rows[0];
  if (!row) return "available";

  const status = String(row.status || "").toLowerCase();
  if (status === "confirmed") return "sold";
  if (status === "pending") return "onbook";
  return "available";
}

async function uploadImageFiles(files, kodeRumah) {
  const validFiles = files
    .filter((file) => file && file.originalname && isAllowedImage(file.originalname))
    .filter((file) => file.buffer && file.buffer.length > 0);

  const uploads = [];
  for (const file of validFiles) {
    uploads.push(await uploadImageFile(file, `properties/${kodeRumah}`));
  }

  return uploads;
}

async function listProperties(req, res, next) {
  try {
    const q = String(req.query.q || "").trim();
    const sql = q
      ? `SELECT * FROM properti
         WHERE nama_rumah ILIKE $1 OR alamat ILIKE $2 OR kota ILIKE $3
         ORDER BY nama_rumah ASC`
      : "SELECT * FROM properti ORDER BY nama_rumah ASC";
    const params = q ? [`%${q}%`, `%${q}%`, `%${q}%`] : [];
    const propertyRows = await query(sql, params);

    const data = await Promise.all(
      propertyRows.map(async (row) => {
        const [images, status] = await Promise.all([
          getPropertyImages(row.kode_rumah),
          getPropertyStatus(row.kode_rumah),
        ]);
        return serializeProperty(row, images, status);
      })
    );
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function getProperty(req, res, next) {
  try {
    const { kode } = req.params;
    const rows = await query("SELECT * FROM properti WHERE kode_rumah = $1", [kode]);
    const row = rows[0];
    if (!row) {
      return res.status(404).json({ message: "Properti tidak ditemukan" });
    }

    const [images, status] = await Promise.all([
      getPropertyImages(kode),
      getPropertyStatus(kode),
    ]);
    return res.json(serializeProperty(row, images, status));
  } catch (error) {
    return next(error);
  }
}

async function createProperty(req, res, next) {
  const client = await pool.connect();
  let kodeRumah = "";
  const uploadedImages = [];
  try {
    const payload = req.body || {};
    kodeRumah = String(payload.kode_rumah || "").trim();
    if (!kodeRumah) {
      return res.status(400).json({ message: "kode_rumah wajib diisi" });
    }

    const fitur = parseFitur(payload.fitur);
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO properti (
        kode_rumah, nama_rumah, alamat, kota, tipe, harga, rating,
        kamar_tidur, kamar_mandi, luas_tanah, luas_bangunan, garasi, fitur, deskripsi
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14)`,
      [
        kodeRumah,
        String(payload.nama_rumah || "").trim(),
        String(payload.alamat || "").trim(),
        String(payload.kota || "").trim(),
        String(payload.tipe || "").trim(),
        toInt(payload.harga),
        toFloat(payload.rating),
        toInt(payload.kamar_tidur),
        toInt(payload.kamar_mandi),
        toInt(payload.luas_tanah),
        toInt(payload.luas_bangunan),
        toInt(payload.garasi),
        JSON.stringify(fitur),
        String(payload.deskripsi || "").trim(),
      ]
    );

    uploadedImages.push(...(await uploadImageFiles(req.files || [], kodeRumah)));
    for (const image of uploadedImages) {
      await client.query(
        "INSERT INTO properti_gambar (kode_rumah, filename) VALUES ($1, $2)",
        [kodeRumah, image.publicUrl]
      );
    }
    await client.query("COMMIT");

    const rows = await query("SELECT * FROM properti WHERE kode_rumah = $1", [kodeRumah]);
    const row = rows[0];
    const images = await getPropertyImages(kodeRumah);
    return res.status(201).json(serializeProperty(row, images, "available"));
  } catch (error) {
    await client.query("ROLLBACK");
    if (uploadedImages.length > 0) {
      await removeImagesFromStorage(uploadedImages.map((image) => image.publicUrl)).catch(() => {});
    }
    if (error.code === "23505") {
      return res.status(400).json({ message: "kode_rumah sudah terpakai" });
    }
    return next(error);
  } finally {
    client.release();
  }
}

async function updateProperty(req, res, next) {
  const client = await pool.connect();
  const uploadedImages = [];
  let oldImageUrls = [];
  try {
    const { kode } = req.params;
    const existingResult = await client.query(
      "SELECT * FROM properti WHERE kode_rumah = $1",
      [kode]
    );
    const existingRows = existingResult.rows;
    const existing = existingRows[0];
    if (!existing) {
      return res.status(404).json({ message: "Properti tidak ditemukan" });
    }

    const payload = req.body || {};
    const fitur = parseFitur(payload.fitur ?? existing.fitur ?? []);

    await client.query("BEGIN");
    await client.query(
      `UPDATE properti SET
         nama_rumah = $1,
         alamat = $2,
         kota = $3,
         tipe = $4,
         harga = $5,
         rating = $6,
         kamar_tidur = $7,
         kamar_mandi = $8,
         luas_tanah = $9,
         luas_bangunan = $10,
         garasi = $11,
         fitur = $12::jsonb,
         deskripsi = $13
       WHERE kode_rumah = $14`,
      [
        String(payload.nama_rumah ?? existing.nama_rumah).trim(),
        String(payload.alamat ?? existing.alamat).trim(),
        String(payload.kota ?? existing.kota).trim(),
        String(payload.tipe ?? existing.tipe).trim(),
        toInt(payload.harga, existing.harga),
        toFloat(payload.rating, existing.rating),
        toInt(payload.kamar_tidur, existing.kamar_tidur),
        toInt(payload.kamar_mandi, existing.kamar_mandi),
        toInt(payload.luas_tanah, existing.luas_tanah),
        toInt(payload.luas_bangunan, existing.luas_bangunan),
        toInt(payload.garasi, existing.garasi),
        JSON.stringify(fitur),
        String(payload.deskripsi ?? existing.deskripsi ?? "").trim(),
        kode,
      ]
    );

    const incomingFiles = (req.files || [])
      .filter((file) => file && file.originalname && isAllowedImage(file.originalname))
      .filter((file) => file.buffer && file.buffer.length > 0);
    if (incomingFiles.length > 0) {
      const oldImageResult = await client.query(
        "SELECT filename FROM properti_gambar WHERE kode_rumah = $1",
        [kode]
      );
      const oldImageRows = oldImageResult.rows;
      oldImageUrls = oldImageRows.map((row) => row.filename);
      uploadedImages.push(...(await uploadImageFiles(incomingFiles, kode)));
      await client.query("DELETE FROM properti_gambar WHERE kode_rumah = $1", [kode]);

      for (const image of uploadedImages) {
        await client.query(
          "INSERT INTO properti_gambar (kode_rumah, filename) VALUES ($1, $2)",
          [kode, image.publicUrl]
        );
      }
    }

    await client.query("COMMIT");
    if (oldImageUrls.length > 0) {
      await removeImagesFromStorage(oldImageUrls).catch(() => {});
    }

    const updatedRow = (await query("SELECT * FROM properti WHERE kode_rumah = $1", [kode]))[0];
    const images = await getPropertyImages(kode);
    return res.json(serializeProperty(updatedRow, images, await getPropertyStatus(kode)));
  } catch (error) {
    await client.query("ROLLBACK");
    if (uploadedImages.length > 0) {
      await removeImagesFromStorage(uploadedImages.map((image) => image.publicUrl)).catch(() => {});
    }
    return next(error);
  } finally {
    client.release();
  }
}

async function deleteProperty(req, res, next) {
  const client = await pool.connect();
  try {
    const { kode } = req.params;
    const imageResult = await client.query(
      "SELECT filename FROM properti_gambar WHERE kode_rumah = $1",
      [kode]
    );
    const imageRows = imageResult.rows;

    await client.query("BEGIN");
    await client.query("DELETE FROM properti WHERE kode_rumah = $1", [kode]);
    await client.query("COMMIT");
    await removeImagesFromStorage(imageRows.map((row) => row.filename)).catch(() => {});
    return res.json({ message: "Properti dihapus" });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    return next(error);
  } finally {
    client.release();
  }
}

module.exports = {
  listProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
};
