"use client";

import React, { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { X, History, Trash2, PlusCircle, Pencil, CheckCircle2, Zap, Trash } from "lucide-react";

export interface AuditEntry {
  id: string;
  action: "CREATE" | "UPDATE" | "STATUS" | "DELETE" | "WEBHOOK";
  target: string;
  detail: string;
  actor: string;
  timestamp: string;
}

interface AuditLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entries: AuditEntry[];
  onClear: () => void;
}

export function AuditLogDrawer({
  isOpen,
  onClose,
  entries,
  onClear,
}: AuditLogDrawerProps) {
  const { t } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getBadgeStyle = (action: AuditEntry["action"]) => {
    switch (action) {
      case "CREATE":
        return {
          bg: "bg-brand-500/10 text-brand-500 border-brand-500/20",
          icon: <PlusCircle className="w-3.5 h-3.5" />,
        };
      case "UPDATE":
        return {
          bg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
          icon: <Pencil className="w-3.5 h-3.5" />,
        };
      case "STATUS":
        return {
          bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
      case "WEBHOOK":
        return {
          bg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
          icon: <Zap className="w-3.5 h-3.5" />,
        };
      case "DELETE":
        return {
          bg: "bg-rose-500/10 text-rose-500 border-rose-500/20",
          icon: <Trash className="w-3.5 h-3.5" />,
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="relative z-10 w-full max-w-md bg-white dark:bg-[#0e1424] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t("auditTitle")}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t("auditSubtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {entries.length > 0 && (
              <button
                onClick={onClear}
                title={t("auditClear")}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t("auditClear")}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Entries List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {entries.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
              <History className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("auditEmpty")}
              </p>
            </div>
          ) : (
            entries.map((entry) => {
              const badge = getBadgeStyle(entry.action);
              return (
                <div
                  key={entry.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge.bg}`}
                    >
                      {badge.icon}
                      {entry.action}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {entry.timestamp}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">
                    {entry.target}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {entry.detail}
                  </p>
                  <p className="text-[10px] text-slate-400 pt-0.5">
                    Actor: <span className="font-semibold text-slate-600 dark:text-slate-300">{entry.actor}</span>
                  </p>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
}
