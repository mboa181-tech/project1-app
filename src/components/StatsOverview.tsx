import React from "react";
import { Invoice } from "@/lib/types";
import { DollarSign, Clock, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";

interface StatsOverviewProps {
  invoices: Invoice[];
}

export function StatsOverview({ invoices }: StatsOverviewProps) {
  const totalRevenue = invoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + inv.total, 0);

  const pendingAmount = invoices
    .filter((inv) => inv.status === "PENDING")
    .reduce((sum, inv) => sum + inv.total, 0);

  const overdueAmount = invoices
    .filter((inv) => inv.status === "OVERDUE")
    .reduce((sum, inv) => sum + inv.total, 0);

  const paidCount = invoices.filter((inv) => inv.status === "PAID").length;
  const totalCount = invoices.length;
  const collectionRate = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

  const stats = [
    {
      title: "Settled Revenue",
      amount: `$${totalRevenue.toLocaleString()}`,
      subtitle: `${paidCount} invoices settled`,
      icon: DollarSign,
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      trend: "+18.4% vs last mo",
    },
    {
      title: "Pending Invoices",
      amount: `$${pendingAmount.toLocaleString()}`,
      subtitle: "Awaiting client settlement",
      icon: Clock,
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      trend: "Net 15/30 terms",
    },
    {
      title: "Overdue Receivables",
      amount: `$${overdueAmount.toLocaleString()}`,
      subtitle: "Requires automated follow-up",
      icon: AlertTriangle,
      color: "text-rose-500 dark:text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
      trend: "Action required",
    },
    {
      title: "Collection Rate",
      amount: `${collectionRate}%`,
      subtitle: `${paidCount} of ${totalCount} closed`,
      icon: TrendingUp,
      color: "text-brand-500 dark:text-brand-400",
      bg: "bg-brand-500/10 border-brand-500/20",
      trend: "Target: 85%+",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white dark:bg-[#111625] border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {stat.title}
              </span>
              <div className={`p-2 rounded-xl border ${stat.bg}`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold tracking-tight">{stat.amount}</div>
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                {stat.trend}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
}
