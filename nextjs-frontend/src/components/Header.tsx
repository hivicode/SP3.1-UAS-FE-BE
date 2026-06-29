"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Tentang", path: "/#tentang" },
    { name: "Kunjungan", path: "/contact" },
    { name: "Cek Inquiry", path: "/inquiry/status" },
    { name: "Riwayat", path: "/inquiry/history" },
  ];

  const isActive = (path: string) => {
    if (path.startsWith("/#")) return false;
    return pathname === path;
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  return (
    <nav className="navbar" suppressHydrationWarning>
      <div className="nav-container">
        <Link href="/" className="brand" onClick={() => setIsOpen(false)}>
          <svg className="brand-logo-star" viewBox="0 0 24 24" fill="currentColor" style={{ width: "1.25rem", height: "1.25rem", color: "#1f2a22", transform: "translateY(-1px)" }}>
            <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" />
          </svg>
          <span className="brand-text">PlanB</span>
        </Link>

        {/* Desktop Nav */}
        <div className="desktop-nav">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              className={`nav-link ${isActive(link.path) ? "active" : ""}`}
            >
              {link.name}
            </Link>
          ))}
          <Link href="/listing" className="cta-button">
            Lihat Listing
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="mobile-toggle"
          aria-label={isOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <div className="mobile-nav">
          <div className="mobile-nav-links">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className={`mobile-nav-link ${isActive(link.path) ? "active" : ""}`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/listing"
              onClick={() => setIsOpen(false)}
              className="mobile-cta-button"
            >
              Lihat Listing
            </Link>
          </div>
        </div>
      )}

      <style jsx>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 50;
          border-bottom: 1px solid rgba(31, 42, 34, 0.15);
          background: rgba(244, 239, 228, 0.85);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }

        .nav-container {
          display: flex;
          height: 5rem;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          padding: 0 clamp(1.25rem, 4vw, 4rem);
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          color: #1f2a22;
          text-decoration: none;
        }

        .brand-mark {
          display: grid;
          height: 2.25rem;
          width: 2.25rem;
          place-items: center;
          background: #111111;
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: 1.125rem;
          color: #f7f0e4;
          font-weight: 500;
        }

        .brand-text {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: 1.25rem;
          letter-spacing: -0.02em;
          font-weight: 500;
        }

        .desktop-nav {
          display: none;
          align-items: center;
          gap: 2rem;
        }

        @media (min-width: 768px) {
          .desktop-nav {
            display: flex;
          }
        }

        .nav-link {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          color: rgba(31, 42, 34, 0.55);
          transition: color 0.2s ease;
          text-decoration: none;
        }

        .nav-link:hover,
        .nav-link.active {
          color: #111111;
        }

        .admin-link {
          color: rgba(31, 42, 34, 0.45);
        }

        .cta-button {
          border: 1px solid #111111;
          background: #111111;
          padding: 0.75rem 1.25rem;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #f7f0e4;
          transition: background-color 0.2s ease, color 0.2s ease;
          text-decoration: none;
        }

        .cta-button:hover {
          background: transparent;
          color: #111111;
        }

        .mobile-toggle {
          display: block;
          background: transparent;
          border: 1px solid rgba(31, 42, 34, 0.2);
          padding: 0.75rem;
          color: #1f2a22;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (min-width: 768px) {
          .mobile-toggle {
            display: none;
          }
        }

        .icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        .mobile-nav {
          border-top: 1px solid rgba(31, 42, 34, 0.15);
          background: #f4efe4;
          padding: 1.25rem clamp(1.25rem, 4vw, 4rem);
        }

        @media (min-width: 768px) {
          .mobile-nav {
            display: none;
          }
        }

        .mobile-nav-links {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .mobile-nav-link {
          border-bottom: 1px solid rgba(31, 42, 34, 0.1);
          padding: 1rem 0;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          color: #1f2a22;
          text-decoration: none;
        }

        .mobile-cta-button {
          margin-top: 1rem;
          border: 1px solid #111111;
          background: #111111;
          padding: 1rem;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #f7f0e4;
          text-align: center;
          text-decoration: none;
        }
      `}</style>
    </nav>
  );
}
