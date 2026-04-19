const path = require("path");

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);
const BOOKING_STATUSES = new Set(["pending", "confirmed", "cancelled"]);

function parseFitur(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw.map((value) => String(value).trim()).filter(Boolean);
  }

  const text = String(raw).trim();
  if (!text) return [];

  if (text.startsWith("[")) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed.map((value) => String(value).trim()).filter(Boolean);
      }
    } catch (_error) {
      // fallback to comma split below
    }
  }

  return text.split(",").map((value) => value.trim()).filter(Boolean);
}

function toInt(value, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toFloat(value, fallback = 0) {
  const parsed = Number.parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isAllowedImage(filename = "") {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext);
}

function serializeProperty(row, images, status = "available") {
  return {
    kode_rumah: row.kode_rumah,
    nama_rumah: row.nama_rumah,
    alamat: row.alamat,
    kota: row.kota,
    tipe: row.tipe,
    harga: Number(row.harga),
    rating: Number(row.rating || 0),
    kamar_tidur: Number(row.kamar_tidur),
    kamar_mandi: Number(row.kamar_mandi),
    luas_tanah: Number(row.luas_tanah),
    luas_bangunan: Number(row.luas_bangunan),
    garasi: Number(row.garasi),
    fitur: Array.isArray(row.fitur) ? row.fitur : parseFitur(row.fitur),
    gambar: images,
    status,
    deskripsi: row.deskripsi || "",
  };
}

function serializeBooking(row) {
  return {
    id: Number(row.id),
    kode_rumah: row.kode_rumah,
    nama_depan: row.nama_depan,
    nama_belakang: row.nama_belakang,
    email: row.email,
    telepon: row.telepon,
    metode_pembayaran: row.metode_pembayaran,
    booking_fee: Number(row.booking_fee),
    status: row.status,
    dibuat_pada:
      row.dibuat_pada instanceof Date ? row.dibuat_pada.toISOString() : row.dibuat_pada,
    nama_rumah: row.nama_rumah,
    alamat: row.alamat,
    kota: row.kota,
  };
}

module.exports = {
  ALLOWED_EXTENSIONS,
  BOOKING_STATUSES,
  parseFitur,
  toInt,
  toFloat,
  isAllowedImage,
  serializeProperty,
  serializeBooking,
};
