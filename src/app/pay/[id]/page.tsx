"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Invoice } from "@/lib/types";
import { initialInvoices } from "@/lib/mock-data";
import { useLanguage } from "@/context/LanguageContext";
import { formatRupiah } from "@/lib/format-currency";
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
    }, 1500);
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

  return (
    <div className="min-h-screen text-[var(--gd-ink)] antialiased flex flex-col justify-between selection:bg-[var(--gd-focus)] selection:text-white font-['Manrope_Variable',Manrope,sans-serif] relative overflow-hidden">
      {/* Background Image & Warm Gradient */}
      <img
        src={studioPhoto}
        alt=""
        aria-hidden="true"
        className="fixed inset-0 w-full h-full object-cover object-center pointer-events-none -z-20 filter sepia-[.22] saturate-[.78] brightness-[.86] dark:brightness-[.58]"
      />
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none -z-10 bg-gradient-to-tr from-[#493025]/45 via-transparent to-[#a2653f]/30"
      />

      {/* Top Security Banner */}
      <header className="sticky top-4 z-40 max-w-5xl w-[calc(100%-32px)] mx-auto glass-modal rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs shadow-lg">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="glass-icon-btn mr-1.5"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 font-black tracking-tight">
            <span className="w-7 h-7 rounded-full bg-[var(--gd-pick)] text-[var(--gd-pick-ink)] flex items-center justify-center font-bold text-xs shadow-sm">
              <FileText className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs sm:text-sm">{t("payGateway")}</span>
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
            <span className="hidden sm:inline">{t("payEncrypted")}</span>
          </div>
        </div>
      </header>

      {/* Main Checkout Area */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center">
        {paymentSuccess || isAlreadyPaid ? (
          <div className="w-full max-w-lg mx-auto p-8 sm:p-10 rounded-[32px] glass-modal shadow-2xl text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[color-mix(in_srgb,var(--gd-teal)_20%,transparent)] text-[var(--gd-teal)] border border-[color-mix(in_srgb,var(--gd-teal)_40%,transparent)] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-[var(--gd-teal)] bg-[color-mix(in_srgb,var(--gd-teal)_15%,transparent)] px-3 py-1 rounded-full border border-[color-mix(in_srgb,var(--gd-teal)_35%,transparent)]">
                {t("paySuccessTitle")}
              </span>
              <h2 className="text-3xl font-black text-[var(--gd-ink)] mt-3.5 font-mono">
                {formatRupiah(invoice.total)}
              </h2>
              <p className="text-xs text-[var(--gd-muted)] mt-1.5">
                {t("paySuccessMsg")} <strong>#{invoice.invoiceNumber}</strong>
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl glass-panel-sub text-left text-xs space-y-2.5">
              <div className="flex justify-between text-[var(--gd-muted)]">
                <span>{lang === "id" ? "Nomor Tanda Terima" : "Receipt Number"}</span>
                <span className="font-mono font-bold text-[var(--gd-ink)]">
                  REC-{invoice.invoiceNumber.replace("INV-", "")}
                </span>
              </div>
              <div className="flex justify-between text-[var(--gd-muted)]">
                <span>{lang === "id" ? "Perusahaan Klien" : "Client Billed"}</span>
                <span className="text-[var(--gd-ink)] font-bold">{invoice.clientName}</span>
              </div>
              <div className="flex justify-between text-[var(--gd-muted)]">
                <span>{lang === "id" ? "Tanggal Pelunasan" : "Settlement Date"}</span>
                <span className="text-[var(--gd-ink)] font-mono">{new Date().toISOString().split("T")[0]}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 glass-btn-secondary py-3 text-xs font-bold"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t("payPrintReceipt")}</span>
              </button>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="flex-1 glass-btn-primary py-3 text-xs font-bold"
              >
                {t("payGoDashboard")}
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
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
                      {item.description} <span className="text-[var(--gd-muted)] font-mono">×{item.quantity}</span>
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

      <footer className="relative z-10 border-t border-[var(--gd-line)] py-4 text-center text-xs text-[var(--gd-muted)]">
        FlowDesk Pay • Production Payment Gateway Simulator • 2026
      </footer>
    </div>
  );
}
