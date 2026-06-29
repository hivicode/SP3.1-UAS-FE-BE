const fs = require("fs");
const path = require("path");
const { pool } = require("../src/db/pool");
const { uploadImageFile, removeImagesFromStorage } = require("../src/storage/supabaseStorage");

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const PROPERTIES = [
  {
    kode_rumah: "PHS-001",
    nama_rumah: "Pension Hoshi-no-suna",
    alamat: "Cluster PlanB, area hunian tropis",
    kota: "Okinawa",
    tipe: "villa",
    harga: 1250000000,
    rating: 4.8,
    kamar_tidur: 3,
    kamar_mandi: 2,
    luas_tanah: 180,
    luas_bangunan: 120,
    garasi: 1,
    fitur: ["parking", "garden", "pool"],
    deskripsi:
      "Hunian bergaya tropis dengan suasana resort yang tenang, cocok untuk keluarga kecil yang mencari rumah nyaman dengan area luar yang lapang.",
    folder: "C:\\Users\\Bintang\\Downloads\\Pension Hoshi-no-suna",
  },
  {
    kode_rumah: "NKR-001",
    nama_rumah: "Nankuru",
    alamat: "Cluster PlanB, area hunian privat",
    kota: "Okinawa",
    tipe: "house",
    harga: 980000000,
    rating: 4.7,
    kamar_tidur: 2,
    kamar_mandi: 2,
    luas_tanah: 150,
    luas_bangunan: 96,
    garasi: 1,
    fitur: ["parking", "garden"],
    deskripsi:
      "Rumah compact dengan karakter hangat dan ruang yang efisien, cocok untuk pasangan atau keluarga baru yang ingin tinggal di lingkungan tenang.",
    folder: "C:\\Users\\Bintang\\Downloads\\Nankuru",
  },
];

function listImageFiles(folder) {
  if (!fs.existsSync(folder)) {
    throw new Error(`Folder tidak ditemukan: ${folder}`);
  }

  return fs
    .readdirSync(folder, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(folder, entry.name))
    .filter((filePath) => IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase()))
    .sort((a, b) => fs.statSync(b).size - fs.statSync(a).size);
}

function mimeTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

async function upsertProperty(client, property) {
  await client.query(
    `INSERT INTO properti (
      kode_rumah, nama_rumah, alamat, kota, tipe, harga, rating,
      kamar_tidur, kamar_mandi, luas_tanah, luas_bangunan, garasi, fitur, deskripsi
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14)
    ON CONFLICT (kode_rumah) DO UPDATE SET
      nama_rumah = EXCLUDED.nama_rumah,
      alamat = EXCLUDED.alamat,
      kota = EXCLUDED.kota,
      tipe = EXCLUDED.tipe,
      harga = EXCLUDED.harga,
      rating = EXCLUDED.rating,
      kamar_tidur = EXCLUDED.kamar_tidur,
      kamar_mandi = EXCLUDED.kamar_mandi,
      luas_tanah = EXCLUDED.luas_tanah,
      luas_bangunan = EXCLUDED.luas_bangunan,
      garasi = EXCLUDED.garasi,
      fitur = EXCLUDED.fitur,
      deskripsi = EXCLUDED.deskripsi`,
    [
      property.kode_rumah,
      property.nama_rumah,
      property.alamat,
      property.kota,
      property.tipe,
      property.harga,
      property.rating,
      property.kamar_tidur,
      property.kamar_mandi,
      property.luas_tanah,
      property.luas_bangunan,
      property.garasi,
      JSON.stringify(property.fitur),
      property.deskripsi,
    ]
  );
}

async function importProperty(property) {
  const imageFiles = listImageFiles(property.folder);
  if (imageFiles.length === 0) {
    throw new Error(`Tidak ada gambar di folder ${property.folder}`);
  }

  const oldRows = await pool.query("SELECT filename FROM properti_gambar WHERE kode_rumah = $1", [
    property.kode_rumah,
  ]);
  const oldImages = oldRows.rows.map((row) => row.filename);
  const uploaded = [];

  try {
    for (const filePath of imageFiles) {
      const result = await uploadImageFile(
        {
          originalname: path.basename(filePath),
          mimetype: mimeTypeFor(filePath),
          buffer: fs.readFileSync(filePath),
        },
        `properties/${property.kode_rumah}`
      );
      uploaded.push(result.publicUrl);
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await upsertProperty(client, property);
      await client.query("DELETE FROM properti_gambar WHERE kode_rumah = $1", [
        property.kode_rumah,
      ]);
      for (const publicUrl of uploaded) {
        await client.query("INSERT INTO properti_gambar (kode_rumah, filename) VALUES ($1, $2)", [
          property.kode_rumah,
          publicUrl,
        ]);
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      throw error;
    } finally {
      client.release();
    }

    if (oldImages.length > 0) {
      await removeImagesFromStorage(oldImages).catch(() => {});
    }

    console.log(`${property.kode_rumah} imported: ${property.nama_rumah} (${uploaded.length} images)`);
  } catch (error) {
    if (uploaded.length > 0) {
      await removeImagesFromStorage(uploaded).catch(() => {});
    }
    throw error;
  }
}

async function main() {
  for (const property of PROPERTIES) {
    await importProperty(property);
  }

  const verify = await pool.query(
    `SELECT p.kode_rumah, p.nama_rumah, p.harga, COUNT(g.id)::int AS image_count
     FROM properti p
     LEFT JOIN properti_gambar g ON g.kode_rumah = p.kode_rumah
     WHERE p.kode_rumah = ANY($1)
     GROUP BY p.kode_rumah, p.nama_rumah, p.harga
     ORDER BY p.kode_rumah`,
    [PROPERTIES.map((property) => property.kode_rumah)]
  );
  console.log(JSON.stringify(verify.rows, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
