"use client";

import React, { useEffect, useState } from "react";
import { Invoice } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { formatRupiah, terbilangRupiah } from "@/lib/format-currency";
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
  QrCode,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in print:p-0 print:bg-white print:static print:block">
      <div
        className="fixed inset-0 print:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 glass-modal rounded-[28px] max-w-3xl w-full max-h-[92vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none print:bg-white print:text-black print:rounded-none print:w-full print:max-w-full">
        {/* Header Toolbar (Hidden when printed) */}
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
              onClick={handlePrint}
              className="glass-btn-primary px-4 py-1.5 text-xs font-bold"
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
        <div className="relative p-6 sm:p-10 space-y-7 print:p-8 print:text-slate-900 print:bg-white print:space-y-5">
          {/* Official Letterhead Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl border-2 border-slate-950 print:bg-slate-900 print:text-white">
                FD
              </div>
              <div>
                <h1 className="text-xl font-black text-[var(--gd-ink)] print:text-slate-950 tracking-tight leading-none mb-1">
                  PT FLOWDESK SOLUSI NUSANTARA
                </h1>
                <p className="text-[11px] text-[var(--gd-muted)] print:text-slate-600 font-semibold leading-relaxed">
                  Gedung Bursa Efek Indonesia, Tower 2 Lt. 18, SCBD Kav. 52-53<br />
                  Jl. Jend. Sudirman, Senayan, Jakarta Selatan 12190 • Telp: (021) 5088-7700<br />
                  Surel: billing@flowdesk.app • Situs: https://flowdesk.app
                </p>
              </div>
            </div>

            <div className="text-right text-[10px] text-[var(--gd-muted)] print:text-slate-600 border border-[var(--gd-line)] print:border-slate-300 rounded-lg p-2.5 bg-[var(--gd-inner)]/50 print:bg-slate-50 min-w-[210px]">
              <div className="flex justify-between gap-2">
                <span className="font-bold">NPWP:</span>
                <span className="font-mono font-bold text-[var(--gd-ink)] print:text-slate-900">01.345.678.9-021.000</span>
              </div>
              <div className="flex justify-between gap-2 mt-0.5">
                <span className="font-bold">NIB:</span>
                <span className="font-mono text-[var(--gd-ink)] print:text-slate-900">1209000182938</span>
              </div>
              <div className="flex justify-between gap-2 mt-0.5">
                <span className="font-bold">Izin BI/OJK:</span>
                <span className="font-mono text-[var(--gd-ink)] print:text-slate-900">BI/24/098/DKSP/Srt/B</span>
              </div>
            </div>
          </div>

          {/* Document Title Banner */}
          <div className="flex justify-between items-center bg-[var(--gd-inner)]/50 print:bg-slate-100 p-4 rounded-xl border border-[var(--gd-line)] print:border-slate-300">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--gd-teal)] print:text-emerald-800 block">
                FAKTUR TAGIHAN ELEKTRONIK RESMI
              </span>
              <h2 className="text-lg font-black text-[var(--gd-ink)] print:text-slate-900 tracking-tight">
                OFFICIAL TAX INVOICE & COMMERCIAL BILL
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[var(--gd-muted)] print:text-slate-500 uppercase block font-bold">
                Nomor Faktur
              </span>
              <span className="font-mono font-black text-base text-[var(--gd-ink)] print:text-slate-950 block">
                #{invoice.invoiceNumber}
              </span>
            </div>
          </div>

          {/* Billed To / Due Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl glass-panel-sub print:bg-slate-50 print:border-slate-200">
            <div>
              <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[var(--gd-muted)] print:text-slate-500 block mb-1">
                {t("detailBilledTo")} (Klien / Pembayar)
              </span>
              <p className="font-extrabold text-base text-[var(--gd-ink)] print:text-slate-900">
                {invoice.clientName}
              </p>
              <p className="text-xs text-[var(--gd-muted)] print:text-slate-600 mt-0.5">{invoice.clientEmail}</p>
              <p className="text-[11px] text-[var(--gd-muted)] print:text-slate-500 mt-1 font-mono">
                ID Klien: CLT-{invoice.id.toUpperCase()}
              </p>
            </div>
            <div className="sm:text-right">
              <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[var(--gd-muted)] print:text-slate-500 block mb-1">
                {t("detailTerms")} & Jatuh Tempo
              </span>
              <p className="font-mono text-sm font-extrabold text-[var(--gd-ink)] print:text-slate-900">
                Jatuh Tempo: {invoice.dueDate}
              </p>
              <p className="text-xs text-[var(--gd-muted)] print:text-slate-600 mt-0.5">
                Diterbitkan: {invoice.issueDate}
              </p>
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 print:text-emerald-700 mt-1">
                {isPaid ? "Status: LUNAS & DIVERIFIKASI" : "Status: MENUNGGU PELUNASAN"}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto rounded-2xl border border-[var(--gd-line)] print:border-slate-300 bg-[var(--gd-inner)]/40 print:bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--gd-line)] print:border-slate-300 text-[10.5px] uppercase font-bold text-[var(--gd-muted)] bg-[var(--gd-inner)] print:bg-slate-900 print:text-white">
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
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
            <div className="sm:col-span-7 space-y-3">
              <div className="p-3.5 rounded-xl border border-[var(--gd-line)] print:border-slate-300 bg-[var(--gd-inner)]/40 print:bg-slate-50">
                <span className="text-[9px] font-black uppercase tracking-wider text-[var(--gd-muted)] print:text-slate-500 block mb-0.5">
                  JUMLAH TERBILANG RESMI (LEGAL SUM IN WORDS):
                </span>
                <p className="font-extrabold text-[var(--gd-ink)] print:text-slate-900 text-xs italic leading-snug">
                  &quot;{terbilangRupiah(invoice.total)}&quot;
                </p>
              </div>

              {/* Payment & Bank Remittance Box */}
              <div className="p-4 rounded-2xl glass-panel-sub print:bg-slate-50 print:border-slate-200 text-xs">
                <span className="font-bold text-[var(--gd-ink)] print:text-slate-900 block mb-1.5 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[var(--gd-teal)] print:text-emerald-700" /> {t("detailRemittance")}
                </span>
                <p className="text-[var(--gd-muted)] print:text-slate-600 leading-relaxed">
                  Bank: <strong>BCA (Bank Central Asia) / Mandiri</strong><br />
                  No. Rekening Giro: <strong>1234-567-890</strong><br />
                  Atas Nama: <strong>PT FlowDesk Solusi Nusantara</strong><br />
                  {invoice.notes || "Harap cantumkan nomor invoice saat transfer untuk verifikasi otomatis."}
                </p>
              </div>
            </div>

            <div className="sm:col-span-5 p-4 rounded-2xl glass-panel-sub print:bg-slate-50 print:border-slate-300 space-y-2 text-xs">
              <div className="flex justify-between text-[var(--gd-muted)] print:text-slate-600">
                <span>{t("detailSubtotal")}</span>
                <span className="font-mono font-bold text-[var(--gd-ink)] print:text-slate-900">
                  {formatRupiah(invoice.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-[var(--gd-muted)] print:text-slate-600">
                <span>{t("modalTax")} ({invoice.taxRate}% PPN UU HPP)</span>
                <span className="font-mono">{formatRupiah(invoice.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-[var(--gd-muted)] print:text-slate-600">
                <span>Biaya Kliring & Administrasi</span>
                <span className="font-mono text-emerald-600 font-bold">Rp 0 (GRATIS)</span>
              </div>
              <div className="flex justify-between font-black text-sm text-[var(--gd-ink)] print:text-slate-950 pt-2 border-t border-[var(--gd-line)] print:border-slate-300">
                <span>{t("detailTotalDue")}</span>
                <span className="font-mono font-extrabold text-[var(--gd-teal)] print:text-emerald-800 text-base">
                  {formatRupiah(invoice.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Official Stamp & Signatory Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t-2 border-slate-900 items-end">
            {/* Rubber Stamp */}
            <div className="flex items-center justify-center">
              <div className="w-28 h-28 rounded-full border-[3px] border-emerald-700 text-emerald-700 p-1 flex items-center justify-center text-center rotate-[-8deg] select-none shadow-xs">
                <div className="w-full h-full rounded-full border border-dashed border-emerald-600 flex flex-col items-center justify-center p-1">
                  <span className="text-[7px] font-black tracking-widest uppercase block leading-tight">
                    PT FLOWDESK SOLUSI
                  </span>
                  <span className="text-xs font-black tracking-widest uppercase my-0.5 text-emerald-800">
                    ★ {isPaid ? "LUNAS" : "OFFICIAL"} ★
                  </span>
                  <span className="text-[6.5px] font-bold block uppercase leading-tight font-mono">
                    VERIFIED · 2026
                  </span>
                  <span className="text-[6px] opacity-80 mt-0.5">SETTLEMENT ENGINE</span>
                </div>
              </div>
            </div>

            {/* QR Code Verification */}
            <div className="text-center space-y-1">
              <div className="w-20 h-20 bg-white border-2 border-slate-800 rounded-xl mx-auto p-1 flex items-center justify-center">
                <QrCode className="w-16 h-16 text-slate-950" />
              </div>
              <span className="text-[8px] font-extrabold uppercase text-slate-500 block">
                Pindai Verifikasi Digital
              </span>
              <span className="text-[7.5px] font-mono text-slate-400 block">
                flowdesk.app/verify/{invoice.id}
              </span>
            </div>

            {/* Digital Signature */}
            <div className="text-right space-y-1 text-xs">
              <span className="text-[10px] text-[var(--gd-muted)] print:text-slate-500 block">
                Jakarta, {invoice.issueDate}
              </span>
              <span className="text-[11px] font-bold text-[var(--gd-ink)] print:text-slate-800 block">
                PT FLOWDESK SOLUSI NUSANTARA
              </span>
              <div className="py-1">
                <div className="inline-block p-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-left font-mono text-[8.5px] text-emerald-800 leading-tight">
                  <span className="font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 inline" />
                    DIGITALLY CERTIFIED
                  </span>
                </div>
              </div>
              <strong className="block text-[var(--gd-ink)] print:text-slate-900 text-xs font-black underline">
                HENDRA WIDJAJA, S.E., M.B.A.
              </strong>
              <span className="text-[10px] text-[var(--gd-muted)] print:text-slate-500 block">
                Direktur Keuangan & Perbendaharaan
              </span>
            </div>
          </div>

          {/* Footer Security Badges */}
          <div className="pt-3 border-t border-[var(--gd-line)] print:border-slate-200 text-[9px] text-[var(--gd-muted)] print:text-slate-500 flex justify-between items-center leading-relaxed">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-[var(--gd-teal)] print:text-emerald-700" />
              Dokumen ini sah dan diterbitkan secara elektronik melalui FlowDesk Financial Ops Engine berdasarkan UU ITE Pasal 5 ayat 1.
            </span>
            <span className="font-mono text-[8.5px] opacity-80 shrink-0 ml-4">UUID: {invoice.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
