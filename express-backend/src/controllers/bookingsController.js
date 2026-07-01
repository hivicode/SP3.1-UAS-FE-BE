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

const CANCELLABLE_STATUSES = new Set(["new", "contacted", "booking_fee_pending", "pending"]);

function normalizeInquiryCode(value) {
  return String(value || "").trim().toUpperCase();
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizePhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

function parseInquiryLookupPayload(payload = {}) {
  const code = normalizeInquiryCode(
    payload.kode_inquiry || payload.kodeInquiry || payload.code || payload.kode
  );
  const contact = String(payload.contact || payload.email || payload.telepon || payload.phone || "").trim();
  return { code, contact };
}

function contactMatches(row, contact) {
  const lookupEmail = normalizeEmail(contact);
  const lookupPhone = normalizePhone(contact);
  const rowEmail = normalizeEmail(row.email);
  const rowPhone = normalizePhone(row.telepon);

  return Boolean(
    (lookupEmail && rowEmail && lookupEmail === rowEmail) ||
    (lookupPhone && rowPhone && lookupPhone === rowPhone)
  );
}

function getInquiryNextAction(status, bookingFee) {
  if (status === "new") return "Admin PlanB akan menghubungi Anda untuk verifikasi minat.";
  if (status === "contacted") return "Admin sudah menghubungi. Lanjutkan komunikasi sesuai preferensi kontak.";
  if (status === "booking_fee_pending") {
    return bookingFee > 0
      ? "Jika booking fee sudah dibayar, tekan tombol Saya Sudah Bayar agar unit masuk status booked."
      : "Admin akan mengirim instruksi lanjutan jika Anda ingin booking unit.";
  }
  if (status === "reserved") return "Unit sudah booked. Hubungi admin jika ingin mengubah jadwal atau membatalkan.";
  if (status === "closed") return "Unit sudah terjual. Hubungi admin untuk dokumen atau detail lanjutan.";
  if (status === "cancelled") return "Inquiry ini sudah dibatalkan.";
  return "Hubungi admin PlanB untuk informasi lanjutan.";
}

function serializePublicInquiry(row) {
  const booking = serializeBooking(row);
  const status = normalizeInquiryStatus(booking.status, booking.booking_fee);
  const canCancel = CANCELLABLE_STATUSES.has(status);
  const canConfirmPayment = booking.booking_fee > 0 && CANCELLABLE_STATUSES.has(status);

  return {
    ...booking,
    status,
    can_cancel: canCancel,
    can_confirm_payment: canConfirmPayment,
    next_action: getInquiryNextAction(status, booking.booking_fee),
  };
}

async function findInquiryByCode(code) {
  const rows = await query(
    `SELECT b.*, p.nama_rumah, p.alamat, p.kota, p.harga
     FROM booking b
     LEFT JOIN properti p ON p.kode_rumah = b.kode_rumah
     WHERE UPPER(COALESCE(b.kode_inquiry, 'INQ-' || LPAD(b.id::text, 6, '0'))) = $1
     LIMIT 1`,
    [code]
  );
  return rows[0] || null;
}

async function cancelExpiredBookings() {
  try {
    await query(
      `UPDATE booking 
       SET status = 'cancelled' 
       WHERE status IN ('new', 'booking_fee_pending', 'pending') 
         AND dibuat_pada < CURRENT_TIMESTAMP - INTERVAL '3 days'`
    );
  } catch (err) {
    console.error("Failed to auto-cancel expired bookings:", err);
  }
}

async function findVerifiedPublicInquiry(payload) {
  await cancelExpiredBookings();
  const { code, contact } = parseInquiryLookupPayload(payload);
  if (!code || !contact) {
    return { error: { status: 400, message: "Isi kode inquiry dan email/nomor HP." } };
  }

  const inquiry = await findInquiryByCode(code);
  if (!inquiry || !contactMatches(inquiry, contact)) {
    return {
      error: {
        status: 404,
        message: "Inquiry tidak ditemukan. Cek kode inquiry dan kontak yang dipakai saat kirim minat.",
      },
    };
  }

  return { inquiry };
}

async function listBookings(_req, res, next) {
  try {
    await cancelExpiredBookings();
    const rows = await query(
      `SELECT b.*, p.nama_rumah, p.alamat, p.kota, p.harga
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
      `SELECT b.*, p.nama_rumah, p.alamat, p.kota, p.harga
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

async function checkInquiryStatus(req, res, next) {
  try {
    const result = await findVerifiedPublicInquiry(req.body || {});
    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    return res.json(serializePublicInquiry(result.inquiry));
  } catch (error) {
    return next(error);
  }
}

async function cancelInquiry(req, res, next) {
  try {
    const result = await findVerifiedPublicInquiry(req.body || {});
    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    const current = serializePublicInquiry(result.inquiry);
    if (!current.can_cancel) {
      return res.status(409).json({
        message: "Inquiry ini tidak bisa dibatalkan dari website. Hubungi admin PlanB untuk bantuan.",
        inquiry: current,
      });
    }

    await query("UPDATE booking SET status = 'cancelled' WHERE id = $1", [result.inquiry.id]);
    const updatedRows = await query(
      `SELECT b.*, p.nama_rumah, p.alamat, p.kota, p.harga
       FROM booking b
       LEFT JOIN properti p ON p.kode_rumah = b.kode_rumah
       WHERE b.id = $1`,
      [result.inquiry.id]
    );

    return res.json(serializePublicInquiry(updatedRows[0]));
  } catch (error) {
    return next(error);
  }
}

async function confirmInquiryPayment(req, res, next) {
  try {
    const result = await findVerifiedPublicInquiry(req.body || {});
    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    const current = serializePublicInquiry(result.inquiry);
    if (current.status === "reserved" || current.status === "closed") {
      return res.json(current);
    }
    if (current.status === "cancelled") {
      return res.status(409).json({
        message: "Inquiry sudah dibatalkan dan tidak bisa dikonfirmasi bayar.",
        inquiry: current,
      });
    }
    if (current.booking_fee <= 0) {
      return res.status(400).json({ message: "Inquiry ini tidak memiliki booking fee." });
    }

    const paymentNote = `[${new Date().toISOString()}] User menekan tombol Saya Sudah Bayar. Verifikasi pembayaran booking fee.`;
    const updatedNote = [String(result.inquiry.catatan || "").trim(), paymentNote]
      .filter(Boolean)
      .join("\n");

    await query("UPDATE booking SET status = 'reserved', catatan = $1 WHERE id = $2", [
      updatedNote,
      result.inquiry.id,
    ]);
    const updatedRows = await query(
      `SELECT b.*, p.nama_rumah, p.alamat, p.kota, p.harga
       FROM booking b
       LEFT JOIN properti p ON p.kode_rumah = b.kode_rumah
       WHERE b.id = $1`,
      [result.inquiry.id]
    );

    return res.json(serializePublicInquiry(updatedRows[0]));
  } catch (error) {
    return next(error);
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
      `SELECT b.*, p.nama_rumah, p.alamat, p.kota, p.harga
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
  checkInquiryStatus,
  cancelInquiry,
  confirmInquiryPayment,
  updateBookingStatus,
};
