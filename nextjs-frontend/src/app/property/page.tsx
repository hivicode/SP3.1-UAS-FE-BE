"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch, normalizeImageUrl, PropertyApi } from "@/lib/api";
import { money, renderStars } from "@/lib/format";

export default function PropertyPage() {
  return (
    <Suspense
      fallback={
        <div className="property-page-container">
          <Header />
          <section className="loading-section">
            <div className="loading-card font-serif">
              <h2>Memuat properti...</h2>
            </div>
          </section>
          <Footer />
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

  const statusLabel = () => {
    if (!property) return "";
    if (property.status === "sold") return "Sold";
    if (property.status === "onbook") return "On Book";
    return "Saya Tertarik";
  };

  return (
    <div className="property-page-container" suppressHydrationWarning>
      <Header />

      {loading && (
        <section className="loading-section">
          <div className="loading-card font-serif">
            <h2>Memuat properti...</h2>
          </div>
        </section>
      )}

      {!loading && !property && (
        <section className="loading-section">
          <div className="loading-card font-serif">
            <h2>Properti tidak ditemukan</h2>
            <p>Silakan kembali ke <Link href="/listing">Katalog</Link> untuk memilih rumah.</p>
          </div>
        </section>
      )}

      {!loading && property && (
        <div className="property-layout-wrapper">
          {/* Gallery Banner */}
          <div className="immersive-hero">
            <img 
              src={currentImage} 
              alt={property.nama_rumah} 
              className="hero-bg-img"
            />
            <div className="hero-overlay" />
            
            <div className="hero-top-bar">
              <Link href="/listing" className="back-link">
                &larr; Kembali ke Katalog
              </Link>
            </div>

            <div className="hero-bottom-bar">
              <div className="property-type">{property.tipe}</div>
              <h1 className="property-title font-serif">{property.nama_rumah}</h1>
              <div className="property-location">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
                </svg>
                {property.alamat}, {property.kota}
              </div>
            </div>
          </div>

          {/* Thumbnail Gallery Bar */}
          {images.length > 1 && (
            <div className="gallery-thumbs">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  className={`thumb-btn ${index === activeImage ? "active" : ""}`}
                  onClick={() => setActiveImage(index)}
                >
                  <img src={image} alt={`thumbnail ${index + 1}`} />
                </button>
              ))}
            </div>
          )}

          {/* Core Content Grid */}
          <div className="main-content">
            <div className="content-grid">
              
              {/* Left Column Details */}
              <div className="details-column">
                <div className="specs-grid">
                  <div>
                    <span className="spec-label">Kamar Tidur</span>
                    <div className="spec-val font-serif">{property.kamar_tidur}</div>
                  </div>
                  <div>
                    <span className="spec-label">Kamar Mandi</span>
                    <div className="spec-val font-serif">{property.kamar_mandi}</div>
                  </div>
                  <div>
                    <span className="spec-label">Luas Bangunan</span>
                    <div className="spec-val font-serif">{property.luas_bangunan} m²</div>
                  </div>
                  <div>
                    <span className="spec-label">Garasi</span>
                    <div className="spec-val font-serif">{property.garasi || "0"}</div>
                  </div>
                </div>

                <div className="section-block">
                  <h2 className="section-title">
                    <span className="title-line" /> Filosofi Ruang
                  </h2>
                  <p className="philosophy-text font-serif">
                    {property.deskripsi || "Sebuah ruang yang dirancang dengan kesadaran dan ketenangan. Menghadirkan sirkulasi udara alami dan cahaya matahari yang membasuh interior sepanjang hari."}
                  </p>
                </div>

                {property.fitur && property.fitur.length > 0 && (
                  <div className="section-block">
                    <h2 className="section-title">
                      <span className="title-line" /> Fasilitas & Karakter
                    </h2>
                    <div className="amenities-grid">
                      {property.fitur.map((feature) => (
                        <div key={feature} className="amenity-item">
                          <img 
                            src="https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/6853ff8bb7215267b2f31695_Kaleo_Icon.svg" 
                            alt="bullet" 
                            className="bullet-icon"
                          />
                          <span>{feature.charAt(0).toUpperCase() + feature.slice(1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column Sticky Sidebar */}
              <div className="sidebar-column">
                <div className="booking-card">
                  <img 
                    src="https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/6853ff8bb7215267b2f31695_Kaleo_Icon.svg" 
                    alt="Logo" 
                    className="booking-logo"
                  />
                  <span className="booking-label">Nilai Investasi</span>
                  <div className="booking-price font-serif">{money(property.harga)}</div>
                  
                  <div className="booking-inputs">
                    <label className="input-label" htmlFor="bookingFee">Booking Fee (Opsional)</label>
                    <input
                      id="bookingFee"
                      type="number"
                      className="booking-input"
                      placeholder="0"
                      value={bookingFee || ""}
                      onChange={(event) => setBookingFee(Number(event.target.value) || 0)}
                    />
                    <p className="input-helper">
                      Isi nominal jika Anda ingin mengajukan pembayaran booking fee secara langsung. Kosongkan jika hanya ingin bertanya.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="booking-submit-btn"
                    onClick={handleInquiry}
                    disabled={property.status !== "available"}
                  >
                    {statusLabel()}
                  </button>

                  <p className="booking-footer-note">
                    Proses penawaran transparan & terpercaya. Admin akan menghubungi via WhatsApp/telepon.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      <Footer />

      <style jsx>{`
        .property-page-container {
          background: #f4efe4;
          color: #1f2a22;
          min-height: 100vh;
        }

        .loading-section {
          padding: 8rem 1.25rem;
          display: flex;
          justify-content: center;
        }

        .loading-card {
          background: white;
          border: 1px solid rgba(31, 42, 34, 0.15);
          padding: 3rem;
          text-align: center;
          max-width: 32rem;
          width: 100%;
        }

        .loading-card h2 {
          font-size: 2rem;
          font-weight: 500;
          margin-bottom: 1rem;
        }

        .loading-card p {
          font-size: 0.875rem;
          color: rgba(31, 42, 34, 0.6);
        }

        /* Immersive Hero styling */
        .immersive-hero {
          position: relative;
          height: 65vh;
          width: 100%;
          overflow: hidden;
          background: #111111;
        }

        .hero-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 60%, rgba(0,0,0,0.7) 100%);
        }

        .hero-top-bar {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          padding: 2rem 1.25rem;
          z-index: 10;
        }

        @media (min-width: 768px) {
          .hero-top-bar {
            padding: 2rem 3rem;
          }
        }

        @media (min-width: 1024px) {
          .hero-top-bar {
            padding: 2rem 4rem;
          }
        }

        .back-link {
          color: white;
          text-transform: uppercase;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-decoration: none;
          opacity: 0.8;
          transition: opacity 0.2s ease;
        }

        .back-link:hover {
          opacity: 1;
        }

        .hero-bottom-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          padding: 2rem 1.25rem;
          z-index: 10;
          color: white;
        }

        @media (min-width: 768px) {
          .hero-bottom-bar {
            padding: 3rem;
          }
        }

        @media (min-width: 1024px) {
          .hero-bottom-bar {
            padding: 4rem;
          }
        }

        .property-type {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          margin-bottom: 0.5rem;
          opacity: 0.85;
        }

        .property-title {
          font-size: clamp(2.5rem, 5vw, 4.5rem);
          line-height: 1;
          letter-spacing: -0.04em;
          font-weight: 500;
          margin-bottom: 0.75rem;
        }

        .property-location {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 14px;
          opacity: 0.9;
        }

        /* Thumbs gallery bar */
        .gallery-thumbs {
          display: flex;
          gap: 0.5rem;
          padding: 0.5rem 1.25rem;
          background: #e8dfce;
          overflow-x: auto;
        }

        @media (min-width: 768px) {
          .gallery-thumbs {
            padding: 0.5rem 3rem;
          }
        }

        @media (min-width: 1024px) {
          .gallery-thumbs {
            padding: 0.5rem 4rem;
          }
        }

        .thumb-btn {
          background: transparent;
          border: 1px solid transparent;
          padding: 0;
          cursor: pointer;
          height: 4rem;
          flex-shrink: 0;
          transition: border-color 0.2s ease;
        }

        .thumb-btn.active {
          border-color: #111111;
        }

        .thumb-btn img {
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Main Content wrapper */
        .main-content {
          max-width: 72rem;
          margin: 0 auto;
          padding: 4rem 1.25rem;
        }

        @media (min-width: 768px) {
          .main-content {
            padding: 5rem 3rem;
          }
        }

        @media (min-width: 1024px) {
          .main-content {
            padding: 5rem 4rem;
          }
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 4rem;
        }

        @media (min-width: 1024px) {
          .content-grid {
            grid-template-columns: 1.4fr 0.6fr;
            gap: 5rem;
          }
        }

        .specs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
          border-bottom: 1px solid rgba(31, 42, 34, 0.15);
          padding-bottom: 3rem;
          margin-bottom: 3rem;
        }

        @media (min-width: 640px) {
          .specs-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .spec-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: rgba(31, 42, 34, 0.5);
          margin-bottom: 0.5rem;
          display: block;
        }

        .spec-val {
          font-size: 1.5rem;
          font-weight: 500;
        }

        .section-block {
          margin-bottom: 3.5rem;
        }

        .section-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .title-line {
          width: 2rem;
          height: 1px;
          background: #111111;
          margin-right: 0.75rem;
        }

        .philosophy-text {
          font-size: clamp(1.125rem, 2vw, 1.35rem);
          line-height: 1.7;
          color: rgba(31, 42, 34, 0.85);
        }

        .amenities-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }

        @media (min-width: 640px) {
          .amenities-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .amenity-item {
          display: flex;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(31, 42, 34, 0.06);
          font-size: 14px;
        }

        .bullet-icon {
          width: 1rem;
          height: 1rem;
          opacity: 0.5;
          margin-right: 0.75rem;
        }

        /* Sticky Sidebar styling */
        .sidebar-column {
          position: relative;
        }

        @media (min-width: 1024px) {
          .sidebar-column {
            position: sticky;
            top: 7rem;
            align-self: flex-start;
          }
        }

        .booking-card {
          background: #111111;
          color: #f7f0e4;
          padding: 2.5rem;
        }

        .booking-logo {
          width: 2rem;
          height: 2rem;
          margin-bottom: 2.5rem;
          opacity: 0.5;
          filter: invert(1);
        }

        .booking-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 0.5rem;
          display: block;
        }

        .booking-price {
          font-size: 2.25rem;
          font-weight: 500;
          margin-bottom: 2.5rem;
        }

        .booking-inputs {
          margin-bottom: 2.5rem;
        }

        .input-label {
          display: block;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          margin-bottom: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .booking-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.25);
          color: white;
          padding-bottom: 0.5rem;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .booking-input:focus {
          border-color: white;
        }

        .input-helper {
          font-size: 11px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.45);
          margin-top: 0.5rem;
        }

        .booking-submit-btn {
          width: 100%;
          background: #f7f0e4;
          color: #111111;
          border: none;
          padding: 1.1rem;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .booking-submit-btn:hover:not(:disabled) {
          background: #ffffff;
        }

        .booking-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .booking-footer-note {
          text-align: center;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          line-height: 1.6;
          margin-top: 1.5rem;
        }
      `}</style>
    </div>
  );
}
