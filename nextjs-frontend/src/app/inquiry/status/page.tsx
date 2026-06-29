"use client";

import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { apiFetch, BookingApi } from "@/lib/api";
import { money } from "@/lib/format";

type InquiryStatusResponse = BookingApi & {
  can_cancel: boolean;
  can_confirm_payment: boolean;
  next_action: string;
};

type LastInquiry = {
  kode_inquiry?: string;
  contact?: string;
  propertyName?: string;
  createdAt?: number;
};

const STATUS_LABELS: Record<string, string> = {
  new: "Minat baru",
  contacted: "Sudah dihubungi",
  booking_fee_pending: "Menunggu booking fee",
  reserved: "Booked",
  closed: "Sold",
  cancelled: "Dibatalkan",
};

function statusLabel(status: string) {
  return STATUS_LABELS[status] || status;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function InquiryStatusPage() {
  const [code, setCode] = useState("");
  const [contact, setContact] = useState("");
  const [lastInquiry, setLastInquiry] = useState<LastInquiry | null>(null);
  const [inquiry, setInquiry] = useState<InquiryStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = window.localStorage.getItem("planb_last_inquiry");
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as LastInquiry;
      setLastInquiry(parsed);
      if (parsed.kode_inquiry) setCode(parsed.kode_inquiry);
      if (parsed.contact) setContact(parsed.contact);
    } catch {
      setLastInquiry(null);
    }
  }, []);

  const lookupInquiry = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const kodeInquiry = code.trim();
    const lookupContact = contact.trim();

    if (!kodeInquiry || !lookupContact) {
      setError("Isi kode inquiry dan email/nomor HP.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await apiFetch<InquiryStatusResponse>("/api/booking/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kode_inquiry: kodeInquiry,
          contact: lookupContact,
        }),
      });
      setInquiry(result);
      window.localStorage.setItem(
        "planb_last_inquiry",
        JSON.stringify({
          kode_inquiry: result.kode_inquiry,
          contact: lookupContact,
          propertyName: result.nama_rumah,
          createdAt: Date.now(),
        })
      );
    } catch (lookupError) {
      setInquiry(null);
      setError(lookupError instanceof Error ? lookupError.message : "Gagal cek status inquiry.");
    } finally {
      setLoading(false);
    }
  };

  const cancelInquiry = async () => {
    if (!inquiry) return;
    const confirmed = window.confirm("Batalkan inquiry ini? Admin tidak akan memproses minat ini lagi.");
    if (!confirmed) return;

    setCancelling(true);
    setError("");
    try {
      const result = await apiFetch<InquiryStatusResponse>("/api/booking/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kode_inquiry: code.trim(),
          contact: contact.trim(),
        }),
      });
      setInquiry(result);
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : "Gagal membatalkan inquiry.");
    } finally {
      setCancelling(false);
    }
  };

  const confirmPayment = async () => {
    if (!inquiry) return;
    const confirmed = window.confirm("Konfirmasi booking fee sudah dibayar? Unit akan masuk status booked.");
    if (!confirmed) return;

    setConfirmingPayment(true);
    setError("");
    try {
      const result = await apiFetch<InquiryStatusResponse>("/api/booking/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kode_inquiry: code.trim(),
          contact: contact.trim(),
        }),
      });
      setInquiry(result);
      window.localStorage.setItem(
        "planb_last_inquiry",
        JSON.stringify({
          kode_inquiry: result.kode_inquiry,
          contact: contact.trim(),
          propertyName: result.nama_rumah,
          createdAt: Date.now(),
        })
      );
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : "Gagal konfirmasi pembayaran.");
    } finally {
      setConfirmingPayment(false);
    }
  };

  return (
    <div className="status-page-container" suppressHydrationWarning>
      <Header />

      <main className="main-content">
        <div className="container-inner">

          <nav aria-label="Breadcrumb" className="breadcrumb">
            <Link href="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <Link href="/listing" className="breadcrumb-link">Katalog</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Cek Inquiry</span>
          </nav>

          <div className="checkout-layout">
            
            {/* Form Column */}
            <div className="form-column">
              <div className="section-header">
                <h1 className="page-title font-serif">Status Inquiry</h1>
                <p className="page-lead">
                  Masukkan kode inquiry dan kontak Anda untuk melacak status reservasi atau pengajuan survey properti.
                </p>
              </div>

              <form className="checkout-form" onSubmit={lookupInquiry}>
                <div className="form-section">
                  <h2 className="section-title">
                    <span className="section-no">1</span> Data Cek Status
                  </h2>

                  {lastInquiry?.kode_inquiry && (
                    <p className="last-inquiry-hint">
                      Inquiry terakhir Anda terdeteksi{lastInquiry.propertyName ? ` untuk ${lastInquiry.propertyName}` : ""}.
                    </p>
                  )}

                  <div className="form-row">
                    <div className="input-group">
                      <label className="input-label" htmlFor="kodeInquiry">Kode Inquiry</label>
                      <input
                        id="kodeInquiry"
                        className="text-input"
                        value={code}
                        onChange={(event) => setCode(event.target.value)}
                        placeholder="INQ-20260616-ABC123"
                        autoComplete="off"
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label" htmlFor="lookupContact">Email atau Nomor HP</label>
                      <input
                        id="lookupContact"
                        className="text-input"
                        value={contact}
                        onChange={(event) => setContact(event.target.value)}
                        placeholder="nama@email.com"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="error-message">
                      {error}
                    </p>
                  )}
                </div>

                <button type="submit" className="submit-form-btn" disabled={loading}>
                  {loading ? "Mengecek status..." : "Cek Status Sekarang"}
                </button>
              </form>
            </div>

            {/* Results Summary Column */}
            <div className="summary-column">
              <div className="summary-card">
                <h3 className="summary-title">Hasil Penelusuran</h3>

                {!inquiry ? (
                  <div className="empty-summary">
                    Status inquiry Anda akan muncul di sini setelah kode dan kontak berhasil dicocokkan.
                  </div>
                ) : (
                  <div className="summary-details">
                    <div className="summary-property-info">
                      <span className="prop-name">{inquiry.nama_rumah || inquiry.kode_rumah}</span>
                      <span className="prop-code">{inquiry.kode_inquiry}</span>
                      <span className="prop-loc">{inquiry.alamat}, {inquiry.kota}</span>
                    </div>

                    <div className="summary-lines-list">
                      <div className="summary-line-item">
                        <span>Status</span>
                        <span className="status-label-value">{statusLabel(inquiry.status)}</span>
                      </div>
                      <div className="summary-line-item">
                        <span>Nama Lengkap</span>
                        <span>{inquiry.nama_depan} {inquiry.nama_belakang}</span>
                      </div>
                      <div className="summary-line-item">
                        <span>Kontak Dipilih</span>
                        <span>{inquiry.preferensi_kontak}</span>
                      </div>
                      <div className="summary-line-item">
                        <span>Jadwal Survey</span>
                        <span>{formatDate(inquiry.jadwal_kunjungan)}</span>
                      </div>
                      <div className="summary-line-item">
                        <span>Booking Fee</span>
                        <span>{money(inquiry.booking_fee)}</span>
                      </div>
                      <div className="summary-line-item">
                        <span>Tanggal Kirim</span>
                        <span>{formatDate(inquiry.dibuat_pada)}</span>
                      </div>
                    </div>

                    <p className="next-action-note">
                      <strong>Langkah Selanjutnya:</strong> {inquiry.next_action}
                    </p>

                    <div className="action-buttons-wrap">
                      {inquiry.can_confirm_payment && (
                        <button
                          type="button"
                          className="action-btn-pay"
                          onClick={confirmPayment}
                          disabled={confirmingPayment}
                        >
                          {confirmingPayment ? "Memproses..." : "Saya Sudah Bayar"}
                        </button>
                      )}

                      {inquiry.can_cancel ? (
                        <button
                          type="button"
                          className="action-btn-cancel"
                          onClick={cancelInquiry}
                          disabled={cancelling}
                        >
                          {cancelling ? "Membatalkan..." : "Batalkan Inquiry"}
                        </button>
                      ) : (
                        <p className="cancel-disabled-note">
                          Pembatalan online hanya bisa diajukan sebelum unit masuk status booked atau sold.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />

      <style jsx>{`
        .status-page-container {
          background: #f4efe4;
          color: #1f2a22;
          min-height: 100vh;
        }

        .main-content {
          max-width: 72rem;
          margin: 0 auto;
          padding: 8rem 1.25rem 4rem;
        }

        @media (min-width: 768px) {
          .main-content {
            padding: 9rem 3rem 5rem;
          }
        }

        @media (min-width: 1024px) {
          .main-content {
            padding: 10rem 4rem 6rem;
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

        /* Layout Grid */
        .checkout-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 4rem;
        }

        @media (min-width: 1024px) {
          .checkout-layout {
            grid-template-columns: 1.3fr 0.7fr;
            gap: 5rem;
          }
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
        }

        /* Form sections */
        .form-section {
          margin-bottom: 2.5rem;
        }

        .section-title {
          font-size: 12px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 1px solid rgba(31, 42, 34, 0.15);
          padding-bottom: 0.75rem;
          margin-bottom: 2rem;
        }

        .section-no {
          display: inline-grid;
          place-items: center;
          width: 1.5rem;
          height: 1.5rem;
          background: #111111;
          color: white;
          font-size: 10px;
          font-weight: 700;
        }

        .last-inquiry-hint {
          font-size: 13px;
          color: #264f36;
          font-weight: 500;
          margin-bottom: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        @media (min-width: 768px) {
          .form-row {
            grid-template-columns: 1fr 1fr;
          }
        }

        .input-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 1.5rem;
        }

        .input-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: rgba(31, 42, 34, 0.6);
          margin-bottom: 0.5rem;
        }

        .text-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(31, 42, 34, 0.2);
          color: #1f2a22;
          padding: 0.5rem 0;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .text-input:focus {
          border-color: #111111;
        }

        .error-message {
          font-size: 12px;
          color: #dc2626;
          font-weight: 500;
          margin-top: 1rem;
        }

        .submit-form-btn {
          width: 100%;
          background: #111111;
          color: #f7f0e4;
          border: none;
          padding: 1.1rem;
          font-size: 11px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .submit-form-btn:hover:not(:disabled) {
          background: black;
          color: white;
        }

        /* Summary Result card styling */
        .summary-column {
          position: relative;
        }

        @media (min-width: 1024px) {
          .summary-column {
            position: sticky;
            top: 7rem;
            align-self: flex-start;
          }
        }

        .summary-card {
          background: #111111;
          color: #f7f0e4;
          padding: 2.25rem;
        }

        .summary-title {
          font-size: 11px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          padding-bottom: 1rem;
          margin-bottom: 1.5rem;
        }

        .empty-summary {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.6;
        }

        .summary-property-info {
          margin-bottom: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          padding-bottom: 1.25rem;
        }

        .prop-name {
          display: block;
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .prop-code {
          display: block;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.5rem;
        }

        .prop-loc {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
        }

        .summary-lines-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          font-size: 13px;
          margin-bottom: 2rem;
        }

        .summary-line-item {
          display: flex;
          justify-content: space-between;
          color: rgba(255, 255, 255, 0.7);
        }

        .status-label-value {
          color: #f7f0e4;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.05em;
        }

        .next-action-note {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.25rem;
          font-size: 12px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.85);
          margin-bottom: 2rem;
        }

        .action-buttons-wrap {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .action-btn-pay {
          width: 100%;
          background: #f7f0e4;
          color: #111111;
          border: none;
          padding: 1rem;
          font-size: 11px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          cursor: pointer;
        }

        .action-btn-pay:hover {
          background: white;
        }

        .action-btn-cancel {
          width: 100%;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #ffffff;
          padding: 1rem;
          font-size: 11px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          cursor: pointer;
          transition: border-color 0.2s ease;
        }

        .action-btn-cancel:hover {
          border-color: white;
        }

        .cancel-disabled-note {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.4);
          text-align: center;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
