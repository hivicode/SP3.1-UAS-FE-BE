"use client";

import { FormEvent, useMemo, useState, useEffect, useCallback } from "react";
import {
  apiFetch,
  AuthResponse,
  BookingApi,
  FinanceReport,
  PropertyApi,
  withAuth,
  makeApiUrl,
  normalizeImageUrl,
} from "@/lib/api";
import { clearAdminToken, getAdminToken, setAdminToken } from "@/lib/auth";
import { money } from "@/lib/format";
import {
  LayoutDashboard, Users, Wallet, Building2, LogOut,
  Plus, Trash2, X, Search, DollarSign, Edit, Upload,
} from "lucide-react";

import "./admin-tailwind.css";

type AdminView = "dashboard" | "inquiries" | "create" | "finance" | "properties";

type PropertyFormState = {
  kode_rumah: string;
  nama_rumah: string;
  alamat: string;
  kota: string;
  tipe: string;
  harga: string;
  rating: string;
  kamar_tidur: string;
  kamar_mandi: string;
  luas_tanah: string;
  luas_bangunan: string;
  garasi: string;
  fitur: string;
  deskripsi: string;
};

const emptyForm: PropertyFormState = {
  kode_rumah: "",
  nama_rumah: "",
  alamat: "",
  kota: "",
  tipe: "Rumah",
  harga: "",
  rating: "0",
  kamar_tidur: "",
  kamar_mandi: "",
  luas_tanah: "",
  luas_bangunan: "",
  garasi: "",
  fitur: "",
  deskripsi: "",
};

type FinanceFormState = {
  tanggal: string;
  tipe: "pemasukan" | "pengeluaran";
  kategori: string;
  jumlah: string;
  deskripsi: string;
};

const emptyFinanceForm: FinanceFormState = {
  tanggal: new Date().toISOString().slice(0, 10),
  tipe: "pengeluaran",
  kategori: "",
  jumlah: "",
  deskripsi: "",
};

const INCOME_CATS = [
  "Penjualan properti",
  "Booking fee",
  "Komisi referral",
  "Jasa konsultasi",
  "Fee negosiasi",
  "Uang muka deal",
  "Pemasukan lainnya"
];

const EXPENSE_CATS = [
  "Iklan digital",
  "Notaris",
  "Operasional",
  "Dokumen",
  "Transport",
  "Komisi staf",
  "Pengeluaran lainnya"
];

