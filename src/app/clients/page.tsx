"use client";

import React, { useState, useEffect } from "react";
import { Invoice, DemoUser } from "@/lib/types";
import { initialInvoices, initialDemoUsers } from "@/lib/mock-data";
import { Navbar } from "@/components/Navbar";
import { InvoiceModal } from "@/components/InvoiceModal";
import { useLanguage } from "@/context/LanguageContext";
import {
  Users,
  Search,
  Building2,
  Mail,
  DollarSign,
  ArrowUpRight,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ExternalLink,
} from "lucide-react";
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

export default function ClientsPage() {
  const { t, lang } = useLanguage();
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [isDark, setIsDark] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentUser = initialDemoUsers[currentUserIndex];

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const res = await fetch("/api/invoices");
        if (res.ok) {
          const data = await res.json();
          if (data.invoices && data.invoices.length > 0) {
            setInvoices(data.invoices);
          }
        }
      } catch (e) {}
    }
    fetchInvoices();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSwitchUser = () => {
    const nextIdx = (currentUserIndex + 1) % initialDemoUsers.length;
    setCurrentUserIndex(nextIdx);
    showToast(
      lang === "id"
        ? `Beralih ke konteks ${initialDemoUsers[nextIdx].name}`
        : `Switched workspace to ${initialDemoUsers[nextIdx].name}`
    );
  };

  const handleCreateInvoice = (newInvoice: Invoice) => {
    setInvoices([newInvoice, ...invoices]);
    showToast(`Invoice ${newInvoice.invoiceNumber} recorded!`);
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
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2.5 py-0.5 rounded-full">
                CRM Client Directory
              </span>
              <span className="text-xs text-slate-400">• Relationship Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {t("crmTitle")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t("crmSubtitle")}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t("navNewInvoice")}</span>
            </button>
          </div>
        </div>

        {/* CRM Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0e1424] border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
              {t("crmTotalAccounts")}
            </span>
            <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
              {totalClients}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {lang === "id" ? "Kontrak korporat terverifikasi" : "Verified enterprise contracts"}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#0e1424] border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
              {t("crmAvgLtv")}
            </span>
            <div className="text-3xl font-black tracking-tight text-brand-600 dark:text-brand-400 font-mono">
              ${avgLtv.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {lang === "id" ? "Rata-rata akumulasi pengeluaran" : "Weighted cumulative spend"}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#0e1424] border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
              {t("crmGrossInvoiced")}
            </span>
            <div className="text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 font-mono">
              ${totalBilledAll.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {lang === "id" ? "Total kontrak yang dieksekusi" : "Gross contracts executed"}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t("crmSearchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-[#0e1424] border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all placeholder:text-slate-400"
          />
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
                className="group p-6 rounded-3xl bg-white dark:bg-[#0e1424] border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 space-y-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md shadow-brand-500/20">
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {client.name}
                      </h3>
                      <p className="text-xs text-slate-400">{client.email}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                      client.hasOverdue
                        ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                        : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    }`}
                  >
                    {client.hasOverdue ? t("crmOverdueBalance") : t("crmGoodStanding")}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">{t("crmCumulativeBilled")}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      ${client.totalBilled.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">{t("crmPendingBalance")}</span>
                    <span className="font-mono font-bold text-amber-500">
                      ${client.totalPending.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">{t("crmSettledFunds")}</span>
                    <span className="font-mono font-bold text-emerald-500">
                      ${client.totalPaid.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">{t("crmTotalContracts")}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {client.invoiceCount} {lang === "id" ? "tagihan" : "invoices"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Link
                    href={`/?client=${encodeURIComponent(client.name)}`}
                    className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                  >
                    <span>{t("crmViewInvoices")}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    {t("crmInvoiceClient")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <InvoiceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateInvoice}
      />

      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-6 text-xs text-slate-500 dark:text-slate-400 mt-auto text-center">
        FlowDesk CRM • Multi-Tenant Client Architecture • 2026
      </footer>
    </div>
  );
}
