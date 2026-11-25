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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-400">Loading secure checkout session...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#0e1424] border border-slate-800 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold">
            {lang === "id" ? "Tagihan Tidak Ditemukan" : "Invoice Not Found"}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {lang === "id"
              ? `Referensi tagihan ${invoiceId} tidak ditemukan atau telah kedaluwarsa.`
              : `The invoice reference ${invoiceId} could not be found or has expired.`}
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white transition-colors"
          >
            {t("payGoDashboard")}
          </button>
        </div>
      </div>
    );
  }

  const isAlreadyPaid = invoice.status === "PAID";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* Top Security Banner */}
      <header className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer mr-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> {lang === "id" ? "Kembali" : "Back"}
          </button>
          <div className="flex items-center gap-2 font-bold tracking-tight">
            <div className="h-6 w-6 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <span>{t("payGateway")}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-300 hover:text-white px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 cursor-pointer"
          >
            <Globe className="w-3 h-3 text-brand-400" />
            <span>{lang === "en" ? "🇺🇸 EN" : "🇮🇩 ID"}</span>
          </button>

          <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t("payEncrypted")}</span>
          </div>
        </div>
      </header>

      {/* Main Checkout Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center">
        {paymentSuccess || isAlreadyPaid ? (
          <div className="w-full max-w-lg mx-auto p-8 rounded-3xl bg-[#0e1424] border border-slate-800 shadow-2xl text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                {t("paySuccessTitle")}
              </span>
              <h2 className="text-2xl font-black text-white mt-3 font-mono">
                {formatRupiah(invoice.total)}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {t("paySuccessMsg")} <strong>#{invoice.invoiceNumber}</strong>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>{lang === "id" ? "Nomor Tanda Terima" : "Receipt Number"}</span>
                <span className="font-mono text-white">REC-{invoice.invoiceNumber.replace("INV-", "")}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{lang === "id" ? "Perusahaan Klien" : "Client Billed"}</span>
                <span className="text-white font-medium">{invoice.clientName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{lang === "id" ? "Tanggal Pelunasan" : "Settlement Date"}</span>
                <span className="text-white">{new Date().toISOString().split("T")[0]}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t("payPrintReceipt")}</span>
              </button>
              <button
                onClick={() => router.push("/")}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 transition-all cursor-pointer"
              >
                {t("payGoDashboard")}
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Summary (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0e1424] border border-slate-800 space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {t("payInvoiceFrom")}
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">FlowDesk Inc.</h3>
                <p className="text-xs text-slate-400">Ref: #{invoice.invoiceNumber}</p>
              </div>

              <div className="py-4 border-y border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                  {t("modalLineItems")}
                </span>
                {invoice.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs gap-3">
                    <span className="text-slate-300 font-medium">
                      {item.description} <span className="text-slate-500">×{item.quantity}</span>
                    </span>
                    <span className="font-mono text-white shrink-0">{formatRupiah(item.amount)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>{t("modalSubtotal")}</span>
                  <span className="font-mono">{formatRupiah(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>{t("modalTax")} ({invoice.taxRate}%)</span>
                  <span className="font-mono">{formatRupiah(invoice.taxAmount)}</span>
                </div>
                <div className="flex justify-between font-black text-lg text-white pt-2 border-t border-slate-800">
                  <span>{t("modalGrandTotal")}</span>
                  <span className="font-mono text-brand-400">
                    {formatRupiah(invoice.total)}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Protected by FlowDesk Sandbox Instant Settlement Engine.</span>
              </div>
            </div>

            {/* Right Column: Payment Methods (7 cols) */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#0e1424] border border-slate-800 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">{t("paySelectMethod")}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === "id"
                    ? "Pilih opsi metode pelunasan tagihan Anda dengan aman"
                    : "Choose your preferred settlement rail to finalize this invoice"}
                </p>
              </div>

              {/* Method Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-900 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedMethod("card")}
                  className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedMethod === "card"
                      ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <CreditCard className="w-4 h-4 mb-1" />
                  <span>{t("payCard")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMethod("va")}
                  className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedMethod === "va"
                      ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Building2 className="w-4 h-4 mb-1" />
                  <span>{t("payVA")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMethod("qris")}
                  className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedMethod === "qris"
                      ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <QrCode className="w-4 h-4 mb-1" />
                  <span>{t("payQRIS")}</span>
                </button>
              </div>

              {selectedMethod === "card" && (
                <form onSubmit={handleProcessPayment} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      {t("payCardName")}
                    </label>
                    <input
                      type="text"
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-900 border border-slate-800 focus:ring-2 focus:ring-brand-500 outline-none text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      {t("payCardNumber")}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-900 border border-slate-800 focus:ring-2 focus:ring-brand-500 outline-none font-mono text-white pl-10"
                      />
                      <CreditCard className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        {t("payCardExpiry")}
                      </label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-900 border border-slate-800 focus:ring-2 focus:ring-brand-500 outline-none font-mono text-white text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        {t("payCardCvc")}
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-900 border border-slate-800 focus:ring-2 focus:ring-brand-500 outline-none font-mono text-white text-center"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3.5 rounded-xl font-bold text-sm bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 mt-4"
                  >
                    {processing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <span className="text-xs text-slate-400">
                      {lang === "id" ? "Nomor Virtual Account (BCA / Mandiri / Transfer Bank):" : "Virtual Account Number (BCA / Mandiri / Wire):"}
                    </span>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-base font-bold text-brand-400">
                      <span>8802 9102 3918 2019</span>
                      <button
                        onClick={handleCopyVA}
                        className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 transition-colors cursor-pointer"
                      >
                        {copiedVA ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedVA ? (lang === "id" ? "Disalin!" : "Copied!") : (lang === "id" ? "Salin" : "Copy")}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {lang === "id"
                        ? `Transfer tepat sebesar ${formatRupiah(invoice.total)}. Pembayaran Anda akan diverifikasi otomatis.`
                        : `Transfer exact amount ${formatRupiah(invoice.total)}. Your payment will be verified automatically.`}
                    </p>
                  </div>

                  <button
                    onClick={handleProcessPayment}
                    disabled={processing}
                    className="w-full py-3.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>{lang === "id" ? "Simulasikan Pembayaran VA Berhasil" : "Simulate VA Payment Receipt"}</span>
                  </button>
                </div>
              )}

              {selectedMethod === "qris" && (
                <div className="space-y-4 text-center">
                  <div className="p-6 rounded-2xl bg-white text-slate-900 inline-block mx-auto shadow-xl">
                    <div className="w-44 h-44 bg-slate-100 flex items-center justify-center rounded-xl border border-slate-300 text-slate-400">
                      <QrCode className="w-36 h-36 text-slate-900" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mt-2">
                      {lang === "id" ? "Scan QRIS dengan Aplikasi Mobile Banking / E-Wallet" : "Scan QRIS with Banking App"}
                    </span>
                  </div>

                  <button
                    onClick={handleProcessPayment}
                    disabled={processing}
                    className="w-full py-3.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>{lang === "id" ? "Simulasikan Scan & Bayar QRIS" : "Simulate Scan & Pay QRIS"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        FlowDesk Pay • Production Payment Gateway Simulator • 2026
      </footer>
    </div>
  );
}
