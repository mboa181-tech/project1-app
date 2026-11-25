"use client";

import React, { useState, useMemo } from "react";
import { Invoice, InvoiceStatus } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCode2,
  Eye,
  Trash2,
  ArrowUpDown,
  Download,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface InvoiceTableProps {
  invoices: Invoice[];
  onViewInvoice: (invoice: Invoice) => void;
  onToggleStatus: (invoiceId: string) => void;
  onDeleteInvoice: (invoiceId: string) => void;
}

type SortField = "invoiceNumber" | "clientName" | "dueDate" | "total" | "status";
type SortDirection = "asc" | "desc";

function getAvatarGradient(name: string) {
  const gradients = [
    "from-blue-500 to-indigo-600",
    "from-purple-500 to-pink-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-red-600",
  ];
  const charCode = name.charCodeAt(0) || 0;
  return gradients[charCode % gradients.length];
}

export function InvoiceTable({
  invoices,
  onViewInvoice,
  onToggleStatus,
  onDeleteInvoice,
}: InvoiceTableProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<SortField>("dueDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const processedInvoices = useMemo(() => {
    return invoices
      .filter((inv) => {
        const matchesSearch =
          inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.clientEmail.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];

        if (sortField === "total") {
          return sortDirection === "asc" ? a.total - b.total : b.total - a.total;
        }

        const comparison = String(aVal).localeCompare(String(bVal));
        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [invoices, searchTerm, statusFilter, sortField, sortDirection]);

  const handleExportCSV = () => {
    const headers = ["Invoice Number,Client Name,Client Email,Issue Date,Due Date,Status,Subtotal,Tax,Total,Currency"];
    const rows = processedInvoices.map((inv) =>
      [
        `"${inv.invoiceNumber}"`,
        `"${inv.clientName}"`,
        `"${inv.clientEmail}"`,
        `"${inv.issueDate}"`,
        `"${inv.dueDate}"`,
        `"${inv.status}"`,
        inv.subtotal,
        inv.taxAmount,
        inv.total,
        `"${inv.currency}"`,
      ].join(",")
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `flowdesk-invoices-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {t("statusPaid")}
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            {t("statusPending")}
          </span>
        );
      case "OVERDUE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
            {t("statusOverdue")}
          </span>
        );
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            {t("statusDraft")}
          </span>
        );
    }
  };

  const renderSortArrow = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="w-3 h-3 text-brand-600 dark:text-brand-400" />
    ) : (
      <ChevronDown className="w-3 h-3 text-brand-600 dark:text-brand-400" />
    );
  };

  const filterTabs = [
    { key: "ALL", label: t("statusAll") },
    { key: "PAID", label: t("statusPaid") },
    { key: "PENDING", label: t("statusPending") },
    { key: "OVERDUE", label: t("statusOverdue") },
    { key: "DRAFT", label: t("statusDraft") },
  ];

  return (
    <div className="bg-white dark:bg-[#0e1424] rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm overflow-hidden transition-colors">
      {/* Search and Filters Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t("tableSearchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-12 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Pills & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-xl overflow-x-auto text-xs font-semibold border border-slate-200/50 dark:border-slate-800/50">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg transition-all capitalize cursor-pointer whitespace-nowrap ${
                  statusFilter === tab.key
                    ? "bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-300 shadow-sm font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            title="Download CSV Spreadsheet"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{t("tableExportCSV")}</span>
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/75 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold border-b border-slate-200 dark:border-slate-800 select-none">
            <tr>
              <th
                onClick={() => handleSort("invoiceNumber")}
                className="py-3.5 px-4 sm:px-6 cursor-pointer hover:text-slate-900 dark:hover:text-white group"
              >
                <div className="flex items-center gap-1.5">
                  <span>{t("tableInvoice")}</span>
                  {renderSortArrow("invoiceNumber")}
                </div>
              </th>
              <th
                onClick={() => handleSort("clientName")}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white group"
              >
                <div className="flex items-center gap-1.5">
                  <span>{t("tableClient")}</span>
                  {renderSortArrow("clientName")}
                </div>
              </th>
              <th
                onClick={() => handleSort("dueDate")}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white group"
              >
                <div className="flex items-center gap-1.5">
                  <span>{t("tableDueDate")}</span>
                  {renderSortArrow("dueDate")}
                </div>
              </th>
              <th
                onClick={() => handleSort("total")}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white group"
              >
                <div className="flex items-center gap-1.5">
                  <span>{t("tableAmount")}</span>
                  {renderSortArrow("total")}
                </div>
              </th>
              <th
                onClick={() => handleSort("status")}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white group"
              >
                <div className="flex items-center gap-1.5">
                  <span>{t("tableStatus")}</span>
                  {renderSortArrow("status")}
                </div>
              </th>
              <th className="py-3.5 px-4 sm:px-6 text-right">{t("tableActions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/80">
            {processedInvoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="max-w-xs mx-auto flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center text-slate-400">
                      <Search className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                        {t("tableNoInvoices")}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {t("tableNoInvoicesSub")}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("ALL");
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" /> {t("tableResetFilters")}
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              processedInvoices.map((inv) => {
                const initials = inv.clientName
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/75 dark:hover:bg-slate-900/40 transition-colors group"
                  >
                    <td className="py-4 px-4 sm:px-6">
                      <button
                        onClick={() => onViewInvoice(inv)}
                        className="font-mono font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer block text-left"
                      >
                        {inv.invoiceNumber}
                      </button>
                      <span className="block text-[11px] text-slate-400 mt-0.5">
                        {inv.issueDate}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${getAvatarGradient(
                            inv.clientName
                          )} flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0`}
                        >
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {inv.clientName}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{inv.clientEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-mono text-xs">
                      {inv.dueDate}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100 font-mono text-sm">
                      Rp {inv.total.toLocaleString("id-ID")}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => onToggleStatus(inv.id)}
                        title="Klik untuk ubah status"
                        className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                      >
                        {getStatusBadge(inv.status)}
                      </button>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <button
                          onClick={() => onViewInvoice(inv)}
                          title="Preview & Print"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">{t("tablePreview")}</span>
                        </button>
                        <button
                          onClick={() => onDeleteInvoice(inv.id)}
                          title="Delete"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="font-medium">
          {t("tableShowing")} <strong>{processedInvoices.length}</strong> {t("tableOf")}{" "}
          <strong>{invoices.length}</strong> {t("tableTotalRecords")}
        </span>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>{t("tableTip")}</span>
        </div>
      </div>
    </div>
  );
}
