import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { CompanyProvider } from "@/context/CompanyContext";

export const metadata: Metadata = {
  title: "FlowDesk — Portal Penagihan & Pembayaran Faktur Resmi",
  description: "Portal resmi penagihan dan pembayaran faktur digital terpercaya. Layanan transaksi bisnis aman dengan verifikasi pembayaran instan.",
  openGraph: {
    title: "FlowDesk — Portal Penagihan & Pembayaran Faktur Resmi",
    description: "Portal resmi penagihan dan pembayaran faktur digital terpercaya. Layanan transaksi bisnis aman dengan verifikasi pembayaran instan.",
    url: "https://flowdesk.aads.my.id",
    siteName: "FlowDesk Invoicing Portal",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "FlowDesk — Portal Penagihan & Pembayaran Faktur Resmi",
    description: "Portal resmi penagihan dan pembayaran faktur digital terpercaya.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 antialiased selection:bg-brand-500 selection:text-white">
        <LanguageProvider>
          <AuthProvider>
            <CompanyProvider>{children}</CompanyProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
