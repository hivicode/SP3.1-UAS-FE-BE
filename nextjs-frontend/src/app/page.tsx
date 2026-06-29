"use client";

import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

const HERO_POSTER =
  "https://raw.githubusercontent.com/hivicode/hivicode.github.io/main/febe/Screenshot%202026-01-13%20231959.png";
const HERO_VIDEO =
  "https://raw.githubusercontent.com/hivicode/hivicode.github.io/main/febe/snapsave-app_6334_hd.webm";

const FEATURE_IMAGES = [
  "https://drive.google.com/thumbnail?id=1iNi_5jCJef6VloqQlI_UTeuwSPvkWUEl&sz=w1024",
  "https://drive.google.com/thumbnail?id=1ySLrro5PYLElnhkMOIeNT9FvmRLoJhSK&sz=w1024",
  "https://drive.google.com/thumbnail?id=1dZmhBiV6g--jyx3Fo2uuT4Hanx_ojSVW&sz=w1024",
];

const features = [
  {
    no: "01",
    title: "Lingkungan lebih hijau",
    body: "Area dirancang dengan nuansa alami agar rumah tidak hanya menjadi bangunan, tetapi tempat untuk bernapas dan beristirahat.",
    image: FEATURE_IMAGES[0],
    alt: "Ruang hijau di kawasan PlanB",
  },
  {
    no: "02",
    title: "Hunian yang praktis",
    body: "Pilihan rumah, villa, dan kavling disajikan dengan informasi jelas agar calon pembeli mudah membandingkan sebelum menghubungi tim.",
    image: FEATURE_IMAGES[1],
    alt: "Interior hunian PlanB yang nyaman",
    reverse: true,
  },
  {
    no: "03",
    title: "Proses inquiry transparan",
    body: "Setelah mengirim inquiry, calon pembeli dapat mengecek status tanpa harus menunggu follow-up manual terus-menerus.",
    image: FEATURE_IMAGES[2],
    alt: "Kawasan PlanB dengan pencahayaan alami",
  },
];

