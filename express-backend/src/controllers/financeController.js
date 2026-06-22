const { query } = require("../db/pool");
const { toInt } = require("../utils/helpers");

const MONTH_LABELS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function parseYear(rawYear) {
  const year = toInt(rawYear, new Date().getFullYear());
  return Math.min(2100, Math.max(2000, year));
}

function parseMonth(rawMonth) {
  const month = toInt(rawMonth, 0);
  return Math.min(12, Math.max(1, month));
}

function parseDateInput(rawDate) {
  const text = String(rawDate || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return new Date().toISOString().slice(0, 10);
  }
  return text;
}

function normalizeTransactionType(rawType) {
  const type = String(rawType || "").trim().toLowerCase();
  if (["income", "in", "masuk", "pemasukan"].includes(type)) return "pemasukan";
  if (["expense", "out", "keluar", "pengeluaran"].includes(type)) return "pengeluaran";
  return "";
}

function serializeFinanceTransaction(row) {
  return {
    id: Number(row.id),
    tanggal:
      row.tanggal instanceof Date ? row.tanggal.toISOString().slice(0, 10) : row.tanggal,
    tipe: row.tipe,
    kategori: row.kategori,
    deskripsi: row.deskripsi || "",
    jumlah: Number(row.jumlah || 0),
    sumber: row.sumber || "manual",
    source_ref: row.source_ref || null,
    dibuat_pada:
      row.dibuat_pada instanceof Date ? row.dibuat_pada.toISOString() : row.dibuat_pada,
    diperbarui_pada:
      row.diperbarui_pada instanceof Date
        ? row.diperbarui_pada.toISOString()
        : row.diperbarui_pada,
  };
}

function serializeAutomaticIncome(row) {
  return {
    bulan: Number(row.bulan),
    tanggal:
      row.tanggal instanceof Date ? row.tanggal.toISOString() : row.tanggal,
    kategori: row.kategori,
    jumlah: Number(row.jumlah || 0),
    booking_id: Number(row.booking_id),
    kode_inquiry: row.kode_inquiry,
    kode_rumah: row.kode_rumah,
    nama_rumah: row.nama_rumah,
    status: row.status,
  };
}

async function getFinanceReport(req, res, next) {
  try {
    const year = parseYear(req.query.year);

    const automaticIncomeRows = await query(
      `SELECT
         EXTRACT(MONTH FROM b.dibuat_pada)::int AS bulan,
         b.dibuat_pada AS tanggal,
         CASE WHEN b.status = 'closed' THEN 'Penjualan rumah' ELSE 'Booking fee' END AS kategori,
         CASE WHEN b.status = 'closed' THEN p.harga ELSE b.booking_fee END AS jumlah,
         b.id AS booking_id,
         b.kode_inquiry,
         b.kode_rumah,
         p.nama_rumah,
         b.status
       FROM booking b
       JOIN properti p ON p.kode_rumah = b.kode_rumah
       WHERE (
           b.status = 'closed'
           OR (b.status = 'reserved' AND b.booking_fee > 0)
         )
         AND EXTRACT(YEAR FROM b.dibuat_pada)::int = $1
       ORDER BY b.dibuat_pada DESC, b.id DESC`,
      [year]
    );

    const transactionRows = await query(
      `SELECT
         id,
         tanggal,
         EXTRACT(MONTH FROM tanggal)::int AS bulan,
         tipe,
         kategori,
         deskripsi,
         jumlah,
         sumber,
         source_ref,
         dibuat_pada,
         diperbarui_pada
       FROM transaksi_keuangan
       WHERE EXTRACT(YEAR FROM tanggal)::int = $1
       ORDER BY tanggal DESC, id DESC`,
      [year]
    );

    const automaticIncome = automaticIncomeRows.map(serializeAutomaticIncome);
    const transactions = transactionRows.map(serializeFinanceTransaction);

    const automaticByMonth = new Map();
    automaticIncome.forEach((row) => {
      const month = Number(row.bulan);
      const current = automaticByMonth.get(month) || {
        total_transaksi: 0,
        total_penjualan: 0,
        total_booking_fee: 0,
      };
      if (row.status === "closed") {
        current.total_transaksi += 1;
        current.total_penjualan += row.jumlah;
      } else if (row.status === "reserved") {
        current.total_booking_fee += row.jumlah;
      }
      automaticByMonth.set(month, current);
    });

    const manualByMonth = new Map();
    transactionRows.forEach((row) => {
      const month = Number(row.bulan);
      const current = manualByMonth.get(month) || {
        total_pemasukan_manual: 0,
        total_pengeluaran: 0,
      };
      const amount = Number(row.jumlah || 0);
      if (row.tipe === "pemasukan") current.total_pemasukan_manual += amount;
      if (row.tipe === "pengeluaran") current.total_pengeluaran += amount;
      manualByMonth.set(month, current);
    });

    const monthly = Array.from({ length: 12 }, (_unused, idx) => {
      const month = idx + 1;
      const automatic = automaticByMonth.get(month) || {
        total_transaksi: 0,
        total_penjualan: 0,
        total_booking_fee: 0,
      };
      const manual = manualByMonth.get(month) || {
        total_pemasukan_manual: 0,
        total_pengeluaran: 0,
      };
      const totalPemasukan =
        automatic.total_penjualan + automatic.total_booking_fee + manual.total_pemasukan_manual;

      return {
        tahun: year,
        bulan: month,
        nama_bulan: MONTH_LABELS[idx],
        total_transaksi: automatic.total_transaksi,
        total_penjualan: automatic.total_penjualan,
        total_booking_fee: automatic.total_booking_fee,
        total_pemasukan_manual: manual.total_pemasukan_manual,
        total_pemasukan: totalPemasukan,
        total_pengeluaran: manual.total_pengeluaran,
        biaya_operasional: manual.total_pengeluaran,
        laba_bersih: totalPemasukan - manual.total_pengeluaran,
        catatan: "",
      };
    });

    const totals = monthly.reduce(
      (acc, row) => {
        acc.total_transaksi += row.total_transaksi;
        acc.total_penjualan += row.total_penjualan;
        acc.total_booking_fee += row.total_booking_fee;
        acc.total_pemasukan_manual += row.total_pemasukan_manual;
        acc.total_pemasukan += row.total_pemasukan;
        acc.total_pengeluaran += row.total_pengeluaran;
        acc.total_biaya_operasional += row.total_pengeluaran;
        acc.total_laba_bersih += row.laba_bersih;
        return acc;
      },
      {
        total_transaksi: 0,
        total_penjualan: 0,
        total_booking_fee: 0,
        total_pemasukan_manual: 0,
        total_pemasukan: 0,
        total_pengeluaran: 0,
        total_biaya_operasional: 0,
        total_laba_bersih: 0,
      }
    );

    return res.json({
      tahun: year,
      summary: totals,
      bulanan: monthly,
      pemasukan_otomatis: automaticIncome,
      transaksi: transactions,
    });
  } catch (error) {
    return next(error);
  }
}

