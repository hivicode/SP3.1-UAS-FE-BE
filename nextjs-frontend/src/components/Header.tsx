"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div
      suppressHydrationWarning
      data-wf--navbar--variant="base"
      data-animation="default"
      data-collapse="medium"
      data-duration="400"
      data-easing="ease"
      data-easing2="ease"
      role="banner"
      className="nav_component w-nav"
    >
      <div className="padding-global">
        <div className="container-large">
          <div className="nav-wrap">
            <Link href="/" className="nav_brand w-inline-block" onClick={closeMenu}>
              <div className="logo">B</div>
            </Link>
            <nav
              role="navigation"
              className="nav-menu w-nav-menu"
              data-nav-menu-open={isMenuOpen ? "true" : undefined}
            >
              <div className="nav-menu_wrap">
                <div className="nav-left">
                  <div className="nav_divider"></div>
                  <Link href="/#ranch" className="nav_link w-inline-block" onClick={closeMenu}>
                    <div className="nav-button_text">
                      <div className="text-size-regular text-weight-medium">Hidup Damai</div>
                    </div>
                    <div className="nav-button_text is-absolute">
                      <div className="text-size-regular text-weight-medium">Hidup Damai</div>
                    </div>
                  </Link>
                  <Link href="/#about" className="nav_link w-inline-block" onClick={closeMenu}>
                    <div className="nav-button_text">
                      <div className="text-size-regular text-weight-medium">Tentang</div>
                    </div>
                    <div className="nav-button_text is-absolute">
                      <div className="text-size-regular text-weight-medium">Tentang</div>
                    </div>
                  </Link>
                  <Link href="/#events" className="nav_link w-inline-block" onClick={closeMenu}>
                    <div className="nav-button_text">
                      <div className="text-size-regular text-weight-medium">Ritme Hidup</div>
                    </div>
                    <div className="nav-button_text is-absolute">
                      <div className="text-size-regular text-weight-medium">Ritme Hidup</div>
                    </div>
                  </Link>
                  <Link href="/#features" className="nav_link w-inline-block" onClick={closeMenu}>
                    <div className="nav-button_text">
                      <div className="text-size-regular text-weight-medium">Fitur</div>
                    </div>
                    <div className="nav-button_text is-absolute">
                      <div className="text-size-regular text-weight-medium">Fitur</div>
                    </div>
                  </Link>
                  <Link href="/contact" className="nav_link w-inline-block" onClick={closeMenu}>
                    <div className="nav-button_text">
                      <div className="text-size-regular text-weight-medium">Kunjungan</div>
                    </div>
                    <div className="nav-button_text is-absolute">
                      <div className="text-size-regular text-weight-medium">Kunjungan</div>
                    </div>
                  </Link>
                </div>
                <Link href="/listing" className="button is-nav w-inline-block" onClick={closeMenu}>
                  <div className="button-text">
                    <div className="button_text">Lihat Listing</div>
                    <div className="button-text-animation">
                      <div className="button_text">Lihat Listing</div>
                    </div>
                  </div>
                  <img src="https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/6853ff8bb7215267b2f31695_Kaleo_Icon.svg" loading="lazy" alt="Kaleo Icon" className="button-image is-nav"/>
                </Link>
              </div>
            </nav>
            <button
              type="button"
              className={`nav_button w-nav-button${isMenuOpen ? " w--open" : ""}`}
              aria-label={isMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <div className="icon w-icon-nav-menu"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
