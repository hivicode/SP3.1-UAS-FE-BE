"use client";

import HeaderMinimal from "../../../components/HeaderMinimal";
import Footer from "../../../components/Footer";
import Link from "next/link";
import "../../css/listing.css";
import "../../css/rent.css";
import { FormEvent, useEffect, useState } from "react";
import { apiFetch, BookingApi } from "@/lib/api";
import { money } from "@/lib/format";

type InquiryStatusResponse = BookingApi & {
  can_cancel: boolean;
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

  return (
    <div className="page-wrapper" id="page-wrapper-id" data-page="inquiry-status">
      <main className="main-wrapper">
        <HeaderMinimal />

        <section className="padding-section-large rent-checkout">
          <div className="padding-global">
            <div className="container-large">
              <nav aria-label="Breadcrumb" className="rent-breadcrumb">
                <Link href="/" className="rent-breadcrumb-link">Home</Link>
                <span className="rent-breadcrumb-separator">/</span>
                <Link href="/listing" className="rent-breadcrumb-link">Katalog</Link>
                <span className="rent-breadcrumb-separator">/</span>
                <span className="rent-breadcrumb-current">Cek Inquiry</span>
              </nav>

              <div className="rent-checkout-layout">
                <section className="rent-panel">
                  <div className="rent-checkout-title">
                    <h2 className="heading-style-h2">Cek Status Inquiry</h2>
                    <div className="text-size-small text-style-muted">
                      Gunakan kode inquiry dan email/nomor HP yang dipakai saat mengirim minat.
                    </div>
                  </div>

                  <form className="rent-form" onSubmit={lookupInquiry}>
                    <div className="rent-card">
                      {lastInquiry?.kode_inquiry && (
                        <p className="text-size-small text-style-muted">
                          Kode terakhir dari browser ini sudah dimuat{lastInquiry.propertyName ? ` untuk ${lastInquiry.propertyName}` : ""}.
                        </p>
                      )}

                      <div className="rent-row-2">
                        <div className="rent-field">
                          <label className="text-size-small text-style-allcaps" htmlFor="kodeInquiry">Kode inquiry</label>
                          <input
                            id="kodeInquiry"
                            className="form-field w-input"
                            value={code}
                            onChange={(event) => setCode(event.target.value)}
                            placeholder="INQ-20260616-ABC123"
                            autoComplete="off"
                          />
                        </div>
                        <div className="rent-field">
                          <label className="text-size-small text-style-allcaps" htmlFor="lookupContact">Email atau nomor HP</label>
                          <input
                            id="lookupContact"
                            className="form-field w-input"
                            value={contact}
                            onChange={(event) => setContact(event.target.value)}
                            placeholder="nama@email.com / 08xxxxxxxxxx"
                            autoComplete="email"
                          />
                        </div>
                      </div>

                      {error && (
                        <p className="text-size-small" style={{ color: "#b42318", marginTop: ".75rem" }}>
                          {error}
                        </p>
                      )}

                      <button type="submit" className="button w-inline-block rent-confirm-btn" disabled={loading}>
                        <div className="button-text">
                          <div className="button_text">{loading ? "Mengecek..." : "Cek Status"}</div>
                          <div className="button-text-animation">
                            <div className="button_text">Cek Status</div>
                          </div>
                        </div>
                        <img src="https://wubflow-shield.nocodexport.dev/685077c466f113761c6d796b/6853ff8bb7215267b2f31695_Kaleo_Icon.svg" loading="lazy" alt="Kaleo Icon" className="button-image" />
                      </button>
                    </div>
                  </form>
                </section>

                <aside className="rent-summary">
                  <div className="rent-card rent-summary-card">
                    <div className="rent-summary-head">Hasil Inquiry</div>
                    {!inquiry ? (
                      <div className="rent-summary-top">
                        <div className="text-size-small text-style-muted">
                          Status inquiry akan muncul setelah kode dan kontak cocok.
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="rent-summary-top">
                          <div>
                            <div className="text-style-allcaps text-size-small">{inquiry.kode_inquiry}</div>
                            <div className="text-weight-bold">{inquiry.nama_rumah || inquiry.kode_rumah}</div>
                            <div className="text-size-small text-style-muted">{inquiry.alamat}, {inquiry.kota}</div>
                          </div>
                        </div>

                        <div className="rent-summary-lines">
                          <div className="rent-summary-line">
                            <span>Status</span>
                            <span>{statusLabel(inquiry.status)}</span>
                          </div>
                          <div className="rent-summary-line">
                            <span>Nama</span>
                            <span>{inquiry.nama_depan} {inquiry.nama_belakang}</span>
                          </div>
                          <div className="rent-summary-line">
                            <span>Preferensi kontak</span>
                            <span>{inquiry.preferensi_kontak}</span>
                          </div>
                          <div className="rent-summary-line">
                            <span>Jadwal kunjungan</span>
                            <span>{formatDate(inquiry.jadwal_kunjungan)}</span>
                          </div>
                          <div className="rent-summary-line">
                            <span>Booking fee</span>
                            <span>{money(inquiry.booking_fee)}</span>
                          </div>
                          <div className="rent-summary-line">
                            <span>Dikirim</span>
                            <span>{formatDate(inquiry.dibuat_pada)}</span>
                          </div>
                        </div>

                        <p className="text-size-small text-style-muted" style={{ marginTop: "1rem" }}>
                          {inquiry.next_action}
                        </p>

                        {inquiry.can_cancel ? (
                          <button
                            type="button"
                            className="button is-secondary w-inline-block rent-confirm-btn"
                            onClick={cancelInquiry}
                            disabled={cancelling}
                          >
                            <div className="button-text">
                              <div className="button_text">{cancelling ? "Membatalkan..." : "Batalkan Inquiry"}</div>
                              <div className="button-text-animation">
                                <div className="button_text">Batalkan Inquiry</div>
                              </div>
                            </div>
                          </button>
                        ) : (
                          <p className="text-size-small text-style-muted" style={{ marginTop: ".75rem" }}>
                            Pembatalan dari website hanya tersedia sebelum unit booked atau sold.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
