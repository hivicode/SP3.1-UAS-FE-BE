"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch, BookingApi } from "@/lib/api";
import { money } from "@/lib/format";
import { Printer, ArrowLeft } from "lucide-react";

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [booking, setBooking] = useState<BookingApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiFetch<BookingApi>(`/api/booking/public/${id}`)
      .then((data) => {
        setBooking(data);
        setError("");
      })
      .catch((err) => {
        setError(err.message || "Gagal memuat invoice.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 text-sm font-medium">Memuat invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">!</div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Error</h2>
          <p className="text-slate-500 text-sm mb-6">{error || "Invoice tidak ditemukan."}</p>
          <button 
            onClick={() => router.push("/")}
            className="w-full py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors text-sm"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  const propertyPrice = booking.harga || 0;
  const bookingFee = booking.booking_fee || 0;
  const isClosed = booking.status === "closed";
  const jumlahPelunasan = Math.max(0, propertyPrice - bookingFee);

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 print:bg-white print:py-0 print:px-0">
      {/* Action Bar (Hidden on print) */}
      <div className="max-w-3xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-950 font-medium text-sm transition-colors"
        >
          <ArrowLeft size={16} /> Kembali
        </button>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-sm text-sm transition-colors"
        >
          <Printer size={16} /> Cetak / Unduh PDF
        </button>
      </div>

      {/* Invoice Document Card */}
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 shadow-xl rounded-2xl p-8 md:p-12 print:border-none print:shadow-none print:p-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start border-b border-slate-100 pb-8 gap-6">
          <div>
            <h1 className="text-2xl font-bold font-serif text-emerald-900 tracking-wide">PlanB Property</h1>
            <p className="text-xs text-slate-400 mt-1 font-semibold">Solusi Hunian Nyaman & Terpercaya</p>
          </div>
          <div className="text-left md:text-right">
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider">INVOICE</h2>
            <p className="text-sm font-mono font-bold text-emerald-600 mt-1">{booking.kode_inquiry}</p>
            <p className="text-xs text-slate-400 mt-1">Tanggal Cetak: {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}</p>
          </div>
        </div>

        {/* Client & Booking Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-slate-100 text-xs">
          <div>
            <h3 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Diberikan Kepada</h3>
            <p className="text-sm font-bold text-slate-950">{booking.nama_depan} {booking.nama_belakang}</p>
            <p className="text-slate-500 mt-1 font-medium">Email: {booking.email}</p>
            <p className="text-slate-500 mt-1 font-medium">Telepon: +{booking.telepon}</p>
          </div>
          <div className="md:text-right">
            <h3 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Detail Transaksi</h3>
            <p className="text-sm font-bold text-slate-950">{booking.nama_rumah}</p>
            <p className="text-slate-500 mt-1 font-medium">{booking.alamat}, {booking.kota}</p>
            <p className="text-slate-500 mt-1 font-medium">Metode Pembayaran: {booking.metode_pembayaran.toUpperCase()}</p>
            <p className="mt-2">
              <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                booking.status === "closed" ? "bg-emerald-100 text-emerald-800" :
                booking.status === "reserved" ? "bg-blue-100 text-blue-800" :
                booking.status === "cancelled" ? "bg-red-100 text-red-800" :
                "bg-amber-100 text-amber-800"
              }`}>
                {booking.status === "closed" ? "Sold / Lunas" :
                 booking.status === "reserved" ? "Booked / DP Paid" :
                 booking.status === "cancelled" ? "Batal" :
                 booking.status}
              </span>
            </p>
          </div>
        </div>

        {/* Pricing Table */}
        <div className="py-8">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 font-semibold">Deskripsi Transaksi</th>
                <th className="pb-3 text-right font-semibold">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="text-slate-800">
                <td className="py-4">
                  <p className="font-bold text-sm text-slate-900">Pembayaran Properti – {booking.nama_rumah}</p>
                  <p className="text-slate-500 mt-1">Harga kesepakatan properti di {booking.kota}.</p>
                </td>
                <td className="py-4 text-right font-bold text-sm text-slate-950">{money(propertyPrice)}</td>
              </tr>
              <tr className="text-slate-800">
                <td className="py-4">
                  <p className="font-bold text-slate-900">Booking Fee / Uang Muka</p>
                  <p className="text-slate-500 mt-1">Uang muka jaminan pemesanan unit properti.</p>
                </td>
                <td className="py-4 text-right font-medium text-emerald-600">- {money(bookingFee)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Calculation and Total */}
        <div className="border-t border-slate-200 pt-6">
          <div className="w-full md:w-80 ml-auto space-y-3 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Total Harga Properti:</span>
              <span className="font-medium">{money(propertyPrice)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Uang Muka (Booking Fee):</span>
              <span className="font-medium text-emerald-600">- {money(bookingFee)}</span>
            </div>
            <div className="border-t border-slate-100 my-2" />
            
            <div className="flex justify-between text-sm font-bold text-slate-950">
              <span>{isClosed ? "Total Pelunasan Terbayar:" : "Sisa Pelunasan (Due):"}</span>
              <span className="text-emerald-800 text-base">{money(jumlahPelunasan)}</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-16 border-t border-slate-100 pt-8 text-center text-[10px] text-slate-400 space-y-1 font-medium font-sans">
          <p>Terima kasih telah mempercayakan investasi properti Anda bersama PlanB Property.</p>
          <p>Invoice ini sah dihasilkan secara elektronik oleh sistem PlanB.</p>
          <p>Hubungi Customer Support di support@planbproperty.co.id jika memiliki pertanyaan.</p>
        </div>
      </div>
    </div>
  );
}
