"use client";

import React, { useState, useEffect } from "react";
import { Invoice, DemoUser } from "@/lib/types";
import { initialInvoices, initialDemoUsers } from "@/lib/mock-data";
import { Navbar } from "@/components/Navbar";
import { StatsOverview } from "@/components/StatsOverview";
import { InvoiceTable } from "@/components/InvoiceTable";
import { InvoiceModal } from "@/components/InvoiceModal";
import { InvoiceDetailModal } from "@/components/InvoiceDetailModal";
import { Check, ShieldCheck, ArrowRight, ExternalLink, Github } from "lucide-react";

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
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSwitchUser = () => {
    const nextIdx = (currentUserIndex + 1) % initialDemoUsers.length;
    setCurrentUserIndex(nextIdx);
    showToast(`Switched workspace context to ${initialDemoUsers[nextIdx].name} (${initialDemoUsers[nextIdx].role})`);
  };

  const handleCreateInvoice = (newInvoice: Invoice) => {
    setInvoices([newInvoice, ...invoices]);
    showToast(`Invoice ${newInvoice.invoiceNumber} created and recorded successfully!`);
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

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200">
      <Navbar
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onOpenCreateModal={() => setIsCreateOpen(true)}
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl border border-slate-800 text-xs font-semibold animate-bounce">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Title & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Financial Billing & Invoices
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Multi-tenant workspace operations for agency and enterprise contracts.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              ACID Compliant Sandbox
            </span>
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
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 FlowDesk Operations. Built with Next.js 15, TypeScript, & Tailwind CSS.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> All systems normal
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
