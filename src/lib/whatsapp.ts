import { Invoice } from "./types";
import { formatRupiah } from "./format-currency";

/**
 * Format status label for WhatsApp message in ID or EN
 */
function getStatusLabel(status: Invoice["status"], lang: "id" | "en" = "id"): string {
  if (lang === "en") {
    switch (status) {
      case "PAID":
        return "✅ Paid & Settled";
      case "PENDING":
        return "⏳ Pending Payment";
      case "OVERDUE":
        return "⚠️ Overdue (Immediate settlement required)";
      case "DRAFT":
        return "📝 Draft";
      default:
        return status;
    }
  }

  switch (status) {
    case "PAID":
      return "✅ Lunas (Terverifikasi)";
    case "PENDING":
      return "⏳ Menunggu Pembayaran";
    case "OVERDUE":
      return "⚠️ Jatuh Tempo (Mohon segera diselesaikan)";
    case "DRAFT":
      return "📝 Draf Tagihan";
    default:
      return status;
  }
}

/**
 * Generate formatted WhatsApp message text for an invoice billing reminder
 */
export function generateWhatsAppInvoiceMessage(
  invoice: Invoice,
  origin?: string,
  lang: "id" | "en" = "id"
): string {
  const base =
    origin ||
    (typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "https://flowdesk.aads.my.id");

  const payUrl = `${base}/pay/${encodeURIComponent(invoice.invoiceNumber || invoice.id)}`;
  const statusStr = getStatusLabel(invoice.status, lang);
  const formattedTotal = formatRupiah(invoice.total);

  if (lang === "en") {
    return [
      `*INVOICE BILLING — FLOWDESK*`,
      `Dear *${invoice.clientName}*,`,
      ``,
      `Here is the billing statement for your invoice:`,
      `━━━━━━━━━━━━━━━━━━`,
      `📄 *Invoice No:* ${invoice.invoiceNumber}`,
      `💰 *Total Amount:* ${formattedTotal}`,
      `📅 *Due Date:* ${invoice.dueDate}`,
      `📊 *Status:* ${statusStr}`,
      `━━━━━━━━━━━━━━━━━━`,
      ``,
      `View breakdown & complete payment securely (QRIS / VA / Card):`,
      `🔗 ${payUrl}`,
      ``,
      `Thank you for your business.`,
      `_FlowDesk Financial Operations_`,
    ].join("\n");
  }

  return [
    `*FAKTUR TAGIHAN — FLOWDESK*`,
    `Kepada Yth. *${invoice.clientName}*,`,
    ``,
    `Berikut rincian faktur tagihan Anda:`,
    `━━━━━━━━━━━━━━━━━━`,
    `📄 *No. Invoice:* ${invoice.invoiceNumber}`,
    `💰 *Total Tagihan:* ${formattedTotal}`,
    `📅 *Batas Jatuh Tempo:* ${invoice.dueDate}`,
    `📊 *Status:* ${statusStr}`,
    `━━━━━━━━━━━━━━━━━━`,
    ``,
    `Rincian lengkap dan pembayaran mandiri aman (QRIS / Virtual Account / Kartu):`,
    `🔗 ${payUrl}`,
    ``,
    `Terima kasih atas kerja samanya.`,
    `_FlowDesk Financial Operations_`,
  ].join("\n");
}

/**
 * Generate WhatsApp payment receipt message (after settled)
 */
export function generateWhatsAppReceiptMessage(
  invoice: Invoice,
  origin?: string,
  lang: "id" | "en" = "id"
): string {
  const base =
    origin ||
    (typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "https://flowdesk.aads.my.id");

  const payUrl = `${base}/pay/${encodeURIComponent(invoice.invoiceNumber || invoice.id)}`;
  const formattedTotal = formatRupiah(invoice.total);

  if (lang === "en") {
    return [
      `*OFFICIAL PAYMENT RECEIPT — FLOWDESK*`,
      `Dear *${invoice.clientName}*,`,
      ``,
      `We have confirmed receipt of your payment:`,
      `━━━━━━━━━━━━━━━━━━`,
      `📄 *Invoice No:* ${invoice.invoiceNumber}`,
      `💰 *Amount Paid:* ${formattedTotal}`,
      `✅ *Status:* PAID & SETTLED (SHA-256 Verified)`,
      `━━━━━━━━━━━━━━━━━━`,
      ``,
      `View official digital receipt:`,
      `🔗 ${payUrl}`,
      ``,
      `Thank you for your prompt payment!`,
      `_FlowDesk Financial Operations_`,
    ].join("\n");
  }

  return [
    `*BUKTI PEMBAYARAN RESMI — FLOWDESK*`,
    `Kepada Yth. *${invoice.clientName}*,`,
    ``,
    `Pembayaran Anda telah kami terima dan diverifikasi:`,
    `━━━━━━━━━━━━━━━━━━`,
    `📄 *No. Invoice:* ${invoice.invoiceNumber}`,
    `💰 *Jumlah Lunas:* ${formattedTotal}`,
    `✅ *Status:* LUNAS & TERSELESAIKAN (Terverifikasi SHA-256)`,
    `━━━━━━━━━━━━━━━━━━`,
    ``,
    `Akses bukti pelunasan digital resmi:`,
    `🔗 ${payUrl}`,
    ``,
    `Terima kasih atas kepercayaan dan kerjasamanya!`,
    `_FlowDesk Financial Operations_`,
  ].join("\n");
}

/**
 * Direct open WhatsApp with formatted message
 */
export function openWhatsAppInvoice(
  invoice: Invoice,
  origin?: string,
  lang: "id" | "en" = "id",
  phoneNumber?: string
): void {
  const message =
    invoice.status === "PAID"
      ? generateWhatsAppReceiptMessage(invoice, origin, lang)
      : generateWhatsAppInvoiceMessage(invoice, origin, lang);

  let url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

  if (phoneNumber) {
    const clean = phoneNumber.replace(/[^0-9]/g, "").replace(/^0/, "62");
    if (clean) {
      url = `https://api.whatsapp.com/send?phone=${clean}&text=${encodeURIComponent(message)}`;
    }
  }

  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
