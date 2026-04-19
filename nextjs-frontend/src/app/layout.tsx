import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PlanB - Hunian Modern yang Tenang dan Seimbang",
  description: "PlanB adalah kawasan hunian modern yang dirancang untuk hidup tenang dan seimbang dengan lingkungan asri dan ruang yang nyaman.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://cdn.prod.website-files.com/685077c466f113761c6d796b/685453e2db13ffd8a65e5d3e_favicon.png" rel="shortcut icon" type="image/x-icon" />
        <link href="https://cdn.prod.website-files.com/685077c466f113761c6d796b/685453e4536cd361036c084f_webclip.png" rel="apple-touch-icon" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
