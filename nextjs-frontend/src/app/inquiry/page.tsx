"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiFetch, BookingApi, normalizeImageUrl, PropertyApi } from "@/lib/api";
import { money } from "@/lib/format";

type InquiryState = {
  propertyId: string;
  bookingFee: number;
  createdAt: number;
};

const QRIS_IMAGE_URL = process.env.NEXT_PUBLIC_QRIS_IMAGE_URL || "";

export default function InquiryPage() {
  const [inquiry, setInquiry] = useState<InquiryState | null>(null);
  const [property, setProperty] = useState<PropertyApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [payMethod, setPayMethod] = useState("qris");
  const [contactPreference, setContactPreference] = useState("WhatsApp");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<BookingApi | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [submittedContact, setSubmittedContact] = useState("");

  useEffect(() => {
    const raw = window.localStorage.getItem("planb_inquiry") || window.localStorage.getItem("planb_purchase");
    if (!raw) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as InquiryState;
      setInquiry(parsed);
    } catch {
      setInquiry(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!inquiry?.propertyId) return;
    const loadProperty = async () => {
      try {
        const data = await apiFetch<PropertyApi>(`/api/properti/${encodeURIComponent(inquiry.propertyId)}`);
        setProperty(data);
      } catch {
        setProperty(null);
      }
    };
    loadProperty();
  }, [inquiry?.propertyId]);

  const bookingFee = Number(inquiry?.bookingFee || 0);
  const summaryImage = useMemo(
    () => normalizeImageUrl(property?.gambar?.[0] || ""),
    [property?.gambar]
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!property || !inquiry) return;

    const formData = new FormData(event.currentTarget);
    const firstName = String(formData.get("firstName") || "").trim();
    const lastName = String(formData.get("lastName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const visitSchedule = String(formData.get("visitSchedule") || "").trim();
    const note = String(formData.get("note") || "").trim();

    if (!firstName || !email || !phone) {
      window.alert("Isi nama, email, dan nomor HP.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await apiFetch<BookingApi>("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kode_rumah: property.kode_rumah,
          nama_depan: firstName,
          nama_belakang: lastName,
          email,
          telepon: phone,
          preferensi_kontak: contactPreference,
          jadwal_kunjungan: visitSchedule || null,
          catatan: note,
          metode_pembayaran: bookingFee > 0 ? payMethod : "Belum memilih",
          booking_fee: bookingFee,
        }),
      });

      window.localStorage.setItem(
        "planb_last_inquiry",
        JSON.stringify({
          kode_inquiry: result.kode_inquiry,
          contact: phone || email,
          propertyName: property.nama_rumah,
          createdAt: Date.now(),
        })
      );

      try {
        const existingRaw = window.localStorage.getItem("planb_inquiries") || "[]";
        const existingList = JSON.parse(existingRaw);
        if (Array.isArray(existingList)) {
          existingList.unshift({
            kode_inquiry: result.kode_inquiry,
            contact: phone || email,
            propertyName: property.nama_rumah,
            createdAt: Date.now(),
          });
          window.localStorage.setItem("planb_inquiries", JSON.stringify(existingList));
        }
      } catch (err) {
        console.error("Failed to append to planb_inquiries:", err);
      }

      window.localStorage.removeItem("planb_inquiry");
      window.localStorage.removeItem("planb_purchase");
      setSubmittedContact(phone || email);
      setSubmitted(result);
    } catch {
      window.alert("Gagal mengirim minat. Coba lagi atau hubungi admin PlanB.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyInquiryCode = async () => {
    if (!submitted?.kode_inquiry) return;

    try {
      await navigator.clipboard.writeText(submitted.kode_inquiry);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 1600);
    } catch {
      window.prompt("Salin kode inquiry:", submitted.kode_inquiry);
    }
  };

  const confirmPayment = async () => {
    if (!submitted) return;
    const contact = submittedContact || submitted.telepon || submitted.email;
    const confirmed = window.confirm("Konfirmasi booking fee sudah dibayar? Unit akan masuk status booked.");
    if (!confirmed) return;

    setConfirmingPayment(true);
    try {
      const result = await apiFetch<BookingApi>("/api/booking/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kode_inquiry: submitted.kode_inquiry,
          contact,
        }),
      });
      setSubmitted(result);
      window.localStorage.setItem(
        "planb_last_inquiry",
        JSON.stringify({
          kode_inquiry: result.kode_inquiry,
          contact,
          propertyName: result.nama_rumah,
          createdAt: Date.now(),
        })
      );
    } catch {
      window.alert("Gagal konfirmasi pembayaran. Coba cek status inquiry atau hubungi admin.");
    } finally {
      setConfirmingPayment(false);
    }
  };

  return (
    <div className="inquiry-page-container" suppressHydrationWarning>
      <Header />

      <main className="main-content">
        <div className="container-inner">
          
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <Link href="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <Link href="/listing" className="breadcrumb-link">Katalog</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Minat Rumah</span>
          </nav>

          {submitted ? (
            /* Thank you page design matching the aesthetic */
            <div className="success-panel">
              <div className="success-card">
                <span className="success-eyebrow">Minat Terkirim</span>
                <h2 className="success-title font-serif">Pernyataan minat Anda telah masuk ke sistem.</h2>
                <p className="success-subtitle">
                  Kode Inquiry Anda: <strong>{submitted.kode_inquiry}</strong>
                </p>

                <div className="summary-lines">
                  <div className="summary-line">
                    <span>Nama Properti</span>
                    <span>{submitted.nama_rumah}</span>
                  </div>
                  <div className="summary-line">
                    <span>Status Unit</span>
                    <span>
                      {submitted.status === "reserved"
                        ? "Booked (Terpesan)"
                        : submitted.status === "booking_fee_pending"
                          ? "Menunggu Booking Fee"
                          : "Inquiry Baru"}
                    </span>
                  </div>
                  <div className="summary-line">
                    <span>Kontak Cek</span>
                    <span>{submittedContact}</span>
                  </div>
                </div>

                {submitted.booking_fee > 0 && submitted.metode_pembayaran.toLowerCase() === "qris" && (
                  <div className="qris-payment-box">
                    <div className="qris-header">
                      <span className="qris-title">QRIS Booking Fee</span>
                      <p className="qris-desc">
                        Scan QRIS di bawah untuk membayar booking fee sebesar {money(submitted.booking_fee)}.
                      </p>
                    </div>
                    {QRIS_IMAGE_URL ? (
                      <div className="qris-img-wrap">
                        <img src={QRIS_IMAGE_URL} alt="QRIS Booking Fee" />
                      </div>
                    ) : (
                      <div className="qris-placeholder">
                        QRIS belum terkonfigurasi. Hubungi Admin untuk opsi pembayaran.
                      </div>
                    )}
                    {submitted.status !== "reserved" && (
                      <button
                        type="button"
                        className="pay-confirm-btn"
                        onClick={confirmPayment}
                        disabled={confirmingPayment}
                      >
                        {confirmingPayment ? "Memproses..." : "Saya Sudah Bayar"}
                      </button>
                    )}
                  </div>
                )}

                <div className="success-actions">
                  <Link href="/inquiry/status" className="btn-action">
                    Cek Status Inquiry
                  </Link>
                  <button type="button" className="btn-action secondary" onClick={copyInquiryCode}>
                    {copiedCode ? "Kode Disalin" : "Salin Kode"}
                  </button>
                  <Link href="/listing" className="btn-action secondary">
                    Kembali ke Katalog
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="checkout-layout">
              {/* Form Column */}
              <div className="form-column">
                <div className="section-header">
                  <h1 className="page-title font-serif">Pernyataan Minat</h1>
                  <p className="page-lead">
                    Isi detail Anda di bawah ini untuk memulai langkah pemesanan atau kunjungan properti.
                  </p>
                </div>

                <form id="inquiryForm" className="checkout-form" onSubmit={onSubmit}>
                  {/* Data Diri section */}
                  <div className="form-section">
                    <h2 className="section-title">
                      <span className="section-no">1</span> Data Kontak
                    </h2>
                    
                    <div className="form-row">
                      <div className="input-group">
                        <label className="input-label" htmlFor="firstName">Nama Depan</label>
                        <input id="firstName" name="firstName" className="text-input" placeholder="Bintang" required />
                      </div>
                      <div className="input-group">
                        <label className="input-label" htmlFor="lastName">Nama Belakang</label>
                        <input id="lastName" name="lastName" className="text-input" placeholder="Fathir" />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="input-group">
                        <label className="input-label" htmlFor="email">Email</label>
                        <input id="email" name="email" className="text-input" type="email" placeholder="nama@email.com" required />
                      </div>
                      <div className="input-group">
                        <label className="input-label" htmlFor="phone">Nomor HP/WhatsApp</label>
                        <input id="phone" name="phone" className="text-input" type="tel" placeholder="08xxxxxxxxxx" required />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="input-group">
                        <label className="input-label" htmlFor="contactPreference">Preferensi Hubungi</label>
                        <select
                          id="contactPreference"
                          className="select-input"
                          value={contactPreference}
                          onChange={(event) => setContactPreference(event.target.value)}
                        >
                          <option value="whatsapp">WhatsApp</option>
                          <option value="telepon">Telepon</option>
                          <option value="email">Email</option>
                        </select>
                      </div>
                      <div className="input-group">
                        <label className="input-label" htmlFor="visitSchedule">Jadwal Survey (Opsional)</label>
                        <input id="visitSchedule" name="visitSchedule" className="date-input" type="datetime-local" />
                      </div>
                    </div>

                    <div className="input-group">
                      <label className="input-label" htmlFor="note">Pesan Tambahan</label>
                      <textarea
                        id="note"
                        name="note"
                        className="textarea-input"
                        rows={4}
                        placeholder="Ada pertanyaan atau permintaan khusus?"
                      />
                    </div>
                  </div>

                  {/* Booking fee details */}
                  <div className="form-section">
                    <h2 className="section-title">
                      <span className="section-no">2</span> Opsi Pembayaran Booking
                    </h2>
                    
                    {bookingFee > 0 ? (
                      <div className="booking-fee-area">
                        <p className="booking-fee-info">
                          Anda telah menyetujui opsi booking fee sebesar <strong>{money(bookingFee)}</strong>. Silakan pilih opsi metode pembayaran di bawah:
                        </p>
                        
                        <div className="payment-cards">
                          <label className={`payment-card ${payMethod === "qris" ? "active" : ""}`}>
                            <input 
                              type="radio" 
                              name="payMethod" 
                              value="qris" 
                              checked={payMethod === "qris"} 
                              onChange={() => setPayMethod("qris")}
                              className="radio-hidden"
                            />
                            <span className="pay-title font-serif">QRIS</span>
                            <span className="pay-subtitle">Scan & Bayar Instan</span>
                          </label>

                          <label className={`payment-card ${payMethod === "transfer" ? "active" : ""}`}>
                            <input 
                              type="radio" 
                              name="payMethod" 
                              value="transfer" 
                              checked={payMethod === "transfer"} 
                              onChange={() => setPayMethod("transfer")}
                              className="radio-hidden"
                            />
                            <span className="pay-title font-serif">Transfer Bank</span>
                            <span className="pay-subtitle">Manual Virtual Account</span>
                          </label>
                        </div>
                      </div>
                    ) : (
                      <p className="booking-fee-none">
                        Tidak ada biaya booking fee yang diajukan. Form ini bersifat konsultasi dan penjadwalan survey secara cuma-cuma.
                      </p>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    className="submit-form-btn"
                    disabled={submitting || !property || !inquiry}
                  >
                    {submitting ? "Mengirim minat..." : "Kirim Pernyataan Minat"}
                  </button>
                </form>
              </div>

              {/* Summary Column */}
              <div className="summary-column">
                <div className="summary-card">
                  <h3 className="summary-title">Ringkasan Minat</h3>

                  {loading && <div className="loading-summary">Memuat properti...</div>}
                  
                  {!loading && !inquiry && (
                    <div className="empty-summary">
                      <p>Belum ada properti yang dipilih.</p>
                      <Link href="/listing" className="catalog-btn">
                        Lihat Katalog
                      </Link>
                    </div>
                  )}

                  {!loading && inquiry && property && (
                    <div className="summary-details">
                      {summaryImage && (
                        <div className="summary-img-wrap">
                          <img src={summaryImage} alt={property.nama_rumah} />
                        </div>
                      )}
                      
                      <div className="summary-property-info">
                        <span className="prop-name">{property.nama_rumah}</span>
                        <span className="prop-loc">{property.kota}</span>
                      </div>

                      <div className="summary-lines-list">
                        <div className="summary-line-item">
                          <span>Nilai Investasi</span>
                          <span>{money(property.harga)}</span>
                        </div>
                        <div className="summary-line-item">
                          <span>Booking Fee</span>
                          <span>{money(bookingFee)}</span>
                        </div>
                        <div className="summary-line-item total">
                          <span>Dibayar Sekarang</span>
                          <span>Rp 0</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />

      <style jsx>{`
        .inquiry-page-container {
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

        /* Checkout layout grid */
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
          margin-bottom: 3.5rem;
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

        .form-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
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

        .text-input,
        .select-input,
        .date-input,
        .textarea-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(31, 42, 34, 0.2);
          color: #1f2a22;
          padding: 0.5rem 0;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .text-input:focus,
        .select-input:focus,
        .date-input:focus,
        .textarea-input:focus {
          border-color: #111111;
        }

        .textarea-input {
          resize: none;
        }

        /* Payment cards style */
        .booking-fee-info {
          font-size: 14px;
          color: rgba(31, 42, 34, 0.7);
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        .payment-cards {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 640px) {
          .payment-cards {
            grid-template-columns: 1fr 1fr;
          }
        }

        .payment-card {
          border: 1px solid rgba(31, 42, 34, 0.15);
          background: white;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .payment-card:hover {
          border-color: #111111;
        }

        .payment-card.active {
          border-color: #111111;
          outline: 1px solid #111111;
        }

        .radio-hidden {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .pay-title {
          font-size: 1.125rem;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .pay-subtitle {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: rgba(31, 42, 34, 0.5);
        }

        .booking-fee-none {
          font-size: 13px;
          color: rgba(31, 42, 34, 0.5);
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

        /* Summary Column styling */
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
        }

        .catalog-btn {
          display: inline-block;
          margin-top: 1rem;
          background: #f7f0e4;
          color: #111111;
          text-decoration: none;
          padding: 0.75rem 1.25rem;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        .summary-img-wrap {
          aspect-ratio: 16 / 10;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.05);
          margin-bottom: 1.5rem;
        }

        .summary-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .summary-property-info {
          margin-bottom: 2rem;
        }

        .prop-name {
          display: block;
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
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
        }

        .summary-line-item {
          display: flex;
          justify-content: space-between;
          color: rgba(255, 255, 255, 0.7);
        }

        .summary-line-item.total {
          border-top: 1px solid rgba(255, 255, 255, 0.15);
          padding-top: 1rem;
          margin-top: 0.5rem;
          font-weight: 600;
          color: white;
        }

        /* Success Panel */
        .success-panel {
          display: flex;
          justify-content: center;
          padding: 2rem 0;
        }

        .success-card {
          background: white;
          border: 1px solid rgba(31, 42, 34, 0.15);
          padding: 3rem;
          max-width: 38rem;
          width: 100%;
        }

        .success-eyebrow {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #264f36;
          font-weight: 750;
          display: block;
          margin-bottom: 1rem;
        }

        .success-title {
          font-size: 2.25rem;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          font-weight: 500;
        }

        .success-subtitle {
          font-size: 14px;
          color: rgba(31, 42, 34, 0.7);
          margin-bottom: 2rem;
          border-bottom: 1px solid rgba(31, 42, 34, 0.1);
          padding-bottom: 1rem;
        }

        .summary-lines {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          font-size: 13px;
          background: #f4efe4;
          padding: 1.25rem;
          margin-bottom: 2rem;
        }

        .summary-line {
          display: flex;
          justify-content: space-between;
        }

        .qris-payment-box {
          background: #111111;
          color: #f7f0e4;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .qris-title {
          font-size: 11px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          display: block;
          margin-bottom: 0.5rem;
        }

        .qris-desc {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }

        .qris-img-wrap {
          max-width: 12rem;
          margin: 0 auto 1.5rem;
          background: white;
          padding: 0.5rem;
        }

        .qris-img-wrap img {
          width: 100%;
          display: block;
        }

        .pay-confirm-btn {
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

        .pay-confirm-btn:hover {
          background: white;
        }

        .success-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .btn-action {
          background: #111111;
          color: #f7f0e4;
          text-decoration: none;
          padding: 0.9rem 1.25rem;
          font-size: 11px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          text-align: center;
          flex: 1 0 auto;
        }

        .btn-action.secondary {
          background: transparent;
          border: 1px solid rgba(31, 42, 34, 0.2);
          color: #1f2a22;
        }

        .btn-action.secondary:hover {
          border-color: #111111;
        }
      `}</style>
    </div>
  );
}
