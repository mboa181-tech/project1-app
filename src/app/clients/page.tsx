"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Invoice, DemoUser } from "@/lib/types";
import { initialInvoices, initialDemoUsers } from "@/lib/mock-data";
import { InvoiceModal } from "@/components/InvoiceModal";
import { InvoiceDetailModal } from "@/components/InvoiceDetailModal";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  Search,
  Building2,
  Mail,
  DollarSign,
  ArrowUpRight,
  ArrowLeft,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Moon,
  Sun,
  Globe,
  X,
  Copy,
  MessageCircle,
} from "lucide-react";
import { formatRupiah } from "@/lib/format-currency";
import { openWhatsAppInvoice } from "@/lib/whatsapp";
import Link from "next/link";

interface ClientRecord {
  id: string;
  name: string;
  email: string;
  totalBilled: number;
  totalPaid: number;
  totalPending: number;
  invoiceCount: number;
  hasOverdue: boolean;
}

const studioPhoto =
  "https://cdn.21st.dev/assets/mirror/ea/ea9270b3b7246283219ac52fa77a1213e9d1efb285d76348d3620609ba6cefa7.jpg";

export default function ClientsPage() {
  const router = useRouter();
  const { t, lang, toggleLang } = useLanguage();
  const { user, loading } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [isDark, setIsDark] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedClientForHistory, setSelectedClientForHistory] = useState<ClientRecord | null>(null);
  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState<Invoice | null>(null);
  const [defaultClientForInvoice, setDefaultClientForInvoice] = useState<{ name: string; email: string } | null>(null);

  // Auth Guard: Redirect unauthenticated visitors to login
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    if (!user) return;
    async function fetchInvoices() {
      try {
        const res = await fetch("/api/invoices");
        if (res.ok) {
          const data = await res.json();
          if (data.invoices && data.invoices.length > 0) {
            setInvoices(data.invoices);
            return;
          }
        }
      } catch (e) {}

      try {
        const local = localStorage.getItem("flowdesk_invoices_v1");
        if (local) {
          setInvoices(JSON.parse(local));
        }
      } catch {}
    }
    fetchInvoices();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateInvoice = async (newInvoice: Invoice) => {
    setInvoices((prev) => [newInvoice, ...prev]);
    try {
      localStorage.setItem("flowdesk_invoices_v1", JSON.stringify([newInvoice, ...invoices]));
    } catch {}
    showToast(`Invoice ${newInvoice.invoiceNumber} sedang disimpan...`);

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInvoice),
      });
      if (res.ok) {
        showToast(`Invoice ${newInvoice.invoiceNumber} berhasil disimpan!`);
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(`Gagal simpan: ${errData.error || "Kesalahan database"}`);
      }
    } catch (err: any) {
      console.error("API error:", err);
      showToast(`Gagal koneksi: ${err.message}`);
    }
  };

  const clientsMap: { [email: string]: ClientRecord } = {};

  invoices.forEach((inv) => {
    const key = inv.clientEmail.toLowerCase();
    if (!clientsMap[key]) {
      clientsMap[key] = {
        id: inv.id,
        name: inv.clientName,
        email: inv.clientEmail,
        totalBilled: 0,
        totalPaid: 0,
        totalPending: 0,
        invoiceCount: 0,
        hasOverdue: false,
      };
    }
    clientsMap[key].totalBilled += inv.total;
    clientsMap[key].invoiceCount += 1;
    if (inv.status === "PAID") clientsMap[key].totalPaid += inv.total;
    if (inv.status === "PENDING") clientsMap[key].totalPending += inv.total;
    if (inv.status === "OVERDUE") clientsMap[key].hasOverdue = true;
  });

  const clientsList = Object.values(clientsMap).filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalClients = Object.keys(clientsMap).length;
  const totalBilledAll = Object.values(clientsMap).reduce((s, c) => s + c.totalBilled, 0);
  const avgLtv = totalClients > 0 ? Math.round(totalBilledAll / totalClients) : 0;

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16] text-white font-['Manrope_Variable',Manrope,sans-serif]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--gd-teal)] border-t-transparent animate-spin" />
          <span className="text-xs font-semibold tracking-wide text-slate-400">
            {lang === "id" ? "Memverifikasi sesi aman..." : "Verifying secure session..."}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-[var(--gd-ink)] flex flex-col justify-between selection:bg-[var(--gd-focus)] selection:text-white font-['Manrope_Variable',Manrope,sans-serif]">
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

      {/* Floating Glass Top Bar */}
      <header className="sticky top-3 sm:top-4 z-40 max-w-7xl w-[calc(100%-20px)] sm:w-[calc(100%-32px)] mx-auto glass-modal rounded-full px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-3 shadow-xl">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <Link
            href="/"
            className="glass-icon-btn shrink-0"
            title="Kembali ke Dashboard Utama"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 shrink-0 rounded-full bg-[var(--gd-pick)] text-[var(--gd-pick-ink)] flex items-center justify-center font-bold text-xs shadow-sm">
              <Users className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <strong className="block text-xs font-black tracking-wider uppercase leading-none truncate">
                FlowDesk CRM
              </strong>
              <small className="block text-[10px] text-[var(--gd-muted)] truncate">
                Direktori Hubungan Klien
              </small>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setDefaultClientForInvoice(null);
              setIsCreateOpen(true);
            }}
            className="glass-btn-primary px-3.5 sm:px-4 py-2 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t("navNewInvoice")}</span>
          </button>

          <button
            type="button"
            onClick={toggleLang}
            className="glass-btn-secondary px-2.5 py-1.5 text-xs font-bold"
            title="Ganti Bahasa"
          >
            <Globe className="w-3.5 h-3.5 text-[var(--gd-muted)]" />
            <span>{lang === "en" ? "EN" : "ID"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDark(!isDark)}
            className="glass-icon-btn"
            title={isDark ? "Tema Terang" : "Tema Gelap"}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl glass-modal text-xs font-extrabold shadow-2xl border border-[var(--gd-rim)] animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[var(--gd-teal)]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* Title & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--gd-teal)] bg-[color-mix(in_srgb,var(--gd-teal)_15%,transparent)] border border-[color-mix(in_srgb,var(--gd-teal)_35%,transparent)] px-2.5 py-0.5 rounded-full">
                Hubungan Klien & Rekanan
              </span>
              <span className="text-xs text-[var(--gd-muted)]">• Multi-Tenant Accounts</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--gd-ink)]">
              {t("crmTitle")}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--gd-muted)] mt-1">
              {t("crmSubtitle")}
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[var(--gd-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t("crmSearchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full glass-input pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-full"
            />
          </div>
        </div>

        {/* CRM Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          <div className="p-6 rounded-3xl glass-modal shadow-lg space-y-2">
            <span className="text-xs font-bold text-[var(--gd-muted)] uppercase tracking-wider block">
              {t("crmTotalAccounts")}
            </span>
            <div className="text-3xl font-black tracking-tight text-[var(--gd-ink)] font-mono">
              {totalClients}
            </div>
            <p className="text-xs text-[var(--gd-muted)]">
              {lang === "id" ? "Kontrak korporat terdaftar" : "Active corporate entities"}
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-modal shadow-lg space-y-2">
            <span className="text-xs font-bold text-[var(--gd-muted)] uppercase tracking-wider block">
              {t("crmAvgLtv")}
            </span>
            <div className="text-3xl font-black tracking-tight text-[var(--gd-teal)] font-mono">
              {formatRupiah(avgLtv)}
            </div>
            <p className="text-xs text-[var(--gd-muted)]">
              {lang === "id" ? "Rata-rata akumulasi kontrak" : "Weighted average value"}
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-modal shadow-lg space-y-2">
            <span className="text-xs font-bold text-[var(--gd-muted)] uppercase tracking-wider block">
              {t("crmGrossInvoiced")}
            </span>
            <div className="text-3xl font-black tracking-tight text-[var(--gd-ink)] font-mono">
              {formatRupiah(totalBilledAll)}
            </div>
            <p className="text-xs text-[var(--gd-muted)]">
              {lang === "id" ? "Akumulasi nilai seluruh tagihan" : "Gross billed volume"}
            </p>
          </div>
        </div>

        {/* Client Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {clientsList.map((client) => {
            const initials = client.name
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <div
                key={client.email}
                className="group p-6 rounded-3xl glass-modal shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 space-y-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-[var(--gd-pick)] text-[var(--gd-pick-ink)] border border-[var(--gd-rim)] flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-base text-[var(--gd-ink)] truncate group-hover:text-[var(--gd-teal)] transition-colors">
                        {client.name}
                      </h3>
                      <p className="text-xs text-[var(--gd-muted)] truncate">{client.email}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full border shrink-0 ${
                      client.hasOverdue
                        ? "bg-[color-mix(in_srgb,var(--gd-coral)_18%,transparent)] text-[var(--gd-coral)] border-[color-mix(in_srgb,var(--gd-coral)_35%,transparent)]"
                        : "bg-[color-mix(in_srgb,var(--gd-teal)_18%,transparent)] text-[var(--gd-teal)] border-[color-mix(in_srgb,var(--gd-teal)_35%,transparent)]"
                    }`}
                  >
                    {client.hasOverdue ? t("crmOverdueBalance") : t("crmGoodStanding")}
                  </span>
                </div>

                <div className="p-4 rounded-2xl glass-panel-sub grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[var(--gd-muted)] block text-[10.5px]">
                      {t("crmCumulativeBilled")}
                    </span>
                    <span className="font-mono font-bold text-[var(--gd-ink)] text-xs sm:text-sm">
                      {formatRupiah(client.totalBilled)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--gd-muted)] block text-[10.5px]">
                      {t("crmPendingBalance")}
                    </span>
                    <span className="font-mono font-bold text-[var(--gd-ochre)] text-xs sm:text-sm">
                      {formatRupiah(client.totalPending)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--gd-muted)] block text-[10.5px]">
                      {t("crmSettledFunds")}
                    </span>
                    <span className="font-mono font-bold text-[var(--gd-teal)] text-xs sm:text-sm">
                      {formatRupiah(client.totalPaid)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--gd-muted)] block text-[10.5px]">
                      {t("crmTotalContracts")}
                    </span>
                    <span className="font-mono font-bold text-[var(--gd-ink)] text-xs sm:text-sm">
                      {client.invoiceCount} {lang === "id" ? "tagihan" : "invoices"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--gd-line)]/50 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedClientForHistory(client)}
                    className="text-xs font-bold text-[var(--gd-teal)] hover:underline flex items-center gap-1.5 transition-colors"
                    title="Buka riwayat dan daftar invoice klien ini"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Riwayat Tagihan ({client.invoiceCount})</span>
                    <ArrowUpRight className="w-3 h-3 opacity-70" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDefaultClientForInvoice({ name: client.name, email: client.email });
                      setIsCreateOpen(true);
                    }}
                    className="glass-btn-secondary px-3 py-1.5 text-xs font-bold flex items-center gap-1 shrink-0 hover:border-[var(--gd-teal)] transition-colors"
                    title={`Buat tagihan baru otomatis terisi untuk ${client.name}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tagih Klien</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {clientsList.length === 0 && (
          <div className="text-center py-16 glass-modal rounded-3xl p-8 max-w-md mx-auto">
            <Users className="w-12 h-12 text-[var(--gd-muted)] mx-auto mb-3 opacity-50" />
            <h3 className="font-bold text-sm text-[var(--gd-ink)]">
              Tidak ada klien yang cocok
            </h3>
            <p className="text-xs text-[var(--gd-muted)] mt-1">
              Coba cari dengan kata kunci lain atau buat tagihan baru.
            </p>
          </div>
        )}
      </main>

      {/* Modal Riwayat Tagihan Klien */}
      {selectedClientForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl glass-modal rounded-3xl p-5 sm:p-7 shadow-2xl border border-[var(--gd-rim)] max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header Profil Klien */}
            <div className="flex items-start justify-between pb-4 border-b border-[var(--gd-line)]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-[var(--gd-pick)] text-[var(--gd-pick-ink)] flex items-center justify-center font-black text-base shadow-sm shrink-0">
                  {selectedClientForHistory.name
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-extrabold text-[var(--gd-ink)] truncate">
                      {selectedClientForHistory.name}
                    </h2>
                    <span
                      className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${
                        selectedClientForHistory.hasOverdue
                          ? "bg-[color-mix(in_srgb,var(--gd-coral)_18%,transparent)] text-[var(--gd-coral)] border-[color-mix(in_srgb,var(--gd-coral)_35%,transparent)]"
                          : "bg-[color-mix(in_srgb,var(--gd-teal)_18%,transparent)] text-[var(--gd-teal)] border-[color-mix(in_srgb,var(--gd-teal)_35%,transparent)]"
                      }`}
                    >
                      {selectedClientForHistory.hasOverdue
                        ? "Perlu Tindak Lanjut"
                        : "Akun Sehat"}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--gd-muted)] truncate mt-0.5">
                    {selectedClientForHistory.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedClientForHistory(null)}
                className="glass-icon-btn p-2 rounded-full"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ringkasan Keuangan Klien */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-4 border-b border-[var(--gd-line)]">
              <div className="p-3 rounded-2xl glass-panel-sub">
                <span className="text-[10px] text-[var(--gd-muted)] block font-bold">TOTAL TAGIHAN</span>
                <span className="text-xs sm:text-sm font-black font-mono text-[var(--gd-ink)]">
                  {formatRupiah(selectedClientForHistory.totalBilled)}
                </span>
              </div>
              <div className="p-3 rounded-2xl glass-panel-sub">
                <span className="text-[10px] text-[var(--gd-muted)] block font-bold">SUDAH DITERIMA</span>
                <span className="text-xs sm:text-sm font-black font-mono text-[var(--gd-teal)]">
                  {formatRupiah(selectedClientForHistory.totalPaid)}
                </span>
              </div>
              <div className="p-3 rounded-2xl glass-panel-sub">
                <span className="text-[10px] text-[var(--gd-muted)] block font-bold">PENDING / PIUTANG</span>
                <span className="text-xs sm:text-sm font-black font-mono text-[var(--gd-ochre)]">
                  {formatRupiah(selectedClientForHistory.totalPending)}
                </span>
              </div>
              <div className="p-3 rounded-2xl glass-panel-sub">
                <span className="text-[10px] text-[var(--gd-muted)] block font-bold">JUMLAH KONTRAK</span>
                <span className="text-xs sm:text-sm font-black font-mono text-[var(--gd-ink)]">
                  {selectedClientForHistory.invoiceCount} Invoice
                </span>
              </div>
            </div>

            {/* Daftar Tagihan Klien */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
              <div className="flex items-center justify-between pb-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--gd-muted)]">
                  Daftar Faktur & Riwayat Tagihan
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setDefaultClientForInvoice({
                      name: selectedClientForHistory.name,
                      email: selectedClientForHistory.email,
                    });
                    setIsCreateOpen(true);
                  }}
                  className="glass-btn-primary px-3 py-1.5 text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Buat Tagihan Baru</span>
                </button>
              </div>

              {invoices
                .filter(
                  (inv) =>
                    inv.clientEmail.toLowerCase() ===
                    selectedClientForHistory.email.toLowerCase()
                )
                .map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3.5 sm:p-4 rounded-2xl glass-panel-sub flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[var(--gd-rim)] transition-all"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-black text-[var(--gd-ink)]">
                          {inv.invoiceNumber}
                        </strong>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            inv.status === "PAID"
                              ? "bg-[color-mix(in_srgb,var(--gd-teal)_20%,transparent)] text-[var(--gd-teal)]"
                              : inv.status === "OVERDUE"
                              ? "bg-[color-mix(in_srgb,var(--gd-coral)_20%,transparent)] text-[var(--gd-coral)]"
                              : "bg-[color-mix(in_srgb,var(--gd-ochre)_20%,transparent)] text-[var(--gd-ochre)]"
                          }`}
                        >
                          {inv.status === "PAID"
                            ? "LUNAS"
                            : inv.status === "OVERDUE"
                            ? "JATUH TEMPO"
                            : "TERTUNDA"}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--gd-muted)] mt-1">
                        Jatuh Tempo: {inv.dueDate} • {inv.items.length} item pekerjaan
                      </p>
                      <div className="text-sm font-black font-mono text-[var(--gd-ink)] mt-1.5 sm:hidden">
                        {formatRupiah(inv.total)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-end sm:self-center">
                      <div className="hidden sm:block text-right mr-2">
                        <span className="text-[10px] text-[var(--gd-muted)] block">Nominal</span>
                        <strong className="text-sm font-black font-mono text-[var(--gd-ink)]">
                          {formatRupiah(inv.total)}
                        </strong>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedInvoiceForDetail(inv)}
                        className="glass-btn-primary px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                        title="Buka Pratinjau & Cetak Nota Standar"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Lihat Nota</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openWhatsAppInvoice(inv, window.location.origin, lang)}
                        className="glass-btn-secondary px-2.5 py-1.5 text-xs font-bold text-[#25D366] hover:bg-[#25D366]/15 transition-colors"
                        style={{ borderColor: "rgba(37, 211, 102, 0.35)" }}
                        title="Kirim Tagihan via WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const link = `${window.location.origin}/pay/${inv.id}`;
                          navigator.clipboard.writeText(link);
                          showToast(`Link pembayaran ${inv.invoiceNumber} disalin!`);
                        }}
                        className="glass-btn-secondary px-2.5 py-1.5 text-xs font-bold"
                        title="Salin Link Pembayaran Klien"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Nota / Faktur (Standard Nota Style) */}
      <InvoiceDetailModal
        invoice={selectedInvoiceForDetail}
        onClose={() => setSelectedInvoiceForDetail(null)}
        onToggleStatus={async (id) => {
          const target = invoices.find((i) => i.id === id);
          if (!target) return;
          const newStatus = target.status === "PAID" ? "PENDING" : "PAID";
          const updated = invoices.map((i) =>
            i.id === id
              ? { ...i, status: newStatus as any }
              : i
          );
          setInvoices(updated);
          try {
            localStorage.setItem("flowdesk_invoices_v1", JSON.stringify(updated));
          } catch {}
          setSelectedInvoiceForDetail((prev) =>
            prev ? { ...prev, status: newStatus } : null
          );
          showToast(`Status invoice diperbarui ke ${newStatus}`);

          try {
            await fetch("/api/invoices", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id, status: newStatus }),
            });
          } catch (err) {
            console.error("Failed to sync invoice status:", err);
          }
        }}
      />

      {/* Modal Pembuatan Tagihan (Mendukung Auto-fill defaultClient) */}
      <InvoiceModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setDefaultClientForInvoice(null);
        }}
        onCreate={handleCreateInvoice}
        defaultClient={defaultClientForInvoice}
      />

      <footer className="relative z-10 py-6 text-center text-xs text-[var(--gd-muted)] mt-8">
        FlowDesk CRM • Financial Operations & Client Relationship Engine • 2026
      </footer>
    </div>
  );
}
