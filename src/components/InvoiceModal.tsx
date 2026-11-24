"use client";

import React, { useState } from "react";
import { Invoice, InvoiceItem } from "@/lib/types";
import { X, Plus, Trash2, CheckCircle2 } from "lucide-react";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (invoice: Invoice) => void;
}

export function InvoiceModal({ isOpen, onClose, onCreate }: InvoiceModalProps) {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [dueDate, setDueDate] = useState("2026-12-31");
  const [taxRate, setTaxRate] = useState(10);
  const [notes, setNotes] = useState("Payment due within 30 days.");
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "Full-Stack Development Sprint", quantity: 1, rate: 3500, amount: 3500 },
  ]);

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
        description: "API Integration & Infrastructure Tuning",
        quantity: 1,
        rate: 1500,
        amount: 1500,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
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
      currency: "USD",
      notes,
    };

    onCreate(newInvoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#111625] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#111625]/95 backdrop-blur-md z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Create New Invoice
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generate an immutable financial record & compute taxes
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Client Name
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Apex Global Ventures"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-brand-500/50 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Client Email
              </label>
              <input
                required
                type="email"
                placeholder="billing@apex.example"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-brand-500/50 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Settlement Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-brand-500/50 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-brand-500/50 outline-none"
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Line Items
              </label>
              <button
                type="button"
                onClick={addItem}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={item.id} className="flex gap-2 items-center">
                  <input
                    type="text"
                    required
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                    className="w-16 px-2 py-1.5 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center outline-none"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                    className="w-24 px-2 py-1.5 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-right outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Summary */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-sm space-y-1.5">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Tax ({taxRate}%)</span>
              <span>${taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-base text-slate-900 dark:text-slate-100 pt-1 border-t border-slate-200 dark:border-slate-800">
              <span>Grand Total</span>
              <span className="text-brand-600 dark:text-brand-400">${total.toLocaleString()} USD</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/25 transition-all"
            >
              Create & Issue Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
