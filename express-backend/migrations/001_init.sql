CREATE TABLE IF NOT EXISTS properti (
  kode_rumah VARCHAR(255) PRIMARY KEY,
  nama_rumah VARCHAR(255) NOT NULL,
  alamat TEXT NOT NULL,
  kota VARCHAR(255) NOT NULL,
  tipe VARCHAR(100) NOT NULL,
  harga BIGINT NOT NULL,
  rating DOUBLE PRECISION DEFAULT 0,
  kamar_tidur INTEGER NOT NULL,
  kamar_mandi INTEGER NOT NULL,
  luas_tanah INTEGER NOT NULL,
  luas_bangunan INTEGER NOT NULL,
  garasi INTEGER NOT NULL,
  fitur JSONB NOT NULL,
  deskripsi TEXT
);

CREATE INDEX IF NOT EXISTS idx_properti_nama ON properti (nama_rumah);
CREATE INDEX IF NOT EXISTS idx_properti_kota ON properti (kota);

CREATE TABLE IF NOT EXISTS properti_gambar (
  id BIGSERIAL PRIMARY KEY,
  kode_rumah VARCHAR(255) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  CONSTRAINT fk_properti_gambar_properti
    FOREIGN KEY (kode_rumah) REFERENCES properti(kode_rumah) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS booking (
  id BIGSERIAL PRIMARY KEY,
  kode_rumah VARCHAR(255) NOT NULL,
  nama_depan VARCHAR(255) NOT NULL,
  nama_belakang VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telepon VARCHAR(100) NOT NULL,
  metode_pembayaran VARCHAR(100) NOT NULL,
  booking_fee BIGINT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'new',
  dibuat_pada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_booking_properti
    FOREIGN KEY (kode_rumah) REFERENCES properti(kode_rumah) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_booking_kode_rumah ON booking (kode_rumah);
CREATE INDEX IF NOT EXISTS idx_booking_dibuat_pada ON booking (dibuat_pada);

ALTER TABLE booking ADD COLUMN IF NOT EXISTS kode_inquiry VARCHAR(50);
ALTER TABLE booking ADD COLUMN IF NOT EXISTS catatan TEXT DEFAULT '';
ALTER TABLE booking ADD COLUMN IF NOT EXISTS jadwal_kunjungan TIMESTAMP;
ALTER TABLE booking ADD COLUMN IF NOT EXISTS preferensi_kontak VARCHAR(100) DEFAULT 'whatsapp';
ALTER TABLE booking ALTER COLUMN status SET DEFAULT 'new';

UPDATE booking SET status = 'new' WHERE status = 'pending';
UPDATE booking SET status = 'closed' WHERE status = 'confirmed';

UPDATE booking
SET kode_inquiry = 'INQ-' || LPAD(id::text, 6, '0')
WHERE kode_inquiry IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_booking_kode_inquiry ON booking (kode_inquiry);

CREATE TABLE IF NOT EXISTS laporan_operasional (
  id BIGSERIAL PRIMARY KEY,
  tahun INT NOT NULL,
  bulan SMALLINT NOT NULL,
  biaya_operasional BIGINT NOT NULL DEFAULT 0,
  catatan VARCHAR(255) DEFAULT '',
  dibuat_pada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  diperbarui_pada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uniq_laporan_operasional_tahun_bulan UNIQUE (tahun, bulan)
);

CREATE INDEX IF NOT EXISTS idx_laporan_operasional_tahun ON laporan_operasional (tahun);
