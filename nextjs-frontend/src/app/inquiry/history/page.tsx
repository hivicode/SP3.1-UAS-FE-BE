"use client";

import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch, BookingApi } from "@/lib/api";
import { money } from "@/lib/format";

type HistoryItem = {
  kode_inquiry: string;
  contact: string;
  propertyName: string;
  createdAt: number;
};

type LoadedBooking = BookingApi & {
  remainingText?: string;
  isExpired?: boolean;
};

const INQUIRY_STATUS_LABELS: Record<string, string> = {
  new: "Minat baru",
  contacted: "Sudah dihubungi",
  booking_fee_pending: "Menunggu booking fee",
  reserved: "Booked",
  closed: "Sold",
  cancelled: "Dibatalkan / Kadaluarsa",
};

export default function HistoryPage() {
  const [inquiries, setInquiries] = useState<HistoryItem[]>([]);
  const [bookings, setBookings] = useState<Record<string, LoadedBooking>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = window.localStorage.getItem("planb_inquiries");
    if (!raw) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as HistoryItem[];
      if (Array.isArray(parsed)) {
        setInquiries(parsed);
        loadStatusForList(parsed);
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, []);

  const loadStatusForList = async (items: HistoryItem[]) => {
    const loaded: Record<string, LoadedBooking> = {};
    
    // Fetch statuses in parallel
    await Promise.all(
      items.map(async (item) => {
        try {
          const res = await apiFetch<BookingApi>("/api/booking/status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              kode_inquiry: item.kode_inquiry,
              contact: item.contact,
            }),
          });
          
          // Calculate remaining time for 3 days limit
          const createdAtMs = new Date(res.dibuat_pada || item.createdAt).getTime();
          const deadlineMs = createdAtMs + 3 * 24 * 60 * 60 * 1000;
          const diffMs = deadlineMs - Date.now();
          
          let remainingText = "";
          let isExpired = false;
          
          if (["new", "booking_fee_pending"].includes(res.status)) {
            if (diffMs <= 0) {
              isExpired = true;
              remainingText = "Waktu pembayaran habis (Batas 3 hari)";
            } else {
              const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
              const days = Math.floor(totalHours / 24);
              const hours = totalHours % 24;
              remainingText = days > 0 ? `${days} hari ${hours} jam lagi` : `${hours} jam lagi`;
            }
          }
          
          loaded[item.kode_inquiry] = {
            ...res,
            remainingText,
            isExpired,
          };
        } catch {
          // If status api fails, fallback to local details
          loaded[item.kode_inquiry] = {
            id: 0,
            kode_inquiry: item.kode_inquiry,
            kode_rumah: "",
            nama_depan: "",
            nama_belakang: "",
            email: "",
            telepon: item.contact,
            metode_pembayaran: "—",
            booking_fee: 0,
            status: "unknown",
            catatan: "",
            jadwal_kunjungan: null,
            preferensi_kontak: "",
            dibuat_pada: new Date(item.createdAt).toISOString(),
            nama_rumah: item.propertyName,
            alamat: "",
            kota: "",
          };
        }
      })
    );
    
    setBookings(loaded);
    setLoading(false);
  };

  return (
    <div className="history-page-container" suppressHydrationWarning>
      <Header />

      <main className="main-content">
        <div className="container-inner">

          <nav aria-label="Breadcrumb" className="breadcrumb">
            <Link href="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Riwayat Minat</span>
          </nav>

          <div className="section-header">
            <h1 className="page-title font-serif">Riwayat Minat Anda</h1>
            <p className="page-lead">
              Daftar seluruh properti yang Anda ajukan atau pesan dari browser ini. Batas waktu pelunasan booking fee adalah 3 hari.
            </p>
          </div>

          {loading ? (
            <div className="loading-state">Memuat data riwayat...</div>
          ) : inquiries.length === 0 ? (
            <div className="empty-state">
              <p>Belum ada riwayat pengajuan minat di browser ini.</p>
              <Link href="/listing" className="catalog-btn">
                Lihat Katalog Properti
              </Link>
            </div>
          ) : (
            <div className="history-list">
              {inquiries.map((item) => {
                const booking = bookings[item.kode_inquiry];
                if (!booking) return null;

                const status = booking.isExpired ? "cancelled" : booking.status;
                const statusLabel = INQUIRY_STATUS_LABELS[status] || status;

                return (
                  <div key={item.kode_inquiry} className="history-card">
                    <div className="card-header">
                      <div>
                        <h2 className="property-title font-serif">{booking.nama_rumah}</h2>
                        <span className="inquiry-code font-mono">{item.kode_inquiry}</span>
                      </div>
                      <div className="status-wrap">
                        <span className={`status-badge ${status}`}>
                          {statusLabel}
                        </span>
                      </div>
                    </div>

                    <div className="card-body">
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">Tanggal Pengajuan</span>
                          <span className="info-val">
                            {new Date(booking.dibuat_pada).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Booking Fee</span>
                          <span className="info-val font-mono">{money(booking.booking_fee)}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Kontak Pengaju</span>
                          <span className="info-val">{booking.telepon || booking.email || item.contact}</span>
                        </div>
                      </div>

                      {booking.remainingText && (
                        <div className={`deadline-box ${booking.isExpired ? "expired" : "active"}`}>
                          <span className="deadline-title">Batas Waktu Booking Fee (3 Hari)</span>
                          <p className="deadline-desc">{booking.remainingText}</p>
                        </div>
                      )}
                    </div>

                    <div className="card-footer">
                      <Link href={`/inquiry/status?code=${item.kode_inquiry}&contact=${item.contact}`} className="detail-link">
                        Lihat Detail & Scan Pembayaran →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>

      <Footer />

      <style jsx>{`
        .history-page-container {
          background: #f4efe4;
          color: #1f2a22;
          min-height: 100vh;
        }

        .main-content {
          max-width: 56rem;
          margin: 0 auto;
          padding: 8rem 1.25rem 4rem;
        }

        @media (min-width: 768px) {
          .main-content {
            padding: 9rem 3rem 5rem;
          }
        }

        /* Breadcrumb styling */
        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 3rem;
          color: rgba(31, 42, 34, 0.6);
        }

        .breadcrumb-link {
          text-decoration: none;
          color: inherit;
        }

        .breadcrumb-separator {
          opacity: 0.5;
        }

        .breadcrumb-current {
          color: #1f2a22;
          font-weight: 600;
        }

        .page-title {
          font-size: 3rem;
          font-weight: 500;
          line-height: 1.1;
          letter-spacing: -0.04em;
          margin-bottom: 1rem;
        }

        .page-lead {
          font-size: 15px;
          color: rgba(31, 42, 34, 0.6);
          margin-bottom: 3rem;
          line-height: 1.6;
        }

        .loading-state,
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border: 1px solid rgba(31, 42, 34, 0.15);
        }

        .empty-state p {
          font-size: 15px;
          color: rgba(31, 42, 34, 0.6);
          margin-bottom: 1.5rem;
        }

        .catalog-btn {
          display: inline-block;
          background: #111111;
          color: #f7f0e4;
          text-decoration: none;
          padding: 0.9rem 1.75rem;
          font-size: 11px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        .catalog-btn:hover {
          background: black;
          color: white;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .history-card {
          background: white;
          border: 1px solid rgba(31, 42, 34, 0.15);
          padding: 2.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid rgba(31, 42, 34, 0.1);
          padding-bottom: 1.25rem;
        }

        .property-title {
          font-size: 1.6rem;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .inquiry-code {
          font-size: 11px;
          color: rgba(31, 42, 34, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .status-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          padding: 0.4rem 0.8rem;
          border-radius: 2px;
        }

        /* Statuses styling */
        .status-badge.new {
          background: #eff6ff;
          color: #1e40af;
        }

        .status-badge.contacted {
          background: #f5f3ff;
          color: #5b21b6;
        }

        .status-badge.booking_fee_pending {
          background: #fffbeb;
          color: #92400e;
        }

        .status-badge.reserved {
          background: #f0fdf4;
          color: #166534;
        }

        .status-badge.closed {
          background: #ecfdf5;
          color: #065f46;
        }

        .status-badge.cancelled {
          background: #f1f5f9;
          color: #475569;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }

        @media (min-width: 640px) {
          .info-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .info-label {
          display: block;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: rgba(31, 42, 34, 0.5);
          margin-bottom: 0.25rem;
        }

        .info-val {
          font-size: 14px;
          font-weight: 600;
        }

        .deadline-box {
          margin-top: 1.5rem;
          padding: 1.25rem;
          background: #f4efe4;
          border-left: 3px solid #1f2a22;
        }

        .deadline-box.expired {
          background: #fef2f2;
          border-left-color: #dc2626;
        }

        .deadline-box.active {
          background: #fefbeb;
          border-left-color: #d97706;
        }

        .deadline-title {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          font-weight: 750;
          display: block;
          margin-bottom: 0.25rem;
          color: rgba(31, 42, 34, 0.6);
        }

        .deadline-desc {
          font-size: 13px;
          font-weight: 600;
        }

        .detail-link {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-weight: 750;
          color: #111111;
          text-decoration: none;
          border-bottom: 1px solid #111111;
          padding-bottom: 0.25rem;
          transition: opacity 0.2s ease;
          align-self: flex-start;
          display: inline-block;
        }

        .detail-link:hover {
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}
