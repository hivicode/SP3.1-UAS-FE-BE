CREATE TABLE IF NOT EXISTS properti (
  kode_rumah VARCHAR(255) PRIMARY KEY,
  nama_rumah VARCHAR(255) NOT NULL,
  alamat TEXT NOT NULL,
  kota VARCHAR(255) NOT NULL,
  tipe VARCHAR(100) NOT NULL,
  harga BIGINT NOT NULL,
  rating DOUBLE DEFAULT 0,
  kamar_tidur INTEGER NOT NULL,
  kamar_mandi INTEGER NOT NULL,
  luas_tanah INTEGER NOT NULL,
  luas_bangunan INTEGER NOT NULL,
  garasi INTEGER NOT NULL,
  fitur JSON NOT NULL,
  deskripsi TEXT,
  INDEX idx_properti_nama (nama_rumah),
  INDEX idx_properti_kota (kota)
);

CREATE TABLE IF NOT EXISTS properti_gambar (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  kode_rumah VARCHAR(255) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  CONSTRAINT fk_properti_gambar_properti
    FOREIGN KEY (kode_rumah) REFERENCES properti(kode_rumah) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS booking (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  kode_rumah VARCHAR(255) NOT NULL,
  nama_depan VARCHAR(255) NOT NULL,
  nama_belakang VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telepon VARCHAR(100) NOT NULL,
  metode_pembayaran VARCHAR(100) NOT NULL,
  booking_fee BIGINT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  dibuat_pada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_booking_properti
    FOREIGN KEY (kode_rumah) REFERENCES properti(kode_rumah) ON DELETE CASCADE,
  INDEX idx_booking_kode_rumah (kode_rumah),
  INDEX idx_booking_dibuat_pada (dibuat_pada)
);

CREATE TABLE IF NOT EXISTS laporan_operasional (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tahun INT NOT NULL,
  bulan TINYINT NOT NULL,
  biaya_operasional BIGINT NOT NULL DEFAULT 0,
  catatan VARCHAR(255) DEFAULT '',
  dibuat_pada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  diperbarui_pada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_laporan_operasional_tahun_bulan (tahun, bulan),
  INDEX idx_laporan_operasional_tahun (tahun)
);
