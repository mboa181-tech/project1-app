"use client";

import React, { useEffect, useState } from "react";
import { Invoice } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { formatRupiah } from "@/lib/format-currency";
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
  ArrowUpRight,
  ShieldCheck,
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
  const { t } = useLanguage();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in print:p-0 print:bg-white">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 glass-modal rounded-[28px] max-w-3xl w-full max-h-[92vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none print:bg-white print:text-black">
        {/* Header Toolbar */}
        <div className="p-4 sm:p-5 border-b border-[var(--gd-line)] flex items-center justify-between sticky top-0 bg-[var(--gd-surface)]/85 backdrop-blur-xl z-20 print:hidden">
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
                className="glass-btn-teal px-3.5 py-1.5 text-xs"
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
                className="glass-btn-secondary px-3.5 py-1.5 text-xs"
              >
                <Pencil className="w-3.5 h-3.5 text-[var(--gd-muted)]" />
                <span>{t("detailEdit")}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyLink}
              title="Salin link portal pembayaran untuk klien"
              className="glass-btn-secondary px-3.5 py-1.5 text-xs"
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
              onClick={handlePrint}
              className="glass-btn-primary px-4 py-1.5 text-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t("detailPrint")}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="glass-icon-btn ml-1"
              aria-label="Tutup dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Sheet */}
        <div className="relative p-6 sm:p-10 space-y-7 print:p-8">
          {/* Watermark Rubber Stamp */}
          {isPaid && (
            <div className="absolute right-10 top-24 pointer-events-none rotate-[-15deg] select-none opacity-85 z-10 print:opacity-100">
              <div className="border-[3.5px] border-[var(--gd-teal)] text-[var(--gd-teal)] font-extrabold tracking-widest text-xl uppercase px-5 py-2 rounded-2xl shadow-sm bg-[var(--gd-surface)]/40 backdrop-blur-xs flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                <span>{t("detailPaidStamp")}</span>
              </div>
            </div>
          )}

          {/* Top Brand & Metadata */}
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[var(--gd-pick)] text-[var(--gd-pick-ink)] flex items-center justify-center shadow-md border border-[var(--gd-rim)]">
                  <svg className="w-6 h-6" viewBox="0 0 28 28" fill="none">
                    <path d="m5 22 7.4-16h3.2L23 22h-4l-5-11.4L9 22H5Z" fill="currentColor"/>
                    <path d="M10 18h8l1.4 3h-10.8l1.4-3Z" fill="currentColor"/>
                  </svg>
                </div>
                <div>
                  <span className="text-xl font-black tracking-tight text-[var(--gd-ink)] block leading-tight">
                    FlowDesk Inc.
                  </span>
                  <span className="text-[11px] font-semibold text-[var(--gd-muted)]">
                    Financial Operations Suite
                  </span>
                </div>
              </div>
              <p className="text-xs text-[var(--gd-muted)] leading-relaxed mt-1">
                Jl. Sudirman No. 100, Suite 400<br />
                Jakarta Selatan 12190 • billing@flowdesk.app
              </p>
            </div>

            <div className="text-right">
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--gd-ink)] tracking-tight uppercase">
                {t("detailInvoice")}
              </h2>
              <p className="font-mono text-sm font-extrabold text-[var(--gd-primary)] mt-1">
                #{invoice.invoiceNumber}
              </p>
              <p className="text-xs text-[var(--gd-muted)] mt-1 flex items-center justify-end gap-1">
                <Calendar className="w-3 h-3" />
                <span>{t("detailIssued")} {invoice.issueDate}</span>
              </p>
            </div>
          </div>

          {/* Billed To / Due Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl glass-panel-sub">
            <div>
              <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[var(--gd-muted)] block mb-1">
                {t("detailBilledTo")}
              </span>
              <p className="font-extrabold text-base text-[var(--gd-ink)]">
                {invoice.clientName}
              </p>
              <p className="text-xs text-[var(--gd-muted)] mt-0.5">{invoice.clientEmail}</p>
            </div>
            <div className="sm:text-right">
              <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[var(--gd-muted)] block mb-1">
                {t("detailTerms")}
              </span>
              <p className="font-mono text-sm font-extrabold text-[var(--gd-ink)]">
                Due: {invoice.dueDate}
              </p>
              <p className="text-xs text-[var(--gd-muted)] mt-0.5">
                Transfer Bank / Virtual Account / QRIS
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto rounded-2xl border border-[var(--gd-line)] bg-[var(--gd-inner)]/40">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[var(--gd-line)] text-[10.5px] uppercase font-bold text-[var(--gd-muted)] bg-[var(--gd-inner)]">
                  <th className="py-3 px-4">{t("modalItemDesc")}</th>
                  <th className="py-3 px-3 text-center">{t("modalQty")}</th>
                  <th className="py-3 px-3 text-right">{t("modalRate")}</th>
                  <th className="py-3 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--gd-line)]">
                {invoice.items.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--gd-raised)]/30 transition-colors">
                    <td className="py-3.5 px-4 text-[var(--gd-ink)] font-semibold">
                      {item.description}
                    </td>
                    <td className="py-3.5 px-3 text-center text-[var(--gd-muted)] font-mono">
                      {item.quantity}
                    </td>
                    <td className="py-3.5 px-3 text-right text-[var(--gd-muted)] font-mono text-xs">
                      {formatRupiah(item.rate)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[var(--gd-ink)] text-xs">
                      {formatRupiah(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculations Summary */}
          <div className="flex justify-end pt-1">
            <div className="w-full sm:w-80 p-4 rounded-2xl glass-panel-sub space-y-2 text-sm">
              <div className="flex justify-between text-[var(--gd-muted)]">
                <span>{t("detailSubtotal")}</span>
                <span className="font-mono font-bold text-[var(--gd-ink)]">{formatRupiah(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[var(--gd-muted)]">
                <span>{t("modalTax")} ({invoice.taxRate}%)</span>
                <span className="font-mono">{formatRupiah(invoice.taxAmount)}</span>
              </div>
              <div className="flex justify-between font-black text-lg text-[var(--gd-ink)] pt-2 border-t border-[var(--gd-line)]">
                <span>{t("detailTotalDue")}</span>
                <span className="font-mono font-extrabold text-[var(--gd-teal)]">
                  {formatRupiah(invoice.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment & Bank Remittance Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl glass-panel-sub text-xs">
            <div>
              <span className="font-bold text-[var(--gd-ink)] block mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[var(--gd-teal)]" /> {t("detailRemittance")}
              </span>
              <p className="text-[var(--gd-muted)] leading-relaxed">
                Bank: BCA / Mandiri / BNI<br />
                No. Rekening: <strong>1234567890</strong><br />
                Atas Nama: <strong>PT FlowDesk Operations Indonesia</strong>
              </p>
            </div>
            <div>
              <span className="font-bold text-[var(--gd-ink)] block mb-1.5">
                {t("detailRemittanceMemo")}
              </span>
              <p className="text-[var(--gd-muted)] leading-relaxed">
                {invoice.notes || "Harap cantumkan nomor invoice saat melakukan konfirmasi transfer."}
              </p>
            </div>
          </div>

          {/* Footer Security Badges */}
          <div className="pt-4 border-t border-[var(--gd-line)] text-[11px] text-[var(--gd-muted)] flex flex-col sm:flex-row justify-between items-center gap-2">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-[var(--gd-teal)]" />
              {t("detailSecured")}
            </span>
            <span className="font-mono text-[10px] opacity-80">Ref UUID: {invoice.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
