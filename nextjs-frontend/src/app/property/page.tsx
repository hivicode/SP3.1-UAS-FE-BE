"use client";
import HeaderMinimal from "../../components/HeaderMinimal";
import Footer from "../../components/Footer";
import Link from "next/link";
import "../css/listing.css";
import "../css/rent.css";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch, normalizeImageUrl, PropertyApi } from "@/lib/api";
import { money, renderStars } from "@/lib/format";

export default function PropertyPage() {
  return (
    <Suspense
      fallback={
        <div className="page-wrapper" id="page-wrapper-id" data-page="property">
          <main className="main-wrapper">
            <HeaderMinimal />
            <section className="padding-section-large rent-detail">
              <div className="padding-global">
                <div className="container-large">
                  <div className="rent-card">
                    <div className="heading-style-h2">Memuat properti...</div>
                  </div>
                </div>
              </div>
            </section>
            <Footer />
          </main>
        </div>
      }
    >
      <PropertyPageContent />
    </Suspense>
  );
}

function PropertyPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const propertyId = searchParams.get("id") || "";
  const [property, setProperty] = useState<PropertyApi | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [bookingFee, setBookingFee] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!propertyId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const data = await apiFetch<PropertyApi>(`/api/properti/${encodeURIComponent(propertyId)}`);
        setProperty(data);
      } catch {
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [propertyId]);

  const images = useMemo(
    () => (property?.gambar || []).map((image) => normalizeImageUrl(image)),
    [property]
  );
  const currentImage = images[activeImage] || images[0] || "";

  const handleInquiry = () => {
    if (!property) return;
    window.localStorage.setItem(
      "planb_inquiry",
      JSON.stringify({
        propertyId: property.kode_rumah,
        bookingFee,
        createdAt: Date.now(),
      })
    );
    router.push("/inquiry");
  };

  return (
    <div className="page-wrapper" id="page-wrapper-id" data-page="property">
      <main className="main-wrapper">
        <HeaderMinimal />

        <section className="padding-section-large rent-detail">
          <div className="padding-global">
            <div className="container-large">
              <nav aria-label="Breadcrumb" className="rent-breadcrumb">
                <Link href="/" className="rent-breadcrumb-link">Home</Link>
                <span className="rent-breadcrumb-separator">/</span>
                <Link href="/listing" className="rent-breadcrumb-link">Katalog</Link>
                <span className="rent-breadcrumb-separator">/</span>
                <span className="rent-breadcrumb-current">Detail Rumah</span>
              </nav>

              {loading && (
                <div className="rent-card">
                  <div className="heading-style-h2">Memuat properti...</div>
                </div>
              )}

              {!loading && !property && (
                <div className="rent-card">
                  <div className="heading-style-h2">Properti tidak ditemukan</div>
                  <div className="text-size-small text-style-muted">
                    Kembali ke katalog untuk pilih rumah.
                  </div>
                </div>
              )}

              {!loading && property && (
                <div id="propertyRoot" className="rent-detail-layout">
                  <section className="rent-detail-main">
                    <div className="rent-gallery">
                      <div className="rent-gallery-main">
                        <div className={`rent-main-img-wrap ${property.status !== "available" ? "is-blocked" : ""}`}>
                          <img id="galleryMain" src={currentImage} alt={property.nama_rumah} />
                          {property.status !== "available" && (
                            <div className="rent-status-badge">{property.status}</div>
                          )}
                        </div>
                      </div>
                      <div className="rent-thumbs">
                        {images.map((image, index) => (
                          <button
                            key={`${image}-${index}`}
                            type="button"
                            className={`rent-thumb ${property.status !== "available" ? "is-blocked" : ""}`}
                            onClick={() => setActiveImage(index)}
                          >
                            <img src={image} alt={`${property.nama_rumah} thumbnail ${index + 1}`} />
                            {property.status !== "available" && (
                              <div className="rent-status-badge">{property.status}</div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rent-detail-content">
                      <div className="rent-detail-title">
                        <div className="text-style-allcaps text-size-small">{property.tipe}</div>
                        <h2 className="heading-style-h2">{property.nama_rumah}</h2>
                        <div className="text-size-small text-style-muted">
                          {renderStars(property.rating)} {Number(property.rating || 0).toFixed(1)} · {property.alamat}, {property.kota}
                        </div>
                      </div>

                      <div className="rent-kpis">
                        <div className="rent-chip"><span className="material-symbols-rounded">bed</span>{property.kamar_tidur} Kamar tidur</div>
                        <div className="rent-chip"><span className="material-symbols-rounded">bathtub</span>{property.kamar_mandi} Kamar mandi</div>
                        <div className="rent-chip"><span className="material-symbols-rounded">square_foot</span>{property.luas_bangunan} m²</div>
                        <div className="rent-chip"><span className="material-symbols-rounded">garage</span>{property.garasi} Garages</div>
                      </div>

                      <div className="text-rich-text">
                        <p>{property.deskripsi || "Belum ada deskripsi."}</p>
                      </div>

                      <div>
                        <div className="text-style-allcaps text-size-small">Fasilitas</div>
                        <div className="rent-kpis" style={{ marginTop: ".5rem" }}>
                          {(property.fitur || []).map((feature) => (
                            <div key={feature} className="rent-chip">
                              {feature.charAt(0).toUpperCase() + feature.slice(1)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  <aside className="rent-detail-aside">
                    <div className={`rent-booking ${property.status !== "available" ? "is-blocked" : ""}`}>
                      <div className="rent-booking-head">
                        <div className="rent-booking-price">{money(property.harga)}</div>
                        <div className="text-size-small text-style-muted">
                          Harga rumah. Admin akan menghubungi untuk detail unit dan jadwal kunjungan.
                        </div>
                      </div>

                      <div className="rent-booking-form">
                        <div className="rent-field">
                          <label className="text-size-small text-style-allcaps" htmlFor="bookingFee">
                            Booking fee opsional
                          </label>
                          <input
                            id="bookingFee"
                            className="form-field w-input"
                            inputMode="numeric"
                            placeholder="0"
                            value={bookingFee}
                            onChange={(event) => setBookingFee(Number(event.target.value) || 0)}
                          />
                          <div className="text-size-small text-style-muted">
                            Kosongkan jika hanya ingin bertanya dulu. Isi nominal jika ingin minta admin menyiapkan instruksi booking fee.
                          </div>
                        </div>

                        <button
                          id="buyBtn"
                          type="button"
                          className="button w-inline-block rent-primary-btn"
                          onClick={handleInquiry}
                          disabled={property.status !== "available"}
                        >
                          <div className="button-text">
                            <div className="button_text">
                              {property.status === "sold"
                                ? "Sold"
                                : property.status === "onbook"
                                  ? "On Book"
                                  : "Saya Tertarik"}
                            </div>
                            <div className="button-text-animation">
                              <div className="button_text">Saya Tertarik</div>
                            </div>
                          </div>
                        </button>

                        <div className="text-size-small text-style-muted">
                          Setelah form minat dikirim, admin PlanB akan menghubungi Anda melalui WhatsApp/telepon.
                        </div>
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

      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:wght@400;500&display=swap"/>
    </div>
  );
}
