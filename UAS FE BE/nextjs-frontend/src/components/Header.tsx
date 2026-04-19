"use client";
import Link from "next/link";
import React from "react";

export default function Header() {
  return (
    <div suppressHydrationWarning data-wf--navbar--variant="base" data-animation="default" data-collapse="medium" data-duration="400" data-easing="ease" data-easing2="ease" role="banner" className="nav_component w-nav">
      <div className="padding-global">
        <div className="container-large">
          <div className="nav-wrap">
            <Link href="/" className="nav_brand w-inline-block">
              <div className="logo">B</div>
            </Link>
            <nav role="navigation" className="nav-menu w-nav-menu">
              <div className="nav-menu_wrap">
                <div className="nav-left">
                  <div className="nav_divider"></div>
                  <Link href="/#ranch" className="nav_link w-inline-block">
                    <div className="nav-button_text">
                      <div className="text-size-regular text-weight-medium">Hidup Damai</div>
                    </div>
                    <div className="nav-button_text is-absolute">
                      <div className="text-size-regular text-weight-medium">Hidup Damai</div>
                    </div>
                  </Link>
                  <Link href="/#about" className="nav_link w-inline-block">
                    <div className="nav-button_text">
                      <div className="text-size-regular text-weight-medium">Tentang</div>
                    </div>
                    <div className="nav-button_text is-absolute">
                      <div className="text-size-regular text-weight-medium">Tentang</div>
                    </div>
                  </Link>
                  <Link href="/#events" className="nav_link w-inline-block">
                    <div className="nav-button_text">
                      <div className="text-size-regular text-weight-medium">Ritme Hidup</div>
                    </div>
                    <div className="nav-button_text is-absolute">
                      <div className="text-size-regular text-weight-medium">Ritme Hidup</div>
                    </div>
                  </Link>
                  <Link href="/#features" className="nav_link w-inline-block">
                    <div className="nav-button_text">
                      <div className="text-size-regular text-weight-medium">Fitur</div>
                    </div>
                    <div className="nav-button_text is-absolute">
                      <div className="text-size-regular text-weight-medium">Fitur</div>
                    </div>
                  </Link>
                  <Link href="/contact" className="nav_link w-inline-block">
                    <div className="nav-button_text">
                      <div className="text-size-regular text-weight-medium">Kunjungan</div>
                    </div>
                    <div className="nav-button_text is-absolute">
                      <div className="text-size-regular text-weight-medium">Kunjungan</div>
                    </div>
                  </Link>
                </div>
                <Link href="/listing" className="button is-nav w-inline-block">
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
            <div className="nav_button w-nav-button">
              <div className="icon w-icon-nav-menu"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