export default function Home() {
  return (
    <div className="page-container" suppressHydrationWarning>
      <Header />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-video-wrapper">
          <video
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
            poster={HERO_POSTER}
            aria-label="Suasana kawasan hunian PlanB yang asri"
          >
            <source src={HERO_VIDEO} type="video/webm" />
          </video>
          <div className="hero-overlay" />
        </div>

        <div className="hero-content">
          <div className="hero-top-info">
            <span>PlanB Residence</span>
            <span className="location-info">Jakarta Selatan — Indonesia</span>
          </div>

          <div className="hero-bottom-info">
            <p className="hero-eyebrow">Hunian modern bernuansa alam</p>
            <h1 className="hero-title font-serif">
              Ruang hidup yang lebih tenang.
            </h1>
            <div className="hero-actions-wrapper">
              <p className="hero-lead">
                PlanB menghadirkan kawasan hunian untuk keluarga yang ingin hidup lebih pelan,
                nyaman, dan tetap terhubung dengan akses kota.
              </p>
              <div className="hero-actions">
                <Link href="/listing" className="btn-primary">
                  Lihat Listing
                </Link>
                <Link href="/contact" className="btn-secondary">
                  Jadwalkan Kunjungan
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="tentang" className="about-section">
        <p className="section-eyebrow">Tentang PlanB</p>
        <div className="about-content">
          <h2 className="about-title font-serif">
            Bukan sekadar tempat tinggal. PlanB adalah ruang pulang yang lapang, hangat, dan mudah dijalani.
          </h2>
          <p className="about-lead">
            Kami menyederhanakan proses pencarian hunian: calon pembeli dapat melihat listing,
            mengirim inquiry, menjadwalkan kunjungan, dan memantau status inquiry secara mandiri.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="keunggulan" className="features-section">
        {features.map((item) => (
          <article key={item.no} className={`feature-item ${item.reverse ? "reverse" : ""}`}>
            <div className="feature-image-wrapper">
              <img src={item.image} alt={item.alt} className="feature-image" />
            </div>
            <div className="feature-text">
              <span className="feature-no">{item.no}</span>
              <h3 className="feature-title font-serif">{item.title}</h3>
              <p className="feature-body">{item.body}</p>
            </div>
          </article>
        ))}
      </section>

      {/* Bottom CTA Section */}
      <section id="listing" className="listing-cta-section">
        <div className="cta-text-wrapper">
          <p className="cta-eyebrow">Siap melihat pilihan properti?</p>
          <h2 className="cta-title font-serif">
            Temukan ruang yang sesuai dengan rencana hidupmu.
          </h2>
        </div>
        <div className="cta-actions">
          <Link href="/listing" className="cta-btn-primary">
            Lihat Listing
          </Link>
          <Link href="/inquiry/status" className="cta-btn-secondary">
            Cek Inquiry
            <svg className="arrow-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .page-container {
          background: #f4efe4;
          color: #1f2a22;
        }

        /* Hero styling */
        .hero-section {
          position: relative;
          min-height: calc(100vh - 5rem);
          overflow: hidden;
          background: #111111;
          color: #f7f0e4;
        }

        .hero-video-wrapper {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .hero-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.6) 100%);
        }

        .hero-content {
          position: relative;
          z-index: 10;
          display: flex;
          min-height: calc(100vh - 5rem);
          flex-direction: column;
          justify-content: space-between;
          padding: 2.5rem 1.25rem;
        }

        @media (min-width: 768px) {
          .hero-content {
            padding: 2.5rem 3rem;
          }
        }

        @media (min-width: 1024px) {
          .hero-content {
            padding: 2.5rem 4rem;
          }
        }

        .hero-top-info {
          display: flex;
          justify-content: space-between;
          gap: 1.5rem;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.26em;
          color: rgba(255, 255, 255, 0.65);
        }

        .location-info {
          display: none;
        }

        @media (min-width: 640px) {
          .location-info {
            display: block;
          }
        }

        .hero-bottom-info {
          max-width: 72rem;
          padding-bottom: 1.5rem;
        }

        .hero-eyebrow {
          margin-bottom: 1.25rem;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.26em;
          color: rgba(255, 255, 255, 0.7);
        }

        .hero-title {
          max-width: 12ch;
          font-size: clamp(3.5rem, 8vw, 9.5rem);
          line-height: 0.84;
          letter-spacing: -0.06em;
          color: #ffffff;
          margin-bottom: 2rem;
        }

        .hero-actions-wrapper {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          max-width: 60rem;
          margin-top: 2rem;
        }

        @media (min-width: 768px) {
          .hero-actions-wrapper {
            grid-template-columns: 0.9fr 1.1fr;
            align-items: flex-end;
          }
        }

        .hero-lead {
          font-size: 1rem;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.75);
          margin-bottom: 0;
        }

        @media (min-width: 768px) {
          .hero-lead {
            font-size: 1.125rem;
          }
        }

        .hero-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        @media (min-width: 640px) {
          .hero-actions {
            flex-direction: row;
            justify-content: flex-end;
          }
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #f7f0e4;
          color: #111111;
          padding: 1rem 1.5rem;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          text-decoration: none;
          transition: background-color 0.2s ease;
        }

        .btn-primary:hover {
          background: #ffffff;
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.35);
          color: #ffffff;
          padding: 1rem 1.5rem;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          text-decoration: none;
          transition: background-color 0.2s;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        /* About section styling */
        .about-section {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
          border-bottom: 1px solid rgba(31, 42, 34, 0.15);
          padding: 5rem 1.25rem;
        }

        @media (min-width: 768px) {
          .about-section {
            padding: 5rem 3rem;
          }
        }

        @media (min-width: 1024px) {
          .about-section {
            grid-template-columns: 0.75fr 1.25fr;
            padding: 7rem 4rem;
          }
        }

        .section-eyebrow {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.26em;
          color: #264f36;
        }

        .about-content {
          display: flex;
          flex-direction: column;
        }

        .about-title {
          font-size: clamp(2rem, 4.5vw, 3.75rem);
          line-height: 0.98;
          letter-spacing: -0.04em;
          font-weight: 500;
        }

        .about-lead {
          margin-top: 2rem;
          max-width: 48rem;
          font-size: 1rem;
          line-height: 1.8;
          color: rgba(31, 42, 34, 0.65);
        }

        /* Features section styling */
        .features-section {
          padding: 0 1.25rem;
        }

        @media (min-width: 768px) {
          .features-section {
            padding: 0 3rem;
          }
        }

        @media (min-width: 1024px) {
          .features-section {
            padding: 0 4rem;
          }
        }

        .feature-item {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          align-items: center;
          border-bottom: 1px solid rgba(31, 42, 34, 0.15);
          padding: 3.5rem 0;
        }

        @media (min-width: 1024px) {
          .feature-item {
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            padding: 5rem 0;
          }

          .feature-item.reverse .feature-image-wrapper {
            order: 2;
          }
        }

        .feature-image-wrapper {
          overflow: hidden;
          background: #d8cbb5;
        }

        .feature-image {
          width: 100%;
          aspect-ratio: 4 / 3;
          object-fit: cover;
          display: block;
          transition: transform 1.6s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .feature-image-wrapper:hover .feature-image {
          transform: scale(1.045);
        }

        .feature-text {
          max-width: 36rem;
        }

        .feature-no {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.26em;
          color: #264f36;
        }

        .feature-title {
          margin-top: 1rem;
          font-size: clamp(1.75rem, 3.5vw, 3rem);
          line-height: 1;
          letter-spacing: -0.035em;
          font-weight: 500;
        }

        .feature-body {
          margin-top: 1.5rem;
          font-size: 1rem;
          line-height: 1.8;
          color: rgba(31, 42, 34, 0.65);
        }

        /* Bottom CTA styling */
        .listing-cta-section {
          background: #111111;
          color: #f7f0e4;
          margin: 1.25rem;
          padding: 3rem 1.5rem;
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
        }

        @media (min-width: 768px) {
          .listing-cta-section {
            margin: 3rem;
            padding: 4rem;
          }
        }

        @media (min-width: 1024px) {
          .listing-cta-section {
            margin: 4rem;
            grid-template-columns: 1.35fr 0.65fr;
            align-items: flex-end;
          }
        }

        .cta-eyebrow {
          margin-bottom: 1.25rem;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.26em;
          color: rgba(255, 255, 255, 0.55);
        }

        .cta-title {
          max-width: 13ch;
          font-size: clamp(2rem, 4.5vw, 3.75rem);
          line-height: 1;
          letter-spacing: -0.04em;
          margin-bottom: 0;
          font-weight: 500;
        }

        .cta-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        @media (min-width: 640px) {
          .cta-actions {
            flex-direction: row;
            justify-content: flex-end;
          }
        }

        .cta-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #f7f0e4;
          color: #111111;
          padding: 1rem 1.5rem;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          text-decoration: none;
          transition: background-color 0.2s ease;
        }

        .cta-btn-primary:hover {
          background: #ffffff;
        }

        .cta-btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #ffffff;
          padding: 1rem 1.5rem;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          text-decoration: none;
          transition: background-color 0.2s;
          gap: 0.5rem;
        }

        .cta-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .arrow-icon {
          transition: transform 0.2s ease;
        }

        .cta-btn-secondary:hover .arrow-icon {
          transform: translate(2px, -2px);
        }
      `}</style>
    </div>
  );
}