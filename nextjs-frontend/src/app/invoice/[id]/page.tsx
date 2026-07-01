"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch, BookingApi } from "@/lib/api";
import { money } from "@/lib/format";
import { Printer, ArrowLeft } from "lucide-react";

import "../../admin/admin-tailwind.css";

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
    <div className="min-h-screen bg-[#f4efe4] text-[#1f2a22] py-12 px-4 print:bg-white print:py-0 print:px-0 font-sans">
      {/* Action Bar (Hidden on print) */}
      <div className="max-w-3xl mx-auto mb-8 flex justify-between items-center print:hidden">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-[#1f2a22]/70 hover:text-[#1f2a22] font-semibold text-sm transition-colors"
        >
          <ArrowLeft size={16} /> Kembali
        </button>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#064E3B] hover:bg-[#053d2f] text-white font-bold rounded-lg shadow-md text-sm transition-all duration-200"
        >
          <Printer size={16} /> Cetak / Unduh PDF
        </button>
      </div>

      {/* Invoice Document Card */}
      <div className="max-w-3xl mx-auto bg-white border border-[#064E3B]/10 shadow-2xl rounded-2xl p-8 md:p-14 print:border-none print:shadow-none print:p-0">
        
        {/* Top Decorative Border */}
        <div className="h-1.5 w-full bg-[#064E3B] rounded-t-lg -mt-8 md:-mt-14 -mx-8 md:-mx-14 mb-8 md:mb-12 print:hidden" />

        {/* Brand Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start border-b border-[#064E3B]/10 pb-8 gap-6">
          <div>
            <h1 className="text-3xl font-bold font-serif text-[#064E3B] tracking-wide">PlanB Property</h1>
            <p className="text-xs text-[#1f2a22]/60 mt-1 font-semibold uppercase tracking-wider">Luxury Residential & Real Estate</p>
          </div>
          <div className="text-left md:text-right">
            <h2 className="text-lg font-bold text-[#064E3B] uppercase tracking-widest font-serif">INVOICE</h2>
            <p className="text-sm font-mono font-bold text-[#1f2a22] mt-1.5">{booking.kode_inquiry}</p>
            <p className="text-xs text-[#1f2a22]/50 mt-1 font-medium">Tanggal Cetak: {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}</p>
          </div>
        </div>

        {/* Client & Booking Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10 border-b border-[#064E3B]/10 text-xs">
          <div className="space-y-2">
            <h3 className="font-bold text-[#064E3B] uppercase tracking-wider text-[10px] mb-3">Diberikan Kepada:</h3>
            <p className="text-base font-bold text-[#1f2a22] font-serif">{booking.nama_depan} {booking.nama_belakang}</p>
            <div className="space-y-1 text-[#1f2a22]/70 font-medium">
              <p>Email: {booking.email}</p>
              <p>Telepon: +{booking.telepon}</p>
            </div>
          </div>
          <div className="md:text-right space-y-2">
            <h3 className="font-bold text-[#064E3B] uppercase tracking-wider text-[10px] mb-3">Detail Transaksi Properti:</h3>
            <p className="text-base font-bold text-[#064E3B] font-serif">{booking.nama_rumah}</p>
            <div className="space-y-1 text-[#1f2a22]/70 font-medium">
              <p>{booking.alamat}, {booking.kota}</p>
              <p>Metode Pembayaran: <span className="font-bold text-[#1f2a22]">{booking.metode_pembayaran.toUpperCase()}</span></p>
            </div>
            <div className="pt-2">
              <span className={`inline-block px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                booking.status === "closed" ? "bg-[#064E3B] text-[#f4efe4]" :
                booking.status === "reserved" ? "bg-emerald-100 text-[#064E3B]" :
                booking.status === "cancelled" ? "bg-red-100 text-red-800" :
                "bg-amber-100 text-amber-900"
              }`}>
                {booking.status === "closed" ? "Sold / Lunas" :
                 booking.status === "reserved" ? "Booked / DP Paid" :
                 booking.status === "cancelled" ? "Batal" :
                 booking.status}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Table */}
        <div className="py-10">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#064E3B] text-[#f4efe4] font-serif font-bold uppercase tracking-wider">
                <th className="p-3 pl-4 rounded-l-lg font-semibold">Deskripsi Transaksi</th>
                <th className="p-3 pr-4 text-right rounded-r-lg font-semibold">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#064E3B]/10">
              <tr className="text-[#1f2a22]">
                <td className="p-4 pl-4">
                  <p className="font-bold text-sm text-[#1f2a22] font-serif">Pembayaran Properti – {booking.nama_rumah}</p>
                  <p className="text-[#1f2a22]/60 mt-1 font-medium">Harga kesepakatan unit properti eksklusif di {booking.kota}.</p>
                </td>
                <td className="p-4 pr-4 text-right font-bold text-sm text-[#1f2a22] font-mono">{money(propertyPrice)}</td>
              </tr>
              <tr className="text-[#1f2a22]">
                <td className="p-4 pl-4">
                  <p className="font-bold text-[#1f2a22] font-serif">Booking Fee (Uang Muka)</p>
                  <p className="text-[#1f2a22]/60 mt-1 font-medium">Uang jaminan pemesanan & penguncian unit properti.</p>
                </td>
                <td className="p-4 pr-4 text-right font-bold text-emerald-700 font-mono">- {money(bookingFee)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Calculation and Total */}
        <div className="border-t border-[#064E3B]/10 pt-8">
          <div className="w-full md:w-80 ml-auto space-y-3.5 text-xs">
            <div className="flex justify-between text-[#1f2a22]/70 font-medium">
              <span>Total Harga Unit:</span>
              <span className="font-bold text-[#1f2a22] font-mono">{money(propertyPrice)}</span>
            </div>
            <div className="flex justify-between text-[#1f2a22]/70 font-medium">
              <span>Uang Muka (Booking Fee):</span>
              <span className="font-bold text-emerald-700 font-mono">- {money(bookingFee)}</span>
            </div>
            <div className="border-t border-[#064E3B]/10 my-3" />
            
            <div className="flex justify-between text-sm font-bold text-[#1f2a22]">
              <span className="font-serif text-[#064E3B]">{isClosed ? "Total Pelunasan Terbayar:" : "Sisa Pelunasan (Due):"}</span>
              <span className="text-[#064E3B] text-lg font-mono font-extrabold">{money(jumlahPelunasan)}</span>
            </div>
          </div>
        </div>

        {/* Stamp or Note Area */}
        <div className="mt-12 bg-[#f4efe4]/30 border border-[#064E3B]/5 rounded-xl p-4 text-center">
          <p className="text-[10px] font-bold text-[#064E3B] uppercase tracking-widest font-serif">PlanB Verification Statement</p>
          <p className="text-[9px] text-[#1f2a22]/60 mt-1 font-medium">
            Pembayaran dinyatakan sah apabila dana telah diterima di rekening resmi PlanB Property dan telah diverifikasi oleh bagian keuangan.
          </p>
        </div>

        {/* Footer Note */}
        <div className="mt-12 border-t border-[#064E3B]/10 pt-8 text-center text-[10px] text-[#1f2a22]/40 space-y-1 font-medium">
          <p className="font-serif font-bold text-[#064E3B]/60 tracking-wider">PLANB PROPERTY GROUP</p>
          <p>Invoice ini sah dihasilkan secara elektronik oleh sistem manajemen PlanB Property.</p>
          <p>Hubungi CS kami di support@planbproperty.co.id untuk layanan & bantuan administrasi.</p>
        </div>
      </div>
    </div>
  );
}
