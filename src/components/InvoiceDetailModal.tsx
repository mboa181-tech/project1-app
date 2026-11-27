"use client";

import React, { useEffect, useState } from "react";
import { Invoice } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { formatRupiah, terbilangRupiah } from "@/lib/format-currency";
import { openWhatsAppInvoice } from "@/lib/whatsapp";
import {
  X,
  Printer,
  Copy,
  Check,
  CheckCircle2,
  Calendar,
  FileText,
  CreditCard,
  Lock,
  Pencil,
  MessageCircle,
} from "lucide-react";

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onToggleStatus?: (invoiceId: string) => void;
  onEdit?: (invoice: Invoice) => void;
}

export function InvoiceDetailModal({
  invoice,
  onClose,
  onToggleStatus,
  onEdit,
}: InvoiceDetailModalProps) {
  const { t, lang } = useLanguage();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const publicUrl = `${window.location.origin}/pay/${invoice.invoiceNumber}`;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isPaid = invoice.status === "PAID";
  const isPending = invoice.status === "PENDING";
  const isOverdue = invoice.status === "OVERDUE";

  const statusLabel =
    isPaid
      ? t("statusPaid")
      : isPending
      ? t("statusPending")
      : isOverdue
      ? t("statusOverdue")
      : t("statusDraft");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in print:p-0 print:bg-white print:static print:block">
      <div
        className="fixed inset-0 print:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-3xl w-full my-auto print:max-w-full">
        {/* Tombol Tutup / Kembali di Pojok Kanan Atas (Di Luar / Sudut Kotak Modal) */}
        <button
          type="button"
          onClick={onClose}
          className="glass-icon-btn absolute -top-3 -right-2 sm:-top-3.5 sm:-right-3.5 z-30 shadow-2xl hover:scale-105 active:scale-95 hover:border-[var(--gd-coral)] hover:text-[var(--gd-coral)] transition-all print:hidden"
          title="Tutup (Esc)"
          aria-label="Tutup dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="glass-modal rounded-[28px] w-full max-h-[92vh] overflow-y-auto print:overflow-visible print:max-h-none print:shadow-none print:border-none print:bg-white print:text-black print:rounded-none print:w-full print:max-w-full">
          {/* Header Toolbar (Hidden when printed) */}
          <div className="p-4 sm:p-5 border-b border-[var(--gd-line)] flex flex-wrap items-center justify-between gap-3 sticky top-0 bg-[var(--gd-surface)]/85 backdrop-blur-xl z-20 print:hidden pr-10 sm:pr-5">
            <div className="flex items-center gap-2.5">
              <span className="font-mono font-extrabold text-xs sm:text-sm px-3 py-1 rounded-full bg-[var(--gd-inner)] border border-[var(--gd-line)] text-[var(--gd-ink)]">
                {invoice.invoiceNumber}
              </span>
              <span
                className={`text-xs px-3 py-1 rounded-full font-bold border flex items-center gap-1.5 ${
                  isPaid
                    ? "bg-[color-mix(in_srgb,var(--gd-teal)_15%,transparent)] text-[var(--gd-teal)] border-[color-mix(in_srgb,var(--gd-teal)_35%,transparent)]"
                    : isPending
                    ? "bg-[color-mix(in_srgb,var(--gd-ochre)_15%,transparent)] text-[var(--gd-ochre)] border-[color-mix(in_srgb,var(--gd-ochre)_35%,transparent)]"
                    : "bg-[color-mix(in_srgb,var(--gd-coral)_15%,transparent)] text-[var(--gd-coral)] border-[color-mix(in_srgb,var(--gd-coral)_35%,transparent)]"
                }`}
              >
                <i className="w-1.5 h-1.5 rounded-full bg-currentColor inline-block" />
                {statusLabel}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onToggleStatus && !isPaid && (
                <button
                  type="button"
                  onClick={() => {
                    onToggleStatus(invoice.id);
                    onClose();
                  }}
                  className="glass-btn-teal px-3.5 py-1.5 text-xs font-bold"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t("detailMarkPaid")}</span>
                </button>
              )}

              {onEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onEdit(invoice);
                    onClose();
                  }}
                  className="glass-btn-secondary px-3.5 py-1.5 text-xs font-bold"
                >
                  <Pencil className="w-3.5 h-3.5 text-[var(--gd-muted)]" />
                  <span>{t("detailEdit")}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCopyLink}
                title="Salin link portal pembayaran untuk klien"
                className="glass-btn-secondary px-3.5 py-1.5 text-xs font-bold"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[var(--gd-teal)]" />
                    <span className="text-[var(--gd-teal)]">{t("detailLinkCopied")}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[var(--gd-muted)]" />
                    <span>{t("detailCopyLink")}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => openWhatsAppInvoice(invoice, typeof window !== "undefined" ? window.location.origin : "", lang)}
                title={lang === "id" ? "Kirim rincian tagihan langsung via WhatsApp" : "Send invoice details via WhatsApp"}
                className="px-3.5 py-1.5 text-xs font-bold rounded-full flex items-center gap-1.5 transition-all shadow-sm"
                style={{
                  backgroundColor: "rgba(37, 211, 102, 0.14)",
                  color: "#25D366",
                  border: "1px solid rgba(37, 211, 102, 0.35)",
                }}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{t("detailSendWhatsApp")}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="glass-btn-primary px-4 py-1.5 text-xs font-bold"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t("detailPrint")}</span>
              </button>
            </div>
          </div>

        {/* Printable Standard Invoice Sheet */}
        <div className="printable-document relative p-6 sm:p-10 space-y-6 print:p-0 print:text-slate-900 print:bg-white print:space-y-5">
          {/* Standard Company Header */}
          <div className="flex justify-between items-start border-b-2 border-[var(--gd-line)] print:border-slate-800 pb-5">
            <div>
              <h1 className="text-xl font-black text-[var(--gd-ink)] print:text-slate-950 tracking-tight leading-none mb-1.5">
                FlowDesk Inc.
              </h1>
              <p className="text-[11px] text-[var(--gd-muted)] print:text-slate-600 leading-relaxed">
                Jl. Sudirman No. 100, Suite 400, Jakarta Selatan 12190<br />
                Email: billing@flowdesk.app • https://flowdesk.app
              </p>
            </div>

            <div className="text-right">
              <h2 className="text-lg font-black uppercase text-[var(--gd-ink)] print:text-slate-950 tracking-wider">
                {lang === "id" ? "FAKTUR TAGIHAN" : "INVOICE"}
              </h2>
              <p className="font-mono font-bold text-sm text-[var(--gd-muted)] print:text-slate-700 mt-0.5">
                #{invoice.invoiceNumber}
              </p>
              <span
                className={`inline-block mt-1.5 text-[10px] font-black uppercase px-2.5 py-0.5 rounded border ${
                  isPaid
                    ? "border-emerald-600 text-emerald-700 bg-emerald-500/10 print:bg-emerald-50 print:text-emerald-800"
                    : isPending
                    ? "border-amber-600 text-amber-700 bg-amber-500/10 print:bg-amber-50 print:text-amber-800"
                    : "border-rose-600 text-rose-700 bg-rose-500/10 print:bg-rose-50 print:text-rose-800"
                }`}
              >
                {statusLabel}
              </span>
            </div>
          </div>

          {/* Billed To / Due Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-5 rounded-2xl glass-panel-sub print:bg-slate-50 print:border print:border-slate-200 print:rounded-lg">
            <div>
              <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[var(--gd-muted)] print:text-slate-500 block mb-1">
                {t("detailBilledTo")}
              </span>
              <p className="font-extrabold text-base text-[var(--gd-ink)] print:text-slate-900">
                {invoice.clientName}
              </p>
              <p className="text-xs text-[var(--gd-muted)] print:text-slate-600 mt-0.5">{invoice.clientEmail}</p>
            </div>
            <div className="sm:text-right">
              <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[var(--gd-muted)] print:text-slate-500 block mb-1">
                {t("detailTerms")}
              </span>
              <p className="font-mono text-sm font-extrabold text-[var(--gd-ink)] print:text-slate-900">
                Jatuh Tempo: {invoice.dueDate}
              </p>
              <p className="text-xs text-[var(--gd-muted)] print:text-slate-600 mt-0.5">
                Tanggal Terbit: {invoice.issueDate}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto rounded-2xl border border-[var(--gd-line)] print:border-slate-300 print:rounded-lg bg-[var(--gd-inner)]/40 print:bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--gd-line)] print:border-slate-800 text-[10.5px] uppercase font-bold text-[var(--gd-muted)] print:text-slate-700 bg-[var(--gd-inner)] print:bg-slate-100">
                  <th className="py-2.5 px-3 w-10 text-center">No.</th>
                  <th className="py-2.5 px-4">{t("modalItemDesc")}</th>
                  <th className="py-2.5 px-3 text-center w-16">{t("modalQty")}</th>
                  <th className="py-2.5 px-3 text-right w-36">{t("modalRate")}</th>
                  <th className="py-2.5 px-4 text-right w-40">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--gd-line)] print:divide-slate-200">
                {invoice.items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-[var(--gd-raised)]/30 print:bg-white transition-colors">
                    <td className="py-3 px-3 text-center text-[var(--gd-muted)] print:text-slate-500 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 text-[var(--gd-ink)] print:text-slate-900 font-semibold">
                      {item.description}
                    </td>
                    <td className="py-3 px-3 text-center text-[var(--gd-muted)] print:text-slate-700 font-mono">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-3 text-right text-[var(--gd-muted)] print:text-slate-700 font-mono text-xs">
                      {formatRupiah(item.rate)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[var(--gd-ink)] print:text-slate-950 text-xs">
                      {formatRupiah(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculations & Terbilang Block */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
            <div className="sm:col-span-7 space-y-3">
              <div className="p-3.5 rounded-xl border border-[var(--gd-line)] print:border-slate-200 bg-[var(--gd-inner)]/40 print:bg-slate-50">
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--gd-muted)] print:text-slate-500 block mb-0.5">
                  Terbilang:
                </span>
                <p className="font-bold text-[var(--gd-ink)] print:text-slate-900 text-xs italic leading-snug">
                  &quot;{terbilangRupiah(invoice.total)}&quot;
                </p>
              </div>

              {/* Payment & Bank Remittance Box */}
              <div className="p-4 rounded-2xl glass-panel-sub print:bg-slate-50 print:border print:border-slate-200 print:rounded-lg text-xs">
                <span className="font-bold text-[var(--gd-ink)] print:text-slate-900 block mb-1.5 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[var(--gd-teal)] print:text-slate-700" /> {t("detailRemittance")}
                </span>
                <p className="text-[var(--gd-muted)] print:text-slate-600 leading-relaxed">
                  Bank: <strong>BCA / Mandiri</strong> • No. Rekening: <strong>1234-567-890</strong><br />
                  Atas Nama: <strong>PT FlowDesk Solusi Nusantara</strong><br />
                  {invoice.notes || "Harap cantumkan nomor faktur saat melakukan transfer."}
                </p>
              </div>
            </div>

            <div className="sm:col-span-5 p-4 rounded-2xl glass-panel-sub print:bg-slate-50 print:border print:border-slate-200 print:rounded-lg space-y-2 text-xs">
              <div className="flex justify-between text-[var(--gd-muted)] print:text-slate-600">
                <span>{t("detailSubtotal")}</span>
                <span className="font-mono font-bold text-[var(--gd-ink)] print:text-slate-900">
                  {formatRupiah(invoice.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-[var(--gd-muted)] print:text-slate-600">
                <span>{t("modalTax")} ({invoice.taxRate}%)</span>
                <span className="font-mono">{formatRupiah(invoice.taxAmount)}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-[var(--gd-ink)] print:text-slate-950 pt-2 border-t border-[var(--gd-line)] print:border-slate-300">
                <span>{t("detailTotalDue")}</span>
                <span className="font-mono font-extrabold text-[var(--gd-teal)] print:text-slate-950 text-base">
                  {formatRupiah(invoice.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Simple Footer & Signatory */}
          <div className="pt-6 border-t border-[var(--gd-line)] print:border-slate-200 flex justify-between items-end text-xs">
            <span className="text-[10px] text-[var(--gd-muted)] print:text-slate-500 flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-[var(--gd-teal)] print:text-slate-600" />
              Dokumen ini diterbitkan secara elektronik oleh FlowDesk.
            </span>

            <div className="text-right space-y-6">
              <span className="text-[11px] text-[var(--gd-muted)] print:text-slate-600 block">
                Hormat kami,
              </span>
              <div>
                <strong className="block text-[var(--gd-ink)] print:text-slate-900 text-xs font-bold">
                  FlowDesk Finance
                </strong>
                <span className="text-[10px] text-[var(--gd-muted)] print:text-slate-500">
                  FlowDesk Inc.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
