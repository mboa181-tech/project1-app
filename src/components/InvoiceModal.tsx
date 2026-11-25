"use client";

import React, { useState, useEffect } from "react";
import { Invoice, InvoiceItem } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { formatRupiah } from "@/lib/format-currency";
import { X, Plus, Trash2, CheckCircle2, DollarSign, Calculator, Calendar } from "lucide-react";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (invoice: Invoice) => void;
}

export function InvoiceModal({ isOpen, onClose, onCreate }: InvoiceModalProps) {
  const { t, lang } = useLanguage();
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [currency, setCurrency] = useState("IDR");
  const [dueDate, setDueDate] = useState("2026-12-31");
  const [taxRate, setTaxRate] = useState(11);
  const [notes, setNotes] = useState(lang === "id" ? "Pembayaran jatuh tempo sesuai syarat perjanjian." : "Payment due within net terms.");
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: lang === "id" ? "Sprint Pengembangan Full-Stack" : "Full-Stack Development Sprint", quantity: 1, rate: 52500000, amount: 52500000 },
  ]);

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
        description: lang === "id" ? "Integrasi API & Optimasi Infrastruktur" : "API Integration & Infrastructure Tuning",
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

    const newInvoice: Invoice = {
      id: `inv-${Date.now().toString().slice(-4)}`,
      invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#0e1424] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#0e1424]/95 backdrop-blur-md z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>{t("modalCreateTitle")}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
                PRO-FORMA
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t("modalCreateSub")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                {t("modalClientName")}
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Apex Global Ventures Inc"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-brand-500/50 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                {t("modalClientEmail")}
              </label>
              <input
                required
                type="email"
                placeholder="accounts.payable@apex.example"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-brand-500/50 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                {t("modalCurrency")}
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-brand-500/50 outline-none transition-all"
              >
                <option value="IDR">IDR (Rp)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                {t("modalDueDate")}
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-brand-500/50 outline-none transition-all font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                {t("modalTaxRate")}
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-brand-500/50 outline-none transition-all font-mono"
              />
            </div>
          </div>

          {/* Preset Terms Quick Selectors */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">{t("modalQuickTerm")}</span>
            <button
              type="button"
              onClick={() => applyPresetTerm(0)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {t("modalDueToday")}
            </button>
            <button
              type="button"
              onClick={() => applyPresetTerm(15)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {t("modalNet15")}
            </button>
            <button
              type="button"
              onClick={() => applyPresetTerm(30)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {t("modalNet30")}
            </button>
          </div>

          {/* Line Items */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2.5">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                {t("modalLineItems")}
              </label>
              <button
                type="button"
                onClick={addItem}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> {t("modalAddItem")}
              </button>
            </div>
            <div className="space-y-2.5">
              {items.map((item, idx) => (
                <div key={item.id} className="flex gap-2 items-center">
                  <input
                    type="text"
                    required
                    placeholder={t("modalItemDesc")}
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder={t("modalQty")}
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                    className="w-16 px-2 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center outline-none font-mono focus:ring-1 focus:ring-brand-500"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder={t("modalRate")}
                    value={item.rate}
                    onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                    className="w-28 px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-right outline-none font-mono focus:ring-1 focus:ring-brand-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Summary */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-sm space-y-2">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>{t("modalSubtotal")}</span>
              <span className="font-mono">{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>{t("modalTax")} ({taxRate}%)</span>
              <span className="font-mono">{formatRupiah(taxAmount)}</span>
            </div>
            <div className="flex justify-between font-black text-base text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span>{t("modalGrandTotal")}</span>
              <span className="font-mono text-brand-600 dark:text-brand-400">
                {formatRupiah(total)}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {t("modalCancel")}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              {t("modalSubmit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
