"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Invoice, InvoiceStatus } from "@/lib/types";
import { initialInvoices, initialDemoUsers } from "@/lib/mock-data";
import { GlassyDashboard } from "@/components/ui/glassy-dashboard";
import { InvoiceModal } from "@/components/InvoiceModal";
import { InvoiceDetailModal } from "@/components/InvoiceDetailModal";
import { CompanySettingsModal } from "@/components/CompanySettingsModal";
import { AuditLogDrawer, AuditEntry } from "@/components/AuditLogDrawer";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Check } from "lucide-react";

const studioPhoto =
  "https://cdn.21st.dev/assets/mirror/ea/ea9270b3b7246283219ac52fa77a1213e9d1efb285d76348d3620609ba6cefa7.jpg";

export default function DashboardPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const { user, loading, signOut } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const userKey = user?.id || user?.email || "default_user";
  const invoiceStorageKey = `flowdesk_invoices_${userKey}`;
  const auditStorageKey = `flowdesk_audit_${userKey}`;

  const actorName =
    user?.user_metadata?.full_name || user?.email || initialDemoUsers[0].name;

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Auth Guard: Redirect unauthenticated visitors to login
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    async function loadInvoices() {
      try {
        const res = await fetch(`/api/invoices?userId=${encodeURIComponent(userKey)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.invoices)) {
            setInvoices(data.invoices);
            try {
              localStorage.setItem(invoiceStorageKey, JSON.stringify(data.invoices));
            } catch {}
            return;
          }
        }
      } catch (err) {
        console.warn("Using offline persistent storage:", err);
      }

      try {
        const local = localStorage.getItem(invoiceStorageKey);
        if (local) {
          setInvoices(JSON.parse(local));
          return;
        }
      } catch {}

      // If demo user, seed initial sample data
      if (userKey === "usr_demo" || user?.email?.includes("demo") || user?.email === "admin@flowdesk.app") {
        const demoData = initialInvoices.map((inv) => ({ ...inv, userId: userKey }));
        setInvoices(demoData);
        try {
          localStorage.setItem(invoiceStorageKey, JSON.stringify(demoData));
        } catch {}
      } else {
        // New tenant starts completely fresh
        setInvoices([]);
      }
    }

    loadInvoices();
  }, [userKey]);

  useEffect(() => {
    try {
      const savedAudit = localStorage.getItem(auditStorageKey);
      if (savedAudit) {
        setAuditLogs(JSON.parse(savedAudit));
      } else {
        setAuditLogs([]);
      }
    } catch {}
  }, [auditStorageKey]);

  useEffect(() => {
    if (!user) return;
    try {
      localStorage.setItem(invoiceStorageKey, JSON.stringify(invoices));
    } catch {}
  }, [invoices, invoiceStorageKey, user]);

  useEffect(() => {
    if (!user) return;
    try {
      localStorage.setItem(auditStorageKey, JSON.stringify(auditLogs));
    } catch {}
  }, [auditLogs, auditStorageKey, user]);

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
    const invoiceWithUser: Invoice = {
      ...newInvoice,
      userId: userKey,
    };
    setInvoices((prev) => {
      const next = [invoiceWithUser, ...prev];
      try {
        localStorage.setItem(invoiceStorageKey, JSON.stringify(next));
      } catch {}
      return next;
    });
    recordAudit(
      "CREATE",
      invoiceWithUser.invoiceNumber,
      `${invoiceWithUser.clientName} — Rp ${invoiceWithUser.total.toLocaleString("id-ID")}`
    );
    showToast(`Tagihan ${invoiceWithUser.invoiceNumber} diterbitkan!`);

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceWithUser),
      });
      if (res.ok) {
        showToast(`Tagihan ${invoiceWithUser.invoiceNumber} berhasil disimpan.`);
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(`Gagal menyimpan tagihan: ${errData.error || "Server error"}`);
      }
    } catch (err) {
      console.error("API error:", err);
    }
  };

  const handleUpdateInvoice = async (updatedInvoice: Invoice) => {
    const invoiceWithUser = {
      ...updatedInvoice,
      userId: userKey,
    };
    setInvoices((prev) => {
      const next = prev.map((inv) => (inv.id === invoiceWithUser.id ? invoiceWithUser : inv));
      try {
        localStorage.setItem(invoiceStorageKey, JSON.stringify(next));
      } catch {}
      return next;
    });
    recordAudit(
      "UPDATE",
      invoiceWithUser.invoiceNumber,
      `${invoiceWithUser.clientName} — Rp ${invoiceWithUser.total.toLocaleString("id-ID")}`
    );
    showToast(`Perubahan pada ${invoiceWithUser.invoiceNumber} disimpan!`);

    try {
      await fetch("/api/invoices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceWithUser),
      });
    } catch (err) {
      console.error("API update error:", err);
    }
  };

  const handleToggleStatus = async (invoiceId: string) => {
    const target = invoices.find((inv) => inv.id === invoiceId);
    if (!target) return;

    const nextStatus: InvoiceStatus =
      target.status === "PAID"
        ? "PENDING"
        : target.status === "PENDING"
        ? "PAID"
        : target.status === "DRAFT"
        ? "PENDING"
        : "PAID";

    setInvoices((prev) => {
      const next = prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: nextStatus } : inv));
      try {
        localStorage.setItem(invoiceStorageKey, JSON.stringify(next));
      } catch {}
      return next;
    });
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
    setInvoices((prev) => {
      const next = prev.filter((inv) => inv.id !== invoiceId);
      try {
        localStorage.setItem(invoiceStorageKey, JSON.stringify(next));
      } catch {}
      return next;
    });
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

  if (loading || !user) {
    return (
      <div className="relative min-h-screen flex items-center justify-center font-['Manrope_Variable',Manrope,sans-serif]">
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
        <div className="glass-modal rounded-3xl px-6 py-5 flex flex-col items-center gap-3 shadow-2xl border border-[var(--gd-rim)]">
          <div className="w-7 h-7 rounded-full border-2 border-[var(--gd-teal)] border-t-transparent animate-spin" />
          <span className="text-xs font-semibold tracking-wide text-[var(--gd-ink)]">
            {lang === "id" ? "Memverifikasi sesi aman..." : "Verifying secure session..."}
          </span>
        </div>
      </div>
    );
  }

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
          onOpenCompanySettings={() => setIsSettingsOpen(true)}
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

      <CompanySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSavedToast={showToast}
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
