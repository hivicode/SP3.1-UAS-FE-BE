const { pool, query } = require("../db/pool");
const { serializeBooking, BOOKING_STATUSES, toInt } = require("../utils/helpers");
const { randomBytes } = require("crypto");

function generateInquiryCode() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = randomBytes(3).toString("hex").toUpperCase();
  return `INQ-${datePart}-${randomPart}`;
}

function normalizeInquiryStatus(status, bookingFee) {
  const normalized = String(status || "").trim().toLowerCase();
  if (BOOKING_STATUSES.has(normalized)) {
    if (normalized === "pending") return "new";
    if (normalized === "confirmed") return "closed";
    return normalized;
  }
  return bookingFee > 0 ? "booking_fee_pending" : "new";
}

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
  const client = await pool.connect();
  try {
    const payload = req.body || {};
    const requiredFields = [
      "kode_rumah",
      "nama_depan",
      "email",
      "telepon",
    ];
    const missing = requiredFields.filter((field) => !String(payload[field] ?? "").trim());
    if (missing.length > 0) {
      return res.status(400).json({ message: "Data inquiry belum lengkap.", missing });
    }

    const propertyResult = await client.query(
      "SELECT kode_rumah FROM properti WHERE kode_rumah = $1",
      [payload.kode_rumah]
    );
    const propertyRows = propertyResult.rows;
    if (propertyRows.length === 0) {
      return res.status(404).json({ message: "Properti tidak ditemukan" });
    }

    const bookingFee = Math.max(0, toInt(payload.booking_fee, 0));
    const status = normalizeInquiryStatus(payload.status, bookingFee);
    const metodePembayaran = bookingFee > 0
      ? String(payload.metode_pembayaran || "qris").trim()
      : "Belum memilih";
    const kodeInquiry = generateInquiryCode();
    const jadwalKunjungan = String(payload.jadwal_kunjungan || "").trim() || null;
    const catatan = String(payload.catatan || "").trim();
    const preferensiKontak = String(payload.preferensi_kontak || "whatsapp").trim().toLowerCase();

    const insertResult = await client.query(
      `INSERT INTO booking (
        kode_inquiry, kode_rumah, nama_depan, nama_belakang, email, telepon,
        metode_pembayaran, booking_fee, status, catatan, jadwal_kunjungan,
        preferensi_kontak, dibuat_pada
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW())
       RETURNING id`,
      [
        kodeInquiry,
        String(payload.kode_rumah).trim(),
        String(payload.nama_depan).trim(),
        String(payload.nama_belakang || "").trim(),
        String(payload.email).trim(),
        String(payload.telepon).trim(),
        metodePembayaran,
        bookingFee,
        status,
        catatan,
        jadwalKunjungan,
        preferensiKontak,
      ]
    );

    const bookingId = insertResult.rows[0].id;
    const rowsResult = await client.query(
      `SELECT b.*, p.nama_rumah, p.alamat, p.kota
       FROM booking b
       JOIN properti p ON p.kode_rumah = b.kode_rumah
       WHERE b.id = $1`,
      [bookingId]
    );

    return res.status(201).json(serializeBooking(rowsResult.rows[0]));
  } catch (error) {
    return next(error);
  } finally {
    client.release();
  }
}

async function updateBookingStatus(req, res, next) {
  try {
    const bookingId = Number(req.params.bookingId);
    if (!Number.isFinite(bookingId)) {
      return res.status(400).json({ message: "Inquiry id tidak valid" });
    }

    const newStatus = String(req.body?.status || "").trim().toLowerCase();
    if (!BOOKING_STATUSES.has(newStatus)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }

    const exists = await query("SELECT id FROM booking WHERE id = $1", [bookingId]);
    if (exists.length === 0) {
      return res.status(404).json({ message: "Inquiry tidak ditemukan" });
    }

    const normalizedStatus =
      newStatus === "pending" ? "new" : newStatus === "confirmed" ? "closed" : newStatus;
    await query("UPDATE booking SET status = $1 WHERE id = $2", [normalizedStatus, bookingId]);
    const rows = await query(
      `SELECT b.*, p.nama_rumah, p.alamat, p.kota
       FROM booking b
       JOIN properti p ON p.kode_rumah = b.kode_rumah
       WHERE b.id = $1`,
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
