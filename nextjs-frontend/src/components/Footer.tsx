"use client";

import Link from "next/link";
import React from "react";

export default function Footer() {
  return (
    <footer className="footer" suppressHydrationWarning>
      <div className="footer-grid">
        <div className="brand-section">
          <Link href="/" className="brand">
            <svg className="brand-logo-star" viewBox="0 0 24 24" fill="currentColor" style={{ width: "1.25rem", height: "1.25rem", color: "#1f2a22", marginRight: "0.5rem", display: "inline-block", transform: "translateY(-1px)" }}>
              <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" />
            </svg>
            PlanB
          </Link>
          <p className="short-copy">
            Hunian modern yang tenang dan seimbang — ruang untuk bernapas, memilih, dan pulang dengan lebih sadar.
          </p>
        </div>
        <div className="links-section">
          <h3 className="section-title">Navigasi</h3>
          <div className="links-grid">
            <Link href="/listing" className="footer-link">Listing</Link>
            <Link href="/contact" className="footer-link">Kunjungan</Link>
            <Link href="/inquiry/status" className="footer-link">Cek Inquiry</Link>
            <Link href="/inquiry/history" className="footer-link">Riwayat Minat</Link>
          </div>
        </div>
        <div className="contact-section">
          <h3 className="section-title">Kontak</h3>
          <div className="links-grid">
            <a href="tel:+6281234567890" className="footer-link">+62 812 3456 7890</a>
            <a href="mailto:halo@planb.space" className="footer-link">halo@planb.space</a>
            <span className="contact-address">Kemang, Jakarta Selatan</span>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} PlanB</span>
        <span>Property management system</span>
      </div>

      <style jsx>{`
        .footer {
          border-top: 1px solid rgba(31, 42, 34, 0.15);
          background: #f4efe4;
          color: #1f2a22;
        }

        .footer-grid {
          display: grid;
          gap: 2.5rem;
          padding: 3rem clamp(1.25rem, 4vw, 4rem);
        }

        @media (min-width: 768px) {
          .footer-grid {
            grid-template-columns: 1.4fr 0.6fr 0.6fr;
            padding: 4rem clamp(1.25rem, 4vw, 4rem);
          }
        }

        .brand {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: 1.875rem;
          letter-spacing: -0.03em;
          text-decoration: none;
          color: #1f2a22;
          font-weight: 500;
        }

        .short-copy {
          margin-top: 1.25rem;
          max-width: 32rem;
          font-size: 0.875rem;
          line-height: 1.75;
          color: rgba(31, 42, 34, 0.6);
        }

        .section-title {
          margin-bottom: 1.25rem;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.24em;
          color: rgba(31, 42, 34, 0.45);
        }

        .links-grid {
          display: grid;
          gap: 0.75rem;
          font-size: 0.875rem;
        }

        .footer-link {
          color: rgba(31, 42, 34, 0.7);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .footer-link:hover {
          color: #111111;
        }

        .contact-address {
          color: rgba(31, 42, 34, 0.7);
        }

        .footer-bottom {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          border-top: 1px solid rgba(31, 42, 34, 0.15);
          padding: 1.25rem clamp(1.25rem, 4vw, 4rem);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          color: rgba(31, 42, 34, 0.45);
        }

        @media (min-width: 768px) {
          .footer-bottom {
            flex-direction: row;
            justify-content: space-between;
          }
        }
      `}</style>
    </footer>
  );
}
