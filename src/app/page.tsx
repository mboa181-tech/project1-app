"use client";

import React, { useState, useEffect } from "react";
import { Invoice, DemoUser } from "@/lib/types";
import { initialInvoices, initialDemoUsers } from "@/lib/mock-data";
import { Navbar } from "@/components/Navbar";
import { StatsOverview } from "@/components/StatsOverview";
import { InvoiceTable } from "@/components/InvoiceTable";
import { InvoiceModal } from "@/components/InvoiceModal";
import { InvoiceDetailModal } from "@/components/InvoiceDetailModal";
import { useLanguage } from "@/context/LanguageContext";
import {
  Check,
  ShieldCheck,
  Zap,
  Sparkles,
  Database,
  ExternalLink,
  Github,
  Plus,
  RefreshCw,
} from "lucide-react";

export default function DashboardPage() {
  const { t, lang } = useLanguage();
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [isDark, setIsDark] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [dbSource, setDbSource] = useState<string>("loading");
  const [isLoading, setIsLoading] = useState(true);

  const currentUser = initialDemoUsers[currentUserIndex];

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    async function loadInvoices() {
      try {
        const res = await fetch("/api/invoices");
        if (res.ok) {
          const data = await res.json();
          if (data.invoices && data.invoices.length > 0) {
            setInvoices(data.invoices);
            setDbSource(data.source === "supabase" ? "Supabase PostgreSQL" : "Cloud API Persistence");
            return;
          }
        }
      } catch (err) {
        console.warn("Using offline persistent storage:", err);
      } finally {
        setIsLoading(false);
      }

      try {
        const local = localStorage.getItem("flowdesk_invoices_v1");
        if (local) {
          setInvoices(JSON.parse(local));
          setDbSource("Local Storage Backup");
        }
      } catch (e) {}
    }

    loadInvoices();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("flowdesk_invoices_v1", JSON.stringify(invoices));
    } catch (e) {}
  }, [invoices]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSwitchUser = () => {
    const nextIdx = (currentUserIndex + 1) % initialDemoUsers.length;
    setCurrentUserIndex(nextIdx);
    showToast(
      lang === "id"
        ? `Beralih ke konteks ${initialDemoUsers[nextIdx].name} (${initialDemoUsers[nextIdx].role})`
        : `Switched workspace context to ${initialDemoUsers[nextIdx].name} (${initialDemoUsers[nextIdx].role})`
    );
  };

  const handleCreateInvoice = async (newInvoice: Invoice) => {
    setInvoices([newInvoice, ...invoices]);
    showToast(
      lang === "id"
        ? `Tagihan ${newInvoice.invoiceNumber} diterbitkan! Menyinkronkan ke database...`
        : `Invoice ${newInvoice.invoiceNumber} recorded! Syncing with database...`
    );

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInvoice),
      });
      if (res.ok) {
        showToast(
          lang === "id"
            ? `Tagihan ${newInvoice.invoiceNumber} berhasil disimpan ke database.`
            : `Invoice ${newInvoice.invoiceNumber} persisted successfully.`
        );
      }
    } catch (err) {
      console.error("API error:", err);
    }
  };

  const handleToggleStatus = async (invoiceId: string) => {
    const target = invoices.find((inv) => inv.id === invoiceId);
    if (!target) return;

    const nextStatus =
      target.status === "PAID"
        ? "PENDING"
        : target.status === "PENDING"
        ? "PAID"
        : target.status === "DRAFT"
        ? "PENDING"
        : "PAID";

    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: nextStatus } : inv))
    );
    showToast(
      lang === "id"
        ? `Status tagihan berhasil diubah ke ${nextStatus}.`
        : `Status updated to ${nextStatus}.`
    );

    try {
      await fetch("/api/invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: invoiceId, status: nextStatus }),
      });
    } catch (err) {
      console.error("API error:", err);
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
    showToast(
      lang === "id"
        ? "Tagihan dihapus dari daftar aktif."
        : "Invoice removed from active registry."
    );

    try {
      await fetch(`/api/invoices?id=${invoiceId}`, { method: "DELETE" });
    } catch (err) {
      console.error("API delete error:", err);
    }
  };

  const handleSimulateWebhook = async () => {
    const target = invoices.find((inv) => inv.status === "PENDING" || inv.status === "OVERDUE");
    if (target) {
      await handleToggleStatus(target.id);
      showToast(
        lang === "id"
          ? `⚡ Webhook Diterima: Tagihan ${target.invoiceNumber} lunas (Rp ${target.total.toLocaleString("id-ID")})!`
          : `⚡ Webhook Verified: ${target.invoiceNumber} settled (Rp ${target.total.toLocaleString("id-ID")})!`
      );
    } else {
      showToast(
        lang === "id"
          ? "Semua tagihan sudah lunas! Buat tagihan baru untuk mencoba simulasi webhook."
          : "All invoices are settled! Create a new invoice to test webhook simulation."
      );
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col transition-colors duration-200">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-gradient-to-b from-brand-500/10 via-purple-500/5 to-transparent blur-[120px] pointer-events-none rounded-full" />

      <Navbar
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onOpenCreateModal={() => setIsCreateOpen(true)}
      />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xl border border-slate-700/50 dark:border-slate-200 text-xs font-semibold animate-bounce">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2.5 py-0.5 rounded-full">
                {t("dashWorkspace")}
              </span>
              <button
                onClick={() => setIsDbModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full hover:bg-emerald-500/20 transition-colors cursor-pointer"
              >
                <Database className="w-3 h-3" />
                <span>{dbSource || "PostgreSQL Ready"}</span>
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {t("dashTitle")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t("dashSubtitle")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsDbModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-brand-500" />
              <span>{t("dashDbConfig")}</span>
            </button>

            <button
              onClick={handleSimulateWebhook}
              title="Simulasikan penerimaan webhook pembayaran"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>{t("dashSimulateWebhook")}</span>
            </button>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t("navNewInvoice")}</span>
            </button>
          </div>
        </div>

        <StatsOverview invoices={invoices} />

        <InvoiceTable
          invoices={invoices}
          onViewInvoice={(inv) => setSelectedInvoice(inv)}
          onToggleStatus={handleToggleStatus}
          onDeleteInvoice={handleDeleteInvoice}
        />
      </main>

      {/* Database Setup Modal */}
      {isDbModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0e1424] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {lang === "id" ? "Arsitektur Database Cloud" : "Cloud Database Architecture"}
                  </h3>
                  <p className="text-xs text-slate-400">PostgreSQL / Supabase Integration</p>
                </div>
              </div>
              <button
                onClick={() => setIsDbModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p>
                FlowDesk mendukung <strong>PostgreSQL permanen</strong> secara instan melalui Supabase atau Neon:
              </p>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold text-brand-600 dark:text-brand-400 block">
                  {lang === "id" ? "Langkah Menghubungkan Supabase Gratis (2 Menit):" : "Connecting Free Supabase (2 Minutes):"}
                </span>
                <ol className="list-decimal pl-4 space-y-1 text-slate-500 dark:text-slate-400">
                  <li>Buat proyek baru di <strong>supabase.com</strong> (Free tier).</li>
                  <li>Buka menu <strong>SQL Editor</strong>, lalu jalankan script dari <code>supabase/schema.sql</code>.</li>
                  <li>Buka <strong>Project Settings ➔ API</strong>, copy <code>Project URL</code> dan <code>anon public key</code>.</li>
                  <li>Masukkan ke Vercel Environment Variables:
                    <ul className="list-disc pl-4 mt-1 font-mono text-[11px] text-slate-400">
                      <li><code>NEXT_PUBLIC_SUPABASE_URL</code></li>
                      <li><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px]">
                ✓ <strong>Status Saat Ini:</strong> Data Anda tersimpan secara otomatis melalui REST API & Persistent State. Begitu environment variables Supabase ditambahkan, sistem otomatis beralih ke cloud PostgreSQL tanpa downtime!
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsDbModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors"
              >
                {lang === "id" ? "Tutup & Mengerti" : "Close & Got it"}
              </button>
            </div>
          </div>
        </div>
      )}

      <InvoiceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateInvoice}
      />

      <InvoiceDetailModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onToggleStatus={handleToggleStatus}
      />

      <footer className="relative z-10 border-t border-slate-200 dark:border-slate-800/80 py-6 text-xs text-slate-500 dark:text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 FlowDesk Operations. Engineered with Next.js 15, TypeScript, & PostgreSQL.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {lang === "id" ? "Semua sistem berjalan normal" : "All systems operational"}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
