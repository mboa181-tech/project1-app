"use client";

import React from "react";
import { Invoice } from "@/lib/types";
import { X, Printer, Download, CheckCircle2, Building2, Calendar, FileText } from "lucide-react";

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export function InvoiceDetailModal({ invoice, onClose }: InvoiceDetailModalProps) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white">
      <div className="bg-white dark:bg-[#111625] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none">
        {/* Header toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#111625]/95 backdrop-blur-md z-10 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-brand-600 dark:text-brand-400">
              {invoice.invoiceNumber}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400">
              {invoice.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-6 sm:p-10 space-y-8 font-sans print:p-8">
          {/* Top Brand & Metadata */}
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  FlowDesk Inc.
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                100 Innovation Parkway, Suite 400<br />
                San Francisco, CA 94103 • billing@flowdesk.app
              </p>
            </div>

            <div className="text-right">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                INVOICE
              </h2>
              <p className="font-mono text-sm font-semibold text-brand-600 dark:text-brand-400">
                #{invoice.invoiceNumber}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Issued: {invoice.issueDate}
              </p>
            </div>
          </div>

          {/* Billed To / Due Date Grid */}
          <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Billed To
              </span>
              <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {invoice.clientName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{invoice.clientEmail}</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Payment Terms & Due
              </span>
              <p className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                Due by {invoice.dueDate}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Electronic ACH / Wire</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase font-semibold text-slate-400">
                <tr>
                  <th className="py-2.5">Description</th>
                  <th className="py-2.5 text-center">Qty</th>
                  <th className="py-2.5 text-right">Rate</th>
                  <th className="py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 pr-2 text-slate-800 dark:text-slate-200 font-medium">
                      {item.description}
                    </td>
                    <td className="py-3 text-center text-slate-600 dark:text-slate-400">
                      {item.quantity}
                    </td>
                    <td className="py-3 text-right text-slate-600 dark:text-slate-400 font-mono">
                      ${item.rate.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-mono font-semibold text-slate-900 dark:text-slate-100">
                      ${item.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculations Summary */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono">${invoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Tax ({invoice.taxRate}%)</span>
                <span className="font-mono">${invoice.taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>Total Due</span>
                <span className="font-mono text-brand-600 dark:text-brand-400">
                  ${invoice.total.toLocaleString()} {invoice.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Notes and Audit Footer */}
          {invoice.notes && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold block text-slate-700 dark:text-slate-300 mb-0.5">
                Notes / Remittance:
              </span>
              {invoice.notes}
            </div>
          )}

          <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 text-[11px] text-slate-400 flex flex-col sm:flex-row justify-between gap-2">
            <span>FlowDesk Engine • Cryptographically verified record</span>
            <span>Ref: {invoice.id} • Generated automatically</span>
          </div>
        </div>
      </div>
    </div>
  );
}
