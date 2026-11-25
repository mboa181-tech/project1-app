"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Invoice } from "@/lib/types";
import { initialInvoices } from "@/lib/mock-data";
import { useLanguage } from "@/context/LanguageContext";
import { formatRupiah, terbilangRupiah } from "@/lib/format-currency";
import {
  CreditCard,
  Building2,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Printer,
  Copy,
  Check,
  FileText,
  AlertCircle,
  Sparkles,
  Globe,
  Calendar,
  Clock,
  ExternalLink,
  ChevronRight,
  Share2,
} from "lucide-react";

const studioPhoto =
  "https://cdn.21st.dev/assets/mirror/ea/ea9270b3b7246283219ac52fa77a1213e9d1efb285d76348d3620609ba6cefa7.jpg";

export default function PublicPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params?.id as string;
  const { t, lang, toggleLang } = useLanguage();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<"card" | "va" | "qris">("card");
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("389");
  const [cardName, setCardName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [copiedVA, setCopiedVA] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "document">("summary");
  const [settlementTime, setSettlementTime] = useState("");

  useEffect(() => {
    setSettlementTime(
      new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }) +
        ", " +
        new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) +
        " WIB"
    );
  }, []);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const res = await fetch("/api/invoices");
        if (res.ok) {
          const data = await res.json();
          const found = data.invoices?.find(
            (inv: Invoice) =>
              inv.id.toLowerCase() === invoiceId?.toLowerCase() ||
              inv.invoiceNumber.toLowerCase() === invoiceId?.toLowerCase()
          );
          if (found) {
            setInvoice(found);
            setCardName(found.clientName);
            setLoading(false);
            return;
          }
        }
      } catch (e) {}

      const fallback = initialInvoices.find(
        (inv) =>
          inv.id.toLowerCase() === invoiceId?.toLowerCase() ||
          inv.invoiceNumber.toLowerCase() === invoiceId?.toLowerCase()
      );
      if (fallback) {
        setInvoice(fallback);
        setCardName(fallback.clientName);
      }
      setLoading(false);
    }

    if (invoiceId) fetchInvoice();
  }, [invoiceId]);

  const handleCopyVA = () => {
    navigator.clipboard.writeText("8802910239182019");
    setCopiedVA(true);
    setTimeout(() => setCopiedVA(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    setProcessing(true);

    try {
      await fetch("/api/invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: invoice.id, status: "PAID" }),
      });
    } catch (err) {
      console.warn("Offline mock status update:", err);
    }

    setTimeout(() => {
      setProcessing(false);
      setPaymentSuccess(true);
      setInvoice((prev) => (prev ? { ...prev, status: "PAID" } : null));
    }, 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-[var(--gd-ink)] font-['Manrope_Variable',Manrope,sans-serif]">
        <img
          src={studioPhoto}
          alt=""
          aria-hidden="true"
          className="fixed inset-0 w-full h-full object-cover object-center pointer-events-none -z-20 filter sepia-[.22] saturate-[.78] brightness-[.86] dark:brightness-[.58]"
        />
        <div className="w-10 h-10 border-3 border-[var(--gd-teal)] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-bold text-[var(--gd-muted)]">Memuat sesi pembayaran aman...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-[var(--gd-ink)] font-['Manrope_Variable',Manrope,sans-serif]">
        <img
          src={studioPhoto}
          alt=""
          aria-hidden="true"
          className="fixed inset-0 w-full h-full object-cover object-center pointer-events-none -z-20 filter sepia-[.22] saturate-[.78] brightness-[.86] dark:brightness-[.58]"
        />
        <div className="max-w-md w-full p-8 rounded-[28px] glass-modal text-center space-y-4 shadow-2xl">
          <AlertCircle className="w-12 h-12 text-[var(--gd-coral)] mx-auto" />
          <h2 className="text-xl font-black">
            {lang === "id" ? "Tagihan Tidak Ditemukan" : "Invoice Not Found"}
          </h2>
          <p className="text-xs text-[var(--gd-muted)] leading-relaxed">
            {lang === "id"
              ? `Referensi tagihan ${invoiceId} tidak ditemukan atau telah kedaluwarsa.`
              : `The invoice reference ${invoiceId} could not be found or has expired.`}
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="glass-btn-primary px-5 py-2 text-xs"
          >
            {t("payGoDashboard")}
          </button>
        </div>
      </div>
    );
  }

  const isAlreadyPaid = invoice.status === "PAID";
  const receiptNumber = `REC-${invoice.invoiceNumber.replace("INV-", "")}`;
  const gatewayTrxId = `TRX-FLW-${invoice.invoiceNumber.replace("INV-2026-", "")}-${invoice.id.slice(-4).toUpperCase()}`;

  return (
    <div className="min-h-screen text-[var(--gd-ink)] antialiased flex flex-col justify-between selection:bg-[var(--gd-focus)] selection:text-white font-['Manrope_Variable',Manrope,sans-serif] relative overflow-x-hidden">
      {/* Background Image & Warm Gradient for On-Screen View */}
      <img
        src={studioPhoto}
        alt=""
        aria-hidden="true"
        className="fixed inset-0 w-full h-full object-cover object-center pointer-events-none -z-20 filter sepia-[.22] saturate-[.78] brightness-[.86] dark:brightness-[.58] print:hidden"
      />
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none -z-10 bg-gradient-to-tr from-[#493025]/45 via-transparent to-[#a2653f]/30 print:hidden"
      />

      {/* Top Security Banner (Hidden when printed) */}
      <header className="sticky top-4 z-40 max-w-5xl w-[calc(100%-32px)] mx-auto glass-modal rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs shadow-lg print:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="glass-icon-btn mr-1.5"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2.5 font-black tracking-tight">
            <span className="w-7 h-7 rounded-full bg-[var(--gd-pick)] text-[var(--gd-pick-ink)] flex items-center justify-center font-bold text-xs shadow-sm">
              <FileText className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs sm:text-sm font-extrabold">{t("payGateway")}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleLang}
            className="glass-btn-secondary px-2.5 py-1 text-[11px] font-bold"
          >
            <Globe className="w-3 h-3 text-[var(--gd-muted)]" />
            <span>{lang === "en" ? "EN" : "ID"}</span>
          </button>

          <div className="flex items-center gap-1.5 text-[var(--gd-teal)] bg-[color-mix(in_srgb,var(--gd-teal)_15%,transparent)] border border-[color-mix(in_srgb,var(--gd-teal)_35%,transparent)] px-3 py-1 rounded-full text-[11px] font-extrabold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">256-Bit SSL Enkripsi Bank</span>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 1. ON-SCREEN INTERACTIVE VIEW (Web UI only, hidden on print)   */}
      {/* ============================================================== */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center print:hidden">
        {paymentSuccess || isAlreadyPaid ? (
          <div className="w-full max-w-2xl space-y-6 animate-fade-in my-4">
            {/* Live Verification Hero Card */}
            <div className="p-6 sm:p-8 rounded-[32px] glass-modal shadow-2xl space-y-6 relative overflow-hidden">
              {/* Radial glow background effect */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-[var(--gd-teal)]/15 rounded-full blur-3xl pointer-events-none -z-10" />

              {/* Status Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 text-center sm:text-left">
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-[var(--gd-teal)] opacity-35" />
                    <div className="w-14 h-14 rounded-full bg-[color-mix(in_srgb,var(--gd-teal)_22%,var(--gd-inner))] text-[var(--gd-teal)] border-2 border-[var(--gd-teal)] flex items-center justify-center shadow-lg relative">
                      <CheckCircle2 className="w-8 h-8 stroke-[2.75]" />
                    </div>
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10.5px] font-extrabold bg-[color-mix(in_srgb,var(--gd-teal)_18%,transparent)] text-[var(--gd-teal)] border border-[color-mix(in_srgb,var(--gd-teal)_35%,transparent)] mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gd-teal)] animate-pulse" />
                      PEMBAYARAN LUNAS & TERVERIFIKASI
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-[var(--gd-ink)] tracking-tight">
                      Faktur #{invoice.invoiceNumber}
                    </h1>
                  </div>
                </div>

                <div className="text-center sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-[var(--gd-muted)] tracking-wider block">
                    Total Dana Dilunasi
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-[var(--gd-teal)] mt-0.5">
                    {formatRupiah(invoice.total)}
                  </div>
                </div>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center justify-center p-1 rounded-full glass-panel-sub max-w-sm mx-auto text-xs font-extrabold">
                <button
                  type="button"
                  onClick={() => setActiveTab("summary")}
                  className={`flex-1 py-1.5 px-3 rounded-full transition-all cursor-pointer ${
                    activeTab === "summary"
                      ? "bg-[var(--gd-primary)] text-[var(--gd-primary-ink)] shadow-md"
                      : "text-[var(--gd-muted)] hover:text-[var(--gd-ink)]"
                  }`}
                >
                  Ringkasan Transaksi
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("document")}
                  className={`flex-1 py-1.5 px-3 rounded-full transition-all cursor-pointer ${
                    activeTab === "document"
                      ? "bg-[var(--gd-primary)] text-[var(--gd-primary-ink)] shadow-md"
                      : "text-[var(--gd-muted)] hover:text-[var(--gd-ink)]"
                  }`}
                >
                  Pratinjau Kuitansi A4
                </button>
              </div>

              {activeTab === "summary" ? (
                <>
                  {/* Transaction Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl glass-panel-sub text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-[var(--gd-muted)] block uppercase">
                        No. Kuitansi
                      </span>
                      <span className="font-mono font-extrabold text-[var(--gd-ink)] text-xs sm:text-sm">
                        {receiptNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[var(--gd-muted)] block uppercase">
                        Klien Pembayar
                      </span>
                      <span className="font-bold text-[var(--gd-ink)] truncate block">
                        {invoice.clientName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[var(--gd-muted)] block uppercase">
                        Jalur Kliring
                      </span>
                      <span className="font-bold text-[var(--gd-ink)] truncate block">
                        BCA VA / BI-FAST
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[var(--gd-muted)] block uppercase">
                        Waktu Penyelesaian
                      </span>
                      <span className="font-mono text-[11px] text-[var(--gd-ink)] block">
                        {settlementTime.split(",")[0]}
                      </span>
                    </div>
                  </div>

                  {/* Line Items List */}
                  <div className="p-4 rounded-2xl glass-panel-sub space-y-3">
                    <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[var(--gd-muted)] block">
                      Rincian Item yang Dilunasi
                    </span>
                    <div className="divide-y divide-[var(--gd-line)]">
                      {invoice.items.map((item) => (
                        <div key={item.id} className="py-2.5 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-[var(--gd-ink)] block">
                              {item.description}
                            </span>
                            <span className="text-[11px] text-[var(--gd-muted)]">
                              {item.quantity} unit × {formatRupiah(item.rate)}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-[var(--gd-ink)]">
                            {formatRupiah(item.amount)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-[var(--gd-line)] space-y-1.5 text-xs">
                      <div className="flex justify-between text-[var(--gd-muted)]">
                        <span>Subtotal Tagihan</span>
                        <span className="font-mono font-bold text-[var(--gd-ink)]">
                          {formatRupiah(invoice.subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[var(--gd-muted)]">
                        <span>PPN (11%)</span>
                        <span className="font-mono">{formatRupiah(invoice.taxAmount)}</span>
                      </div>
                      <div className="flex justify-between text-[var(--gd-muted)]">
                        <span>Biaya Administrasi Gateway</span>
                        <span className="font-mono text-[var(--gd-teal)] font-bold">GRATIS (Rp 0)</span>
                      </div>
                      <div className="flex justify-between font-black text-base text-[var(--gd-ink)] pt-2 border-t border-[var(--gd-line)]">
                        <span>Total Pelunasan</span>
                        <span className="font-mono font-black text-[var(--gd-teal)] text-lg">
                          {formatRupiah(invoice.total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Terbilang Box */}
                  <div className="p-3.5 rounded-xl bg-[color-mix(in_srgb,var(--gd-teal)_8%,transparent)] border border-[color-mix(in_srgb,var(--gd-teal)_25%,transparent)] text-xs">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--gd-teal)] block mb-0.5">
                      Jumlah Terbilang (Legal Terbilang)
                    </span>
                    <p className="font-extrabold text-[var(--gd-ink)] italic">
                      &quot;{terbilangRupiah(invoice.total)}&quot;
                    </p>
                  </div>
                </>
              ) : (
                /* Live Preview of the Official Stamped A4 Document */
                <div className="p-6 rounded-2xl bg-white text-slate-900 border border-slate-300 shadow-xl space-y-5 text-xs">
                  <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                          FD
                        </div>
                        <strong className="text-sm font-black tracking-tight text-slate-900">
                          PT FLOWDESK SOLUSI NUSANTARA
                        </strong>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Gedung BEI Tower 2 Lt. 18, SCBD Jakarta 12190<br />
                        NPWP: 01.345.678.9-021.000 • billing@flowdesk.app
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full inline-block">
                        BUKTI LUNAS RESMI
                      </span>
                      <p className="font-mono text-xs font-black text-slate-800 mt-1">
                        {receiptNumber}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-[11px]">
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[9px]">
                        Ditagihkan Kepada
                      </span>
                      <strong className="text-slate-800 block">{invoice.clientName}</strong>
                      <span className="text-slate-500">{invoice.clientEmail}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 font-bold block uppercase text-[9px]">
                        Faktur Terkait & Waktu Bayar
                      </span>
                      <strong className="text-slate-800 block">#{invoice.invoiceNumber}</strong>
                      <span className="text-slate-500">{settlementTime}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Total Dana Diterima Secara Sah
                    </span>
                    <strong className="text-xl font-black text-slate-900 font-mono block">
                      {formatRupiah(invoice.total)}
                    </strong>
                    <span className="text-[10px] italic text-slate-500 block mt-1">
                      &quot;{terbilangRupiah(invoice.total)}&quot;
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                    <span>Otentikasi Digital: {gatewayTrxId}</span>
                    <span className="text-emerald-600 font-bold">Sah demi hukum (UU ITE)</span>
                  </div>
                </div>
              )}

              {/* Action Buttons Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 glass-btn-primary py-3.5 text-xs font-black shadow-lg"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Simpan PDF Resmi (A4)</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="glass-btn-secondary py-3.5 px-4 text-xs font-bold"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[var(--gd-teal)]" />
                      <span className="text-[var(--gd-teal)]">Tautan Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-[var(--gd-muted)]" />
                      <span>Salin Bukti</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="glass-btn-secondary py-3.5 px-4 text-xs font-bold"
                >
                  <span>Ke Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Payment Processing Form */
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start my-4">
            {/* Left Column: Summary (5 cols) */}
            <div className="lg:col-span-5 p-6 sm:p-7 rounded-[32px] glass-modal space-y-6 shadow-xl">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--gd-muted)]">
                  {t("payInvoiceFrom")}
                </span>
                <h3 className="text-xl font-black text-[var(--gd-ink)] mt-0.5">FlowDesk Inc.</h3>
                <p className="text-xs text-[var(--gd-muted)]">Ref: #{invoice.invoiceNumber}</p>
              </div>

              <div className="py-4 border-y border-[var(--gd-line)] space-y-3">
                <span className="text-[11px] font-extrabold text-[var(--gd-muted)] block uppercase tracking-wider">
                  {t("modalLineItems")}
                </span>
                {invoice.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs gap-3">
                    <span className="text-[var(--gd-ink)] font-semibold">
                      {item.description}{" "}
                      <span className="text-[var(--gd-muted)] font-mono">×{item.quantity}</span>
                    </span>
                    <span className="font-mono text-[var(--gd-ink)] font-bold shrink-0">
                      {formatRupiah(item.amount)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-[var(--gd-muted)]">
                  <span>{t("modalSubtotal")}</span>
                  <span className="font-mono font-bold">{formatRupiah(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[var(--gd-muted)]">
                  <span>{t("modalTax")} ({invoice.taxRate}%)</span>
                  <span className="font-mono">{formatRupiah(invoice.taxAmount)}</span>
                </div>
                <div className="flex justify-between font-black text-lg text-[var(--gd-ink)] pt-2 border-t border-[var(--gd-line)]">
                  <span>{t("modalGrandTotal")}</span>
                  <span className="font-mono font-extrabold text-[var(--gd-teal)]">
                    {formatRupiah(invoice.total)}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl glass-panel-sub text-[11px] text-[var(--gd-muted)] flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-[var(--gd-teal)] shrink-0" />
                <span>Protected by FlowDesk Instant Settlement Engine.</span>
              </div>
            </div>

            {/* Right Column: Payment Methods (7 cols) */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-[32px] glass-modal space-y-6 shadow-xl">
              <div>
                <h2 className="text-xl font-black text-[var(--gd-ink)]">{t("paySelectMethod")}</h2>
                <p className="text-xs text-[var(--gd-muted)] mt-0.5">
                  {lang === "id"
                    ? "Pilih opsi metode pelunasan tagihan Anda dengan aman"
                    : "Choose your preferred settlement rail to finalize this invoice"}
                </p>
              </div>

              {/* Method Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl glass-panel-sub">
                <button
                  type="button"
                  onClick={() => setSelectedMethod("card")}
                  className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedMethod === "card"
                      ? "bg-[var(--gd-primary)] text-[var(--gd-primary-ink)] shadow-md"
                      : "text-[var(--gd-muted)] hover:text-[var(--gd-ink)]"
                  }`}
                >
                  <CreditCard className="w-4 h-4 mb-1" />
                  <span>{t("payCard")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMethod("va")}
                  className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedMethod === "va"
                      ? "bg-[var(--gd-primary)] text-[var(--gd-primary-ink)] shadow-md"
                      : "text-[var(--gd-muted)] hover:text-[var(--gd-ink)]"
                  }`}
                >
                  <Building2 className="w-4 h-4 mb-1" />
                  <span>{t("payVA")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMethod("qris")}
                  className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedMethod === "qris"
                      ? "bg-[var(--gd-primary)] text-[var(--gd-primary-ink)] shadow-md"
                      : "text-[var(--gd-muted)] hover:text-[var(--gd-ink)]"
                  }`}
                >
                  <QrCode className="w-4 h-4 mb-1" />
                  <span>{t("payQRIS")}</span>
                </button>
              </div>

              {selectedMethod === "card" && (
                <form onSubmit={handleProcessPayment} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-[var(--gd-muted)] uppercase tracking-wider mb-1">
                      {t("payCardName")}
                    </label>
                    <input
                      type="text"
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full glass-input px-3.5 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-[var(--gd-muted)] uppercase tracking-wider mb-1">
                      {t("payCardNumber")}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full glass-input px-3.5 py-2.5 text-sm font-mono pl-10"
                      />
                      <CreditCard className="w-4 h-4 text-[var(--gd-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold text-[var(--gd-muted)] uppercase tracking-wider mb-1">
                        {t("payCardExpiry")}
                      </label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full glass-input px-3.5 py-2.5 text-sm font-mono text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-[var(--gd-muted)] uppercase tracking-wider mb-1">
                        {t("payCardCvc")}
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full glass-input px-3.5 py-2.5 text-sm font-mono text-center"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full glass-btn-primary py-3.5 text-sm font-extrabold flex items-center justify-center gap-2 mt-4"
                  >
                    {processing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>{t("payProcessing")}</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>{t("payBtnPay")} {formatRupiah(invoice.total)}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {selectedMethod === "va" && (
                <div className="space-y-5">
                  <div className="p-4 sm:p-5 rounded-2xl glass-panel-sub space-y-3">
                    <span className="text-xs text-[var(--gd-muted)] font-bold">
                      {lang === "id"
                        ? "Nomor Virtual Account (BCA / Mandiri / Transfer Bank):"
                        : "Virtual Account Number (BCA / Mandiri / Wire):"}
                    </span>
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--gd-inner)] border border-[var(--gd-line)] font-mono text-base font-black text-[var(--gd-ink)]">
                      <span>8802 9102 3918 2019</span>
                      <button
                        type="button"
                        onClick={handleCopyVA}
                        className="glass-btn-secondary px-3 py-1 text-xs font-bold"
                      >
                        {copiedVA ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[var(--gd-teal)]" />
                            <span className="text-[var(--gd-teal)]">
                              {lang === "id" ? "Disalin!" : "Copied!"}
                            </span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{lang === "id" ? "Salin" : "Copy"}</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-[var(--gd-muted)] leading-relaxed">
                      {lang === "id"
                        ? `Transfer tepat sebesar ${formatRupiah(invoice.total)}. Pembayaran Anda akan diverifikasi otomatis.`
                        : `Transfer exact amount ${formatRupiah(invoice.total)}. Your payment will be verified automatically.`}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleProcessPayment}
                    disabled={processing}
                    className="w-full glass-btn-teal py-3.5 text-sm font-extrabold flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>
                      {lang === "id"
                        ? "Simulasikan Pembayaran VA Berhasil"
                        : "Simulate VA Payment Receipt"}
                    </span>
                  </button>
                </div>
              )}

              {selectedMethod === "qris" && (
                <div className="space-y-4 text-center">
                  <div className="p-6 rounded-3xl glass-panel-sub inline-block mx-auto shadow-xl">
                    <div className="w-44 h-44 bg-white flex items-center justify-center rounded-2xl border border-[var(--gd-line)] p-3">
                      <QrCode className="w-36 h-36 text-black" />
                    </div>
                    <span className="text-[11px] font-extrabold text-[var(--gd-ink)] uppercase tracking-wider block mt-3">
                      {lang === "id"
                        ? "Scan QRIS dengan Aplikasi Mobile Banking / E-Wallet"
                        : "Scan QRIS with Banking App"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleProcessPayment}
                    disabled={processing}
                    className="w-full glass-btn-teal py-3.5 text-sm font-extrabold flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>
                      {lang === "id"
                        ? "Simulasikan Scan & Bayar QRIS"
                        : "Simulate Scan & Pay QRIS"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer on Web View */}
      <footer className="relative z-10 border-t border-[var(--gd-line)] py-4 text-center text-xs text-[var(--gd-muted)] print:hidden">
        FlowDesk Pay • Production Payment Gateway Simulator • 2026
      </footer>

      {/* ========================================================================= */}
      {/* 2. DEDICATED OFFICIAL A4 PRINTABLE DOCUMENT (Visible ONLY when printing) */}
      {/* ========================================================================= */}
      <div className="hidden print:block printable-document font-['Manrope_Variable',Manrope,sans-serif] text-slate-900 bg-white p-6 max-w-[210mm] mx-auto space-y-6">
        {/* Official Letterhead */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl border-2 border-slate-950">
              FD
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-950 tracking-tight leading-none mb-1">
                PT FLOWDESK SOLUSI NUSANTARA
              </h1>
              <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                Gedung Bursa Efek Indonesia, Tower 2 Lt. 18, SCBD Kav. 52-53<br />
                Jl. Jend. Sudirman, Senayan, Kebayoran Baru, Jakarta Selatan 12190<br />
                Telp: (021) 5088-7700 • Email: billing@flowdesk.app • Web: https://flowdesk.app
              </p>
            </div>
          </div>

          <div className="text-right text-[10px] text-slate-600 border border-slate-300 rounded-lg p-2.5 bg-slate-50 min-w-[220px]">
            <div className="flex justify-between gap-2">
              <span className="font-bold">NPWP:</span>
              <span className="font-mono font-bold text-slate-900">01.345.678.9-021.000</span>
            </div>
            <div className="flex justify-between gap-2 mt-0.5">
              <span className="font-bold">NIB:</span>
              <span className="font-mono text-slate-900">1209000182938</span>
            </div>
            <div className="flex justify-between gap-2 mt-0.5">
              <span className="font-bold">Izin BI/OJK:</span>
              <span className="font-mono text-slate-900">BI/24/098/DKSP/Srt/B</span>
            </div>
          </div>
        </div>

        {/* Document Title Banner */}
        <div className="flex justify-between items-center bg-slate-100 p-4 rounded-xl border border-slate-300">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">
              SURAT TANDA TERIMA PEMBAYARAN RESMI ELEKTRONIK
            </span>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              OFFICIAL PAYMENT RECEIPT & TAX CONFIRMATION
            </h2>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Nomor Kuitansi</span>
            <span className="font-mono font-black text-base text-slate-950 block">
              {receiptNumber}
            </span>
          </div>
        </div>

        {/* Two-Column Parties & Metadata */}
        <div className="grid grid-cols-2 gap-6 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
              DITAGIHKAN KEPADA (BUYER / CLIENT)
            </span>
            <strong className="text-sm font-black text-slate-900 block">
              {invoice.clientName}
            </strong>
            <p className="text-slate-600 leading-snug">
              Surel Resmi: <strong>{invoice.clientEmail}</strong><br />
              ID Registrasi Akun: <span className="font-mono text-[11px]">CLT-{invoice.id.toUpperCase()}</span><br />
              Status Domisili: Wajib Pajak Badan / Korporasi Terdaftar
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
              RINCIAN TRANSAKSI & FAKTUR
            </span>
            <div className="grid grid-cols-2 gap-y-1 text-slate-700">
              <span className="text-slate-500">Ref. Faktur Asli:</span>
              <span className="font-mono font-bold text-slate-900">#{invoice.invoiceNumber}</span>
              <span className="text-slate-500">Tanggal Faktur:</span>
              <span className="font-bold text-slate-900">{invoice.issueDate}</span>
              <span className="text-slate-500">Tanggal Pelunasan:</span>
              <span className="font-bold text-emerald-700">{settlementTime.split(",")[0]}</span>
              <span className="text-slate-500">Metode Pembayaran:</span>
              <span className="font-bold text-slate-900">BCA Virtual Account / BI-SNAP</span>
              <span className="text-slate-500">Status Pembayaran:</span>
              <span className="font-black text-emerald-700 uppercase">LUNAS & DIVERIFIKASI</span>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-slate-300 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3 w-10 text-center">No.</th>
                <th className="py-2.5 px-4">Deskripsi Layanan / Pekerjaan</th>
                <th className="py-2.5 px-3 text-center w-16">Kuantitas</th>
                <th className="py-2.5 px-4 text-right w-36">Harga Satuan</th>
                <th className="py-2.5 px-4 text-right w-40">Total (IDR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.items.map((item, idx) => (
                <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="py-3 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{item.description}</td>
                  <td className="py-3 px-3 text-center text-slate-700 font-mono">{item.quantity}</td>
                  <td className="py-3 px-4 text-right text-slate-700 font-mono">{formatRupiah(item.rate)}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-950 font-mono">{formatRupiah(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculations & Terbilang Block */}
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Terbilang & Catatan (7 cols) */}
          <div className="col-span-7 space-y-3">
            <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-50">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-0.5">
                JUMLAH TERBILANG RESMI (LEGAL SUM IN WORDS):
              </span>
              <p className="font-extrabold text-slate-900 text-xs italic leading-snug">
                &quot;{terbilangRupiah(invoice.total)}&quot;
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 text-[10.5px] text-slate-600 leading-relaxed">
              <strong className="text-slate-800 block mb-0.5">Catatan & Ketentuan Pembayaran:</strong>
              Pembayaran telah diterima secara penuh melalui gateway kliring instan Bank Central Asia (BCA) dan telah dikreditkan ke rekening giro resmi PT FlowDesk Solusi Nusantara. Bukti ini merupakan tanda pelunasan final yang tidak dapat dibatalkan.
            </div>
          </div>

          {/* Totals Summary Table (5 cols) */}
          <div className="col-span-5 border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
            <div className="p-3.5 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Tagihan:</span>
                <span className="font-mono font-bold text-slate-900">{formatRupiah(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>PPN (11% UU HPP):</span>
                <span className="font-mono font-semibold text-slate-900">{formatRupiah(invoice.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Bea Layanan Kliring:</span>
                <span className="font-mono font-semibold text-emerald-700">Rp 0 (BEBAS BIAYA)</span>
              </div>
              <div className="flex justify-between font-black text-sm text-slate-950 pt-2.5 border-t-2 border-slate-300">
                <span>TOTAL PELUNASAN:</span>
                <span className="font-mono font-black text-emerald-800 text-base">
                  {formatRupiah(invoice.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Official Stamp & Signatory Section */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t-2 border-slate-900 items-end">
          {/* Authentic Double-Ring Stamp */}
          <div className="flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-[3px] border-emerald-700 text-emerald-700 p-1 flex items-center justify-center text-center rotate-[-8deg] select-none shadow-xs">
              <div className="w-full h-full rounded-full border border-dashed border-emerald-600 flex flex-col items-center justify-center p-1">
                <span className="text-[7.5px] font-black tracking-widest uppercase block leading-tight">
                  PT FLOWDESK SOLUSI
                </span>
                <span className="text-sm font-black tracking-widest uppercase my-0.5 text-emerald-800">
                  ★ LUNAS ★
                </span>
                <span className="text-[7px] font-bold block uppercase leading-tight font-mono">
                  {invoice.dueDate.split("-")[0]} · VERIFIED
                </span>
                <span className="text-[6.5px] opacity-80 mt-0.5">SETTLED IN FULL</span>
              </div>
            </div>
          </div>

          {/* QR Code Verification */}
          <div className="text-center space-y-1">
            <div className="w-24 h-24 bg-white border-2 border-slate-800 rounded-xl mx-auto p-1.5 flex items-center justify-center">
              <QrCode className="w-20 h-20 text-slate-950" />
            </div>
            <span className="text-[8.5px] font-extrabold uppercase text-slate-500 block">
              Pindai untuk Verifikasi Keabsahan Dokumen
            </span>
            <span className="text-[8px] font-mono text-slate-400 block">
              flowdesk.app/verify/{invoice.id}
            </span>
          </div>

          {/* Digital Signature Box */}
          <div className="text-right space-y-1 text-xs">
            <span className="text-[10px] text-slate-500 block">Jakarta, {settlementTime.split(",")[0]}</span>
            <span className="text-[11px] font-bold text-slate-800 block">
              PT FLOWDESK SOLUSI NUSANTARA
            </span>
            <div className="py-2">
              <div className="inline-block p-2 rounded-lg border border-emerald-300 bg-emerald-50/80 text-left font-mono text-[9px] text-emerald-800 leading-tight">
                <span className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                  E-SIGNATURE TERVERIFIKASI
                </span>
                <span>Digest: {gatewayTrxId}</span>
              </div>
            </div>
            <strong className="block text-slate-900 text-xs font-black underline">
              HENDRA WIDJAJA, S.E., M.B.A.
            </strong>
            <span className="text-[10px] text-slate-500 block">Direktur Keuangan & Perbendaharaan</span>
          </div>
        </div>

        {/* Legal Disclaimer Footer */}
        <div className="pt-3 border-t border-slate-200 text-[8.5px] text-slate-500 flex justify-between items-center leading-relaxed">
          <span>
            Bukti pembayaran elektronik ini sah dan diakui secara hukum berdasarkan UU Republik Indonesia No. 11 Tahun 2008 tentang ITE Pasal 5 ayat 1. Diterbitkan otomatis oleh sistem perbankan terintegrasi FlowDesk.
          </span>
          <span className="font-mono text-slate-400 ml-4 shrink-0">Halaman 1 dari 1</span>
        </div>
      </div>
    </div>
  );
}
