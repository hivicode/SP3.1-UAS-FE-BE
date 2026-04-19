"use client";
import HeaderMinimal from "../../components/HeaderMinimal";
import Footer from "../../components/Footer";
import Link from "next/link";
import "../css/listing.css";
import "../css/rent.css";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiFetch, makeApiUrl, PropertyApi } from "@/lib/api";
import { money } from "@/lib/format";

type PurchaseState = {
  propertyId: string;
  bookingFee: number;
  createdAt: number;
};

export default function CheckoutPage() {
  const [purchase, setPurchase] = useState<PurchaseState | null>(null);
  const [property, setProperty] = useState<PropertyApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [payMethod, setPayMethod] = useState("visa");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem("planb_purchase");
    if (!raw) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as PurchaseState;
      setPurchase(parsed);
    } catch {
      setPurchase(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!purchase?.propertyId) return;
    const loadProperty = async () => {
      try {
        const data = await apiFetch<PropertyApi>(`/api/properti/${encodeURIComponent(purchase.propertyId)}`);
        setProperty(data);
      } catch {
        setProperty(null);
      }
    };
    loadProperty();
  }, [purchase?.propertyId]);

  const summaryImage = useMemo(() => {
    const src = property?.gambar?.[0] || "";
    if (!src) return "";
    if (/^https?:\/\//i.test(src)) return src;
    return makeApiUrl(src);
  }, [property?.gambar]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!property || !purchase) return;

    const formData = new FormData(event.currentTarget);
    const firstName = String(formData.get("firstName") || "").trim();
    const lastName = String(formData.get("lastName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();

    if (!firstName || !lastName || !email || !phone) {
      window.alert("Lengkapi semua data checkout.");
      return;
    }

    const requiresCard = payMethod === "visa" || payMethod === "mastercard";
    if (requiresCard) {
      const cardNumber = String(formData.get("cardNumber") || "").trim();
      const expiry = String(formData.get("expiry") || "").trim();
      const cvv = String(formData.get("cvv") || "").trim();
      const cardName = String(formData.get("cardName") || "").trim();
      if (!cardNumber || !expiry || !cvv || !cardName) {
        window.alert("Lengkapi data kartu.");
        return;
      }
    }

    setSubmitting(true);
    try {
      await apiFetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kode_rumah: property.kode_rumah,
          nama_depan: firstName,
          nama_belakang: lastName,
          email,
          telepon: phone,
          metode_pembayaran: payMethod,
          booking_fee: Number(purchase.bookingFee || 0),
        }),
      });
      window.localStorage.removeItem("planb_purchase");
      window.alert("Pengajuan pembelian berhasil! Tim kami akan menghubungi Anda.");
      window.location.href = "/listing";
    } catch {
      window.alert("Gagal mengirim data booking. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper" id="page-wrapper-id" data-page="checkout">
      <main className="main-wrapper">
        <HeaderMinimal />

        <section className="padding-section-large rent-checkout">
          <div className="padding-global">
            <div className="container-large">
              <nav aria-label="Breadcrumb" className="rent-breadcrumb">
                <Link href="/" className="rent-breadcrumb-link">Home</Link>
                <span className="rent-breadcrumb-separator">/</span>
                <Link href="/listing" className="rent-breadcrumb-link">Listing</Link>
                <span className="rent-breadcrumb-separator">/</span>
                <span className="rent-breadcrumb-current">Checkout</span>
              </nav>

              <div className="rent-checkout-layout">
                <div className="rent-checkout-title">
                  <h2 className="heading-style-h2">Ajukan Pembelian</h2>
                  <div className="text-size-small text-style-muted">Isi data pembeli dan pilih metode pembayaran booking fee.</div>
                </div>

                <section className="rent-panel">
                  <form id="checkoutForm" className="rent-form" onSubmit={onSubmit}>
                    <div className="rent-card">
                      <div className="rent-card-head">
                        <div className="text-style-allcaps text-size-small">Data Pembeli</div>
                      </div>

                      <div className="rent-row-2">
                        <div className="rent-field">
                          <label className="text-size-small text-style-allcaps" htmlFor="firstName">Nama depan</label>
                          <input id="firstName" name="firstName" className="form-field w-input" autoComplete="given-name" placeholder="Bintang" required/>
                        </div>
                        <div className="rent-field">
                          <label className="text-size-small text-style-allcaps" htmlFor="lastName">Nama belakang</label>
                          <input id="lastName" name="lastName" className="form-field w-input" autoComplete="family-name" placeholder="Fathir" required/>
                        </div>
                      </div>

                      <div className="rent-row-2">
                        <div className="rent-field">
                          <label className="text-size-small text-style-allcaps" htmlFor="email">Email</label>
                          <input id="email" name="email" className="form-field w-input" type="email" autoComplete="email" placeholder="nama@email.com" required/>
                        </div>
                        <div className="rent-field">
                          <label className="text-size-small text-style-allcaps" htmlFor="phone">Nomor HP</label>
                          <input id="phone" name="phone" className="form-field w-input" autoComplete="tel" inputMode="tel" placeholder="08xxxxxxxxxx" required/>
                        </div>
                      </div>
                    </div>

                    <div className="rent-card">
                      <div className="rent-card-head">
                        <div className="text-style-allcaps text-size-small">Metode Pembayaran</div>
                      </div>

                      <div className="rent-pay-methods">
                        <label className="rent-pay">
                          <input type="radio" name="payMethod" value="visa" checked={payMethod === "visa"} onChange={() => setPayMethod("visa")}/>
                          <span className="rent-pay-name">VISA</span>
                        </label>

                        <label className="rent-pay">
                          <input type="radio" name="payMethod" value="mastercard" checked={payMethod === "mastercard"} onChange={() => setPayMethod("mastercard")}/>
                          <span className="rent-pay-name">Mastercard</span>
                        </label>

                        <label className="rent-pay">
                          <input type="radio" name="payMethod" value="gpay" checked={payMethod === "gpay"} onChange={() => setPayMethod("gpay")}/>
                          <span className="rent-pay-name">GPay</span>
                        </label>

                        <label className="rent-pay">
                          <input type="radio" name="payMethod" value="paypal" checked={payMethod === "paypal"} onChange={() => setPayMethod("paypal")}/>
                          <span className="rent-pay-name">PayPal</span>
                        </label>

                        <label className="rent-pay">
                          <input type="radio" name="payMethod" value="applepay" checked={payMethod === "applepay"} onChange={() => setPayMethod("applepay")}/>
                          <span className="rent-pay-name">Apple Pay</span>
                        </label>

                        <label className="rent-pay">
                          <input type="radio" name="payMethod" value="stripe" checked={payMethod === "stripe"} onChange={() => setPayMethod("stripe")}/>
                          <span className="rent-pay-name">Stripe</span>
                        </label>
                      </div>

                      <div id="cardFields" className="rent-card-fields" style={{ display: payMethod === "visa" || payMethod === "mastercard" ? "" : "none" }}>
                        <div className="rent-row-1">
                          <div className="rent-field">
                            <label className="text-size-small text-style-allcaps" htmlFor="cardNumber">Nomor kartu</label>
                            <input id="cardNumber" name="cardNumber" className="form-field w-input" autoComplete="cc-number" inputMode="numeric" placeholder="0000 0000 0000 0000" required={payMethod === "visa" || payMethod === "mastercard"}/>
                          </div>
                        </div>

                        <div className="rent-row-2">
                          <div className="rent-field">
                            <label className="text-size-small text-style-allcaps" htmlFor="expiry">Masa berlaku</label>
                            <input id="expiry" name="expiry" className="form-field w-input" autoComplete="cc-exp" inputMode="numeric" placeholder="MM/YY" required={payMethod === "visa" || payMethod === "mastercard"}/>
                          </div>
                          <div className="rent-field">
                            <label className="text-size-small text-style-allcaps" htmlFor="cvv">CVV</label>
                            <input id="cvv" name="cvv" className="form-field w-input" autoComplete="cc-csc" inputMode="numeric" placeholder="123" required={payMethod === "visa" || payMethod === "mastercard"}/>
                          </div>
                        </div>

                        <div className="rent-row-1">
                          <div className="rent-field">
                            <label className="text-size-small text-style-allcaps" htmlFor="cardName">Nama pemilik kartu</label>
                            <input id="cardName" name="cardName" className="form-field w-input" autoComplete="cc-name" placeholder="Nama sesuai kartu" required={payMethod === "visa" || payMethod === "mastercard"}/>
                          </div>
                        </div>
                      </div>
                      <div
                        id="altPayNote"
                        className="text-size-small text-style-muted rent-pay-note"
                        style={{ display: payMethod === "visa" || payMethod === "mastercard" ? "none" : "" }}
                      >
                        Konfirmasi pembayaran akan dialihkan ke layanan terpilih.
                      </div>
                      <div className="text-size-small text-style-muted">Informasi pembayaran dienkripsi dan aman.</div>
                    </div>

                    <button type="submit" className="button w-inline-block rent-confirm-btn" disabled={submitting}>
                      <div className="button-text">
                        <div className="button_text">{submitting ? "Menyimpan..." : "Confirm Reservation"}</div>
                        <div className="button-text-animation">
                          <div className="button_text">Confirm Reservation</div>
                        </div>
                      </div>
                      <img src="https://wubflow-shield.nocodexport.dev/685077c466f113761c6d796b/6853ff8bb7215267b2f31695_Kaleo_Icon.svg" loading="lazy" alt="Kaleo Icon" className="button-image"/>
                    </button>
                  </form>
                </section>

                <aside className="rent-summary">
                  <div className="rent-card rent-summary-card">
                    <div className="rent-summary-head">Ringkasan</div>
                    <div id="summaryBox">
                      {loading && <div className="text-size-small text-style-muted">Memuat ringkasan...</div>}
                      {!loading && !purchase && (
                        <div className="rent-summary-top">
                          <div className="heading-style-h2">Belum ada pengajuan</div>
                          <div className="text-size-small text-style-muted">
                            Silakan pilih properti lalu klik Ajukan Pembelian.
                          </div>
                          <Link href="/listing" className="button w-inline-block" style={{ marginTop: ".75rem" }}>
                            <div className="button-text">
                              <div className="button_text">Kembali ke Listing</div>
                              <div className="button-text-animation">
                                <div className="button_text">Kembali ke Listing</div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      )}
                      {!loading && purchase && property && (
                        <>
                          <div className="rent-summary-top">
                            <div className="rent-summary-img"><img src={summaryImage} alt={property.nama_rumah} /></div>
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
                              <span>Booking fee (dibayar sekarang)</span>
                              <span>{money(Number(purchase.bookingFee || 0))}</span>
                            </div>
                            <div className="rent-summary-line is-total">
                              <span>Total dibayar sekarang</span>
                              <span>{money(Number(purchase.bookingFee || 0))}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
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
