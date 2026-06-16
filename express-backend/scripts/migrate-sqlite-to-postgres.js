const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { pool } = require("../src/db/pool");
const { runMigrations } = require("../src/db/migrate");
const { parseFitur } = require("../src/utils/helpers");

const sqlitePath =
  process.argv[2] || path.resolve(__dirname, "../../Backend/data.db");

function openSqliteDatabase(filePath) {
  return new sqlite3.Database(filePath);
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) reject(error);
      else resolve(rows);
    });
  });
}

async function migrate() {
  const db = openSqliteDatabase(sqlitePath);
  const client = await pool.connect();
  try {
    await runMigrations();

    const properties = await all(db, "SELECT * FROM properti");
    const images = await all(db, "SELECT * FROM properti_gambar");
    const bookings = await all(db, "SELECT * FROM booking");

    await client.query("BEGIN");
    await client.query("TRUNCATE TABLE booking, properti_gambar, properti RESTART IDENTITY CASCADE");

    for (const row of properties) {
      await client.query(
        `INSERT INTO properti (
          kode_rumah, nama_rumah, alamat, kota, tipe, harga, rating,
          kamar_tidur, kamar_mandi, luas_tanah, luas_bangunan, garasi, fitur, deskripsi
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14)`,
        [
          row.kode_rumah,
          row.nama_rumah,
          row.alamat,
          row.kota,
          row.tipe,
          row.harga || 0,
          row.rating || 0,
          row.kamar_tidur || 0,
          row.kamar_mandi || 0,
          row.luas_tanah || 0,
          row.luas_bangunan || 0,
          row.garasi || 0,
          JSON.stringify(parseFitur(row.fitur)),
          row.deskripsi || "",
        ]
      );
    }

    for (const row of images) {
      await client.query(
        "INSERT INTO properti_gambar (kode_rumah, filename) VALUES ($1, $2)",
        [row.kode_rumah, row.filename]
      );
    }

    for (const row of bookings) {
      await client.query(
        `INSERT INTO booking (
          id, kode_rumah, nama_depan, nama_belakang, email, telepon,
          metode_pembayaran, booking_fee, status, dibuat_pada
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          row.id,
          row.kode_rumah,
          row.nama_depan,
          row.nama_belakang,
          row.email,
          row.telepon,
          row.metode_pembayaran,
          row.booking_fee || 0,
          row.status || "pending",
          row.dibuat_pada || new Date().toISOString(),
        ]
      );
    }

    await client.query(
      "SELECT setval(pg_get_serial_sequence('booking', 'id'), COALESCE((SELECT MAX(id) FROM booking), 1), true)"
    );

    await client.query("COMMIT");
    console.log("SQLite migration completed.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", error);
    process.exitCode = 1;
  } finally {
    db.close();
    client.release();
    await pool.end();
  }
}

migrate();
