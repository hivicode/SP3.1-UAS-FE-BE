"use client";
import HeaderMinimal from "../../components/HeaderMinimal";
import Footer from "../../components/Footer";
import Link from "next/link";
import "../css/listing.css";
import "../css/rent.css";
import { useEffect, useMemo, useState } from "react";
import { apiFetch, normalizeImageUrl, PropertyApi } from "@/lib/api";
import { money, renderStars } from "@/lib/format";

export default function ListingPage() {
  const [properties, setProperties] = useState<PropertyApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [propertyType, setPropertyType] = useState("");
  const [minBeds, setMinBeds] = useState(0);
  const [minBaths, setMinBaths] = useState(0);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5_000_000_000);
  const [features, setFeatures] = useState({
    parking: false,
    pool: false,
    garden: false,
    gym: false,
  });
  const [pageSize, setPageSize] = useState(9);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const saved = window.localStorage.getItem("planb_view");
    if (saved === "grid" || saved === "list") {
      setViewMode(saved);
    }

    const loadProperties = async () => {
      try {
        const data = await apiFetch<PropertyApi[]>("/api/properti");
        setProperties(Array.isArray(data) ? data : []);
      } catch {
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  useEffect(() => {
    window.localStorage.setItem("planb_view", viewMode);
  }, [viewMode]);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const base = properties.filter((item) => {
      const searchTarget = `${item.nama_rumah} ${item.alamat} ${item.kota}`.toLowerCase();
      if (normalizedSearch && !searchTarget.includes(normalizedSearch)) return false;
      if (propertyType && item.tipe !== propertyType) return false;
      if (minBeds && Number(item.kamar_tidur) < minBeds) return false;
      if (minBaths && Number(item.kamar_mandi) < minBaths) return false;

      const price = Number(item.harga) || 0;
      if (price < minPrice || price > maxPrice) return false;

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
    setMaxPrice(5_000_000_000);
    setFeatures({
      parking: false,
      pool: false,
      garden: false,
      gym: false,
    });
  };

  return (
    <div className="page-wrapper" id="page-wrapper-id" data-page="listing">
      <main className="main-wrapper">
        <HeaderMinimal />

        <section className="padding-section-large">
          <div className="padding-global">
            <div className="container-large">
              <nav aria-label="Breadcrumb" className="rent-breadcrumb">
                <Link href="/" className="rent-breadcrumb-link">Home</Link>
                <span className="rent-breadcrumb-separator">/</span>
                <span className="rent-breadcrumb-current">Listing</span>
              </nav>

              <div className="contact-component rent-page">
                <div className="contact_header">
                  <img src="https://wubflow-shield.nocodexport.dev/685077c466f113761c6d796b/6853ff8bb7215267b2f31695_Kaleo_Icon.svg" loading="lazy" alt="Kaleo Icon" className="hero-icon"/>
                  <h1 className="heading-style-h1 is-contact">Listing Properti</h1>
                  <p className="text-size-large text-align-center max-width-large">Temukan hunian PlanB yang paling cocok untuk ritme hidupmu.</p>
                </div>

                <div className="rent-toolbar">
                  <div className="rent-search">
                    <input
                      id="searchInput"
                      className="form-field w-input"
                      type="search"
                      placeholder="Cari nama properti atau lokasi..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </div>

                  <div className="rent-toolbar-right">
                    <select
                      id="sortSelect"
                      className="form-field w-input rent-select"
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value)}
                    >
                      <option value="featured">Sort by: Featured</option>
                      <option value="priceAsc">Harga: Terendah</option>
                      <option value="priceDesc">Harga: Tertinggi</option>
                      <option value="bedsDesc">Bedrooms: Terbanyak</option>
                      <option value="ratingDesc">Rating: Tertinggi</option>
                    </select>

                    <div className="rent-view-toggle" role="group" aria-label="View toggle">
                      <button
                        id="gridBtn"
                        type="button"
                        className={`rent-toggle-btn${viewMode === "grid" ? " is-active" : ""}`}
                        aria-label="Grid view"
                        onClick={() => setViewMode("grid")}
                      >
                        <span className="material-symbols-outlined" aria-hidden="true">grid_view</span>
                        <span className="sr-only">Grid</span>
                      </button>
                      <button
                        id="listBtn"
                        type="button"
                        className={`rent-toggle-btn${viewMode === "list" ? " is-active" : ""}`}
                        aria-label="List view"
                        onClick={() => setViewMode("list")}
                      >
                        <span className="material-symbols-outlined" aria-hidden="true">view_list</span>
                        <span className="sr-only">List</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rent-layout">
                  <aside className="rent-filters" aria-label="Filters">
                    <div className="rent-filters-head">
                      <div className="text-style-allcaps text-size-small">Filters</div>
                      <button id="resetFiltersBtn" type="button" className="rent-link-btn" onClick={resetFilters}>Reset</button>
                    </div>

                    <div className="rent-field">
                      <label className="text-size-small text-style-allcaps">Property Type</label>
                      <select
                        id="typeSelect"
                        className="form-field w-input"
                        value={propertyType}
                        onChange={(event) => setPropertyType(event.target.value)}
                      >
                        <option value="">All Types</option>
                        <option value="house">House</option>
                        <option value="villa">Villa</option>
                        <option value="cabin">Cabin</option>
                      </select>
                    </div>

                    <div className="rent-field">
                      <label className="text-size-small text-style-allcaps">Bedrooms</label>
                      <select
                        id="bedroomsSelect"
                        className="form-field w-input"
                        value={minBeds ? String(minBeds) : ""}
                        onChange={(event) => setMinBeds(event.target.value ? Number(event.target.value) : 0)}
                      >
                        <option value="">Any</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                        <option value="4">4+</option>
                        <option value="5">5+</option>
                      </select>
                    </div>

                    <div className="rent-field">
                      <label className="text-size-small text-style-allcaps">Bathrooms</label>
                      <select
                        id="bathroomsSelect"
                        className="form-field w-input"
                        value={minBaths ? String(minBaths) : ""}
                        onChange={(event) => setMinBaths(event.target.value ? Number(event.target.value) : 0)}
                      >
                        <option value="">Any</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                      </select>
                    </div>

                    <div className="rent-field">
                      <div className="rent-range-head">
                        <label className="text-size-small text-style-allcaps">Price Range</label>
                        <div id="priceLabel" className="text-size-small text-style-muted">{`${money(minPrice)} - ${money(maxPrice)}`}</div>
                      </div>

                      <div className="rent-range">
                        <input
                          id="minPrice"
                          className="form-field w-input"
                          inputMode="numeric"
                          placeholder="Min (Rp)"
                          value={minPrice}
                          onChange={(event) => setMinPrice(Number(event.target.value) || 0)}
                        />
                        <input
                          id="maxPrice"
                          className="form-field w-input"
                          inputMode="numeric"
                          placeholder="Max (Rp)"
                          value={maxPrice}
                          onChange={(event) => setMaxPrice(Number(event.target.value) || 0)}
                        />
                      </div>

                      <div className="rent-range-sliders">
                        <input
                          id="minPriceRange"
                          type="range"
                          min="0"
                          max="5000000000"
                          step="50000000"
                          value={minPrice}
                          onChange={(event) => setMinPrice(Number(event.target.value))}
                        />
                        <input
                          id="maxPriceRange"
                          type="range"
                          min="0"
                          max="5000000000"
                          step="50000000"
                          value={maxPrice}
                          onChange={(event) => setMaxPrice(Number(event.target.value))}
                        />
                      </div>
                    </div>

                    <div className="rent-field">
                      <label className="text-size-small text-style-allcaps">Features</label>

                      <label className="rent-check">
                        <input
                          id="featureParking"
                          type="checkbox"
                          checked={features.parking}
                          onChange={(event) =>
                            setFeatures((prev) => ({ ...prev, parking: event.target.checked }))
                          }
                        />
                        <span>Parking</span>
                      </label>

                      <label className="rent-check">
                        <input
                          id="featurePool"
                          type="checkbox"
                          checked={features.pool}
                          onChange={(event) =>
                            setFeatures((prev) => ({ ...prev, pool: event.target.checked }))
                          }
                        />
                        <span>Swimming Pool</span>
                      </label>

                      <label className="rent-check">
                        <input
                          id="featureGarden"
                          type="checkbox"
                          checked={features.garden}
                          onChange={(event) =>
                            setFeatures((prev) => ({ ...prev, garden: event.target.checked }))
                          }
                        />
                        <span>Garden</span>
                      </label>

                      <label className="rent-check">
                        <input
                          id="featureGym"
                          type="checkbox"
                          checked={features.gym}
                          onChange={(event) =>
                            setFeatures((prev) => ({ ...prev, gym: event.target.checked }))
                          }
                        />
                        <span>Gym</span>
                      </label>
                    </div>

                    <button id="applyFiltersBtn" type="button" className="button w-inline-block rent-apply-btn">
                      <div className="button-text">
                        <div className="button_text">Terapkan</div>
                        <div className="button-text-animation">
                          <div className="button_text">Terapkan</div>
                        </div>
                      </div>
                      <img src="https://wubflow-shield.nocodexport.dev/685077c466f113761c6d796b/6853ff8bb7215267b2f31695_Kaleo_Icon.svg" loading="lazy" alt="Kaleo Icon" className="button-image"/>
                    </button>
                  </aside>

                  <section className="rent-results" aria-label="Results">
                    <div className="rent-results-head">
                      <div>
                        <div className="heading-style-h2 rent-subtitle">Available Properties</div>
                        <div id="foundLabel" className="text-size-small text-style-muted">
                          {loading ? "Loading properties..." : `${filtered.length} properties found`}
                        </div>
                      </div>

                      <select
                        id="pageSizeSelect"
                        className="form-field w-input rent-select rent-page-size"
                        value={String(pageSize)}
                        onChange={(event) => setPageSize(Number(event.target.value))}
                      >
                        <option value="6">6 / page</option>
                        <option value="9">9 / page</option>
                        <option value="12">12 / page</option>
                      </select>
                    </div>

                    <div id="cards" className={`rent-cards ${viewMode === "grid" ? "is-grid" : "is-list"}`}>
                      {visible.map((property) => {
                        const image = normalizeImageUrl(property.gambar?.[0] || "");
                        const blocked = property.status !== "available";
                        return (
                          <Link
                            key={property.kode_rumah}
                            href={`/property?id=${encodeURIComponent(property.kode_rumah)}`}
                            className={`rent-card-link${viewMode === "list" ? " rent-list-row" : ""}${blocked ? " is-blocked" : ""}`}
                          >
                            <div className={`rent-card-img-wrap${blocked ? " is-blocked" : ""}`}>
                              <img className="rent-card-img" src={image} alt={property.nama_rumah} />
                              {blocked && <div className="rent-status-badge">{property.status}</div>}
                            </div>
                            <div className="rent-card-body">
                              <div className="rent-card-title">{property.nama_rumah}</div>
                              <div className="text-size-small text-style-muted">
                                {property.alamat}, {property.kota}
                              </div>
                              <div className="rent-card-meta">
                                <span>{renderStars(property.rating)} {Number(property.rating || 0).toFixed(1)}</span>
                                <span>
                                  {property.kamar_tidur} bedrooms · {property.kamar_mandi} bathrooms · {property.luas_bangunan} m² · {property.garasi} garages
                                </span>
                              </div>
                              <div className="rent-card-price">
                                <div className="rent-price">{money(property.harga)}</div>
                                <div className="rent-link-btn">View</div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>

                    <nav className="rent-pagination" aria-label="Pagination">
                      <button
                        id="prevPageBtn"
                        type="button"
                        className="rent-page-btn"
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        disabled={page <= 1}
                      >
                        Prev
                      </button>
                      <div id="pageNumbers" className="rent-page-numbers">
                        {Array.from({ length: totalPages }).map((_, index) => {
                          const value = index + 1;
                          return (
                            <button
                              key={value}
                              type="button"
                              className={`rent-page-number${value === page ? " is-active" : ""}`}
                              onClick={() => setPage(value)}
                            >
                              {value}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        id="nextPageBtn"
                        type="button"
                        className="rent-page-btn"
                        onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={page >= totalPages}
                      >
                        Next
                      </button>
                    </nav>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>

      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"/>
    </div>
  );
}
