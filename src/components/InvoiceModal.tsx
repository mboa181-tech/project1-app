"use client";

import React, { useState, useEffect } from "react";
import { Invoice, InvoiceItem } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { formatRupiah } from "@/lib/format-currency";
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  DollarSign,
  Calculator,
  Calendar,
  FileText,
  Building2,
  Mail,
  Percent,
} from "lucide-react";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (invoice: Invoice) => void;
  editingInvoice?: Invoice | null;
  onUpdate?: (invoice: Invoice) => void;
  defaultClient?: { name: string; email: string } | null;
}

export function InvoiceModal({
  isOpen,
  onClose,
  onCreate,
  editingInvoice,
  onUpdate,
  defaultClient,
}: InvoiceModalProps) {
  const { t, lang } = useLanguage();
  const isEditing = Boolean(editingInvoice);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [currency, setCurrency] = useState("IDR");
  const [dueDate, setDueDate] = useState("2026-12-31");
  const [taxRate, setTaxRate] = useState(11);
  const [notes, setNotes] = useState(
    lang === "id"
      ? "Pembayaran jatuh tempo sesuai syarat perjanjian."
      : "Payment due within net terms."
  );
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: "1",
      description:
        lang === "id"
          ? "Sprint Pengembangan Full-Stack"
          : "Full-Stack Development Sprint",
      quantity: 1,
      rate: 52500000,
      amount: 52500000,
    },
  ]);

  useEffect(() => {
    if (editingInvoice) {
      setClientName(editingInvoice.clientName);
      setClientEmail(editingInvoice.clientEmail);
      setCurrency(editingInvoice.currency || "IDR");
      setDueDate(editingInvoice.dueDate);
      setTaxRate(editingInvoice.taxRate);
      setNotes(editingInvoice.notes || "");
      setItems(
        editingInvoice.items.length > 0
          ? editingInvoice.items
          : [{ id: "1", description: "", quantity: 1, rate: 0, amount: 0 }]
      );
    } else if (isOpen) {
      setClientName(defaultClient?.name || "");
      setClientEmail(defaultClient?.email || "");
      setCurrency("IDR");
      setDueDate("2026-12-31");
      setTaxRate(11);
      setNotes(
        lang === "id"
          ? "Pembayaran jatuh tempo sesuai syarat perjanjian."
          : "Payment due within net terms."
      );
      setItems([
        {
          id: "1",
          description:
            lang === "id"
              ? "Sprint Pengembangan Full-Stack"
              : "Full-Stack Development Sprint",
          quantity: 1,
          rate: 52500000,
          amount: 52500000,
        },
      ]);
    }
  }, [editingInvoice, isOpen, lang, defaultClient]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    if (field === "quantity" || field === "rate") {
      const q = field === "quantity" ? Number(value) : updated[index].quantity;
      const r = field === "rate" ? Number(value) : updated[index].rate;
      updated[index].amount = (q || 0) * (r || 0);
    }
    setItems(updated);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: String(Date.now()),
        description:
          lang === "id"
            ? "Integrasi API & Optimasi Infrastruktur"
            : "API Integration & Infrastructure Tuning",
        quantity: 1,
        rate: 22500000,
        amount: 22500000,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const applyPresetTerm = (days: number) => {
    const target = new Date();
    target.setDate(target.getDate() + days);
    setDueDate(target.toISOString().split("T")[0]);
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail) return;

    if (isEditing && editingInvoice && onUpdate) {
      const updatedInvoice: Invoice = {
        ...editingInvoice,
        clientName,
        clientEmail,
        dueDate,
        items,
        subtotal,
        taxRate,
        taxAmount,
        total,
        currency,
        notes,
      };
      onUpdate(updatedInvoice);
      onClose();
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}-${randomSuffix}`,
      invoiceNumber: `INV-2026-${randomSuffix}`,
      clientName,
      clientEmail,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate,
      status: "PENDING",
      items,
      subtotal,
      taxRate,
      taxAmount,
      total,
      currency,
      notes,
    };

    onCreate(newInvoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 glass-modal rounded-[28px] max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[var(--gd-line)] flex items-center justify-between sticky top-0 bg-[var(--gd-surface)]/85 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--gd-pick)] text-[var(--gd-pick-ink)] border border-[var(--gd-rim)] flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[var(--gd-ink)] tracking-tight">
                  {isEditing ? t("modalEditTitle") : t("modalCreateTitle")}
                </h3>
                <span className="text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-[var(--gd-inner)] border border-[var(--gd-line)] text-[var(--gd-ink)]">
                  {isEditing ? editingInvoice?.invoiceNumber : "PRO-FORMA"}
                </span>
              </div>
              <p className="text-xs text-[var(--gd-muted)] mt-0.5">
                {isEditing ? t("modalEditSub") : t("modalCreateSub")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="glass-icon-btn"
            aria-label="Tutup form"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-6">
          {/* Client Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-extrabold text-[var(--gd-muted)] uppercase tracking-wider mb-1.5">
                {t("modalClientName")}
              </label>
              <div className="relative">
                <input
                  required
                  type="text"
                  placeholder="e.g. PT Artha Mandiri Perkasa"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-extrabold text-[var(--gd-muted)] uppercase tracking-wider mb-1.5">
                {t("modalClientEmail")}
              </label>
              <div className="relative">
                <input
                  required
                  type="email"
                  placeholder="finance@arthamandiri.co.id"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Payment Terms & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-extrabold text-[var(--gd-muted)] uppercase tracking-wider mb-1.5">
                {t("modalCurrency")}
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full glass-input px-3.5 py-2.5 text-sm cursor-pointer"
              >
                <option value="IDR">IDR (Rupiah Rp)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="SGD">SGD (S$)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-extrabold text-[var(--gd-muted)] uppercase tracking-wider mb-1.5">
                {t("modalDueDate")}
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full glass-input px-3.5 py-2.5 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-extrabold text-[var(--gd-muted)] uppercase tracking-wider mb-1.5">
                {t("modalTaxRate")} (%)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full glass-input px-3.5 py-2.5 text-sm font-mono"
              />
            </div>
          </div>

          {/* Preset Term Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="text-xs text-[var(--gd-muted)] font-semibold">
              {t("modalQuickTerm")}
            </span>
            <button
              type="button"
              onClick={() => applyPresetTerm(0)}
              className="glass-btn-secondary text-[11px] px-3 py-1"
            >
              {t("modalDueToday")}
            </button>
            <button
              type="button"
              onClick={() => applyPresetTerm(7)}
              className="glass-btn-secondary text-[11px] px-3 py-1"
            >
              +7 Hari
            </button>
            <button
              type="button"
              onClick={() => applyPresetTerm(15)}
              className="glass-btn-secondary text-[11px] px-3 py-1"
            >
              {t("modalNet15")}
            </button>
            <button
              type="button"
              onClick={() => applyPresetTerm(30)}
              className="glass-btn-secondary text-[11px] px-3 py-1"
            >
              {t("modalNet30")}
            </button>
          </div>

          {/* Line Items Editor */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-extrabold text-[var(--gd-muted)] uppercase tracking-wider">
                {t("modalLineItems")}
              </label>
              <button
                type="button"
                onClick={addItem}
                className="glass-btn-teal text-xs px-3.5 py-1.5 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t("modalAddItem")}</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl glass-panel-sub flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center"
                >
                  <input
                    type="text"
                    required
                    placeholder={t("modalItemDesc")}
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                    className="flex-1 glass-input px-3.5 py-2 text-sm"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      title="Kuantitas"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                      className="w-16 glass-input px-2 py-2 text-sm text-center font-mono"
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="Tarif (Rp)"
                      title="Tarif Satuan"
                      value={item.rate}
                      onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                      className="w-32 sm:w-36 glass-input px-3 py-2 text-sm text-right font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      disabled={items.length <= 1}
                      className="glass-icon-btn text-[var(--gd-muted)] hover:text-[var(--gd-coral)] hover:border-[var(--gd-coral)] disabled:opacity-30 disabled:hover:text-[var(--gd-muted)]"
                      title="Hapus baris item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Summary Card */}
          <div className="p-4 sm:p-5 rounded-2xl glass-panel-sub space-y-2.5 text-sm">
            <div className="flex justify-between text-[var(--gd-muted)]">
              <span>{t("modalSubtotal")}</span>
              <span className="font-mono font-bold text-[var(--gd-ink)]">
                {formatRupiah(subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-[var(--gd-muted)]">
              <span>{t("modalTax")} ({taxRate}%)</span>
              <span className="font-mono">{formatRupiah(taxAmount)}</span>
            </div>
            <div className="flex justify-between font-black text-base sm:text-lg text-[var(--gd-ink)] pt-2 border-t border-[var(--gd-line)]">
              <span>{t("modalGrandTotal")}</span>
              <span className="font-mono font-extrabold text-[var(--gd-teal)]">
                {formatRupiah(total)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="glass-btn-secondary px-5 py-2.5 text-sm"
            >
              {t("modalCancel")}
            </button>
            <button
              type="submit"
              className="glass-btn-primary px-7 py-2.5 text-sm flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEditing ? t("modalSaveChanges") : t("modalSubmit")}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
