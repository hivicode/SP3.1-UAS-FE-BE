export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5000";

export type PropertyApi = {
  kode_rumah: string;
  nama_rumah: string;
  alamat: string;
  kota: string;
  tipe: string;
  harga: number;
  rating: number;
  kamar_tidur: number;
  kamar_mandi: number;
  luas_tanah: number;
  luas_bangunan: number;
  garasi: number;
  fitur: string[];
  gambar: string[];
  status: "available" | "onbook" | "sold" | string;
  deskripsi: string;
};

export type BookingApi = {
  id: number;
  kode_rumah: string;
  nama_depan: string;
  nama_belakang: string;
  email: string;
  telepon: string;
  metode_pembayaran: string;
  booking_fee: number;
  status: "pending" | "confirmed" | "cancelled" | string;
  dibuat_pada: string;
  nama_rumah: string;
  alamat: string;
  kota: string;
};

export type AuthResponse = {
  token: string;
  user: { username: string; role: string };
};

export type FinanceMonthlyRow = {
  tahun: number;
  bulan: number;
  nama_bulan: string;
  total_transaksi: number;
  total_penjualan: number;
  total_booking_fee: number;
  biaya_operasional: number;
  laba_bersih: number;
  catatan: string;
};

export type FinanceReport = {
  tahun: number;
  summary: {
    total_transaksi: number;
    total_penjualan: number;
    total_booking_fee: number;
    total_biaya_operasional: number;
    total_laba_bersih: number;
  };
  bulanan: FinanceMonthlyRow[];
};

export function makeApiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function normalizeImageUrl(src: string): string {
  if (/^https?:\/\//i.test(src)) return src;
  return makeApiUrl(src);
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(makeApiUrl(path), init);
  if (!response.ok) {
    const fallbackMessage = `Request failed with status ${response.status}`;
    const contentType = response.headers.get("content-type") || "";
    let message = "";

    if (contentType.includes("application/json")) {
      try {
        const payload = (await response.json()) as { message?: unknown };
        if (typeof payload?.message === "string" && payload.message.trim()) {
          message = payload.message.trim();
        }
      } catch (_error) {
        // Fall through and try reading text body if JSON parsing fails.
      }
    }

    if (!message) {
      const text = await response.text();
      message = text || fallbackMessage;
    }

    throw new Error(message);
  }
  return (await response.json()) as T;
}

export function withAuth(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
  };
}
