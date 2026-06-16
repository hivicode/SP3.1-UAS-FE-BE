"use client";

import HeaderMinimal from "../../components/HeaderMinimal";
import Footer from "../../components/Footer";
import Link from "next/link";
import "../css/listing.css";
import "../css/rent.css";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiFetch, BookingApi, normalizeImageUrl, PropertyApi } from "@/lib/api";
import { money } from "@/lib/format";

type InquiryState = {
  propertyId: string;
  bookingFee: number;
  createdAt: number;
};

export default function InquiryPage() {
  const [inquiry, setInquiry] = useState<InquiryState | null>(null);
  const [property, setProperty] = useState<PropertyApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [payMethod, setPayMethod] = useState("qris");
  const [contactPreference, setContactPreference] = useState("whatsapp");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<BookingApi | null>(null);

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

      window.localStorage.removeItem("planb_inquiry");
      window.localStorage.removeItem("planb_purchase");
      setSubmitted(result);
    } catch {
      window.alert("Gagal mengirim minat. Coba lagi atau hubungi admin PlanB.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper" id="page-wrapper-id" data-page="inquiry">
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
                <span className="rent-breadcrumb-current">Minat Rumah</span>
              </nav>

              {submitted ? (
                <section className="rent-card">
                  <div className="text-style-allcaps text-size-small">Minat terkirim</div>
                  <h2 className="heading-style-h2">Admin PlanB akan menghubungi Anda.</h2>
                  <p className="text-size-small text-style-muted">
                    Simpan kode inquiry ini untuk follow-up: <strong>{submitted.kode_inquiry}</strong>
                  </p>
                  <div className="button-wrap" style={{ marginTop: "1rem" }}>
                    <Link href="/listing" className="button w-inline-block">
                      <div className="button-text">
                        <div className="button_text">Lihat Rumah Lain</div>
                        <div className="button-text-animation">
                          <div className="button_text">Lihat Rumah Lain</div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </section>
              ) : (
                <div className="rent-checkout-layout">
                  <div className="rent-checkout-title">
                    <h2 className="heading-style-h2">Form Minat Rumah</h2>
                    <div className="text-size-small text-style-muted">
                      Isi kontak Anda. Admin akan menghubungi untuk info unit, jadwal kunjungan, dan opsi booking fee.
                    </div>
                  </div>

                  <section className="rent-panel">
                    <form id="inquiryForm" className="rent-form" onSubmit={onSubmit}>
                      <div className="rent-card">
                        <div className="rent-card-head">
                          <div className="text-style-allcaps text-size-small">Data Kontak</div>
                        </div>

                        <div className="rent-row-2">
                          <div className="rent-field">
                            <label className="text-size-small text-style-allcaps" htmlFor="firstName">Nama depan</label>
                            <input id="firstName" name="firstName" className="form-field w-input" autoComplete="given-name" placeholder="Bintang" required />
                          </div>
                          <div className="rent-field">
                            <label className="text-size-small text-style-allcaps" htmlFor="lastName">Nama belakang</label>
                            <input id="lastName" name="lastName" className="form-field w-input" autoComplete="family-name" placeholder="Fathir" />
                          </div>
                        </div>

                        <div className="rent-row-2">
                          <div className="rent-field">
                            <label className="text-size-small text-style-allcaps" htmlFor="email">Email</label>
                            <input id="email" name="email" className="form-field w-input" type="email" autoComplete="email" placeholder="nama@email.com" required />
                          </div>
                          <div className="rent-field">
                            <label className="text-size-small text-style-allcaps" htmlFor="phone">Nomor HP/WhatsApp</label>
                            <input id="phone" name="phone" className="form-field w-input" autoComplete="tel" inputMode="tel" placeholder="08xxxxxxxxxx" required />
                          </div>
                        </div>

                        <div className="rent-row-2">
                          <div className="rent-field">
                            <label className="text-size-small text-style-allcaps" htmlFor="contactPreference">Preferensi kontak</label>
                            <select
                              id="contactPreference"
                              className="form-field w-input"
                              value={contactPreference}
                              onChange={(event) => setContactPreference(event.target.value)}
                            >
                              <option value="whatsapp">WhatsApp</option>
                              <option value="telepon">Telepon</option>
                              <option value="email">Email</option>
                            </select>
                          </div>
                          <div className="rent-field">
                            <label className="text-size-small text-style-allcaps" htmlFor="visitSchedule">Jadwal kunjungan opsional</label>
                            <input id="visitSchedule" name="visitSchedule" className="form-field w-input" type="datetime-local" />
                          </div>
                        </div>

                        <div className="rent-field">
                          <label className="text-size-small text-style-allcaps" htmlFor="note">Catatan untuk admin</label>
                          <textarea
                            id="note"
                            name="note"
                            className="form-field w-input"
                            rows={4}
                            placeholder="Contoh: ingin tanya promo, jadwal survey Sabtu, atau minta info unit serupa."
                          />
                        </div>
                      </div>

                      <div className="rent-card">
                        <div className="rent-card-head">
                          <div className="text-style-allcaps text-size-small">Booking fee opsional</div>
                        </div>

                        {bookingFee > 0 ? (
                          <>
                            <p className="text-size-small text-style-muted">
                              Anda memilih menanyakan booking fee sebesar {money(bookingFee)}. Admin akan mengirim instruksi pembayaran setelah kontak terverifikasi.
                            </p>
                            <div className="rent-pay-methods">
                              <label className="rent-pay">
                                <input type="radio" name="payMethod" value="qris" checked={payMethod === "qris"} onChange={() => setPayMethod("qris")} />
                                <span className="rent-pay-name">QRIS</span>
                              </label>
                              <label className="rent-pay">
                                <input type="radio" name="payMethod" value="transfer" checked={payMethod === "transfer"} onChange={() => setPayMethod("transfer")} />
                                <span className="rent-pay-name">Transfer Bank</span>
                              </label>
                            </div>
                          </>
                        ) : (
                          <p className="text-size-small text-style-muted">
                            Tidak ada pembayaran sekarang. Inquiry ini hanya meminta admin menghubungi Anda.
                          </p>
                        )}
                      </div>

                      <button type="submit" className="button w-inline-block rent-confirm-btn" disabled={submitting || !property || !inquiry}>
                        <div className="button-text">
                          <div className="button_text">{submitting ? "Mengirim..." : "Kirim Minat"}</div>
                          <div className="button-text-animation">
                            <div className="button_text">Kirim Minat</div>
                          </div>
                        </div>
                        <img src="https://wubflow-shield.nocodexport.dev/685077c466f113761c6d796b/6853ff8bb7215267b2f31695_Kaleo_Icon.svg" loading="lazy" alt="Kaleo Icon" className="button-image" />
                      </button>
                    </form>
                  </section>

                  <aside className="rent-summary">
                    <div className="rent-card rent-summary-card">
                      <div className="rent-summary-head">Ringkasan Minat</div>
                      <div id="summaryBox">
                        {loading && <div className="text-size-small text-style-muted">Memuat ringkasan...</div>}
                        {!loading && !inquiry && (
                          <div className="rent-summary-top">
                            <div className="heading-style-h2">Belum ada rumah dipilih</div>
                            <div className="text-size-small text-style-muted">
                              Pilih rumah dari katalog lalu klik Saya Tertarik.
                            </div>
                            <Link href="/listing" className="button w-inline-block" style={{ marginTop: ".75rem" }}>
                              <div className="button-text">
                                <div className="button_text">Lihat Katalog</div>
                                <div className="button-text-animation">
                                  <div className="button_text">Lihat Katalog</div>
                                </div>
                              </div>
                            </Link>
                          </div>
                        )}
                        {!loading && inquiry && property && (
                          <>
                            <div className="rent-summary-top">
                              {summaryImage && <div className="rent-summary-img"><img src={summaryImage} alt={property.nama_rumah} /></div>}
                              <div>
                                <div className="text-weight-bold">{property.nama_rumah}</div>
                                <div className="text-size-small text-style-muted">{property.kota}</div>
                                <div className="text-size-small text-style-muted">{property.alamat}</div>
                              </div>
                            </div>

                            <div className="rent-summary-lines">
                              <div className="rent-summary-line">
                                <span>Harga rumah</span>
                                <span>{money(property.harga)}</span>
                              </div>
                              <div className="rent-summary-line">
                                <span>Booking fee ditanyakan</span>
                                <span>{money(bookingFee)}</span>
                              </div>
                              <div className="rent-summary-line is-total">
                                <span>Dibayar sekarang</span>
                                <span>{money(0)}</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </aside>
                </div>
              )}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
