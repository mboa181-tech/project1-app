"use client";

import React, { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  X,
  History,
  Trash2,
  PlusCircle,
  Pencil,
  CheckCircle2,
  Zap,
  Trash,
} from "lucide-react";

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

  const getActionBadge = (action: AuditEntry["action"]) => {
    switch (action) {
      case "CREATE":
        return {
          pillClass: "bg-[color-mix(in_srgb,var(--gd-teal)_18%,transparent)] text-[var(--gd-teal)] border-[color-mix(in_srgb,var(--gd-teal)_35%,transparent)]",
          icon: <PlusCircle className="w-3.5 h-3.5" />,
          label: "BUAT",
        };
      case "UPDATE":
        return {
          pillClass: "bg-[color-mix(in_srgb,var(--gd-ochre)_18%,transparent)] text-[var(--gd-ochre)] border-[color-mix(in_srgb,var(--gd-ochre)_35%,transparent)]",
          icon: <Pencil className="w-3.5 h-3.5" />,
          label: "EDIT",
        };
      case "STATUS":
        return {
          pillClass: "bg-[color-mix(in_srgb,var(--gd-teal)_22%,transparent)] text-[var(--gd-teal)] border-[color-mix(in_srgb,var(--gd-teal)_40%,transparent)]",
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          label: "STATUS",
        };
      case "WEBHOOK":
        return {
          pillClass: "bg-[color-mix(in_srgb,#8b5cf6_18%,transparent)] text-[#a78bfa] border-[#8b5cf6]/30",
          icon: <Zap className="w-3.5 h-3.5" />,
          label: "WEBHOOK",
        };
      case "DELETE":
        return {
          pillClass: "bg-[color-mix(in_srgb,var(--gd-coral)_18%,transparent)] text-[var(--gd-coral)] border-[color-mix(in_srgb,var(--gd-coral)_35%,transparent)]",
          icon: <Trash className="w-3.5 h-3.5" />,
          label: "HAPUS",
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-md animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className="relative z-10 w-full max-w-md glass-modal rounded-none rounded-l-[32px] border-y-0 border-r-0 border-l border-[var(--gd-rim)] shadow-2xl flex flex-col h-full">
        {/* Header */}
        <div className="p-5 border-b border-[var(--gd-line)] flex items-center justify-between bg-[var(--gd-surface)]/60 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--gd-pick)] text-[var(--gd-pick-ink)] border border-[var(--gd-rim)] flex items-center justify-center shadow-sm">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[var(--gd-ink)]">
                {t("auditTitle")}
              </h3>
              <p className="text-[11px] text-[var(--gd-muted)]">
                {t("auditSubtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {entries.length > 0 && (
              <button
                type="button"
                onClick={onClear}
                title="Hapus riwayat aktivitas lokal"
                className="glass-btn-coral text-[11px] px-3 py-1 font-bold"
              >
                <Trash2 className="w-3 h-3" />
                <span>{t("auditClear")}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="glass-icon-btn"
              aria-label="Tutup panel riwayat audit"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Audit Log Entries List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {entries.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--gd-muted)]">
              <div className="w-16 h-16 rounded-full bg-[var(--gd-inner)] border border-[var(--gd-rim)] flex items-center justify-center mb-3">
                <History className="w-7 h-7 text-[var(--gd-muted)] opacity-60" />
              </div>
              <p className="text-xs font-semibold">
                {t("auditEmpty")}
              </p>
              <p className="text-[11px] opacity-75 mt-1 max-w-[220px]">
                Setiap aksi pembuatan, perubahan status, atau webhook akan otomatis tercatat di sini.
              </p>
            </div>
          ) : (
            entries.map((entry) => {
              const badge = getActionBadge(entry.action);
              return (
                <div
                  key={entry.id}
                  className="p-3.5 rounded-2xl glass-panel-sub hover:bg-[var(--gd-raised)]/40 transition-all border border-[var(--gd-line)] space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${badge.pillClass}`}
                      >
                        {badge.icon}
                        <span>{badge.label}</span>
                      </span>
                      <span className="font-mono text-xs font-bold text-[var(--gd-ink)]">
                        {entry.target}
                      </span>
                    </div>
                    <span className="text-[10px] text-[var(--gd-muted)] font-mono">
                      {entry.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--gd-ink)] leading-relaxed">
                    {entry.detail}
                  </p>

                  <div className="pt-1.5 border-t border-[var(--gd-line)]/60 flex items-center justify-between text-[10px] text-[var(--gd-muted)]">
                    <span className="truncate max-w-[200px]">
                      Oleh: <strong className="text-[var(--gd-ink)]">{entry.actor}</strong>
                    </span>
                    <span className="font-mono text-[9px] opacity-70">
                      ID: {entry.id.split("-").slice(-2).join("-")}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[var(--gd-line)] bg-[var(--gd-surface)]/60 backdrop-blur-xl flex items-center justify-between text-[11px] text-[var(--gd-muted)]">
          <span>{entries.length} entri tercatat</span>
          <span className="font-mono text-[10px]">Audit Trace Engine v2</span>
        </div>
      </aside>
    </div>
  );
}
