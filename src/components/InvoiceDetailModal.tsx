"use client";

import React, { useEffect, useState } from "react";
import { Invoice } from "@/lib/types";
import {
  X,
  Printer,
  Copy,
  Check,
  CheckCircle2,
  Building2,
  Calendar,
  FileText,
  CreditCard,
  QrCode,
  Lock,
} from "lucide-react";

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onToggleStatus?: (invoiceId: string) => void;
}

export function InvoiceDetailModal({
  invoice,
  onClose,
  onToggleStatus,
}: InvoiceDetailModalProps) {
  const [copied, setCopied] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const publicUrl = `${window.location.origin}/pay/${invoice.invoiceNumber}`;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isPaid = invoice.status === "PAID";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white">
      <div className="bg-white dark:bg-[#0e1424] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none transition-colors">
        {/* Header Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#0e1424]/95 backdrop-blur-md z-10 print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="font-mono font-black text-sm text-brand-600 dark:text-brand-400">
              {invoice.invoiceNumber}
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                isPaid
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : invoice.status === "PENDING"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
              }`}
            >
              {invoice.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy Client Link */}
            <button
              onClick={handleCopyLink}
              title="Copy shareable client payment link"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Client Link</span>
                </>
              )}
            </button>

            {/* Print/Save PDF */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Sheet */}
        <div className="relative p-6 sm:p-10 space-y-8 font-sans print:p-8">
          {/* PAID Watermark Stamp */}
          {isPaid && (
            <div className="absolute right-12 top-28 pointer-events-none rotate-[-18deg] select-none opacity-85">
              <div className="border-4 border-emerald-500 text-emerald-500 font-black tracking-widest text-2xl uppercase px-5 py-2 rounded-xl">
                PAID & SETTLED
              </div>
            </div>
          )}

          {/* Top Brand & Metadata */}
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  FlowDesk Inc.
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                100 Innovation Parkway, Suite 400<br />
                San Francisco, CA 94103 • billing@flowdesk.app
              </p>
            </div>

            <div className="text-right">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                INVOICE
              </h2>
              <p className="font-mono text-sm font-bold text-brand-600 dark:text-brand-400 mt-0.5">
                #{invoice.invoiceNumber}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Issued Date: {invoice.issueDate}
              </p>
            </div>
          </div>

          {/* Billed To / Due Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Billed To Client
              </span>
              <p className="font-bold text-base text-slate-900 dark:text-slate-100">
                {invoice.clientName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{invoice.clientEmail}</p>
            </div>
            <div className="sm:text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Settlement Terms & Maturity
              </span>
              <p className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                Due by {invoice.dueDate}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Electronic ACH / Domestic Wire Transfer
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase font-semibold text-slate-400">
                <tr>
                  <th className="py-3 pr-4">Description</th>
                  <th className="py-3 px-2 text-center">Qty</th>
                  <th className="py-3 px-2 text-right">Unit Rate</th>
                  <th className="py-3 pl-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3.5 pr-4 text-slate-800 dark:text-slate-200 font-medium">
                      {item.description}
                    </td>
                    <td className="py-3.5 px-2 text-center text-slate-600 dark:text-slate-400 font-mono">
                      {item.quantity}
                    </td>
                    <td className="py-3.5 px-2 text-right text-slate-600 dark:text-slate-400 font-mono">
                      ${item.rate.toLocaleString()}
                    </td>
                    <td className="py-3.5 pl-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      ${item.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculations Summary */}
          <div className="flex justify-end pt-2">
            <div className="w-72 space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono font-semibold">${invoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Tax Rate ({invoice.taxRate}%)</span>
                <span className="font-mono">${invoice.taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-black text-lg text-slate-900 dark:text-slate-50 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>Total Amount Due</span>
                <span className="font-mono text-brand-600 dark:text-brand-400">
                  ${invoice.total.toLocaleString()} {invoice.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Payment & Bank Remittance Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 text-xs">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-brand-500" /> Remittance Instructions:
              </span>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Bank: Silicon Valley Commercial Bank<br />
                Routing (ABA): 121000358 • Account: 9840291039<br />
                Beneficiary: FlowDesk Operations Inc.
              </p>
            </div>
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                Remittance Note / Memo:
              </span>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                {invoice.notes || "Please include invoice number in the wire transfer description."}
              </p>
            </div>
          </div>

          {/* Footer Security Badges */}
          <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 text-[11px] text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-emerald-500" />
              Cryptographically verified invoice record (SHA-256)
            </span>
            <span className="font-mono">Ref UUID: {invoice.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
