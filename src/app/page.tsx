"use client";

import React, { useState, useEffect } from "react";
import { Invoice } from "@/lib/types";
import { initialInvoices, initialDemoUsers } from "@/lib/mock-data";
import { GlassyDashboard } from "@/components/ui/glassy-dashboard";
import { InvoiceModal } from "@/components/InvoiceModal";
import { InvoiceDetailModal } from "@/components/InvoiceDetailModal";
import { AuditLogDrawer, AuditEntry } from "@/components/AuditLogDrawer";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Check } from "lucide-react";

export default function DashboardPage() {
  const { lang } = useLanguage();
  const { user, signOut } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const actorName =
    user?.user_metadata?.full_name || user?.email || initialDemoUsers[0].name;

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    async function loadInvoices() {
      try {
        const res = await fetch("/api/invoices");
        if (res.ok) {
          const data = await res.json();
          if (data.invoices && data.invoices.length > 0) {
            setInvoices(data.invoices);
            return;
          }
        }
      } catch (err) {
        console.warn("Using offline persistent storage:", err);
      }

      try {
        const local = localStorage.getItem("flowdesk_invoices_v1");
        if (local) {
          setInvoices(JSON.parse(local));
        }
      } catch {}
    }

    loadInvoices();
  }, []);

  useEffect(() => {
    try {
      const savedAudit = localStorage.getItem("flowdesk_audit_v1");
      if (savedAudit) {
        setAuditLogs(JSON.parse(savedAudit));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("flowdesk_invoices_v1", JSON.stringify(invoices));
    } catch {}
  }, [invoices]);

  useEffect(() => {
    try {
      localStorage.setItem("flowdesk_audit_v1", JSON.stringify(auditLogs));
    } catch {}
  }, [auditLogs]);

  const recordAudit = (
    action: AuditEntry["action"],
    target: string,
    detail: string
  ) => {
    const entry: AuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      action,
      target,
      detail,
      actor: actorName,
      timestamp: new Date().toLocaleTimeString(lang === "id" ? "id-ID" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
    setAuditLogs((prev) => [entry, ...prev].slice(0, 50));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateInvoice = async (newInvoice: Invoice) => {
    setInvoices((prev) => [newInvoice, ...prev]);
    recordAudit(
      "CREATE",
      newInvoice.invoiceNumber,
      `${newInvoice.clientName} — Rp ${newInvoice.total.toLocaleString("id-ID")}`
    );
    showToast(`Tagihan ${newInvoice.invoiceNumber} diterbitkan!`);

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInvoice),
      });
      if (res.ok) {
        showToast(`Tagihan ${newInvoice.invoiceNumber} disimpan ke Supabase.`);
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(`Gagal simpan ke Supabase: ${errData.error || "Server error"}`);
      }
    } catch (err) {
      console.error("API error:", err);
    }
  };

  const handleUpdateInvoice = async (updatedInvoice: Invoice) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv))
    );
    recordAudit(
      "UPDATE",
      updatedInvoice.invoiceNumber,
      `${updatedInvoice.clientName} — Rp ${updatedInvoice.total.toLocaleString("id-ID")}`
    );
    showToast(`Perubahan pada ${updatedInvoice.invoiceNumber} disimpan!`);

    try {
      await fetch("/api/invoices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedInvoice),
      });
    } catch (err) {
      console.error("API update error:", err);
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
    recordAudit("STATUS", target.invoiceNumber, `${target.status} → ${nextStatus}`);
    showToast(`Status ${target.invoiceNumber} diubah ke ${nextStatus}.`);

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
    const target = invoices.find((inv) => inv.id === invoiceId);
    setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
    if (target) {
      recordAudit("DELETE", target.invoiceNumber, target.clientName);
    }
    showToast("Tagihan dihapus dari daftar aktif.");

    try {
      await fetch(`/api/invoices?id=${invoiceId}`, { method: "DELETE" });
    } catch (err) {
      console.error("API delete error:", err);
    }
  };

  const handleSimulateWebhook = async () => {
    const target = invoices.find(
      (inv) => inv.status === "PENDING" || inv.status === "OVERDUE"
    );
    if (target) {
      await handleToggleStatus(target.id);
      recordAudit(
        "WEBHOOK",
        target.invoiceNumber,
        `Payment webhook settled — Rp ${target.total.toLocaleString("id-ID")}`
      );
      showToast(
        `⚡ Webhook Diterima: ${target.invoiceNumber} lunas (Rp ${target.total.toLocaleString("id-ID")})!`
      );
    } else {
      showToast("Semua tagihan sudah lunas! Buat tagihan baru untuk simulasi webhook.");
    }
  };

  return (
    <div className="relative min-h-screen">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 px-5 py-2.5 rounded-full glass-modal shadow-2xl border border-[var(--gd-rim)] text-xs font-bold text-[var(--gd-ink)] animate-bounce print:hidden">
          <Check className="w-4 h-4 text-[var(--gd-teal)] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="print:hidden">
        <GlassyDashboard
          workspaceName="FLOWDESK"
          panelFrost={14}
          initialTheme="dark"
          invoices={invoices}
          onCreateInvoice={() => setIsCreateOpen(true)}
          onViewInvoice={(inv) => setSelectedInvoice(inv)}
          onEditInvoice={(inv) => {
            setEditingInvoice(inv);
            setIsCreateOpen(true);
          }}
          onToggleStatus={handleToggleStatus}
          onDeleteInvoice={handleDeleteInvoice}
          onSimulateWebhook={handleSimulateWebhook}
          onOpenAuditLog={() => setIsAuditOpen(true)}
          auditCount={auditLogs.length}
          userLabel={user ? actorName : "Financial Ops"}
          isAuthenticated={Boolean(user)}
          onSignOut={signOut}
        />
      </div>

      <InvoiceModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingInvoice(null);
        }}
        onCreate={handleCreateInvoice}
        editingInvoice={editingInvoice}
        onUpdate={handleUpdateInvoice}
      />

      <InvoiceDetailModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onToggleStatus={handleToggleStatus}
        onEdit={(inv) => {
          setEditingInvoice(inv);
          setIsCreateOpen(true);
        }}
      />

      <AuditLogDrawer
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        entries={auditLogs}
        onClear={() => setAuditLogs([])}
      />
    </div>
  );
}
