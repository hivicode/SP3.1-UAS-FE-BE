const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { query, pool } = require("../db/pool");
const {
  parseFitur,
  toInt,
  toFloat,
  serializeProperty,
  isAllowedImage,
} = require("../utils/helpers");
const { uploadDir } = require("../config");

function absoluteFileFromPublicUrl(publicPath = "") {
  const filename = publicPath.replace(/^\/uploads\//, "");
  return path.join(uploadDir, filename);
}

async function getPropertyImages(kodeRumah) {
  const rows = await query(
    "SELECT filename FROM properti_gambar WHERE kode_rumah = ? ORDER BY id ASC",
    [kodeRumah]
  );
  return rows.map((row) => `/uploads/${row.filename}`);
}

async function getPropertyStatus(kodeRumah) {
  const rows = await query(
    "SELECT status FROM booking WHERE kode_rumah = ? ORDER BY id DESC LIMIT 1",
    [kodeRumah]
  );
  const row = rows[0];
  if (!row) return "available";

  const status = String(row.status || "").toLowerCase();
  if (status === "confirmed") return "sold";
  if (status === "pending") return "onbook";
  return "available";
}

function saveImageFiles(files) {
  return files
    .filter((file) => file && file.originalname && isAllowedImage(file.originalname))
    .map((file) => file.filename);
}

function removeImages(publicPaths = []) {
  for (const publicPath of publicPaths) {
    const target = absoluteFileFromPublicUrl(publicPath);
    if (fs.existsSync(target)) {
      fs.unlinkSync(target);
    }
  }
}

async function listProperties(req, res, next) {
  try {
    const q = String(req.query.q || "").trim();
    const sql = q
      ? `SELECT * FROM properti
         WHERE nama_rumah LIKE ? OR alamat LIKE ? OR kota LIKE ?
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
    const rows = await query("SELECT * FROM properti WHERE kode_rumah = ?", [kode]);
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
  const connection = await pool.getConnection();
  try {
    const payload = req.body || {};
    const kodeRumah = String(payload.kode_rumah || "").trim();
    if (!kodeRumah) {
      return res.status(400).json({ message: "kode_rumah wajib diisi" });
    }

    const fitur = parseFitur(payload.fitur);
    await connection.beginTransaction();
    await connection.execute(
      `INSERT INTO properti (
        kode_rumah, nama_rumah, alamat, kota, tipe, harga, rating,
        kamar_tidur, kamar_mandi, luas_tanah, luas_bangunan, garasi, fitur, deskripsi
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,CAST(? AS JSON),?)`,
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

    const filenames = saveImageFiles(req.files || []);
    for (const filename of filenames) {
      await connection.execute(
        "INSERT INTO properti_gambar (kode_rumah, filename) VALUES (?, ?)",
        [kodeRumah, filename]
      );
    }
    await connection.commit();

    const rows = await query("SELECT * FROM properti WHERE kode_rumah = ?", [kodeRumah]);
    const row = rows[0];
    const images = await getPropertyImages(kodeRumah);
    return res.status(201).json(serializeProperty(row, images, "available"));
  } catch (error) {
    await connection.rollback();
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "kode_rumah sudah terpakai" });
    }
    return next(error);
  } finally {
    connection.release();
  }
}

async function updateProperty(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const { kode } = req.params;
    const [existingRows] = await connection.execute(
      "SELECT * FROM properti WHERE kode_rumah = ?",
      [kode]
    );
    const existing = existingRows[0];
    if (!existing) {
      return res.status(404).json({ message: "Properti tidak ditemukan" });
    }

    const payload = req.body || {};
    const fitur = parseFitur(payload.fitur ?? existing.fitur ?? []);

    await connection.beginTransaction();
    await connection.execute(
      `UPDATE properti SET
         nama_rumah = ?,
         alamat = ?,
         kota = ?,
         tipe = ?,
         harga = ?,
         rating = ?,
         kamar_tidur = ?,
         kamar_mandi = ?,
         luas_tanah = ?,
         luas_bangunan = ?,
         garasi = ?,
         fitur = CAST(? AS JSON),
         deskripsi = ?
       WHERE kode_rumah = ?`,
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

    const incomingFiles = saveImageFiles(req.files || []);
    if (incomingFiles.length > 0) {
      const [oldImageRows] = await connection.execute(
        "SELECT filename FROM properti_gambar WHERE kode_rumah = ?",
        [kode]
      );
      await connection.execute("DELETE FROM properti_gambar WHERE kode_rumah = ?", [kode]);
      removeImages(oldImageRows.map((row) => `/uploads/${row.filename}`));

      for (const filename of incomingFiles) {
        await connection.execute(
          "INSERT INTO properti_gambar (kode_rumah, filename) VALUES (?, ?)",
          [kode, filename]
        );
      }
    }

    await connection.commit();

    const updatedRow = (await query("SELECT * FROM properti WHERE kode_rumah = ?", [kode]))[0];
    const images = await getPropertyImages(kode);
    return res.json(serializeProperty(updatedRow, images, await getPropertyStatus(kode)));
  } catch (error) {
    await connection.rollback();
    return next(error);
  } finally {
    connection.release();
  }
}

async function deleteProperty(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const { kode } = req.params;
    const [imageRows] = await connection.execute(
      "SELECT filename FROM properti_gambar WHERE kode_rumah = ?",
      [kode]
    );

    await connection.execute("DELETE FROM properti WHERE kode_rumah = ?", [kode]);
    removeImages(imageRows.map((row) => `/uploads/${row.filename}`));
    return res.json({ message: "Properti dihapus" });
  } catch (error) {
    return next(error);
  } finally {
    connection.release();
  }
}

function uploadFilename(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  cb(null, `${uuidv4().replace(/-/g, "")}${ext}`);
}

module.exports = {
  listProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadFilename,
};
