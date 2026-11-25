"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DemoUser } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldCheck,
  Moon,
  Sun,
  Plus,
  FileText,
  Users,
  CreditCard,
  Sparkles,
  Globe,
  LogIn,
  LogOut,
} from "lucide-react";

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
  const pathname = usePathname();
  const { lang, toggleLang, t } = useLanguage();
  const { user, signOut } = useAuth();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    currentUser.name;
  const displaySubtitle = user
    ? user.email
    : currentUser.role === "Owner"
    ? t("navOwner")
    : t("navStaff");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#080c14]/80 backdrop-blur-md transition-colors">
      {/* Top Session / Demo Banner */}
      {user ? (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-brand-600 text-white text-xs px-4 py-1.5 flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
            <span>
              <strong>{t("authVerifiedSession")} (Supabase Auth):</strong>{" "}
              {t("authSignedInAs")} <u>{displayName}</u> ({user.email})
            </span>
          </div>
          <button
            onClick={signOut}
            className="underline hover:text-white/80 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
          >
            <LogOut className="w-3 h-3" />
            {t("authLogout")}
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white text-xs px-4 py-1.5 flex items-center justify-between gap-2 font-medium">
          <div className="flex items-center gap-2 truncate">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="truncate">
              <strong>{t("navDemoMode")}:</strong> {t("navViewingAs")} <u>{currentUser.name}</u> (
              {currentUser.role === "Owner" ? t("navOwner") : t("navStaff")})
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onSwitchUser}
              className="underline hover:text-white/80 transition-colors text-xs font-semibold hidden sm:flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              {t("navSwitchRole")}{" "}
              {currentUser.role === "Owner" ? t("navStaff") : t("navOwner")}
            </button>
            <Link
              href="/login"
              className="px-2.5 py-0.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors text-xs font-bold flex items-center gap-1"
            >
              <LogIn className="w-3 h-3" />
              {t("authLogin")}
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 transition-transform group-hover:scale-105">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
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
          </Link>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100/80 dark:bg-slate-900/80 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-xs font-semibold">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                pathname === "/"
                  ? "bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t("navInvoices")}</span>
            </Link>

            <Link
              href="/clients"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                pathname === "/clients"
                  ? "bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t("navClients")}</span>
            </Link>

            <Link
              href="/pay/INV-2026-002"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                pathname?.startsWith("/pay")
                  ? "bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{t("navPayDemo")}</span>
            </Link>
          </nav>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Language Switcher Button */}
          <button
            onClick={toggleLang}
            title={lang === "en" ? "Ganti ke Bahasa Indonesia" : "Switch to English"}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-brand-500" />
            <span>{lang === "en" ? "🇺🇸 EN" : "🇮🇩 ID"}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800 cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* New Invoice Button */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t("navNewInvoice")}</span>
          </button>

          {/* User Profile / Login Pill */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center font-bold text-xs text-emerald-500">
                {displayName.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden lg:block text-left max-w-[140px]">
                <p className="text-xs font-semibold leading-tight truncate">{displayName}</p>
                <p className="text-[10px] text-emerald-500 font-medium leading-tight truncate">
                  {displaySubtitle}
                </p>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-brand-500" />
              <span className="hidden sm:inline">{t("authLogin")}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <nav className="flex md:hidden items-center justify-around gap-1 px-3 py-2 border-t border-slate-200/70 dark:border-slate-800/70 bg-slate-50/80 dark:bg-slate-900/50 text-xs font-semibold">
        <Link
          href="/"
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
            pathname === "/"
              ? "bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-300 shadow-sm"
              : "text-slate-600 dark:text-slate-400"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{t("navInvoices")}</span>
        </Link>
        <Link
          href="/clients"
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
            pathname === "/clients"
              ? "bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-300 shadow-sm"
              : "text-slate-600 dark:text-slate-400"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{t("navClients")}</span>
        </Link>
        <Link
          href="/pay/INV-2026-002"
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
            pathname?.startsWith("/pay")
              ? "bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-300 shadow-sm"
              : "text-slate-600 dark:text-slate-400"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>{t("navPayDemo")}</span>
        </Link>
      </nav>
    </header>
  );
}