async function createFinanceTransaction(req, res, next) {
  try {
    const type = normalizeTransactionType(req.body?.tipe);
    const amount = Math.max(0, toInt(req.body?.jumlah, 0));
    const category = String(req.body?.kategori || "").trim().slice(0, 100);
    const description = String(req.body?.deskripsi || "").trim().slice(0, 500);
    const date = parseDateInput(req.body?.tanggal);

    if (!type) {
      return res.status(400).json({ message: "Tipe transaksi tidak valid." });
    }
    if (!category) {
      return res.status(400).json({ message: "Kategori wajib diisi." });
    }
    if (amount <= 0) {
      return res.status(400).json({ message: "Jumlah transaksi harus lebih dari 0." });
    }

    const rows = await query(
      `INSERT INTO transaksi_keuangan (
         tanggal, tipe, kategori, deskripsi, jumlah, sumber, dibuat_pada, diperbarui_pada
       ) VALUES ($1, $2, $3, $4, $5, 'manual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [date, type, category, description, amount]
    );

    return res.status(201).json(serializeFinanceTransaction(rows[0]));
  } catch (error) {
    return next(error);
  }
}

async function deleteFinanceTransaction(req, res, next) {
  try {
    const transactionId = Number(req.params.transactionId);
    if (!Number.isFinite(transactionId)) {
      return res.status(400).json({ message: "ID transaksi tidak valid." });
    }

    const rows = await query(
      "DELETE FROM transaksi_keuangan WHERE id = $1 AND sumber = 'manual' RETURNING id",
      [transactionId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Transaksi manual tidak ditemukan." });
    }

    return res.json({ message: "Transaksi dihapus." });
  } catch (error) {
    return next(error);
  }
}

async function upsertOperationalCost(req, res, next) {
  try {
    const year = parseYear(req.body?.tahun);
    const month = parseMonth(req.body?.bulan);
    const biayaOperasional = Math.max(0, toInt(req.body?.biaya_operasional, 0));
    const catatan = String(req.body?.catatan || "").trim().slice(0, 255);

    await query(
      `INSERT INTO laporan_operasional (tahun, bulan, biaya_operasional, catatan)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (tahun, bulan) DO UPDATE SET
         biaya_operasional = EXCLUDED.biaya_operasional,
         catatan = EXCLUDED.catatan,
         diperbarui_pada = CURRENT_TIMESTAMP`,
      [year, month, biayaOperasional, catatan]
    );

    const sourceRef = `${year}-${String(month).padStart(2, "0")}`;
    await query(
      `INSERT INTO transaksi_keuangan (
         tanggal, tipe, kategori, deskripsi, jumlah, sumber, source_ref, dibuat_pada, diperbarui_pada
       ) VALUES (make_date($1, $2, 1), 'pengeluaran', 'Operasional bulanan', $3, $4, 'legacy_operasional', $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (sumber, source_ref) DO UPDATE SET
         tanggal = EXCLUDED.tanggal,
         deskripsi = EXCLUDED.deskripsi,
         jumlah = EXCLUDED.jumlah,
         diperbarui_pada = CURRENT_TIMESTAMP`,
      [year, month, catatan, biayaOperasional, sourceRef]
    );

    return res.json({
      message: "Biaya operasional berhasil disimpan.",
      data: {
        tahun: year,
        bulan: month,
        biaya_operasional: biayaOperasional,
        catatan,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getFinanceReport,
  createFinanceTransaction,
  deleteFinanceTransaction,
  upsertOperationalCost,
};
