"use client";

import React from "react";
import { DemoUser } from "@/lib/types";
import { ShieldCheck, Moon, Sun, Plus, FileText, Bell, Sparkles } from "lucide-react";

interface NavbarProps {
  currentUser: DemoUser;
  onSwitchUser: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenCreateModal: () => void;
}

export function Navbar({
  currentUser,
  onSwitchUser,
  isDark,
  onToggleTheme,
  onOpenCreateModal,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-md transition-colors">
      {/* Top Demo Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white text-xs px-4 py-1.5 flex items-center justify-between font-medium">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            <strong>Production Demo Mode:</strong> Viewing as <u>{currentUser.name}</u> ({currentUser.role})
          </span>
        </div>
        <button
          onClick={onSwitchUser}
          className="underline hover:text-white/80 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
        >
          <Sparkles className="w-3 h-3" />
          Switch to {currentUser.role === "Owner" ? "Billing Staff" : "Owner"} Account
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                FlowDesk
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                v15.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none">
              Financial Operations Engine
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800 cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* New Invoice Button */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm shadow-md shadow-brand-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Invoice</span>
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-brand-600 dark:text-brand-300 ring-2 ring-brand-500/20">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                {currentUser.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
