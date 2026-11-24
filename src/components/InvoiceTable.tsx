"use client";

import React, { useState } from "react";
import { Invoice, InvoiceStatus } from "@/lib/types";
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCode2,
  Eye,
  Trash2,
  ArrowUpDown,
  Filter,
} from "lucide-react";

interface InvoiceTableProps {
  invoices: Invoice[];
  onViewInvoice: (invoice: Invoice) => void;
  onToggleStatus: (invoiceId: string) => void;
  onDeleteInvoice: (invoiceId: string) => void;
}

export function InvoiceTable({
  invoices,
  onViewInvoice,
  onToggleStatus,
  onDeleteInvoice,
}: InvoiceTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.clientEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Paid
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "OVERDUE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-3 h-3" />
            Overdue
          </span>
        );
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            <FileCode2 className="w-3 h-3" />
            Draft
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-[#111625] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
      {/* Search and Filters Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice number, client or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-x-auto text-xs font-semibold">
          {["ALL", "PAID", "PENDING", "OVERDUE", "DRAFT"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition-all capitalize cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? "bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {st.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/75 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4 sm:px-6">Invoice</th>
              <th className="py-3.5 px-4">Client</th>
              <th className="py-3.5 px-4">Due Date</th>
              <th className="py-3.5 px-4">Amount</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/80">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  No invoices found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors group"
                >
                  <td className="py-4 px-4 sm:px-6 font-semibold text-slate-900 dark:text-slate-100">
                    <span className="font-mono text-brand-600 dark:text-brand-400 hover:underline cursor-pointer" onClick={() => onViewInvoice(inv)}>
                      {inv.invoiceNumber}
                    </span>
                    <span className="block text-xs font-normal text-slate-400">{inv.issueDate}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-slate-800 dark:text-slate-200">{inv.clientName}</div>
                    <div className="text-xs text-slate-400">{inv.clientEmail}</div>
                  </td>
                  <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-mono text-xs">
                    {inv.dueDate}
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    ${inv.total.toLocaleString()}
                    <span className="text-xs font-normal text-slate-400 ml-1">{inv.currency}</span>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => onToggleStatus(inv.id)}
                      title="Click to toggle status"
                      className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                    >
                      {getStatusBadge(inv.status)}
                    </button>
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onViewInvoice(inv)}
                        title="View / Print PDF"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteInvoice(inv.id)}
                        title="Delete Invoice"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <span>Showing {filteredInvoices.length} of {invoices.length} total entries</span>
        <span className="text-[11px] text-slate-400">💡 Click any status badge to toggle between Paid / Pending</span>
      </div>
    </div>
  );
}
