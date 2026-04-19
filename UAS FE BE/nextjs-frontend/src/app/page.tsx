"use client";
import "./css/index.css";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Home() {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!isClient) {
    return null;
  }

  return (
    <div className="page-wrapper" suppressHydrationWarning>
      <main className="main-wrapper">
        <Header />
        
        {/* HERO SECTION */}
        <div className="section_hero">
          <div className="padding-global">
            <div className="container-large">
              <div className="hero-component">
                <div className="hero_content">
                  <div className="hero_content-top">
                    <img src="https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/6853ff8bb7215267b2f31695_Kaleo_Icon.svg" loading="eager" alt="Kaleo Icon" className="hero-icon" />
                    <h1 className="heading-style-h1">PlanB</h1>
                  </div>
                  <div className="hero-subtitle">
                    <p className="hero-subtitle-text">PlanB adalah kawasan hunian modern yang dirancang untuk hidup tenang dan seimbang. Dengan lingkungan asri dan ruang yang tertata nyaman, Plan B menghadirkan tempat untuk melambat, terhubung, dan menikmati alam sebagai bagian dari keseharian.</p>
                  </div>
                </div>
                <Link href="#ranch" className="hero_bottom w-inline-block">
                  <div className="text-size-regular">Jelajahi</div>
                </Link>
              </div>
            </div>
          </div>
          <div className="hero-background">
            <div data-poster-url="https://raw.githubusercontent.com/hivicode/hivicode.github.io/main/febe/Screenshot%202026-01-13%20231959.png" data-video-urls="https://raw.githubusercontent.com/hivicode/hivicode.github.io/main/febe/snapsave-app_6334_hd.webm" data-autoplay="true" data-loop="true" data-wf-ignore="true" className="background-video w-background-video w-background-video-atom">
              <video id="ff380576-39b0-e818-5439-5cba18ff91c4-video" autoPlay loop poster="https://raw.githubusercontent.com/hivicode/hivicode.github.io/main/febe/Screenshot%202026-01-13%20231959.png" style={{backgroundImage: "url(https://raw.githubusercontent.com/hivicode/hivicode.github.io/main/febe/Screenshot%202026-01-13%20231959.png)"}} muted playsInline data-wf-ignore="true" data-object-fit="cover">
                <source src="https://raw.githubusercontent.com/hivicode/hivicode.github.io/main/febe/snapsave-app_6334_hd.webm" data-wf-ignore="true" />
              </video>
              <div className="video-overlay light"></div>
            </div>
            <div className="video-placeholder">
              <img src="https://raw.githubusercontent.com/hivicode/hivicode.github.io/main/febe/Screenshot%202026-01-13%20231959.png" loading="eager" sizes="90vw" alt="Hero Placeholder" className="image is-radius" />
            </div>
          </div>
        </div>

        {/* ABOUT SECTION */}
        <section id="ranch" className="section_about">
          <div className="padding-global">
            <div className="container-large">
              <div className="track">
                <div className="sticky">
                  <div className="frame">
                    <div className="sticky_element">
                      <div className="page-headings text-align-center">
                        <div className="text-style-allcaps">Hidup yang Tumbuh di Sini</div>
                        <h2 className="heading-style-h2">PlanB bukan sekadar tempat tinggal<span className="text-span-image"></span>ia adalah ritme hidup. Ruang terbuka yang tenang. Jalur hijau yang mengalir alami. Cahaya pagi menyusup di antara rumah. Senja turun perlahan, menghadirkan rasa pulang.</h2>
                      </div>
                      <div className="photos-wrap">
                        <div className="photo-wrap_first">
                          <img src="https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/685451385988633b2abbdd85_photo1.jpg" loading="eager" sizes="100vw" srcSet="https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/685451385988633b2abbdd85_photo1-p-500.jpg 500w, https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/685451385988633b2abbdd85_photo1-p-800.jpg 800w, https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/685451385988633b2abbdd85_photo1-p-1080.jpg 1080w, https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/685451385988633b2abbdd85_photo1-p-1600.jpg 1600w, https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/685451385988633b2abbdd85_photo1.jpg 1602w" alt="Ranch Photo" className="photo" />
                        </div>
                        <div className="photo-wrap_second">
                          <img src="https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/68545138286f04f1973ee597_photo2.jpg" loading="eager" sizes="100vw" srcSet="https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/68545138286f04f1973ee597_photo2-p-500.jpg 500w, https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/68545138286f04f1973ee597_photo2-p-800.jpg 800w, https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/68545138286f04f1973ee597_photo2-p-1080.jpg 1080w, https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/68545138286f04f1973ee597_photo2.jpg 1602w" alt="Ranch Photo" className="photo" />
                        </div>
                        <div className="photo-wrap_third">
                          <img src="https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/68545138cbdd621a144328f0_photo3.jpg" loading="eager" sizes="100vw" srcSet="https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/68545138cbdd621a144328f0_photo3-p-500.jpg 500w, https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/68545138cbdd621a144328f0_photo3-p-800.jpg 800w, https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/68545138cbdd621a144328f0_photo3-p-1080.jpg 1080w, https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/68545138cbdd621a144328f0_photo3.jpg 1602w" alt="Ranch Photo" className="photo" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section id="about" className="section_cta">
          <div className="track-cta">
            <div className="sticky-cta">
              <div className="cta-video_background">
                <div className="cta_content">
                  <h3 className="text-style-allcaps font-zodiak text-weight-normal text-size-xhuge">DAMAI</h3>
                  <div className="button-wrap" style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                    <Link href="/contact" className="button w-inline-block">
                      <div className="button-text">
                        <div className="button_text">Jadwalkan Kunjungan</div>
                        <div className="button-text-animation">
                          <div className="button_text">Jadwalkan Kunjungan</div>
                        </div>
                      </div>
                      <img src="https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/6853ff8bb7215267b2f31695_Kaleo_Icon.svg" loading="eager" alt="Kaleo Icon" className="button-image" />
                    </Link>
                    <Link href="/listing" className="button w-inline-block">
                      <div className="button-text">
                        <div className="button_text">Lihat Listing</div>
                        <div className="button-text-animation">
                          <div className="button_text">Lihat Listing</div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
                <div data-poster-url="https://raw.githubusercontent.com/hivicode/hivicode.github.io/main/febe/Screenshot%202026-01-13%20232221.png" data-video-urls="https://raw.githubusercontent.com/hivicode/hivicode.github.io/main/febe/snapsave-app_916875_hd.webm" data-autoplay="true" data-loop="true" data-wf-ignore="true" className="background-video absolute w-background-video w-background-video-atom">
                  <video id="b6ebaab0-fce4-4585-ecb3-6c8057d84a3b-video" autoPlay loop poster="https://raw.githubusercontent.com/hivicode/hivicode.github.io/main/febe/Screenshot%202026-01-13%20232221.png" style={{ backgroundImage: "url(https://raw.githubusercontent.com/hivicode/hivicode.github.io/main/febe/Screenshot%202026-01-13%20232221.png)" }} muted playsInline data-wf-ignore="true" data-object-fit="cover">
                    <source src="https://raw.githubusercontent.com/hivicode/hivicode.github.io/main/febe/snapsave-app_916875_hd.webm" data-wf-ignore="true" />
                  </video>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LOCATION SECTION */}
        <section id="events" className="section_location">
          <div className="padding-global">
            <div className="container-medium">
              <div className="location-wrap">
                <div className="page-headings text-align-center is-location">
                  <div className="text-style-allcaps">Ruang, Jiwa, dan Pilihan</div>
                  <div className="max-width-medium">
                    <h2 className="heading-style-h2">PlanB berangkat dari hasrat untuk kembali pada ruang, pada makna, pada hidup yang tidak perlu dipercepat.</h2>
                  </div>
                </div>
                <div className="w-layout-grid location_grid">
                  <div id="w-node-f203eb11-a149-7bce-6643-6c0a832275f0-1c6d796d" className="location_card is-left">
                    <img src="https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/68540427bc46875dd34cd085_Kaleo_Icon-dark.svg" loading="eager" alt="Kaleo Icon" className="location_icon" />
                    <div className="heading-style-h2 text-style-allcaps font-zodiak">Pagi yang lapang, hidup yang hadir —</div>
                    <div>PlanB lahir untuk mereka yang memilih hidup dengan tenang bernapas lebih dalam, melambat, dan merasa utuh di rumah sendiri.</div>
                  </div>
                  <div className="location_card is-right">
                    <img src="https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/68540427bc46875dd34cd085_Kaleo_Icon-dark.svg" loading="eager" alt="Kaleo Icon" className="location_icon" />
                    <div className="heading-style-h2 text-style-allcaps font-zodiak">Ritme yang selaras dengan hidup —</div>
                    <div>Di PlanB, kehidupan mengalir selaras dengan ruang. Langkah terasa lebih sadar, hening memberi arti, dan keseharian mengingatkan kita untuk hadir sepenuhnya. Di sinilah gerak bertemu makna, dan hidup dijalani dengan intensi.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="section_features">
          <div className="padding-global">
            <div className="container-large">
              <div className="features-component">
                <div className="page-headings text-align-center is-location">
                  <div className="text-style-allcaps">Yang Tetap Bermakna</div>
                  <div className="max-width-medium">
                    <h2 className="heading-style-h2">PlanB mengajak Anda melambat bergerak dengan kesadaran, dan mengingat kembali bagaimana hidup terasa ketika dijalani dengan tujuan dan makna.</h2>
                  </div>
                </div>
                <div className="features-wrap">
                  <div className="features_image">
                    <img src="https://drive.google.com/thumbnail?id=1iNi_5jCJef6VloqQlI_UTeuwSPvkWUEl&sz=w1024" loading="eager" sizes="(max-width: 1078px) 100vw, 1078px" srcSet="https://drive.google.com/thumbnail?id=1iNi_5jCJef6VloqQlI_UTeuwSPvkWUEl&sz=w1024" alt="Kaleo Image" className="features_image" />
                  </div>
                  <div className="features_content">
                    <h2 className="text-weight-normal text-style-allcaps heading-style-h4">Ruang Hijau</h2>
                    <img src="https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/6854494c95fab58d560ef202_divider.svg" loading="eager" alt="" className="divider-img" />
                    <div className="max-width-small">
                      <p className="text-size-medium">PlanB berangkat dari ruang yang hidup—pepohonan yang menaungi, air yang tenang, dan ritme alam yang hadir tanpa suara. Di sini, waktu melambat, cahaya menyentuh perlahan, dan keseharian menemukan pijakan yang lebih hening dan berakar.</p>
                    </div>
                  </div>
                </div>
                <div className="features-wrap is-middle">
                  <div className="features_content">
                    <h2 className="text-weight-normal text-style-allcaps heading-style-h4">Jiwa yang Berdiam</h2>
                    <img src="https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/6854494c95fab58d560ef202_divider.svg" loading="eager" alt="" className="divider-img" />
                    <div className="max-width-small">
                      <p className="text-size-medium">Ada jiwa yang hidup dalam hal-hal kecil—dalam momen hening yang singkat, dalam perhatian pada detail, dalam jeda di antara kesibukan. Ia hadir lewat cahaya yang lembut, sentuhan yang sederhana, dan rasa peduli yang membuat keseharian terasa utuh.</p>
                    </div>
                  </div>
                  <div className="features_image">
                    <img src="https://drive.google.com/thumbnail?id=1ySLrro5PYLElnhkMOIeNT9FvmRLoJhSK&sz=w1024" loading="eager" sizes="(max-width: 1078px) 100vw, 1078px" alt="Kaleo Image" className="image" />
                  </div>
                </div>
                <div className="features-wrap">
                  <div className="features_image">
                    <img src="https://drive.google.com/thumbnail?id=1dZmhBiV6g--jyx3Fo2uuT4Hanx_ojSVW&sz=w1024" loading="eager" sizes="(max-width: 1078px) 100vw, 1078px" alt="Kaleo Image" className="image" />
                  </div>
                  <div className="features_content">
                    <h2 className="text-weight-normal text-style-allcaps heading-style-h4">Visi</h2>
                    <img src="https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/6854494c95fab58d560ef202_divider.svg" loading="eager" alt="" className="divider-img" />
                    <div className="max-width-small">
                      <p className="text-size-medium">Visi PlanB adalah menjaga hal-hal yang tetap berarti—ruang untuk bernapas, keheningan yang menenangkan, keindahan yang sederhana, dan rasa memiliki. Bukan sekadar tempat untuk singgah, Plan B adalah cara hidup—pilihan untuk kembali pada yang menumbuhkan, memberi jeda, dan membuat hidup terasa utuh.</p>
                    </div>
                  </div>
                </div>
                <div className="button-group" style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                  <Link href="/contact" className="button is-secondary w-inline-block">
                    <div className="button-text">
                      <div className="button_text">Jadwalkan Kunjungan</div>
                      <div className="button-text-animation">
                        <div className="button_text">Jadwalkan Kunjungan</div>
                      </div>
                    </div>
                  </Link>
                  <Link href="/listing" className="button w-inline-block">
                    <div className="button-text">
                      <div className="button_text">Lihat Listing</div>
                      <div className="button-text-animation">
                        <div className="button_text">Lihat Listing</div>
                      </div>
                    </div>
                    <img src="https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/6853ff8bb7215267b2f31695_Kaleo_Icon.svg" loading="eager" alt="Kaleo Icon" className="button-image" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LAST CTA SECTION */}
        <section className="section_last-cta">
          <div className="cta_background">
            <div className="cta_content">
              <img src="https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/6853ff8bb7215267b2f31695_Kaleo_Icon.svg" loading="eager" alt="Kaleo Icon" />
              <h3 className="text-style-allcaps font-zodiak text-size-huge text-weight-normal">Keindahan Alami</h3>
              <div className="cta_subtitle text-align-center">
                <p>Ada momen yang berbicara tanpa kata — langkah pagi yang pelan, cahaya menyentuh permukaan air, bayangan pepohonan bergerak lembut di ruang yang hening.</p>
              </div>
              <div className="button-wrap">
                <Link href="/listing" className="button w-inline-block">
                  <div className="button-text">
                    <div className="button_text">Lihat Listing</div>
                    <div className="button-text-animation">
                      <div className="button_text">Lihat Listing</div>
                    </div>
                  </div>
                  <img src="https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/6853ff8bb7215267b2f31695_Kaleo_Icon.svg" loading="eager" alt="Kaleo Icon" className="button-image" />
                </Link>
              </div>
            </div>
            <div className="video-overlay"></div>
            <div data-poster-url="https://raw.githubusercontent.com/hivicode/hivicode.github.io/main/febe/Screenshot%202026-01-13%20232112.png" data-video-urls="https://raw.githubusercontent.com/hivicode/hivicode.github.io/main/febe/snapsave-app_57705_hd.webm" data-autoplay="true" data-loop="true" data-wf-ignore="true" className="background-video absolute w-background-video w-background-video-atom">
              <video id="65ef5802-0db7-ca95-b866-3b3b2f2a2b50-video" autoPlay loop poster="https://raw.githubusercontent.com/hivicode/hivicode.github.io/main/febe/Screenshot%202026-01-13%20232112.png" style={{ backgroundImage: "url(https://raw.githubusercontent.com/hivicode/hivicode.github.io/main/febe/Screenshot%202026-01-13%20232112.png)" }} muted playsInline data-wf-ignore="true" data-object-fit="cover">
                <source src="https://raw.githubusercontent.com/hivicode/hivicode.github.io/main/febe/snapsave-app_57705_hd.webm" data-wf-ignore="true" />
              </video>
              <div className="video-overlay"></div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
