"use client";
import Link from "next/link";
import React from "react";

export default function Footer() {
  return (
    <footer className="footer" suppressHydrationWarning>
      <div className="padding-global">
        <div className="footer-wrap">
          <div className="container-large">
            <div className="footer_component">
              <div className="footer_left">
                <h3 className="heading-style-h3 is-small">
                  Kami menyambut mereka yang sejalan.
                  Entah Anda mencari ketenangan, ruang untuk bernapas, atau sekadar ritme hidup yang baru — PlanB terbuka untuk Anda.
                </h3>
                <Link href="/contact" className="button w-inline-block">
                  <div className="button-text">
                    <div className="button_text">Jadwalkan Kunjungan</div>
                    <div className="button-text-animation">
                      <div className="button_text">Jadwalkan Kunjungan</div>
                    </div>
                  </div>
                  <img src="https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/6853ff8bb7215267b2f31695_Kaleo_Icon.svg" loading="lazy" alt="Kaleo Icon" className="button-image" />
                </Link>
                <div className="credits">
                  <div className="copyright">
                    <div className="text-size-regular">Copyright</div>
                    <div className="text-size-regular">©</div>
                  </div>
                  <div className="created">
                    <div className="text-size-regular">Redesigned by</div>
                    <a href="https://github.com/hivicode" className="credits-link w-inline-block">
                      <div className="text-size-regular">Hivicode</div>
                    </a>
                  </div>
                  <div className="created">
                    <div className="text-size-regular">Developed by</div>
                    <a href="https://webflow.com/templates/designers/lucas-gusso" className="credits-link w-inline-block">
                      <div className="text-size-regular">Lucas Gusso</div>
                    </a>
                  </div>
                  <div className="powered">
                    <div className="text-size-regular">Powered by</div>
                    <a href="https://webflow.com/" target="_blank" rel="noreferrer" className="credits-link w-inline-block">
                      <div className="text-size-regular">Webflow</div>
                    </a>
                  </div>
                </div>
              </div>
              <div className="footer_right">
                <div className="footer_right-wrap">
                  <div className="text-style-allcaps text-size-small">ALAMAT</div>
                  <div className="text-size-large">Cahaya — 722 Kelinci Blok E5 <br />Air Asri, TX 78624 <br />Indonesia </div>
                </div>
                <div className="footer_right-wrap">
                  <div className="text-style-allcaps text-size-small">TELEPON</div>
                  <a href="tel:+1(512)555-0198" className="phone-link w-inline-block">
                    <div className="text-size-large">+62 812 3456 7890</div>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="footer-bottom font-zodiak">
            <div className="footer-text">PLANB</div>
            <img src="https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/685405fce8267d81b0374af7_Kaleo_Icon-black.svg" loading="lazy" alt="Kaleo Icon" className="footer-image" />
          </div>
        </div>
      </div>
    </footer>
  );
}
