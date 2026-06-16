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

async function getFinanceReport(req, res, next) {
  try {
    const year = parseYear(req.query.year);

    const salesRows = await query(
      `SELECT
         EXTRACT(MONTH FROM b.dibuat_pada)::int AS bulan,
         COUNT(*) AS total_transaksi,
         COALESCE(SUM(p.harga), 0) AS total_penjualan,
         COALESCE(SUM(b.booking_fee), 0) AS total_booking_fee
       FROM booking b
       JOIN properti p ON p.kode_rumah = b.kode_rumah
       WHERE b.status = 'confirmed'
         AND EXTRACT(YEAR FROM b.dibuat_pada)::int = $1
       GROUP BY EXTRACT(MONTH FROM b.dibuat_pada)`,
      [year]
    );

    const operationalRows = await query(
      `SELECT bulan, biaya_operasional, catatan
       FROM laporan_operasional
       WHERE tahun = $1`,
      [year]
    );

    const salesByMonth = new Map(
      salesRows.map((row) => [
        Number(row.bulan),
        {
          total_transaksi: Number(row.total_transaksi || 0),
          total_penjualan: Number(row.total_penjualan || 0),
          total_booking_fee: Number(row.total_booking_fee || 0),
        },
      ])
    );

    const operationalByMonth = new Map(
      operationalRows.map((row) => [
        Number(row.bulan),
        {
          biaya_operasional: Number(row.biaya_operasional || 0),
          catatan: row.catatan || "",
        },
      ])
    );

    const monthly = Array.from({ length: 12 }, (_unused, idx) => {
      const month = idx + 1;
      const sales = salesByMonth.get(month) || {
        total_transaksi: 0,
        total_penjualan: 0,
        total_booking_fee: 0,
      };
      const ops = operationalByMonth.get(month) || {
        biaya_operasional: 0,
        catatan: "",
      };

      return {
        tahun: year,
        bulan: month,
        nama_bulan: MONTH_LABELS[idx],
        total_transaksi: sales.total_transaksi,
        total_penjualan: sales.total_penjualan,
        total_booking_fee: sales.total_booking_fee,
        biaya_operasional: ops.biaya_operasional,
        laba_bersih: sales.total_penjualan - ops.biaya_operasional,
        catatan: ops.catatan,
      };
    });

    const totals = monthly.reduce(
      (acc, row) => {
        acc.total_transaksi += row.total_transaksi;
        acc.total_penjualan += row.total_penjualan;
        acc.total_booking_fee += row.total_booking_fee;
        acc.total_biaya_operasional += row.biaya_operasional;
        acc.total_laba_bersih += row.laba_bersih;
        return acc;
      },
      {
        total_transaksi: 0,
        total_penjualan: 0,
        total_booking_fee: 0,
        total_biaya_operasional: 0,
        total_laba_bersih: 0,
      }
    );

    return res.json({
      tahun: year,
      summary: totals,
      bulanan: monthly,
    });
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
  upsertOperationalCost,
};
