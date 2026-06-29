"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="contact-page-container" suppressHydrationWarning>
      <Header />

      <main className="main-content">
        
        {/* Banner Section */}
        <div className="banner-section">
          <img 
            src="https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/6853ff8bb7215267b2f31695_Kaleo_Icon.svg" 
            alt="Kaleo Icon" 
            className="banner-icon"
          />
          <span className="banner-eyebrow">Hubungi Kami</span>
          <h1 className="banner-title font-serif">Mari mulai percakapan.</h1>
          <p className="banner-lead font-serif">
            Apakah Anda memiliki pertanyaan tentang properti kami, atau sekadar ingin berbagi visi tentang ruang tinggal idaman Anda? Tim kami siap mendengarkan.
          </p>
        </div>

        {/* Content Layout Grid */}
        <div className="content-grid">
          
          {/* Left Column: Contact Details */}
          <div className="info-column">
            <h2 className="info-title">
              <span className="title-line" /> Informasi Kontak
            </h2>

            <div className="info-blocks">
              <div className="info-block">
                <h3 className="block-title font-serif">Ruang & Studio</h3>
                <p className="block-body">
                  123 Jalan Damai, Suite 100<br />
                  Kemang, Jakarta Selatan<br />
                  Indonesia 12190
                </p>
                <a href="#" className="map-link">Lihat Peta</a>
              </div>

              <div className="info-block">
                <h3 className="block-title font-serif">Sapa Kami</h3>
                <p className="block-body phone">+62 812 3456 7890</p>
                <p className="block-body email">halo@planb.space</p>
              </div>

              <div className="info-block">
                <h3 className="block-title font-serif">Waktu Bertemu</h3>
                <p className="block-body">
                  Senin - Jumat: 09:00 - 18:00<br />
                  Sabtu: Dengan Janji Temu
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="form-column">
            <div className="form-card">
              <h2 className="form-title font-serif">Tinggalkan Pesan</h2>

              <form id="email-form" name="email-form" data-name="Email Form" method="get" className="form-element">
                <div className="form-row">
                  <div className="input-group">
                    <label className="input-label" htmlFor="Name">Nama Lengkap</label>
                    <input 
                      type="text" 
                      id="Name"
                      name="Name"
                      data-name="Name"
                      maxLength={256}
                      required
                      className="text-input" 
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label" htmlFor="Email">Email</label>
                    <input 
                      type="email" 
                      id="Email"
                      name="Email"
                      data-name="Email"
                      maxLength={256}
                      required
                      className="text-input" 
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="Phone">Nomor Telepon</label>
                  <input 
                    type="tel" 
                    id="Phone"
                    name="Phone"
                    data-name="Phone"
                    maxLength={256}
                    required
                    className="text-input" 
                  />
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="Message">Pesan Anda</label>
                  <textarea 
                    id="Message"
                    name="Message"
                    data-name="Message"
                    maxLength={5000}
                    required
                    rows={4}
                    className="textarea-input" 
                  />
                </div>

                <button 
                  type="submit" 
                  className="submit-btn"
                >
                  Kirim Pesan
                </button>
              </form>
            </div>
          </div>

        </div>

      </main>

      <Footer />

      <style jsx>{`
        .contact-page-container {
          background: #f4efe4;
          color: #1f2a22;
          min-height: 100vh;
        }

        .main-content {
          max-width: 72rem;
          margin: 0 auto;
          padding: 8rem 1.25rem 4rem;
        }

        @media (min-width: 768px) {
          .main-content {
            padding: 9rem 3rem 5rem;
          }
        }

        @media (min-width: 1024px) {
          .main-content {
            padding: 10rem 4rem 6rem;
          }
        }

        /* Banner styling */
        .banner-section {
          text-align: center;
          max-width: 48rem;
          margin: 0 auto 5rem;
        }

        .banner-icon {
          width: 3rem;
          height: 3rem;
          margin: 0 auto 2rem;
          opacity: 0.8;
        }

        .banner-eyebrow {
          display: block;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: rgba(31, 42, 34, 0.6);
          margin-bottom: 1.5rem;
        }

        .banner-title {
          font-size: clamp(2.5rem, 5vw, 4.5rem);
          line-height: 1.1;
          letter-spacing: -0.04em;
          margin-bottom: 2rem;
          font-weight: 500;
        }

        .banner-lead {
          font-size: clamp(1.125rem, 2vw, 1.25rem);
          line-height: 1.7;
          color: rgba(31, 42, 34, 0.7);
        }

        /* Grid styling */
        .content-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 4rem;
        }

        @media (min-width: 1024px) {
          .content-grid {
            grid-template-columns: 0.85fr 1.15fr;
            gap: 5rem;
          }
        }

        /* Left column styling */
        .info-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          display: flex;
          align-items: center;
          margin-bottom: 3rem;
        }

        .title-line {
          width: 2rem;
          height: 1px;
          background: #111111;
          margin-right: 0.75rem;
        }

        .info-blocks {
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        .block-title {
          font-size: 1.25rem;
          font-weight: 500;
          margin-bottom: 1rem;
        }

        .block-body {
          font-size: 0.875rem;
          line-height: 1.75;
          color: rgba(31, 42, 34, 0.7);
          margin-bottom: 1rem;
        }

        .block-body.phone,
        .block-body.email {
          margin-bottom: 0.5rem;
        }

        .map-link {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          font-weight: 700;
          border-bottom: 1px solid #111111;
          padding-bottom: 0.25rem;
          text-decoration: none;
          display: inline-block;
          transition: opacity 0.2s ease;
        }

        .map-link:hover {
          opacity: 0.6;
        }

        /* Right column: Card & Form */
        .form-card {
          background: #111111;
          color: #f7f0e4;
          padding: 2.5rem;
        }

        @media (min-width: 768px) {
          .form-card {
            padding: 4rem;
          }
        }

        .form-title {
          font-size: 1.875rem;
          font-weight: 500;
          margin-bottom: 2.5rem;
        }

        .form-element {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        @media (min-width: 768px) {
          .form-row {
            grid-template-columns: 1fr 1fr;
          }
        }

        .input-group {
          display: flex;
          flex-direction: column;
        }

        .input-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 0.75rem;
        }

        .text-input,
        .textarea-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding-bottom: 0.5rem;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .text-input:focus,
        .textarea-input:focus {
          border-color: white;
        }

        .textarea-input {
          resize: none;
        }

        .submit-btn {
          background: #f7f0e4;
          color: #111111;
          border: none;
          padding: 1.1rem;
          font-size: 11px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          cursor: pointer;
          transition: background-color 0.2s ease;
          margin-top: 1.5rem;
        }

        .submit-btn:hover {
          background: white;
        }
      `}</style>
    </div>
  );
}
