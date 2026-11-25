"use client";

import React, { useMemo } from "react";
import { Invoice } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { formatRupiah } from "@/lib/format-currency";
import { BarChart3, PieChart } from "lucide-react";

interface RevenueAnalyticsProps {
  invoices: Invoice[];
}

export function RevenueAnalytics({ invoices }: RevenueAnalyticsProps) {
  const { lang } = useLanguage();

  const { statusBreakdown, topClients, totalVolume } = useMemo(() => {
    const sums = {
      PAID: 0,
      PENDING: 0,
      OVERDUE: 0,
      DRAFT: 0,
    };
    const clientTotals: Record<string, number> = {};

    invoices.forEach((inv) => {
      sums[inv.status] = (sums[inv.status] || 0) + inv.total;
      clientTotals[inv.clientName] = (clientTotals[inv.clientName] || 0) + inv.total;
    });

    const total = Object.values(sums).reduce((a, b) => a + b, 0);

    const breakdown = [
      {
        key: "PAID",
        label: lang === "id" ? "Lunas" : "Paid",
        amount: sums.PAID,
        barColor: "bg-emerald-500",
        dotColor: "bg-emerald-500",
        textColor: "text-emerald-600 dark:text-emerald-400",
      },
      {
        key: "PENDING",
        label: lang === "id" ? "Tertunda" : "Pending",
        amount: sums.PENDING,
        barColor: "bg-amber-500",
        dotColor: "bg-amber-500",
        textColor: "text-amber-600 dark:text-amber-400",
      },
      {
        key: "OVERDUE",
        label: lang === "id" ? "Jatuh Tempo" : "Overdue",
        amount: sums.OVERDUE,
        barColor: "bg-rose-500",
        dotColor: "bg-rose-500",
        textColor: "text-rose-600 dark:text-rose-400",
      },
      {
        key: "DRAFT",
        label: lang === "id" ? "Draf" : "Draft",
        amount: sums.DRAFT,
        barColor: "bg-slate-400 dark:bg-slate-500",
        dotColor: "bg-slate-400",
        textColor: "text-slate-600 dark:text-slate-400",
      },
    ];

    const sortedClients = Object.entries(clientTotals)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);

    return { statusBreakdown: breakdown, topClients: sortedClients, totalVolume: total };
  }, [invoices, lang]);

  const maxClientAmount = topClients[0]?.amount || 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Status Distribution Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0e1424] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500 border border-brand-500/20">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {lang === "id" ? "Distribusi Nilai Tagihan" : "Invoice Value Distribution"}
              </h3>
              <p className="text-[11px] text-slate-400">
                {lang === "id" ? "Total portofolio aktif" : "Total active portfolio"}:{" "}
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                  {formatRupiah(totalVolume)}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Stacked Progress Bar */}
        <div className="w-full h-3.5 rounded-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden flex">
          {statusBreakdown.map((item) => {
            const pct = totalVolume > 0 ? (item.amount / totalVolume) * 100 : 0;
            if (pct <= 0) return null;
            return (
              <div
                key={item.key}
                style={{ width: `${pct}%` }}
                className={`${item.barColor} h-full transition-all duration-500`}
                title={`${item.label}: ${formatRupiah(item.amount)} (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>

        {/* Legend Grid */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {statusBreakdown.map((item) => {
            const pct = totalVolume > 0 ? Math.round((item.amount / totalVolume) * 100) : 0;
            return (
              <div
                key={item.key}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
                    <span className={`w-2 h-2 rounded-full ${item.dotColor}`} />
                    {item.label}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">{pct}%</span>
                </div>
                <p className={`font-mono text-xs font-bold ${item.textColor}`}>
                  {formatRupiah(item.amount)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Clients Bar Chart */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0e1424] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {lang === "id" ? "Kontribusi Klien Teratas" : "Top Client Contributions"}
            </h3>
            <p className="text-[11px] text-slate-400">
              {lang === "id" ? "Berdasarkan total nilai tagihan" : "Ranked by gross billed amount"}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {topClients.map((client) => {
            const widthPct = Math.max(6, Math.round((client.amount / maxClientAmount) * 100));
            return (
              <div key={client.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[55%]">
                    {client.name}
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {formatRupiah(client.amount)}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all duration-500"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
          {topClients.length === 0 && (
            <p className="text-xs text-slate-400 py-6 text-center">
              {lang === "id" ? "Belum ada data klien." : "No client data yet."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
