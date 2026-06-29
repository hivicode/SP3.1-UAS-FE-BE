"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetch, normalizeImageUrl, PropertyApi } from "@/lib/api";
import { money, renderStars } from "@/lib/format";

export default function ListingPage() {
  const [properties, setProperties] = useState<PropertyApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [propertyType, setPropertyType] = useState("");
  const [minBeds, setMinBeds] = useState(0);
  const [minBaths, setMinBaths] = useState(0);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [features, setFeatures] = useState({
    parking: false,
    pool: false,
    garden: false,
    gym: false,
  });
  const [pageSize, setPageSize] = useState(9);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const data = await apiFetch<PropertyApi[]>("/api/properti");
        setProperties(Array.isArray(data) ? data : []);
        setLoadError("");
      } catch (error) {
        setProperties([]);
        setLoadError(error instanceof Error ? error.message : "Gagal memuat katalog rumah.");
      } finally {
        setLoading(false);
      }
    };
    loadProperties();
  }, []);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const base = properties.filter((item) => {
      const searchTarget = `${item.nama_rumah} ${item.alamat} ${item.kota}`.toLowerCase();
      if (normalizedSearch && !searchTarget.includes(normalizedSearch)) return false;
      if (propertyType && item.tipe !== propertyType) return false;
      if (minBeds && Number(item.kamar_tidur) < minBeds) return false;
      if (minBaths && Number(item.kamar_mandi) < minBaths) return false;

      const price = Number(item.harga) || 0;
      if (price < minPrice) return false;
      if (maxPrice > 0 && price > maxPrice) return false;

      const featureList = Array.isArray(item.fitur) ? item.fitur : [];
      if (features.parking && !featureList.includes("parking")) return false;
      if (features.pool && !featureList.includes("pool")) return false;
      if (features.garden && !featureList.includes("garden")) return false;
      if (features.gym && !featureList.includes("gym")) return false;

      return true;
    });

    if (sortBy === "priceAsc") return base.sort((a, b) => a.harga - b.harga);
    if (sortBy === "priceDesc") return base.sort((a, b) => b.harga - a.harga);
    if (sortBy === "bedsDesc") return base.sort((a, b) => b.kamar_tidur - a.kamar_tidur);
    if (sortBy === "ratingDesc") return base.sort((a, b) => b.rating - a.rating);
    return base;
  }, [properties, search, propertyType, minBeds, minBaths, minPrice, maxPrice, features, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [search, propertyType, minBeds, minBaths, minPrice, maxPrice, features, sortBy, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const visible = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const resetFilters = () => {
    setSearch("");
    setSortBy("featured");
    setPropertyType("");
    setMinBeds(0);
    setMinBaths(0);
    setMinPrice(0);
    setMaxPrice(0);
    setFeatures({
      parking: false,
      pool: false,
      garden: false,
      gym: false,
    });
  };

  return (
    <div className="listing-page-container" suppressHydrationWarning>
      <Header />

      {/* Header Banner */}
      <div className="header-banner">
        <div className="header-banner-content">
          <div className="banner-eyebrow">Ruang & Kehidupan</div>
          <h1 className="banner-title font-serif">
            Temukan harmoni<br />di setiap sudut.
          </h1>
          <p className="banner-lead">
            Jelajahi koleksi properti PlanB yang dirancang untuk mereka yang menghargai ketenangan, cahaya alami, dan ritme hidup yang selaras.
          </p>
        </div>
        <img 
          src="https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/6853ff8bb7215267b2f31695_Kaleo_Icon.svg" 
          alt="Kaleo Icon" 
          className="banner-bg-icon"
        />
      </div>

      <div className="main-content">
        <div className="layout-grid">
          
          {/* Mobile Filter Toggle */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="mobile-filter-btn"
          >
            <span>Saring Pencarian</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h16" />
            </svg>
          </button>

          {/* Filters Sidebar */}
          <aside className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
            <div className="filters-head">
              <span className="filters-title">Filters</span>
              <button type="button" className="reset-btn" onClick={resetFilters}>Reset</button>
            </div>

            <div className="filter-field">
              <label className="filter-label">Lokasi</label>
              <div className="search-input-wrap">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Kota atau area..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="filter-field">
              <label className="filter-label">Tipe Properti</label>
              <select
                className="select-input"
                value={propertyType}
                onChange={(event) => setPropertyType(event.target.value)}
              >
                <option value="">Semua Tipe</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="cabin">Cabin</option>
              </select>
            </div>

            <div className="filter-field">
              <label className="filter-label">Kamar Tidur</label>
              <select
                className="select-input"
                value={minBeds ? String(minBeds) : ""}
                onChange={(event) => setMinBeds(event.target.value ? Number(event.target.value) : 0)}
              >
                <option value="">Bebas</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>

            <div className="filter-field">
              <label className="filter-label">Kamar Mandi</label>
              <select
                className="select-input"
                value={minBaths ? String(minBaths) : ""}
                onChange={(event) => setMinBaths(event.target.value ? Number(event.target.value) : 0)}
              >
                <option value="">Bebas</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
              </select>
            </div>

            <div className="filter-field">
              <label className="filter-label">Rentang Harga</label>
              <div className="price-inputs">
                <input
                  type="number"
                  className="price-input"
                  placeholder="Min (Rp)"
                  value={minPrice || ""}
                  onChange={(event) => setMinPrice(Number(event.target.value) || 0)}
                />
                <input
                  type="number"
                  className="price-input"
                  placeholder="Maks (Rp)"
                  value={maxPrice || ""}
                  onChange={(event) => setMaxPrice(Number(event.target.value) || 0)}
                />
              </div>
            </div>
          </aside>

          {/* Results Grid */}
          <div className="results-container">
            <div className="results-toolbar">
              <span className="results-count">
                {loading ? "Memuat properti..." : `${filtered.length} Properti ditemukan`}
              </span>
              <div className="toolbar-actions">
                <select
                  className="toolbar-select"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                >
                  <option value="featured">Terbaru</option>
                  <option value="priceAsc">Harga: Terendah</option>
                  <option value="priceDesc">Harga: Tertinggi</option>
                  <option value="bedsDesc">Kamar Tidur: Terbanyak</option>
                  <option value="ratingDesc">Rating: Tertinggi</option>
                </select>
              </div>
            </div>

            {loadError && (
              <div className="error-card">
                <div className="error-title">Katalog tidak dapat dimuat</div>
                <div className="error-body">{loadError}</div>
              </div>
            )}

            <div className="properties-grid">
              {visible.map((property) => {
                const image = normalizeImageUrl(property.gambar?.[0] || "");
                const blocked = property.status !== "available";
                return (
                  <Link
                    key={property.kode_rumah}
                    href={`/property?id=${encodeURIComponent(property.kode_rumah)}`}
                    className={`property-card-link ${blocked ? "blocked" : ""}`}
                  >
                    <div className="property-image-container">
                      <img className="property-image" src={image} alt={property.nama_rumah} />
                      <div className="property-type-tag">{property.tipe}</div>
                      {blocked && <div className="status-badge">{property.status}</div>}
                    </div>
                    <div className="property-info">
                      <h3 className="property-title font-serif">{property.nama_rumah}</h3>
                      <div className="property-location">
                        <svg className="location-pin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
                        </svg>
                        {property.alamat}, {property.kota}
                      </div>
                      
                      <div className="property-specs">
                        <span>{property.kamar_tidur} KT · {property.kamar_mandi} KM · {property.luas_bangunan} m²</span>
                        {property.rating && <span className="rating-tag">★ {Number(property.rating).toFixed(1)}</span>}
                      </div>

                      <div className="property-footer">
                        <div className="property-price">
                          {money(property.harga)}
                        </div>
                        <div className="arrow-btn">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="pagination">
                <button
                  type="button"
                  className="page-btn"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1}
                >
                  Prev
                </button>
                <div className="page-numbers">
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const value = index + 1;
                    return (
                      <button
                        key={value}
                        type="button"
                        className={`page-number ${value === page ? "active" : ""}`}
                        onClick={() => setPage(value)}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  className="page-btn"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </button>
              </nav>
            )}
          </div>

        </div>
      </div>

      <Footer />

      <style jsx>{`
        .listing-page-container {
          background: #f4efe4;
          color: #1f2a22;
          min-height: 100vh;
        }

        .header-banner {
          position: relative;
          background: #111111;
          color: #f7f0e4;
          padding: 8rem 1.25rem 5rem;
          overflow: hidden;
        }

        @media (min-width: 768px) {
          .header-banner {
            padding: 9rem 3rem 6rem;
          }
        }

        @media (min-width: 1024px) {
          .header-banner {
            padding: 10rem 4rem 7rem;
          }
        }

        .header-banner-content {
          position: relative;
          z-index: 10;
          max-width: 72rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        @media (min-width: 768px) {
          .header-banner-content {
            flex-direction: row;
            align-items: flex-end;
            justify-content: space-between;
          }
        }

        .banner-eyebrow {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: rgba(255, 255, 255, 0.6);
        }

        .banner-title {
          font-size: clamp(2.5rem, 5vw, 4.5rem);
          line-height: 1.1;
          letter-spacing: -0.04em;
          margin-bottom: 0;
          font-weight: 500;
        }

        .banner-lead {
          max-width: 24rem;
          font-size: 0.875rem;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.7);
        }

        .banner-bg-icon {
          position: absolute;
          top: 50%;
          right: 0;
          transform: translateY(-50%) translateX(25%);
          height: 24rem;
          opacity: 0.05;
          pointer-events: none;
        }

        .main-content {
          max-width: 72rem;
          margin: 0 auto;
          padding: 3rem 1.25rem;
        }

        @media (min-width: 768px) {
          .main-content {
            padding: 4rem 3rem;
          }
        }

        @media (min-width: 1024px) {
          .main-content {
            padding: 4rem;
          }
        }

        .layout-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
        }

        @media (min-width: 1024px) {
          .layout-grid {
            grid-template-columns: 0.28fr 0.72fr;
          }
        }

        .mobile-filter-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 0;
          border: none;
          border-bottom: 1px solid #111111;
          background: transparent;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          cursor: pointer;
        }

        @media (min-width: 1024px) {
          .mobile-filter-btn {
            display: none;
          }
        }

        .filters-sidebar {
          display: none;
        }

        .filters-sidebar.show {
          display: block;
        }

        @media (min-width: 1024px) {
          .filters-sidebar {
            display: block;
            position: sticky;
            top: 7rem;
            align-self: flex-start;
          }
        }

        .filters-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          border-bottom: 1px solid rgba(31, 42, 34, 0.1);
          padding-bottom: 1rem;
        }

        .filters-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
        }

        .reset-btn {
          background: transparent;
          border: none;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(31, 42, 34, 0.5);
          cursor: pointer;
        }

        .reset-btn:hover {
          color: #111111;
        }

        .filter-field {
          margin-bottom: 2rem;
        }

        .filter-label {
          display: block;
          font-size: 10px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          margin-bottom: 0.75rem;
          color: rgba(31, 42, 34, 0.6);
        }

        .search-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(31, 42, 34, 0.2);
          padding-bottom: 0.5rem;
          font-size: 14px;
          color: #1f2a22;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .search-input:focus {
          border-color: #111111;
        }

        .select-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(31, 42, 34, 0.2);
          padding-bottom: 0.5rem;
          font-size: 14px;
          color: #1f2a22;
          outline: none;
          cursor: pointer;
        }

        .price-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .price-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(31, 42, 34, 0.2);
          padding-bottom: 0.5rem;
          font-size: 13px;
          color: #1f2a22;
          outline: none;
        }

        /* Results area styling */
        .results-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          border-bottom: 1px solid rgba(31, 42, 34, 0.15);
          padding-bottom: 1rem;
          margin-bottom: 3rem;
        }

        .results-count {
          font-weight: 500;
        }

        .toolbar-select {
          background: transparent;
          border: none;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          cursor: pointer;
          outline: none;
          color: rgba(31, 42, 34, 0.8);
        }

        .properties-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 4rem 2rem;
        }

        @media (min-width: 640px) {
          .properties-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .property-card-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .property-card-link.blocked {
          opacity: 0.65;
        }

        .property-image-container {
          position: relative;
          aspect-ratio: 4 / 5;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.05);
          margin-bottom: 1.5rem;
        }

        .property-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .property-card-link:hover .property-image {
          transform: scale(1.04);
        }

        .property-type-tag {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          padding: 0.3rem 0.6rem;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #111111;
        }

        .status-badge {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.3);
          color: white;
          display: grid;
          place-items: center;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
        }

        .property-title {
          font-size: 1.5rem;
          line-height: 1.1;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .property-location {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 13px;
          color: rgba(31, 42, 34, 0.6);
          margin-bottom: 1rem;
        }

        .location-pin {
          opacity: 0.6;
        }

        .property-specs {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: rgba(31, 42, 34, 0.75);
          padding-bottom: 1rem;
        }

        .rating-tag {
          color: #264f36;
          font-weight: 600;
        }

        .property-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid rgba(31, 42, 34, 0.1);
          padding-top: 1rem;
        }

        .property-price {
          font-size: 1.125rem;
          font-weight: 600;
        }

        .arrow-btn {
          width: 2rem;
          height: 2rem;
          border-radius: 999px;
          border: 1px solid rgba(31, 42, 34, 0.2);
          display: grid;
          place-items: center;
          transition: all 0.2s ease;
        }

        .property-card-link:hover .arrow-btn {
          background: #111111;
          color: #ffffff;
          border-color: #111111;
        }

        /* Pagination styling */
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1.5rem;
          margin-top: 4rem;
          border-top: 1px solid rgba(31, 42, 34, 0.1);
          padding-top: 2rem;
        }

        .page-btn {
          background: transparent;
          border: 1px solid rgba(31, 42, 34, 0.2);
          padding: 0.5rem 1rem;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .page-btn:hover:not(:disabled) {
          border-color: #111111;
          background: #111111;
          color: #ffffff;
        }

        .page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .page-numbers {
          display: flex;
          gap: 0.5rem;
        }

        .page-number {
          background: transparent;
          border: none;
          width: 2rem;
          height: 2rem;
          display: grid;
          place-items: center;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .page-number.active {
          background: #111111;
          color: #ffffff;
        }

        .page-number:hover:not(.active) {
          background: rgba(31, 42, 34, 0.05);
        }

        .error-card {
          background: rgba(239, 68, 68, 0.05);
          border: 1px dashed rgba(239, 68, 68, 0.3);
          padding: 2rem;
          text-align: center;
          margin-bottom: 2rem;
        }

        .error-title {
          font-weight: 600;
          color: #dc2626;
          margin-bottom: 0.5rem;
        }

        .error-body {
          font-size: 13px;
          color: rgba(31, 42, 34, 0.6);
        }
      `}</style>
    </div>
  );
}
