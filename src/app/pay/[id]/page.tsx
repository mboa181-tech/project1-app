"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Invoice } from "@/lib/types";
import { initialInvoices } from "@/lib/mock-data";
import { useLanguage } from "@/context/LanguageContext";
import { useCompany } from "@/context/CompanyContext";
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
  Share2,
  Receipt,
  MessageCircle,
} from "lucide-react";
import { openWhatsAppInvoice } from "@/lib/whatsapp";

const studioPhoto =
  "https://cdn.21st.dev/assets/mirror/ea/ea9270b3b7246283219ac52fa77a1213e9d1efb285d76348d3620609ba6cefa7.jpg";

export default function PublicPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params?.id as string;
  const { t, lang, toggleLang } = useLanguage();
  const { companyProfile } = useCompany();

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
  const [settlementTime, setSettlementTime] = useState("");

  useEffect(() => {
    const now = new Date();
    setSettlementTime(
      now.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }) +
        ", " +
        now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) +
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
    }, 1000);
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
        <p className="text-xs font-bold text-[var(--gd-muted)]">Memuat sesi pembayaran...</p>
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

  return (
    <div className="min-h-screen text-[var(--gd-ink)] antialiased flex flex-col justify-between selection:bg-[var(--gd-focus)] selection:text-white font-['Manrope_Variable',Manrope,sans-serif] relative overflow-x-hidden">
      {/* Background for Web View */}
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

      {/* Top Security Banner (Hidden when printing) */}
      <header className="sticky top-3 sm:top-4 z-40 max-w-5xl w-[calc(100%-20px)] sm:w-[calc(100%-32px)] mx-auto glass-modal rounded-full px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between text-xs shadow-lg print:hidden">
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
          /* ================================================================= */
          /* STANDARD NOTA / DIGITAL RECEIPT (Sesuai nota standar pada umumnya) */
          /* ================================================================= */
          <div className="w-full max-w-xl animate-fade-in my-4">
            <div className="p-6 sm:p-8 rounded-[28px] glass-modal shadow-2xl space-y-6 relative">
              {/* Header Nota */}
              <div className="flex items-center justify-between pb-5 border-b border-[var(--gd-line)]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[color-mix(in_srgb,var(--gd-teal)_18%,var(--gd-inner))] text-[var(--gd-teal)] border border-[color-mix(in_srgb,var(--gd-teal)_35%,transparent)] flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-[var(--gd-ink)] leading-tight">
                      Bukti Pembayaran
                    </h2>
                    <p className="text-[11px] text-[var(--gd-muted)]">
                      Transaksi Pelunasan Berhasil
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold bg-[color-mix(in_srgb,var(--gd-teal)_16%,transparent)] text-[var(--gd-teal)] border border-[color-mix(in_srgb,var(--gd-teal)_35%,transparent)]">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    LUNAS
                  </span>
                </div>
              </div>

              {/* Total Nominal Bayar */}
              <div className="text-center py-2">
                <span className="text-[11px] font-bold text-[var(--gd-muted)] uppercase tracking-wider block mb-1">
                  Total Pembayaran
                </span>
                <div className="text-3xl sm:text-4xl font-black font-mono text-[var(--gd-ink)] tracking-tight">
                  {formatRupiah(invoice.total)}
                </div>
                <p className="text-[11px] font-semibold text-[var(--gd-teal)] mt-1">
                  Dibayarkan ke {companyProfile.companyName}
                </p>
              </div>

              {/* Rincian Nota Transaksi */}
              <div className="p-4 sm:p-5 rounded-2xl glass-panel-sub space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-[var(--gd-line)]/50">
                  <span className="text-[var(--gd-muted)]">No. Bukti / Kuitansi</span>
                  <span className="font-mono font-bold text-[var(--gd-ink)]">{receiptNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--gd-line)]/50">
                  <span className="text-[var(--gd-muted)]">No. Tagihan (Faktur)</span>
                  <span className="font-mono font-bold text-[var(--gd-ink)]">#{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--gd-line)]/50">
                  <span className="text-[var(--gd-muted)]">Waktu Pelunasan</span>
                  <span className="font-medium text-[var(--gd-ink)]">{settlementTime || invoice.issueDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--gd-line)]/50">
                  <span className="text-[var(--gd-muted)]">Metode Pembayaran</span>
                  <span className="font-bold text-[var(--gd-ink)]">Transfer Bank / Virtual Account</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[var(--gd-muted)]">Ditagihkan Kepada</span>
                  <span className="font-bold text-[var(--gd-ink)] text-right">{invoice.clientName}</span>
                </div>
              </div>

              {/* Rincian Item Tagihan */}
              <div className="p-4 sm:p-5 rounded-2xl glass-panel-sub space-y-3">
                <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[var(--gd-muted)] block">
                  Rincian Item
                </span>
                <div className="divide-y divide-[var(--gd-line)]/60 text-xs">
                  {invoice.items.map((item) => (
                    <div key={item.id} className="py-2.5 flex justify-between items-center gap-3">
                      <div>
                        <span className="font-bold text-[var(--gd-ink)] block">
                          {item.description}
                        </span>
                        <span className="text-[11px] text-[var(--gd-muted)] font-mono">
                          {item.quantity} × {formatRupiah(item.rate)}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-[var(--gd-ink)] shrink-0">
                        {formatRupiah(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[var(--gd-line)] space-y-1.5 text-xs">
                  <div className="flex justify-between text-[var(--gd-muted)]">
                    <span>Subtotal</span>
                    <span className="font-mono font-bold text-[var(--gd-ink)]">
                      {formatRupiah(invoice.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[var(--gd-muted)]">
                    <span>PPN (11%)</span>
                    <span className="font-mono">{formatRupiah(invoice.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-[var(--gd-ink)] pt-2 border-t border-[var(--gd-line)]">
                    <span>Total Pelunasan</span>
                    <span className="font-mono font-black text-[var(--gd-teal)] text-base">
                      {formatRupiah(invoice.total)}
                    </span>
                  </div>
                </div>

                {/* Terbilang */}
                <div className="pt-2 text-[11px] text-[var(--gd-muted)] italic leading-tight">
                  Terbilang: &quot;{terbilangRupiah(invoice.total)}&quot;
                </div>
              </div>

              {/* Action Buttons Toolbar (Web only) */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 glass-btn-primary py-3 text-xs font-black shadow-lg"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Nota / Simpan PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="glass-btn-secondary py-3 px-4 text-xs font-bold"
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
                  onClick={() => invoice && openWhatsAppInvoice(invoice, window.location.origin, lang)}
                  className="glass-btn-secondary py-3 px-4 text-xs font-bold flex items-center justify-center gap-1.5 text-[#25D366] hover:bg-[#25D366]/15 transition-colors"
                  style={{ borderColor: "rgba(37, 211, 102, 0.35)" }}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Kirim ke WA</span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="glass-btn-secondary py-3 px-4 text-xs font-bold"
                >
                  <span>Dashboard</span>
                </button>
              </div>

              <p className="text-center text-[10.5px] text-[var(--gd-muted)]">
                Bukti pembayaran sah ini diterbitkan secara otomatis oleh FlowDesk.
              </p>
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
                <h3 className="text-xl font-black text-[var(--gd-ink)] mt-0.5">{companyProfile.companyName}</h3>
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
                <span>Dilindungi oleh FlowDesk Instant Settlement Engine.</span>
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
        FlowDesk Pay • Platform Operasional Faktur & Pembayaran Digital • 2026
      </footer>

      {/* ========================================================================= */}
      {/* 2. DEDICATED OFFICIAL PRINTABLE NOTA (Visible ONLY when printing)         */}
      {/* ========================================================================= */}
      <div className="hidden print:block printable-document font-['Manrope_Variable',Manrope,sans-serif] text-slate-900 bg-white p-8 max-w-[190mm] mx-auto text-xs">
        {/* Header Nota Standar */}
        <div className="flex justify-between items-start pb-4 border-b-2 border-slate-900">
          <div>
            <h1 className="text-xl font-black text-slate-950 tracking-tight leading-none mb-1">
              {companyProfile.companyName}
            </h1>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {companyProfile.address}<br />
              Email: {companyProfile.billingEmail} • Website: {companyProfile.website}
            </p>
          </div>

          <div className="text-right">
            <h2 className="text-base font-black uppercase text-slate-900 tracking-wider">
              BUKTI PEMBAYARAN
            </h2>
            <p className="text-[11px] font-mono font-bold text-slate-700 mt-0.5">
              No: {receiptNumber}
            </p>
            <div className="mt-1">
              <span className="inline-block border border-emerald-700 text-emerald-800 bg-emerald-50 text-[10px] font-black px-2.5 py-0.5 rounded">
                LUNAS / PAID
              </span>
            </div>
          </div>
        </div>

        {/* Informasi Transaksi */}
        <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
              Diterima Dari
            </span>
            <strong className="text-slate-900 text-sm block">{invoice.clientName}</strong>
            <span className="text-slate-600 text-[11px]">{invoice.clientEmail}</span>
          </div>

          <div className="space-y-1 text-right text-[11px]">
            <div className="flex justify-end gap-2">
              <span className="text-slate-500">Ref. Faktur:</span>
              <span className="font-mono font-bold text-slate-900">#{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-end gap-2">
              <span className="text-slate-500">Tanggal Bayar:</span>
              <span className="text-slate-900 font-medium">{settlementTime || invoice.issueDate}</span>
            </div>
            <div className="flex justify-end gap-2">
              <span className="text-slate-500">Metode Bayar:</span>
              <span className="text-slate-900 font-semibold">Virtual Account / Transfer Bank</span>
            </div>
          </div>
        </div>

        {/* Tabel Rincian Item */}
        <div className="py-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-800 text-[10.5px] font-bold uppercase text-slate-700">
                <th className="py-2 px-1 w-8 text-center">No.</th>
                <th className="py-2 px-2">Deskripsi Layanan / Item</th>
                <th className="py-2 px-2 text-center w-16">Qty</th>
                <th className="py-2 px-2 text-right w-32">Harga Satuan</th>
                <th className="py-2 px-2 text-right w-36">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.items.map((item, idx) => (
                <tr key={item.id}>
                  <td className="py-2.5 px-1 text-center font-mono text-slate-500">{idx + 1}</td>
                  <td className="py-2.5 px-2 font-medium text-slate-900">{item.description}</td>
                  <td className="py-2.5 px-2 text-center font-mono text-slate-700">{item.quantity}</td>
                  <td className="py-2.5 px-2 text-right font-mono text-slate-700">{formatRupiah(item.rate)}</td>
                  <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-950">{formatRupiah(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rincian Total & Terbilang */}
        <div className="border-t-2 border-slate-800 pt-3 grid grid-cols-12 gap-4">
          <div className="col-span-7 space-y-2">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                Jumlah Terbilang:
              </span>
              <p className="text-[11px] font-bold text-slate-900 italic leading-snug">
                &quot;{terbilangRupiah(invoice.total)}&quot;
              </p>
            </div>
            <div className="text-[10px] text-slate-500 pt-3 leading-relaxed">
              Catatan: Bukti pembayaran ini sah dan diterbitkan secara elektronik oleh FlowDesk. Terima kasih atas pembayaran tepat waktu Anda.
            </div>
          </div>

          <div className="col-span-5 space-y-1.5 text-xs text-right">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono font-bold text-slate-900">{formatRupiah(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>PPN (11%):</span>
              <span className="font-mono text-slate-900">{formatRupiah(invoice.taxAmount)}</span>
            </div>
            <div className="flex justify-between font-black text-sm text-slate-950 pt-2 border-t border-slate-300">
              <span>TOTAL BAYAR:</span>
              <span className="font-mono text-base font-black text-slate-950">
                {formatRupiah(invoice.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Tanda Tangan / Pengesahan Sederhana */}
        <div className="pt-8 mt-6 border-t border-slate-200 flex justify-between items-end text-xs">
          <div className="text-slate-500 text-[10px]">
            ID Transaksi: {invoice.id.toUpperCase()} • Status: SUKSES
          </div>

          <div className="text-right space-y-6">
            <span className="text-[11px] text-slate-600 block">
              Hormat kami,
            </span>
            <div>
              <strong className="block text-slate-900 text-xs font-bold">
                {companyProfile.signatoryName}
              </strong>
              <span className="text-[10px] text-slate-500">{companyProfile.companyName}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
