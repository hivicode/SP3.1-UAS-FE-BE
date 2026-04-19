"use client";
import HeaderMinimal from "../../components/HeaderMinimal";
import Footer from "../../components/Footer";
import Link from "next/link";
import "../css/contact.css";
import "../css/rent.css";

export default function ContactPage() {
  return (
    <div className="page-wrapper" id="page-wrapper-id" data-page="contact">
      <main className="main-wrapper">
        <HeaderMinimal />
        
        <section className="padding-section-large">
          <div className="padding-global">
            <div className="container-large">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem" }}>
                <nav aria-label="Breadcrumb" className="rent-breadcrumb" style={{ marginBottom: 0 }}>
                  <Link href="/" className="rent-breadcrumb-link">Home</Link>
                  <span className="rent-breadcrumb-separator">/</span>
                  <span className="rent-breadcrumb-current">Contact</span>
                </nav>
                <Link href="/listing" className="button w-inline-block" style={{ flexShrink: 0 }}>
                  <div className="button-text">
                    <div className="button_text">Lihat Listing</div>
                    <div className="button-text-animation">
                      <div className="button_text">Lihat Listing</div>
                    </div>
                  </div>
                  <img src="https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/6853ff8bb7215267b2f31695_Kaleo_Icon.svg" loading="lazy" alt="Kaleo Icon" className="button-image" />
                </Link>
              </div>
              <div className="contact-component">
                <div className="contact_header">
                  <img src="https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/6853ff8bb7215267b2f31695_Kaleo_Icon.svg" loading="lazy" alt="Kaleo Icon" className="hero-icon" />
                  <h1 className="heading-style-h1 is-contact">Jadwal Kunjungan</h1>
                  <p className="text-size-large text-align-center max-width-large">Hubungi kami untuk mengatur jadwal kunjungan ke PlanB. Kami siap membantu Anda menemukan hunian impian.</p>
                </div>
                
                <div className="contact_form">
                  <div className="w-form">
                    <form id="email-form" name="email-form" data-name="Email Form" method="get" className="form">
                      <div className="form-field_wrap">
                        <input className="form-field w-input" maxLength={256} name="Name" data-name="Name" placeholder="Nama Lengkap" type="text" id="Name" required />
                        <input className="form-field w-input" maxLength={256} name="Email" data-name="Email" placeholder="Email" type="email" id="Email" required />
                      </div>
                      <input className="form-field w-input" maxLength={256} name="Phone" data-name="Phone" placeholder="Nomor Telepon" type="tel" id="Phone" required />
                      <textarea id="Message" name="Message" maxLength={5000} data-name="Message" placeholder="Pesan Anda" required className="text-field w-input"></textarea>
                      <div className="button-form">
                        <input type="submit" data-wait="Mengirim..." className="submit-button w-button" value="" />
                        <div className="button w-inline-block">
                          <div className="button-text">
                            <div className="button_text">Kirim Pesan</div>
                            <div className="button-text-animation">
                            <div className="button_text">Kirim Pesan</div>
                            </div>
                          </div>
                          <img src="https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/6853ff8bb7215267b2f31695_Kaleo_Icon.svg" loading="lazy" alt="Kaleo Icon" className="button-image" />
                        </div>
                      </div>
                    </form>
                    <div className="success-message w-form-done">
                      <div>Terima kasih! Pesan Anda telah diterima.</div>
                    </div>
                    <div className="error-message w-form-fail">
                      <div>Oops! Terjadi kesalahan saat mengirim formulir.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <Footer />
      </main>
    </div>
  );
}
