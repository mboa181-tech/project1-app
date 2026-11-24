"use client";

import React, { useState, useEffect } from "react";
import { Invoice, DemoUser } from "@/lib/types";
import { initialInvoices, initialDemoUsers } from "@/lib/mock-data";
import { Navbar } from "@/components/Navbar";
import { StatsOverview } from "@/components/StatsOverview";
import { InvoiceTable } from "@/components/InvoiceTable";
import { InvoiceModal } from "@/components/InvoiceModal";
import { InvoiceDetailModal } from "@/components/InvoiceDetailModal";
import {
  Check,
  ShieldCheck,
  Zap,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Github,
  Plus,
} from "lucide-react";

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [isDark, setIsDark] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentUser = initialDemoUsers[currentUserIndex];

  // Dark mode toggle effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSwitchUser = () => {
    const nextIdx = (currentUserIndex + 1) % initialDemoUsers.length;
    setCurrentUserIndex(nextIdx);
    showToast(`Switched workspace context to ${initialDemoUsers[nextIdx].name} (${initialDemoUsers[nextIdx].role})`);
  };

  const handleCreateInvoice = (newInvoice: Invoice) => {
    setInvoices([newInvoice, ...invoices]);
    showToast(`Invoice ${newInvoice.invoiceNumber} registered and recorded successfully!`);
  };

  const handleToggleStatus = (invoiceId: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const nextStatus =
            inv.status === "PAID"
              ? "PENDING"
              : inv.status === "PENDING"
              ? "PAID"
              : inv.status === "DRAFT"
              ? "PENDING"
              : "PAID";
          return { ...inv, status: nextStatus };
        }
        return inv;
      })
    );
    showToast(`Invoice status updated.`);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
    showToast(`Invoice removed from active registry.`);
  };

  // Simulate Instant Webhook Payment (Simulates receiving an ACH/Stripe webhook)
  const handleSimulateWebhook = () => {
    const target = invoices.find((inv) => inv.status === "PENDING" || inv.status === "OVERDUE");
    if (target) {
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === target.id ? { ...inv, status: "PAID" } : inv))
      );
      showToast(`⚡ Webhook Received: Invoice ${target.invoiceNumber} paid via ACH Settlement ($${target.total.toLocaleString()})!`);
    } else {
      showToast("All invoices are already settled! Create a new one to test webhook simulation.");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col transition-colors duration-200">
      {/* Ambient background glow for high-end SaaS feel */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-gradient-to-b from-brand-500/10 via-purple-500/5 to-transparent blur-[120px] pointer-events-none rounded-full" />

      <Navbar
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onOpenCreateModal={() => setIsCreateOpen(true)}
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xl border border-slate-700/50 dark:border-slate-200 text-xs font-semibold animate-bounce">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Title & Status Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded-full">
                Workspace: Apex Group
              </span>
              <span className="text-xs text-slate-400">• Q4 Fiscal Year 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Financial Billing & Invoices
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Multi-tenant workspace operations for agency contracts, retainers, and settlement automation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Simulate Webhook Button */}
            <button
              onClick={handleSimulateWebhook}
              title="Simulate incoming Stripe/ACH webhook"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Simulate Webhook</span>
            </button>

            {/* Quick Create Invoice CTA */}
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Invoice</span>
            </button>
          </div>
        </div>

        {/* Realtime Stats */}
        <StatsOverview invoices={invoices} />

        {/* Invoice Table View */}
        <InvoiceTable
          invoices={invoices}
          onViewInvoice={(inv) => setSelectedInvoice(inv)}
          onToggleStatus={handleToggleStatus}
          onDeleteInvoice={handleDeleteInvoice}
        />
      </main>

      {/* Create Modal */}
      <InvoiceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateInvoice}
      />

      {/* View Detail / Print PDF Modal */}
      <InvoiceDetailModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onToggleStatus={handleToggleStatus}
      />

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-slate-800/80 py-6 text-xs text-slate-500 dark:text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 FlowDesk Operations. Engineered with Next.js 15, TypeScript, & Tailwind CSS.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All systems operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
