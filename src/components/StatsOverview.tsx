"use client";

import React from "react";
import { Invoice } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import {
  DollarSign,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

interface StatsOverviewProps {
  invoices: Invoice[];
}

export function StatsOverview({ invoices }: StatsOverviewProps) {
  const { t, lang } = useLanguage();

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
  const pendingCount = invoices.filter((inv) => inv.status === "PENDING").length;
  const overdueCount = invoices.filter((inv) => inv.status === "OVERDUE").length;
  const totalCount = invoices.length;
  const collectionRate = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

  const stats = [
    {
      title: t("statSettled"),
      amount: `$${totalRevenue.toLocaleString()}`,
      subtitle: `${paidCount} ${t("statSettledSub")}`,
      icon: DollarSign,
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
      accent: "from-emerald-500/20 to-transparent",
      badge: "+18.4% MoM",
      badgeColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      progress: Math.min(100, Math.round((totalRevenue / (totalRevenue + pendingAmount || 1)) * 100)),
      progressBar: "bg-emerald-500",
    },
    {
      title: t("statPending"),
      amount: `$${pendingAmount.toLocaleString()}`,
      subtitle: `${pendingCount} ${t("statPendingSub")}`,
      icon: Clock,
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
      accent: "from-amber-500/20 to-transparent",
      badge: "Net 15/30 terms",
      badgeColor: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
      progress: Math.min(100, Math.round((pendingAmount / (totalRevenue + pendingAmount || 1)) * 100)),
      progressBar: "bg-amber-500",
    },
    {
      title: t("statOverdue"),
      amount: `$${overdueAmount.toLocaleString()}`,
      subtitle: `${overdueCount} ${t("statOverdueSub")}`,
      icon: AlertTriangle,
      color: "text-rose-500 dark:text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400",
      accent: "from-rose-500/20 to-transparent",
      badge: overdueCount > 0 ? (lang === "id" ? "Perlu Ditagih" : "Action required") : (lang === "id" ? "Aman" : "Zero overdue"),
      badgeColor: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
      progress: Math.min(100, Math.round((overdueCount / (totalCount || 1)) * 100)),
      progressBar: "bg-rose-500",
    },
    {
      title: t("statCollection"),
      amount: `${collectionRate}%`,
      subtitle: `${paidCount} ${t("tableOf")} ${totalCount} ${t("statCollectionSub")}`,
      icon: TrendingUp,
      color: "text-brand-500 dark:text-brand-400",
      bg: "bg-brand-500/10 border-brand-500/20 text-brand-600 dark:text-brand-400",
      accent: "from-brand-500/20 to-transparent",
      badge: "Target: 85%+",
      badgeColor: "text-brand-600 dark:text-brand-400 bg-brand-500/10 border-brand-500/20",
      progress: collectionRate,
      progressBar: "bg-brand-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="group relative overflow-hidden p-5 rounded-2xl bg-white dark:bg-[#0e1424] border border-slate-200/90 dark:border-slate-800/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700"
          >
            {/* Top ambient highlight line */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.accent}`}
            />

            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {stat.title}
              </span>
              <div
                className={`p-2 rounded-xl border ${stat.bg} transition-transform duration-300 group-hover:scale-110`}
              >
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>

            <div className="flex items-baseline justify-between mb-1.5">
              <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50 font-mono">
                {stat.amount}
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${stat.badgeColor} flex items-center gap-0.5`}
              >
                {stat.badge}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{stat.subtitle}</p>

            {/* Micro Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full ${stat.progressBar} transition-all duration-500 rounded-full`}
                style={{ width: `${Math.max(4, stat.progress)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
