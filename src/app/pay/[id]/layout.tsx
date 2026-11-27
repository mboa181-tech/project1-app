import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const invoiceNumber = id ? decodeURIComponent(id) : "Faktur";

  return {
    title: `Faktur Tagihan Resmi #${invoiceNumber} — FlowDesk`,
    description: `Rincian faktur tagihan resmi ${invoiceNumber}. Akses dokumen penagihan dan selesaikan pembayaran aman via QRIS, Virtual Account, atau Kartu.`,
    openGraph: {
      title: `Faktur Tagihan Resmi #${invoiceNumber} — FlowDesk`,
      description: `Rincian faktur tagihan resmi ${invoiceNumber}. Akses dokumen penagihan dan selesaikan pembayaran aman via QRIS, Virtual Account, atau Kartu.`,
      url: `https://flowdesk.aads.my.id/pay/${encodeURIComponent(id)}`,
      siteName: "FlowDesk Financial Operations",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `Faktur Tagihan Resmi #${invoiceNumber} — FlowDesk`,
      description: `Rincian faktur tagihan resmi ${invoiceNumber}. Selesaikan pembayaran aman melalui portal resmi FlowDesk.`,
    },
  };
}

export default function PayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
