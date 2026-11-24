import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlowDesk — Modern B2B Invoicing & Financial Operations Engine",
  description: "Production-grade, multi-tenant billing & financial ops platform engineered with Next.js 15, TypeScript, and Tailwind CSS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 antialiased selection:bg-brand-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
