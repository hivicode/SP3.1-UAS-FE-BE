"use client";

import { FormEvent, useMemo, useState, useEffect, useCallback } from "react";
import {
  apiFetch,
  AuthResponse,
  BookingApi,
  FinanceMonthlyRow,
  FinanceReport,
  PropertyApi,
  withAuth,
  makeApiUrl,
  normalizeImageUrl,
} from "@/lib/api";
import { clearAdminToken, getAdminToken, setAdminToken } from "@/lib/auth";
import { money } from "@/lib/format";
import "./admin.css";

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

type AdminView = "dashboard" | "customers" | "create" | "finance";

const emptyForm: PropertyFormState = {
  kode_rumah: "",
  nama_rumah: "",
  alamat: "",
  kota: "",
  tipe: "house",
  harga: "",
  rating: "",
  kamar_tidur: "",
  kamar_mandi: "",
  luas_tanah: "",
  luas_bangunan: "",
  garasi: "",
  fitur: "",
  deskripsi: "",
};

export default function AdminPage() {
  const [view, setView] = useState<AdminView>("dashboard");
  const [token, setToken] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [properties, setProperties] = useState<PropertyApi[]>([]);
  const [bookings, setBookings] = useState<BookingApi[]>([]);
  const [form, setForm] = useState<PropertyFormState>(emptyForm);
  const [editCode, setEditCode] = useState("");
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [busyAction, setBusyAction] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [financeYear, setFinanceYear] = useState(new Date().getFullYear());
  const [financeReport, setFinanceReport] = useState<FinanceReport | null>(null);
  const [financeDrafts, setFinanceDrafts] = useState<
    Record<number, { biaya_operasional: string; catatan: string }>
  >({});
  const [loadingFinance, setLoadingFinance] = useState(false);

  const isEditing = Boolean(editCode);

  const bookingStats = useMemo(() => {
    const base = { total: bookings.length, pending: 0, confirmed: 0, cancelled: 0 };
    bookings.forEach((item) => {
      if (item.status === "pending") base.pending += 1;
      if (item.status === "confirmed") base.confirmed += 1;
      if (item.status === "cancelled") base.cancelled += 1;
    });
    return base;
  }, [bookings]);

  const filteredProperties = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return properties;
    return properties.filter((property) =>
      `${property.nama_rumah} ${property.alamat} ${property.kota}`.toLowerCase().includes(q)
    );
  }, [properties, searchQuery]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredProperties.length / perPage)),
    [filteredProperties.length, perPage]
  );

  const pagedProperties = useMemo(() => {
    const offset = (page - 1) * perPage;
    return filteredProperties.slice(offset, offset + perPage);
  }, [filteredProperties, page, perPage]);

  const topType = useMemo(() => {
    if (pagedProperties.length === 0) return "-";
    const counts = pagedProperties.reduce<Record<string, number>>((acc, item) => {
      const key = item.tipe || "-";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }, [pagedProperties]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, perPage]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

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

  const loadFinance = useCallback(async (authToken: string, year = financeYear) => {
    setLoadingFinance(true);
    try {
      const report = await apiFetch<FinanceReport>(`/api/finance/report?year=${year}`, {
        headers: withAuth(authToken),
      });
      setFinanceReport(report);

      const draftMap = report.bulanan.reduce<
        Record<number, { biaya_operasional: string; catatan: string }>
      >((acc, row) => {
        acc[row.bulan] = {
          biaya_operasional: String(row.biaya_operasional || 0),
          catatan: row.catatan || "",
        };
        return acc;
      }, {});
      setFinanceDrafts(draftMap);
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
    loadFinance(token, financeYear).catch(() => {
      // keep current report if request fails
    });
  }, [token, financeYear, loadFinance]);

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
    } catch {
      setLoginError("Username atau password salah.");
    } finally {
      setBusyAction("");
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    setToken("");
    setProperties([]);
    setBookings([]);
    resetForm();
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
      const headers = withAuth(token);

      await fetch(makeApiUrl(path), {
        method,
        headers,
        body: payload,
      }).then(async (response) => {
        if (!response.ok) throw new Error(await response.text());
      });

      await loadDashboard(token);
      resetForm();
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
      if (editCode === kode) resetForm();
    } catch {
      window.alert("Gagal menghapus properti.");
    } finally {
      setBusyAction("");
    }
  };

  const updateBookingStatus = async (bookingId: number, status: "pending" | "confirmed" | "cancelled") => {
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
      window.alert("Gagal update status booking.");
    } finally {
      setBusyAction("");
    }
  };

  const updateFinanceDraft = (
    month: number,
    patch: Partial<{ biaya_operasional: string; catatan: string }>
  ) => {
    setFinanceDrafts((prev) => ({
      ...prev,
      [month]: {
        biaya_operasional: prev[month]?.biaya_operasional ?? "0",
        catatan: prev[month]?.catatan ?? "",
        ...patch,
      },
    }));
  };

  const saveOperationalCost = async (row: FinanceMonthlyRow) => {
    if (!token) return;
    const draft = financeDrafts[row.bulan] || {
      biaya_operasional: String(row.biaya_operasional || 0),
      catatan: row.catatan || "",
    };
    setBusyAction(`finance-${row.bulan}`);
    try {
      await apiFetch("/api/finance/operasional", {
        method: "POST",
        headers: {
          ...withAuth(token),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tahun: financeYear,
          bulan: row.bulan,
          biaya_operasional: Number(draft.biaya_operasional || 0),
          catatan: draft.catatan || "",
        }),
      });
      await loadFinance(token, financeYear);
    } catch {
      window.alert("Gagal menyimpan biaya operasional.");
    } finally {
      setBusyAction("");
    }
  };

  if (checkingSession) {
    return <main className="admin-login-wrap">Memeriksa sesi admin...</main>;
  }

  if (!token) {
    return (
      <main className="admin-login-wrap">
        <section className="admin-card admin-login-card admin-grid">
          <div>
            <h1 className="admin-title">Admin Login</h1>
            <p className="admin-subtitle">Gunakan akun default: admin / admin</p>
          </div>
          <form onSubmit={handleLogin} className="admin-grid">
            <input className="admin-input" name="username" placeholder="Username" defaultValue="admin" required />
            <input className="admin-input" name="password" type="password" placeholder="Password" defaultValue="admin" required />
            <button className="admin-btn" type="submit" disabled={busyAction === "login"}>
              {busyAction === "login" ? "Memproses..." : "Login"}
            </button>
            {loginError && <p className="admin-muted" style={{ color: "#a02020" }}>{loginError}</p>}
          </form>
        </section>
      </main>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-mark">B</div>
          <div>
            <p style={{ margin: 0, fontWeight: 700 }}>PlanB</p>
            <small className="admin-muted">Admin Panel</small>
          </div>
        </div>
        <nav className="admin-nav">
          <button className={`admin-nav-btn ${view === "dashboard" ? "active" : ""}`} type="button" onClick={() => setView("dashboard")}>
            Dashboard
          </button>
          <button className={`admin-nav-btn ${view === "customers" ? "active" : ""}`} type="button" onClick={() => setView("customers")}>
            Customer
          </button>
          <button className={`admin-nav-btn ${view === "create" ? "active" : ""}`} type="button" onClick={() => setView("create")}>
            {isEditing ? "Edit Properti" : "Tambah Properti"}
          </button>
          <button className={`admin-nav-btn ${view === "finance" ? "active" : ""}`} type="button" onClick={() => setView("finance")}>
            Laporan Keuangan
          </button>
        </nav>
        <div style={{ marginTop: "auto" }}>
          <button className="admin-btn" type="button" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className="admin-content">
        {view === "dashboard" && (
          <>
            <div className="admin-header">
              <div>
                <h1 className="admin-title">Dashboard</h1>
                <p className="admin-subtitle">Ringkasan listing dan kondisi terbaru properti.</p>
              </div>
              <button className="admin-btn" type="button" onClick={() => setView("create")}>Tambah Properti</button>
            </div>

            <div className="admin-stats">
              <div className="admin-stat-card">
                <div className="admin-stat-title">Total Listing</div>
                <div className="admin-stat-value">{filteredProperties.length}</div>
                <div className="admin-muted">Tersimpan di database.</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-title">Tipe Teratas</div>
                <div className="admin-stat-value">{topType}</div>
                <div className="admin-muted">Kategori terbanyak.</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-title">Status Booking</div>
                <div className="admin-stat-value">{bookingStats.total}</div>
                <div className="admin-muted">
                  Pending: {bookingStats.pending}, Confirmed: {bookingStats.confirmed}, Cancelled: {bookingStats.cancelled}
                </div>
              </div>
            </div>

            <section className="admin-card" style={{ marginTop: "1.5rem" }}>
              <div className="admin-toolbar">
                <input
                  className="admin-input"
                  placeholder="Cari nama properti, alamat, atau kota..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
                <select
                  className="admin-select"
                  value={String(perPage)}
                  onChange={(event) => setPerPage(Number(event.target.value) || 10)}
                >
                  <option value="5">5 / page</option>
                  <option value="10">10 / page</option>
                  <option value="20">20 / page</option>
                  <option value="50">50 / page</option>
                </select>
              </div>
              {loadingData && <p className="admin-muted">Memuat data dashboard...</p>}
              {!loadingData && filteredProperties.length === 0 && <p className="admin-muted">Belum ada data properti.</p>}
              {!loadingData && filteredProperties.length > 0 && (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Kode</th>
                      <th>Nama</th>
                      <th>Alamat</th>
                      <th>Harga</th>
                      <th>Gambar</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedProperties.map((property) => (
                      <tr key={property.kode_rumah}>
                        <td>{property.kode_rumah}</td>
                        <td>
                          <strong>{property.nama_rumah}</strong>
                          <div className="admin-muted">{property.kota} • {property.tipe}</div>
                        </td>
                        <td>{property.alamat}</td>
                        <td>{money(property.harga)}</td>
                        <td>
                          <div className="admin-thumbs">
                            {(property.gambar || []).slice(0, 3).map((image, index) => (
                              <img key={`${property.kode_rumah}-${index}`} src={normalizeImageUrl(image)} alt={property.nama_rumah} />
                            ))}
                          </div>
                        </td>
                        <td>
                          <div className="admin-actions">
                            <button className="admin-icon-btn" type="button" onClick={() => fillFromProperty(property)}>
                              Edit
                            </button>
                            <button
                              className="admin-icon-btn danger"
                              type="button"
                              onClick={() => deleteProperty(property.kode_rumah)}
                              disabled={busyAction === `delete-${property.kode_rumah}`}
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {!loadingData && filteredProperties.length > 0 && (
                <div className="admin-pagination">
                  <button
                    className="admin-btn secondary"
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  >
                    Prev
                  </button>
                  <span className="admin-muted">
                    Page {page} / {totalPages} • {filteredProperties.length} items
                  </span>
                  <button
                    className="admin-btn secondary"
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  >
                    Next
                  </button>
                </div>
              )}
            </section>
          </>
        )}

        {view === "customers" && (
          <>
            <div className="admin-header">
              <div>
                <h1 className="admin-title">Customer</h1>
                <p className="admin-subtitle">Daftar booking dan kontak pelanggan terbaru.</p>
              </div>
            </div>
            <section className="admin-card">
              {!bookings.length && <p className="admin-muted">Belum ada booking masuk.</p>}
              {bookings.length > 0 && (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>Properti</th>
                      <th>Kontak</th>
                      <th>Metode</th>
                      <th>Status</th>
                      <th>Booking Fee</th>
                      <th>Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>
                          <strong>{booking.nama_depan} {booking.nama_belakang}</strong>
                          <div className="admin-muted">ID {booking.id}</div>
                        </td>
                        <td>
                          <div>{booking.nama_rumah}</div>
                          <div className="admin-muted">{booking.alamat}, {booking.kota}</div>
                        </td>
                        <td>
                          <div>{booking.email}</div>
                          <div className="admin-muted">{booking.telepon}</div>
                        </td>
                        <td>{booking.metode_pembayaran}</td>
                        <td>
                          <div className="admin-actions">
                            <select
                              className="admin-select"
                              defaultValue={booking.status}
                              onChange={(event) =>
                                updateBookingStatus(
                                  booking.id,
                                  event.target.value as "pending" | "confirmed" | "cancelled"
                                )
                              }
                              disabled={busyAction === `booking-${booking.id}`}
                            >
                              <option value="pending">pending</option>
                              <option value="confirmed">confirmed</option>
                              <option value="cancelled">cancelled</option>
                            </select>
                          </div>
                        </td>
                        <td>{money(booking.booking_fee)}</td>
                        <td className="admin-muted">
                          {new Date(booking.dibuat_pada).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </>
        )}

        {view === "finance" && (
          <>
            <div className="admin-header">
              <div>
                <h1 className="admin-title">Laporan Keuangan</h1>
                <p className="admin-subtitle">
                  Penjualan terkonfirmasi dikurangi biaya operasional per bulan.
                </p>
              </div>
              <div className="admin-actions">
                <input
                  className="admin-input"
                  style={{ width: "120px" }}
                  type="number"
                  min={2000}
                  max={2100}
                  value={financeYear}
                  onChange={(event) => setFinanceYear(Number(event.target.value) || new Date().getFullYear())}
                />
              </div>
            </div>

            {financeReport && (
              <div className="admin-stats" style={{ marginBottom: "1rem" }}>
                <div className="admin-stat-card">
                  <div className="admin-stat-title">Total Penjualan ({financeReport.tahun})</div>
                  <div className="admin-stat-value">{money(financeReport.summary.total_penjualan)}</div>
                  <div className="admin-muted">{financeReport.summary.total_transaksi} transaksi confirmed</div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-title">Biaya Operasional</div>
                  <div className="admin-stat-value">{money(financeReport.summary.total_biaya_operasional)}</div>
                  <div className="admin-muted">Akumulasi biaya per bulan</div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-title">Laba Bersih</div>
                  <div className="admin-stat-value">{money(financeReport.summary.total_laba_bersih)}</div>
                  <div className="admin-muted">Penjualan - biaya operasional</div>
                </div>
              </div>
            )}

            <section className="admin-card">
              {loadingFinance && <p className="admin-muted">Memuat laporan keuangan...</p>}
              {!loadingFinance && financeReport && (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Bulan</th>
                      <th>Penjualan</th>
                      <th>Booking Fee</th>
                      <th>Biaya Operasional</th>
                      <th>Laba Bersih</th>
                      <th>Catatan</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financeReport.bulanan.map((row) => {
                      const draft = financeDrafts[row.bulan] || {
                        biaya_operasional: String(row.biaya_operasional || 0),
                        catatan: row.catatan || "",
                      };
                      const projectedProfit =
                        Number(row.total_penjualan || 0) - Number(draft.biaya_operasional || 0);
                      return (
                        <tr key={row.bulan}>
                          <td>
                            <strong>{row.nama_bulan}</strong>
                          </td>
                          <td>{money(row.total_penjualan)}</td>
                          <td>{money(row.total_booking_fee)}</td>
                          <td style={{ minWidth: "180px" }}>
                            <input
                              className="admin-input"
                              type="number"
                              min={0}
                              value={draft.biaya_operasional}
                              onChange={(event) =>
                                updateFinanceDraft(row.bulan, { biaya_operasional: event.target.value })
                              }
                            />
                          </td>
                          <td>{money(projectedProfit)}</td>
                          <td style={{ minWidth: "220px" }}>
                            <input
                              className="admin-input"
                              value={draft.catatan}
                              onChange={(event) =>
                                updateFinanceDraft(row.bulan, { catatan: event.target.value })
                              }
                              placeholder="Catatan operasional..."
                            />
                          </td>
                          <td>
                            <button
                              className="admin-btn"
                              type="button"
                              disabled={busyAction === `finance-${row.bulan}`}
                              onClick={() => saveOperationalCost(row)}
                            >
                              {busyAction === `finance-${row.bulan}` ? "Menyimpan..." : "Simpan"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </section>
          </>
        )}

        {view === "create" && (
          <>
            <div className="admin-header">
              <div>
                <h1 className="admin-title">{isEditing ? `Edit Properti ${editCode}` : "Tambah Properti"}</h1>
                <p className="admin-subtitle">Lengkapi detail properti dan unggah beberapa gambar.</p>
              </div>
              <button className="admin-btn secondary" type="button" onClick={() => { resetForm(); setView("dashboard"); }}>
                Kembali
              </button>
            </div>
            <section className="admin-card">
              <form onSubmit={submitProperty} className="admin-form-grid">
                <div className="admin-field">
                  <label>Kode Rumah</label>
                  <input className="admin-input" value={form.kode_rumah} disabled={isEditing} onChange={(event) => setForm((prev) => ({ ...prev, kode_rumah: event.target.value }))} required />
                </div>
                <div className="admin-field">
                  <label>Nama Rumah</label>
                  <input className="admin-input" value={form.nama_rumah} onChange={(event) => setForm((prev) => ({ ...prev, nama_rumah: event.target.value }))} required />
                </div>
                <div className="admin-field">
                  <label>Alamat</label>
                  <input className="admin-input" value={form.alamat} onChange={(event) => setForm((prev) => ({ ...prev, alamat: event.target.value }))} required />
                </div>
                <div className="admin-field">
                  <label>Kota</label>
                  <input className="admin-input" value={form.kota} onChange={(event) => setForm((prev) => ({ ...prev, kota: event.target.value }))} required />
                </div>
                <div className="admin-field">
                  <label>Tipe</label>
                  <select className="admin-select" value={form.tipe} onChange={(event) => setForm((prev) => ({ ...prev, tipe: event.target.value }))}>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="cabin">Cabin</option>
                  </select>
                </div>
                <div className="admin-field">
                  <label>Harga</label>
                  <input className="admin-input" value={form.harga} onChange={(event) => setForm((prev) => ({ ...prev, harga: event.target.value }))} required />
                </div>
                <div className="admin-field">
                  <label>Rating</label>
                  <input className="admin-input" value={form.rating} onChange={(event) => setForm((prev) => ({ ...prev, rating: event.target.value }))} required />
                </div>
                <div className="admin-field">
                  <label>Kamar Tidur</label>
                  <input className="admin-input" value={form.kamar_tidur} onChange={(event) => setForm((prev) => ({ ...prev, kamar_tidur: event.target.value }))} required />
                </div>
                <div className="admin-field">
                  <label>Kamar Mandi</label>
                  <input className="admin-input" value={form.kamar_mandi} onChange={(event) => setForm((prev) => ({ ...prev, kamar_mandi: event.target.value }))} required />
                </div>
                <div className="admin-field">
                  <label>Luas Tanah</label>
                  <input className="admin-input" value={form.luas_tanah} onChange={(event) => setForm((prev) => ({ ...prev, luas_tanah: event.target.value }))} required />
                </div>
                <div className="admin-field">
                  <label>Luas Bangunan</label>
                  <input className="admin-input" value={form.luas_bangunan} onChange={(event) => setForm((prev) => ({ ...prev, luas_bangunan: event.target.value }))} required />
                </div>
                <div className="admin-field">
                  <label>Garasi</label>
                  <input className="admin-input" value={form.garasi} onChange={(event) => setForm((prev) => ({ ...prev, garasi: event.target.value }))} required />
                </div>
                <div className="admin-field admin-full">
                  <label>Fitur</label>
                  <input className="admin-input" value={form.fitur} onChange={(event) => setForm((prev) => ({ ...prev, fitur: event.target.value }))} placeholder="parking,pool,garden,gym" />
                </div>
                <div className="admin-field admin-full">
                  <label>Deskripsi</label>
                  <textarea className="admin-textarea" value={form.deskripsi} onChange={(event) => setForm((prev) => ({ ...prev, deskripsi: event.target.value }))} />
                </div>
                <div className="admin-field admin-full">
                  <label>Upload Gambar</label>
                  <input className="admin-input" type="file" multiple onChange={(event) => setUploadFiles(event.target.files)} />
                </div>
                <div className="admin-full admin-actions">
                  <button className="admin-btn" type="submit" disabled={busyAction === "submitProperty"}>
                    {busyAction === "submitProperty" ? "Menyimpan..." : isEditing ? "Update Properti" : "Tambah Properti"}
                  </button>
                  {isEditing && (
                    <button className="admin-btn secondary" type="button" onClick={resetForm}>
                      Batal Edit
                    </button>
                  )}
                </div>
              </form>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