const INQUIRY_STATUS_CFG: Record<string, { label: string; dot: string; badge: string }> = {
  new: { label: "Baru", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700" },
  contacted: { label: "Dihubungi", dot: "bg-violet-500", badge: "bg-violet-50 text-violet-700" },
  booking_fee_pending: { label: "Menunggu Booking Fee", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700" },
  reserved: { label: "Booked", dot: "bg-teal-500", badge: "bg-teal-50 text-teal-700" },
  closed: { label: "Deal / Closed", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700" },
  cancelled: { label: "Dibatalkan", dot: "bg-slate-400", badge: "bg-slate-100 text-slate-500" },
};

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function shortDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function AdminPage() {
  const [view, setView] = useState<AdminView>("dashboard");
  const [token, setToken] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const [loginError, setLoginError] = useState("");

  const [properties, setProperties] = useState<PropertyApi[]>([]);
  const [bookings, setBookings] = useState<BookingApi[]>([]);
  const [financeReport, setFinanceReport] = useState<FinanceReport | null>(null);

  // Forms
  const [form, setForm] = useState<PropertyFormState>(emptyForm);
  const [editCode, setEditCode] = useState("");
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [financeForm, setFinanceForm] = useState<FinanceFormState>(emptyFinanceForm);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>("all");
  const [financeYear, setFinanceYear] = useState(new Date().getFullYear());
  const [fromMonth, setFromMonth] = useState(1);
  const [toMonth, setToMonth] = useState(12);

  // Modals/Loading States
  const [busyAction, setBusyAction] = useState("");
  const [loadingData, setLoadingData] = useState(false);
  const [loadingFinance, setLoadingFinance] = useState(false);
  const [dealModalBooking, setDealModalBooking] = useState<BookingApi | null>(null);
  const [dealForm, setDealForm] = useState({
    tanggal: new Date().toISOString().slice(0, 10),
    kategori: "Penjualan properti",
    jumlah: "",
    deskripsi: "",
  });

  const isEditing = Boolean(editCode);

  const loadFinance = useCallback(async (authToken: string, year = financeYear) => {
    setLoadingFinance(true);
    try {
      const report = await apiFetch<FinanceReport>(`/api/finance/report?year=${year}`, {
        headers: withAuth(authToken),
      });
      setFinanceReport(report);
    } catch {
      // Ignore
    } finally {
      setLoadingFinance(false);
    }
  }, [financeYear]);

  const loadDashboard = useCallback(async (authToken: string) => {
    setLoadingData(true);
    try {
      const [propertyData, bookingData] = await Promise.all([
        apiFetch<PropertyApi[]>("/api/properti"),
        apiFetch<BookingApi[]>("/api/booking", {
          headers: withAuth(authToken),
        }),
      ]);
      setProperties(propertyData);
      setBookings(bookingData);
    } catch {
      // Ignore
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    const savedToken = getAdminToken();
    if (!savedToken) {
      setCheckingSession(false);
      return;
    }

    apiFetch<{ user: { username: string } }>("/api/auth/me", {
      headers: withAuth(savedToken),
    })
      .then(() => {
        setToken(savedToken);
        return loadDashboard(savedToken);
      })
      .catch(() => {
        clearAdminToken();
      })
      .finally(() => setCheckingSession(false));
  }, [loadDashboard]);

  useEffect(() => {
    if (!token) return;
    loadFinance(token, financeYear).catch(() => {});
  }, [token, financeYear, loadFinance]);

  // Derived dashboard metrics
  const stats = useMemo(() => {
    const totalUnit = properties.length;
    const soldUnit = properties.filter((p) => p.status === "sold").length;
    const bookedUnit = bookings.filter((b) => b.status === "reserved").length;
    const cleanLaba = financeReport?.summary?.total_laba_bersih || 0;

    return { totalUnit, soldUnit, bookedUnit, cleanLaba };
  }, [properties, bookings, financeReport]);

  const filteredBookings = useMemo(() => {
    let list = bookings;
    if (bookingStatusFilter !== "all") {
      list = list.filter((b) => b.status === bookingStatusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((b) =>
        `${b.nama_depan} ${b.nama_belakang} ${b.email} ${b.kode_inquiry} ${b.nama_rumah}`
          .toLowerCase()
          .includes(q)
      );
    }
    return list;
  }, [bookings, bookingStatusFilter, searchQuery]);

  // Finance Range Filter
  const filteredMonthlyRows = useMemo(() => {
    if (!financeReport?.bulanan) return [];
    return financeReport.bulanan.filter((row) => row.bulan >= fromMonth && row.bulan <= toMonth);
  }, [financeReport?.bulanan, fromMonth, toMonth]);

  const filteredTransactions = useMemo(() => {
    if (!financeReport?.transaksi) return [];
    return financeReport.transaksi.filter((t) => {
      const m = new Date(t.tanggal).getMonth() + 1;
      return m >= fromMonth && m <= toMonth;
    });
  }, [financeReport?.transaksi, fromMonth, toMonth]);

  const rangeSummary = useMemo(() => {
    return filteredMonthlyRows.reduce(
      (acc, row) => ({
        total_pemasukan: acc.total_pemasukan + row.total_pemasukan,
        total_pengeluaran: acc.total_pengeluaran + row.total_pengeluaran,
        laba_bersih: acc.laba_bersih + row.laba_bersih,
      }),
      { total_pemasukan: 0, total_pengeluaran: 0, laba_bersih: 0 }
    );
  }, [filteredMonthlyRows]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError("");
    setBusyAction("login");

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") || "");
    const password = String(formData.get("password") || "");

    try {
      const result = await apiFetch<AuthResponse>("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      setAdminToken(result.token);
      setToken(result.token);
      await loadDashboard(result.token);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Gagal Login.");
    } finally {
      setBusyAction("");
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    setToken("");
    setProperties([]);
    setBookings([]);
    setView("dashboard");
  };

  const submitProperty = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setBusyAction("submitProperty");

    const payload = new FormData();
    const kode = isEditing ? editCode : form.kode_rumah.trim();
    payload.set("kode_rumah", kode);
    payload.set("nama_rumah", form.nama_rumah);
    payload.set("alamat", form.alamat);
    payload.set("kota", form.kota);
    payload.set("tipe", form.tipe);
    payload.set("harga", form.harga);
    payload.set("rating", form.rating);
    payload.set("kamar_tidur", form.kamar_tidur);
    payload.set("kamar_mandi", form.kamar_mandi);
    payload.set("luas_tanah", form.luas_tanah);
    payload.set("luas_bangunan", form.luas_bangunan);
    payload.set("garasi", form.garasi);
    payload.set("fitur", form.fitur);
    payload.set("deskripsi", form.deskripsi);

    if (uploadFiles) {
      Array.from(uploadFiles).forEach((file) => payload.append("gambar", file));
    }

    try {
      const path = isEditing ? `/api/properti/${encodeURIComponent(editCode)}` : "/api/properti";
      const method = isEditing ? "PUT" : "POST";
      
      await fetch(makeApiUrl(path), {
        method,
        headers: withAuth(token),
        body: payload,
      }).then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
      });

      await loadDashboard(token);
      resetForm();
      setView("properties");
    } catch {
      window.alert("Gagal menyimpan properti.");
    } finally {
      setBusyAction("");
    }
  };

  const deleteProperty = async (kode: string) => {
    if (!token || !window.confirm(`Hapus properti ${kode}?`)) return;
    setBusyAction(`delete-${kode}`);
    try {
      await apiFetch(`/api/properti/${encodeURIComponent(kode)}`, {
        method: "DELETE",
        headers: withAuth(token),
      });
      await loadDashboard(token);
    } catch {
      window.alert("Gagal menghapus properti.");
    } finally {
      setBusyAction("");
    }
  };

  const updateBookingStatus = async (bookingId: number, status: string) => {
    if (!token) return;
    setBusyAction(`booking-${bookingId}`);
    try {
      await apiFetch(`/api/booking/${bookingId}/status`, {
        method: "PATCH",
        headers: {
          ...withAuth(token),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      await loadDashboard(token);
      await loadFinance(token, financeYear);
    } catch {
      window.alert("Gagal update status.");
    } finally {
      setBusyAction("");
    }
  };

  const saveFinanceTransaction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    if (!financeForm.kategori.trim() || Number(financeForm.jumlah || 0) <= 0) {
      window.alert("Isi kategori dan jumlah transaksi.");
      return;
    }

    setBusyAction("finance-add");
    try {
      await apiFetch("/api/finance/transactions", {
        method: "POST",
        headers: {
          ...withAuth(token),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tanggal: financeForm.tanggal,
          tipe: financeForm.tipe,
          kategori: financeForm.kategori,
          deskripsi: financeForm.deskripsi,
          jumlah: Number(financeForm.jumlah || 0),
        }),
      });
      setFinanceForm({
        ...emptyFinanceForm,
        tanggal: financeForm.tanggal,
        tipe: financeForm.tipe,
      });
      await loadFinance(token, financeYear);
    } catch {
      window.alert("Gagal menyimpan transaksi.");
    } finally {
      setBusyAction("");
    }
  };

  const saveDealTransaction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !dealModalBooking) return;
    if (!dealForm.kategori || Number(dealForm.jumlah || 0) <= 0) {
      window.alert("Isi kategori dan jumlah transaksi deal.");
      return;
    }

    setBusyAction("deal-add");
    try {
      await apiFetch("/api/finance/transactions", {
        method: "POST",
        headers: {
          ...withAuth(token),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tanggal: dealForm.tanggal,
          tipe: "pemasukan",
          kategori: dealForm.kategori,
          deskripsi: dealForm.deskripsi || `Deal manual – ${dealModalBooking.nama_depan} ${dealModalBooking.nama_belakang}`,
          jumlah: Number(dealForm.jumlah),
          sumber: "manual",
          source_ref: dealModalBooking.kode_inquiry,
        }),
      });

      // Update status booking target ke 'closed'
      await apiFetch(`/api/booking/${dealModalBooking.id}/status`, {
        method: "PATCH",
        headers: {
          ...withAuth(token),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "closed" }),
      });

      setDealModalBooking(null);
      setDealForm({
        tanggal: new Date().toISOString().slice(0, 10),
        kategori: "Penjualan properti",
        jumlah: "",
        deskripsi: "",
      });
      await loadDashboard(token);
      await loadFinance(token, financeYear);
    } catch {
      window.alert("Gagal menyimpan deal penjualan.");
    } finally {
      setBusyAction("");
    }
  };

  const deleteFinanceTransaction = async (transactionId: number) => {
    if (!token) return;
    if (!window.confirm("Hapus transaksi ini?")) return;

    setBusyAction(`finance-delete-${transactionId}`);
    try {
      await apiFetch(`/api/finance/transactions/${transactionId}`, {
        method: "DELETE",
        headers: withAuth(token),
      });
      await loadFinance(token, financeYear);
    } catch {
      window.alert("Gagal menghapus transaksi.");
    } finally {
      setBusyAction("");
    }
  };

  const fillFromProperty = (property: PropertyApi) => {
    setView("create");
    setEditCode(property.kode_rumah);
    setForm({
      kode_rumah: property.kode_rumah,
      nama_rumah: property.nama_rumah,
      alamat: property.alamat,
      kota: property.kota,
      tipe: property.tipe,
      harga: String(property.harga),
      rating: String(property.rating ?? 0),
      kamar_tidur: String(property.kamar_tidur),
      kamar_mandi: String(property.kamar_mandi),
      luas_tanah: String(property.luas_tanah),
      luas_bangunan: String(property.luas_bangunan),
      garasi: String(property.garasi),
      fitur: Array.isArray(property.fitur) ? property.fitur.join(", ") : "",
      deskripsi: property.deskripsi || "",
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditCode("");
    setUploadFiles(null);
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center text-white/70 text-sm font-mono">
        Verifikasi sesi admin...
      </div>
    );
  }

  if (!token) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 font-sans"
        style={{ background: "linear-gradient(135deg, #0D1117 0%, #064E3B 100%)" }}
      >
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 text-white font-bold text-xl mb-4 font-serif">
              B
            </div>
            <h1 className="text-xl font-semibold text-white font-serif tracking-wide">PlanB Admin</h1>
            <p className="text-sm text-white/50 mt-1">Dashboard manajemen properti</p>
          </div>
          
          <form onSubmit={handleLogin} className="bg-white rounded-2xl p-6 space-y-4 shadow-2xl">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Username</label>
              <input 
                name="username" 
                defaultValue="admin" 
                required 
                className="w-full px-3 py-2.5 text-sm border border-black/10 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Password</label>
              <input 
                name="password" 
                type="password" 
                defaultValue="admin" 
                required 
                className="w-full px-3 py-2.5 text-sm border border-black/10 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            
            {loginError && <p className="text-xs text-red-600 text-center">{loginError}</p>}
            
            <button 
              type="submit" 
              className="w-full py-2.5 bg-[#064E3B] hover:bg-[#053d2f] text-white text-sm font-semibold rounded-lg transition-colors uppercase tracking-wider mt-4"
              disabled={busyAction === "login"}
            >
              {busyAction === "login" ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FBFC] text-slate-800 flex font-sans">
      
      {/* Sidebar navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-lg flex items-center justify-center font-serif">
            B
          </div>
          <div>
            <h2 className="font-bold text-white tracking-wide">PlanB Space</h2>
            <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest leading-none mt-0.5">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => { setView("dashboard"); resetForm(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === "dashboard" ? "bg-slate-800 text-white" : "hover:bg-slate-800/50 hover:text-white"}`}
          >
            <LayoutDashboard size={16} /> Dashboard
          </button>
          <button 
            onClick={() => { setView("inquiries"); resetForm(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === "inquiries" ? "bg-slate-800 text-white" : "hover:bg-slate-800/50 hover:text-white"}`}
          >
            <Users size={16} /> Inquiries / Booking
          </button>
          <button 
            onClick={() => { setView("properties"); resetForm(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === "properties" ? "bg-slate-800 text-white" : "hover:bg-slate-800/50 hover:text-white"}`}
          >
            <Building2 size={16} /> Properti Unit
          </button>
          <button 
            onClick={() => { setView("finance"); resetForm(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === "finance" ? "bg-slate-800 text-white" : "hover:bg-slate-800/50 hover:text-white"}`}
          >
            <Wallet size={16} /> Laporan Keuangan
          </button>
          <button 
            onClick={() => { setView("create"); resetForm(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === "create" ? "bg-slate-800 text-white" : "hover:bg-slate-800/50 hover:text-white"}`}
          >
            <Plus size={16} /> {isEditing ? "Edit Unit" : "Tambah Unit"}
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">

        {/* ══ DASHBOARD VIEW ══ */}
        {view === "dashboard" && (
          <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-serif font-semibold text-slate-900 tracking-wide">Ringkasan Dashboard</h1>
                <p className="text-sm text-slate-400 mt-0.5">Pantau status listing, reservasi unit, dan keuangan hari ini</p>
              </div>
            </div>

            {/* Metric widgets */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Total Properti</p>
                <p className="mt-1.5 text-2xl font-semibold leading-none font-mono text-slate-900">{stats.totalUnit} Unit</p>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Unit Terjual (Sold)</p>
                <p className="mt-1.5 text-2xl font-semibold leading-none font-mono text-slate-900">{stats.soldUnit} Unit</p>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Unit Terpesan (Booked)</p>
                <p className="mt-1.5 text-2xl font-semibold leading-none font-mono text-slate-900">{stats.bookedUnit} Unit</p>
              </div>
              <div className="bg-[#064E3B] border border-transparent rounded-xl p-5 shadow-sm text-white">
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-300">Total Laba Bersih</p>
                <p className="mt-1.5 text-2xl font-semibold leading-none font-mono">{money(stats.cleanLaba)}</p>
              </div>
            </div>

            {/* Quick tables grids */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Recent Inquiries */}
              <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Inquiry Terbaru</h3>
                  <button onClick={() => setView("inquiries")} className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold">Lihat Semua</button>
                </div>
                <div className="divide-y divide-slate-100">
                  {bookings.slice(0, 5).map((b) => (
                    <div key={b.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-800">{b.nama_depan} {b.nama_belakang}</p>
                          <span className="font-mono text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{b.kode_inquiry}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{b.nama_rumah} · {b.preferensi_kontak}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${INQUIRY_STATUS_CFG[b.status as string]?.badge || "bg-slate-100 text-slate-600"}`}>
                        {INQUIRY_STATUS_CFG[b.status as string]?.label || b.status}
                      </span>
                    </div>
                  ))}
                  {bookings.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-sm">Belum ada inquiry masuk.</div>
                  )}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Transaksi Terakhir</h3>
                  <button onClick={() => setView("finance")} className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold">Lihat Semua</button>
                </div>
                <div className="divide-y divide-slate-100">
                  {financeReport?.transaksi?.slice(0, 5).map((t) => (
                    <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{t.kategori}</p>
                        <p className="text-xs text-slate-400 mt-1">{shortDate(t.tanggal)} · {t.deskripsi}</p>
                      </div>
                      <span className={`font-mono text-sm font-semibold ${t.tipe === "pemasukan" ? "text-emerald-600" : "text-red-500"}`}>
                        {t.tipe === "pemasukan" ? "+" : "-"}{money(t.jumlah)}
                      </span>
                    </div>
                  ))}
                  {(!financeReport?.transaksi || financeReport.transaksi.length === 0) && (
                    <div className="p-8 text-center text-slate-400 text-sm">Belum ada transaksi tercatat.</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ══ INQUIRIES VIEW ══ */}
        {view === "inquiries" && (
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-serif font-semibold text-slate-900 tracking-wide">Kelola Inquiry</h1>
                <p className="text-sm text-slate-400 mt-0.5">Verifikasi booking fee dan atur status komunikasi calon pembeli</p>
              </div>
            </div>

            {/* Filter bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama, email, kode inquiry, atau nama unit..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                />
              </div>
              <div className="w-56">
                <select 
                  value={bookingStatusFilter} 
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="all">Semua Status</option>
                  {Object.entries(INQUIRY_STATUS_CFG).map(([key, item]) => (
                    <option key={key} value={key}>{item.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Inquiries List */}
            <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Kode / Tanggal</th>
                    <th className="px-6 py-4">Calon Pembeli</th>
                    <th className="px-6 py-4">Unit Terpilih</th>
                    <th className="px-6 py-4">Kontak & Jadwal</th>
                    <th className="px-6 py-4">Booking Fee</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 text-sm">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono font-semibold text-slate-900 block">{b.kode_inquiry}</span>
                        <span className="text-[11px] text-slate-400 mt-1 block">{shortDate(b.dibuat_pada)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900 block">{b.nama_depan} {b.nama_belakang}</span>
                        <span className="text-xs text-slate-400 mt-0.5 block">{b.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900 block">{b.nama_rumah}</span>
                        <span className="text-xs text-slate-400 mt-0.5 block">{b.kota}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs block">Preferensi: <span className="font-semibold">{b.preferensi_kontak}</span></span>
                        <span className="text-xs text-slate-400 block mt-0.5">Tel: {b.telepon}</span>
                        {b.jadwal_kunjungan && (
                          <span className="text-[11px] text-emerald-600 block mt-1">Survey: {formatDate(b.jadwal_kunjungan)}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-slate-900">
                        {money(b.booking_fee)}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={b.status}
                          onChange={(e) => updateBookingStatus(b.id, e.target.value)}
                          className="px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:border-emerald-500 bg-white"
                        >
                          {Object.entries(INQUIRY_STATUS_CFG).map(([key, item]) => (
                            <option key={key} value={key}>{item.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {b.status === "closed" && (
                          <span className="text-xs text-slate-400 font-medium">Deal Selesai</span>
                        )}
                        {b.status === "cancelled" && (
                          <button
                            disabled
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 text-slate-400 text-xs font-bold rounded cursor-not-allowed"
                          >
                            <DollarSign size={12} /> Catat Deal Penjualan
                          </button>
                        )}
                        {b.status !== "closed" && b.status !== "cancelled" && (
                          <button
                            onClick={() => setDealModalBooking(b)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded shadow-sm transition-colors"
                          >
                            <DollarSign size={12} /> Catat Deal Penjualan
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center text-slate-400 py-12">Tidak ada data booking cocok.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ PROPERTIES VIEW ══ */}
        {view === "properties" && (
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-serif font-semibold text-slate-900 tracking-wide">Daftar Properti</h1>
                <p className="text-sm text-slate-400 mt-0.5">Kelola data unit properti aktif dan status ketersediaannya</p>
              </div>
              <button 
                onClick={() => { resetForm(); setView("create"); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#064E3B] hover:bg-[#053d2f] text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <Plus size={15} /> Tambah Properti
              </button>
            </div>

            <div className="grid gap-3">
              {properties.map((p) => (
                <div 
                  key={p.kode_rumah}
                  className="bg-white border border-slate-200/80 rounded-xl p-5 flex items-center justify-between hover:border-emerald-200 transition-colors shadow-sm group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center text-slate-400">
                      {p.gambar && p.gambar.length > 0 ? (
                        <img 
                          src={normalizeImageUrl(p.gambar[0])} 
                          alt={p.nama_rumah} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 size={18} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900">{p.nama_rumah}</p>
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{p.kode_rumah}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{p.alamat}, {p.kota} · {p.tipe}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-mono font-semibold text-slate-900">{money(p.harga)}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{p.harga.toLocaleString("id-ID")}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      p.status === "sold" ? "bg-slate-100 text-slate-500" 
                        : p.status === "reserved" ? "bg-amber-50 text-amber-700" 
                          : "bg-emerald-50 text-emerald-700"
                    }`}>
                      {p.status === "sold" ? "Terjual" : p.status === "reserved" ? "Booked" : "Tersedia"}
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => fillFromProperty(p)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 rounded transition-colors"
                        title="Edit properti"
                      >
                        <Edit size={15} />
                      </button>
                      <button 
                        onClick={() => deleteProperty(p.kode_rumah)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded transition-colors"
                        title="Hapus properti"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {properties.length === 0 && (
                <div className="bg-white border border-slate-200/80 rounded-xl p-8 text-center text-slate-400 text-sm">
                  Belum ada properti unit. Klik Tambah Properti untuk memulai.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ CREATE/EDIT PROPERTY VIEW ══ */}
        {view === "create" && (
          <div className="p-8 max-w-3xl space-y-6">
            <div>
              <h1 className="text-2xl font-serif font-semibold text-slate-900 tracking-wide">{isEditing ? "Edit Properti Unit" : "Tambah Properti Baru"}</h1>
              <p className="text-sm text-slate-400 mt-0.5">Isi semua detail, spesifikasi fisik, dan unggah gambar unit</p>
            </div>

            <form onSubmit={submitProperty} className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Kode Rumah</label>
                  <input 
                    type="text" 
                    value={isEditing ? editCode : form.kode_rumah}
                    onChange={(e) => setForm((p) => ({ ...p, kode_rumah: e.target.value }))}
                    disabled={isEditing}
                    placeholder="Contoh: RMH-SENTUL-01"
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Nama Rumah</label>
                  <input 
                    type="text" 
                    value={form.nama_rumah}
                    onChange={(e) => setForm((p) => ({ ...p, nama_rumah: e.target.value }))}
                    placeholder="Contoh: Villa Emerald Sentul"
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Alamat</label>
                  <input 
                    type="text" 
                    value={form.alamat}
                    onChange={(e) => setForm((p) => ({ ...p, alamat: e.target.value }))}
                    placeholder="Jl. Raya Sentul No. 12"
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Kota</label>
                  <input 
                    type="text" 
                    value={form.kota}
                    onChange={(e) => setForm((p) => ({ ...p, kota: e.target.value }))}
                    placeholder="Bogor"
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Tipe Properti</label>
                  <select
                    value={form.tipe}
                    onChange={(e) => setForm((p) => ({ ...p, tipe: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="Rumah">Rumah</option>
                    <option value="Villa">Villa</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Kavling">Kavling</option>
                    <option value="Ruko">Ruko</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Harga Rumah (Rp)</label>
                  <input 
                    type="number" 
                    value={form.harga}
                    onChange={(e) => setForm((p) => ({ ...p, harga: e.target.value }))}
                    placeholder="1200000000"
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Kamar Tidur</label>
                  <input 
                    type="number" 
                    value={form.kamar_tidur}
                    onChange={(e) => setForm((p) => ({ ...p, kamar_tidur: e.target.value }))}
                    placeholder="3"
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Kamar Mandi</label>
                  <input 
                    type="number" 
                    value={form.kamar_mandi}
                    onChange={(e) => setForm((p) => ({ ...p, kamar_mandi: e.target.value }))}
                    placeholder="2"
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Luas Tanah (m²)</label>
                  <input 
                    type="number" 
                    value={form.luas_tanah}
                    onChange={(e) => setForm((p) => ({ ...p, luas_tanah: e.target.value }))}
                    placeholder="120"
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Luas Bangunan (m²)</label>
                  <input 
                    type="number" 
                    value={form.luas_bangunan}
                    onChange={(e) => setForm((p) => ({ ...p, luas_bangunan: e.target.value }))}
                    placeholder="90"
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Kapasitas Garasi (mobil)</label>
                  <input 
                    type="number" 
                    value={form.garasi}
                    onChange={(e) => setForm((p) => ({ ...p, garasi: e.target.value }))}
                    placeholder="1"
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Rating (0 - 5)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    max="5"
                    value={form.rating}
                    onChange={(e) => setForm((p) => ({ ...p, rating: e.target.value }))}
                    placeholder="4.8"
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Fitur Properti (pisahkan dengan koma)</label>
                <input 
                  type="text" 
                  value={form.fitur}
                  onChange={(e) => setForm((p) => ({ ...p, fitur: e.target.value }))}
                  placeholder="Smart Lock, CCTV 24 Jam, Kolam Renang, Balkon Luas"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Deskripsi Singkat</label>
                <textarea 
                  rows={4}
                  value={form.deskripsi}
                  onChange={(e) => setForm((p) => ({ ...p, deskripsi: e.target.value }))}
                  placeholder="Ceritakan detail filosofi ruang dan spesifikasi arsitektur unit..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Foto Properti</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors relative cursor-pointer font-sans">
                  <input 
                    type="file" 
                    multiple 
                    onChange={(e) => setUploadFiles(e.target.files)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="mx-auto text-slate-400 mb-2" size={24} />
                  <p className="text-sm font-semibold text-slate-700">Pilih berkas gambar untuk diunggah</p>
                  <p className="text-xs text-slate-400 mt-1">Format PNG, JPG, atau JPEG (Bisa pilih beberapa gambar)</p>
                  {uploadFiles && uploadFiles.length > 0 && (
                    <p className="text-xs text-emerald-600 mt-3 font-semibold">{uploadFiles.length} gambar dipilih</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => { resetForm(); setView("properties"); }}
                  className="flex-1 py-2.5 text-sm font-medium border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={busyAction === "submitProperty"}
                  className="flex-1 py-2.5 text-sm font-semibold bg-[#064E3B] hover:bg-[#053d2f] text-white rounded-lg transition-colors"
                >
                  {busyAction === "submitProperty" ? "Menyimpan..." : "Simpan Properti"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ══ FINANCE REPORT VIEW ══ */}
        {view === "finance" && (
          <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-serif font-semibold text-slate-900 tracking-wide">Laporan Keuangan</h1>
                <p className="text-sm text-slate-400 mt-0.5">Analisis pendapatan, pengeluaran operasional, dan laba bersih</p>
              </div>
            </div>

            {/* Range Filters */}
            <div className="flex flex-wrap gap-4 bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Tahun</label>
                <select 
                  value={financeYear} 
                  onChange={(e) => setFinanceYear(Number(e.target.value))}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                  <option value={2024}>2024</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Dari Bulan</label>
                <select 
                  value={fromMonth} 
                  onChange={(e) => setFromMonth(Number(e.target.value))}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                >
                  {MONTH_NAMES.map((name, i) => (
                    <option key={i} value={i + 1}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Sampai Bulan</label>
                <select 
                  value={toMonth} 
                  onChange={(e) => setToMonth(Number(e.target.value))}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                >
                  {MONTH_NAMES.map((name, i) => (
                    <option key={i} value={i + 1} disabled={i + 1 < fromMonth}>{name}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 text-right">
                <span className="text-xs text-slate-400 italic">Menampilkan laporan: {MONTH_NAMES[fromMonth - 1]} - {MONTH_NAMES[toMonth - 1]} {financeYear}</span>
              </div>
            </div>

            {/* Range summary statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Total Pemasukan Periode Ini</p>
                <p className="mt-1.5 text-2xl font-semibold leading-none font-mono text-emerald-600">{money(rangeSummary.total_pemasukan)}</p>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Total Pengeluaran Periode Ini</p>
                <p className="mt-1.5 text-2xl font-semibold leading-none font-mono text-red-500">{money(rangeSummary.total_pengeluaran)}</p>
              </div>
              <div className={`rounded-xl p-5 border shadow-sm ${rangeSummary.laba_bersih >= 0 ? "bg-[#064E3B] border-transparent text-white" : "bg-red-950 border-transparent text-white"}`}>
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-300">Laba Bersih Periode Ini</p>
                <p className="mt-1.5 text-2xl font-semibold leading-none font-mono">{money(rangeSummary.laba_bersih)}</p>
              </div>
            </div>

            {/* Layout for form and grid breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Add Transaction Form */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm self-start space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3">Input Transaksi Manual</h3>
                
                <form onSubmit={saveFinanceTransaction} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Tanggal</label>
                    <input 
                      type="date" 
                      value={financeForm.tanggal}
                      onChange={(e) => setFinanceForm((p) => ({ ...p, tanggal: e.target.value }))}
                      required
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Tipe Transaksi</label>
                    <select 
                      value={financeForm.tipe} 
                      onChange={(e) => setFinanceForm((p) => ({ ...p, tipe: e.target.value as "pemasukan" | "pengeluaran" }))}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                    >
                      <option value="pemasukan">Pemasukan</option>
                      <option value="pengeluaran">Pengeluaran</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Kategori</label>
                    <select 
                      value={financeForm.kategori} 
                      onChange={(e) => setFinanceForm((p) => ({ ...p, kategori: e.target.value }))}
                      required
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                    >
                      <option value="">Pilih Kategori...</option>
                      {financeForm.tipe === "pemasukan"
                        ? INCOME_CATS.map((c) => <option key={c} value={c}>{c}</option>)
                        : EXPENSE_CATS.map((c) => <option key={c} value={c}>{c}</option>)
                      }
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Jumlah (Rp)</label>
                    <input 
                      type="number" 
                      value={financeForm.jumlah}
                      onChange={(e) => setFinanceForm((p) => ({ ...p, jumlah: e.target.value }))}
                      placeholder="Jumlah nominal"
                      required
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Keterangan / Deskripsi</label>
                    <textarea 
                      rows={3}
                      value={financeForm.deskripsi}
                      onChange={(e) => setFinanceForm((p) => ({ ...p, deskripsi: e.target.value }))}
                      placeholder="Detail pembayaran..."
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white resize-none"
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={busyAction === "finance-add"}
                    className="w-full py-2.5 bg-[#064E3B] hover:bg-[#053d2f] text-white text-sm font-semibold rounded-lg transition-colors uppercase tracking-wider"
                  >
                    {busyAction === "finance-add" ? "Menyimpan..." : "Simpan Transaksi"}
                  </button>
                </form>
              </div>

              {/* Monthly breakdown table */}
              <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900">Rincian Per Bulan</h3>
                </div>
                <div className="flex-1 overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <th className="px-5 py-3.5">Bulan</th>
                        <th className="px-5 py-3.5">Penjualan Unit</th>
                        <th className="px-5 py-3.5">Booking Fee</th>
                        <th className="px-5 py-3.5">Pemasukan Manual</th>
                        <th className="px-5 py-3.5">Pengeluaran</th>
                        <th className="px-5 py-3.5 text-right">Laba Bersih</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {filteredMonthlyRows.map((row) => (
                        <tr key={row.bulan} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3.5 font-semibold text-slate-800">{row.nama_bulan}</td>
                          <td className="px-5 py-3.5 font-mono">{money(row.total_penjualan)}</td>
                          <td className="px-5 py-3.5 font-mono">{money(row.total_booking_fee)}</td>
                          <td className="px-5 py-3.5 font-mono">{money(row.total_pemasukan_manual)}</td>
                          <td className="px-5 py-3.5 font-mono text-red-500">{money(row.total_pengeluaran)}</td>
                          <td className={`px-5 py-3.5 text-right font-mono font-semibold ${row.laba_bersih >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                            {money(row.laba_bersih)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* List of Manual Transactions */}
            <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900">Arsip Transaksi Manual</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="px-5 py-3.5">Tanggal</th>
                      <th className="px-5 py-3.5">Tipe</th>
                      <th className="px-5 py-3.5">Kategori</th>
                      <th className="px-5 py-3.5">Deskripsi</th>
                      <th className="px-5 py-3.5">Jumlah</th>
                      <th className="px-5 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {filteredTransactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-slate-400">{shortDate(t.tanggal)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${t.tipe === "pemasukan" ? "text-emerald-700 bg-emerald-50" : "text-red-600 bg-red-50"}`}>
                            {t.tipe === "pemasukan" ? "Masuk" : "Keluar"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-800">{t.kategori}</td>
                        <td className="px-5 py-3.5 text-xs text-slate-400 max-w-[200px] truncate">
                          {t.deskripsi || "—"}
                          {t.source_ref && (
                            <span className="block font-mono text-emerald-600 font-semibold mt-0.5">#{t.source_ref.split("_")[0]}</span>
                          )}
                        </td>
                        <td className={`px-5 py-3.5 font-mono font-semibold ${t.tipe === "pemasukan" ? "text-emerald-600" : "text-red-500"}`}>
                          {t.tipe === "pemasukan" ? "+" : "-"}{money(t.jumlah)}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {t.sumber === "manual" && (
                            <button
                              onClick={() => deleteFinanceTransaction(t.id)}
                              className="p-1 text-slate-300 hover:text-red-500 rounded transition-colors"
                              title="Hapus Transaksi"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredTransactions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center text-slate-400 py-12">Belum ada transaksi manual tercatat di periode ini.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ══ MANUAL DEAL RECORDING MODAL ══ */}
      {dealModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDealModalBooking(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900 font-serif">Catat Deal Penjualan</h2>
              <button onClick={() => setDealModalBooking(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-slate-900">{dealModalBooking.nama_depan} {dealModalBooking.nama_belakang}</p>
                <p className="text-[11px] font-mono text-slate-400 font-semibold">Inquiry: {dealModalBooking.kode_inquiry}</p>
                <p className="text-[11px] text-slate-500 font-semibold">{dealModalBooking.nama_rumah} · {dealModalBooking.kota}</p>
              </div>

              <form onSubmit={saveDealTransaction} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Tanggal Deal</label>
                  <input 
                    type="date" 
                    value={dealForm.tanggal}
                    onChange={(e) => setDealForm((p) => ({ ...p, tanggal: e.target.value }))}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Jumlah Deal (Rp)</label>
                  <input 
                    type="number" 
                    value={dealForm.jumlah}
                    onChange={(e) => setDealForm((p) => ({ ...p, jumlah: e.target.value }))}
                    placeholder="Contoh: 1200000000"
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Kategori</label>
                  <select 
                    value={dealForm.kategori}
                    onChange={(e) => setDealForm((p) => ({ ...p, kategori: e.target.value }))}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    {INCOME_CATS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Catatan Keterangan</label>
                  <textarea 
                    rows={3}
                    value={dealForm.deskripsi}
                    onChange={(e) => setDealForm((p) => ({ ...p, deskripsi: e.target.value }))}
                    placeholder="Detail cara pembayaran, KPR, cash bertahap, dll..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white resize-none"
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setDealModalBooking(null)}
                    className="flex-1 py-2 text-sm font-medium border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={busyAction === "deal-add"}
                    className="flex-1 py-2 text-sm font-semibold bg-[#064E3B] hover:bg-[#053d2f] text-white rounded-lg"
                  >
                    {busyAction === "deal-add" ? "Menyimpan..." : "Simpan Deal"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}
