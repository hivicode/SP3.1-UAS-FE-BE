const { pool, query } = require("../db/pool");
const { serializeBooking, BOOKING_STATUSES, toInt } = require("../utils/helpers");

async function listBookings(_req, res, next) {
  try {
    const rows = await query(
      `SELECT b.*, p.nama_rumah, p.alamat, p.kota
       FROM booking b
       JOIN properti p ON p.kode_rumah = b.kode_rumah
       ORDER BY b.dibuat_pada DESC`
    );
    return res.json(rows.map((row) => serializeBooking(row)));
  } catch (error) {
    return next(error);
  }
}

async function createBooking(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const payload = req.body || {};
    const requiredFields = [
      "kode_rumah",
      "nama_depan",
      "nama_belakang",
      "email",
      "telepon",
      "metode_pembayaran",
      "booking_fee",
    ];
    const missing = requiredFields.filter((field) => !String(payload[field] ?? "").trim());
    if (missing.length > 0) {
      return res.status(400).json({ message: "Data booking belum lengkap.", missing });
    }

    const [propertyRows] = await connection.execute(
      "SELECT kode_rumah FROM properti WHERE kode_rumah = ?",
      [payload.kode_rumah]
    );
    if (propertyRows.length === 0) {
      return res.status(404).json({ message: "Properti tidak ditemukan" });
    }

    const status = String(payload.status || "pending").trim().toLowerCase() || "pending";
    const [insert] = await connection.execute(
      `INSERT INTO booking (
        kode_rumah, nama_depan, nama_belakang, email, telepon,
        metode_pembayaran, booking_fee, status, dibuat_pada
      ) VALUES (?,?,?,?,?,?,?, ?, NOW())`,
      [
        String(payload.kode_rumah).trim(),
        String(payload.nama_depan).trim(),
        String(payload.nama_belakang).trim(),
        String(payload.email).trim(),
        String(payload.telepon).trim(),
        String(payload.metode_pembayaran).trim(),
        toInt(payload.booking_fee),
        BOOKING_STATUSES.has(status) ? status : "pending",
      ]
    );

    const bookingId = insert.insertId;
    const [rows] = await connection.execute(
      `SELECT b.*, p.nama_rumah, p.alamat, p.kota
       FROM booking b
       JOIN properti p ON p.kode_rumah = b.kode_rumah
       WHERE b.id = ?`,
      [bookingId]
    );

    return res.status(201).json(serializeBooking(rows[0]));
  } catch (error) {
    return next(error);
  } finally {
    connection.release();
  }
}

async function updateBookingStatus(req, res, next) {
  try {
    const bookingId = Number(req.params.bookingId);
    if (!Number.isFinite(bookingId)) {
      return res.status(400).json({ message: "Booking id tidak valid" });
    }

    const newStatus = String(req.body?.status || "").trim().toLowerCase();
    if (!BOOKING_STATUSES.has(newStatus)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }

    const exists = await query("SELECT id FROM booking WHERE id = ?", [bookingId]);
    if (exists.length === 0) {
      return res.status(404).json({ message: "Booking tidak ditemukan" });
    }

    await query("UPDATE booking SET status = ? WHERE id = ?", [newStatus, bookingId]);
    const rows = await query(
      `SELECT b.*, p.nama_rumah, p.alamat, p.kota
       FROM booking b
       JOIN properti p ON p.kode_rumah = b.kode_rumah
       WHERE b.id = ?`,
      [bookingId]
    );
    return res.json(serializeBooking(rows[0]));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listBookings,
  createBooking,
  updateBookingStatus,
};
