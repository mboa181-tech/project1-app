"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import {
  FileText,
  Mail,
  Lock,
  User,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
} from "lucide-react";

const studioPhoto =
  "https://cdn.21st.dev/assets/mirror/ea/ea9270b3b7246283219ac52fa77a1213e9d1efb285d76348d3620609ba6cefa7.jpg";

export default function LoginPage() {
  const router = useRouter();
  const { t, lang, toggleLang } = useLanguage();
  const { user, signInWithCredentials } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    setLoading(true);
    try {
      const res = await signInWithCredentials({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        mode,
      });

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Authentication error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-[var(--gd-ink)] flex flex-col justify-between relative overflow-hidden font-['Manrope_Variable',Manrope,sans-serif]">
      {/* Background Image & Warm Gradient */}
      <img
        src={studioPhoto}
        alt=""
        aria-hidden="true"
        className="fixed inset-0 w-full h-full object-cover object-center pointer-events-none -z-20 filter sepia-[.22] saturate-[.78] brightness-[.86] dark:brightness-[.58]"
      />
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none -z-10 bg-gradient-to-tr from-[#493025]/45 via-transparent to-[#a2653f]/30"
      />

      {/* Top Bar */}
      <header className="relative z-10 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="glass-btn-secondary px-3.5 py-1.5 text-xs font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t("authBackHome")}</span>
        </Link>

        <button
          type="button"
          onClick={toggleLang}
          className="glass-btn-secondary px-3 py-1.5 text-xs font-bold"
        >
          <Globe className="w-3.5 h-3.5 text-[var(--gd-muted)]" />
          <span>{lang === "en" ? "🇺🇸 EN" : "🇮🇩 ID"}</span>
        </button>
      </header>

      {/* Main Glass Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md glass-modal rounded-[32px] p-7 sm:p-9 shadow-2xl space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[var(--gd-pick)] text-[var(--gd-pick-ink)] border border-[var(--gd-rim)] flex items-center justify-center shadow-md">
              <svg className="w-7 h-7" viewBox="0 0 28 28" fill="none">
                <path d="m5 22 7.4-16h3.2L23 22h-4l-5-11.4L9 22H5Z" fill="currentColor"/>
                <path d="M10 18h8l1.4 3h-10.8l1.4-3Z" fill="currentColor"/>
              </svg>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[var(--gd-ink)]">
              {mode === "signin" ? t("authTitleSignIn") : t("authTitleSignUp")}
            </h1>
            <p className="text-xs text-[var(--gd-muted)]">
              {mode === "signin" ? t("authSubtitleSignIn") : t("authSubtitleSignUp")}
            </p>
          </div>

          {/* Mode Pill Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-full glass-panel-sub text-xs font-extrabold">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setErrorMsg(null);
              }}
              className={`py-2 rounded-full transition-all cursor-pointer ${
                mode === "signin"
                  ? "bg-[var(--gd-primary)] text-[var(--gd-primary-ink)] shadow-md"
                  : "text-[var(--gd-muted)] hover:text-[var(--gd-ink)]"
              }`}
            >
              {t("authLogin")}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setErrorMsg(null);
              }}
              className={`py-2 rounded-full transition-all cursor-pointer ${
                mode === "signup"
                  ? "bg-[var(--gd-primary)] text-[var(--gd-primary-ink)] shadow-md"
                  : "text-[var(--gd-muted)] hover:text-[var(--gd-ink)]"
              }`}
            >
              {t("authRegister")}
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-[color-mix(in_srgb,var(--gd-coral)_16%,transparent)] border border-[color-mix(in_srgb,var(--gd-coral)_35%,transparent)] text-[var(--gd-coral)] text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-[color-mix(in_srgb,var(--gd-teal)_16%,transparent)] border border-[color-mix(in_srgb,var(--gd-teal)_35%,transparent)] text-[var(--gd-teal)] text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-[11px] font-extrabold text-[var(--gd-muted)] uppercase tracking-wider mb-1.5">
                  {t("authFullName")}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[var(--gd-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Budi Santoso"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full glass-input pl-10 pr-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-extrabold text-[var(--gd-muted)] uppercase tracking-wider mb-1.5">
                {t("authEmail")}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[var(--gd-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="nama@perusahaan.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input pl-10 pr-3.5 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-[var(--gd-muted)] uppercase tracking-wider mb-1.5">
                {t("authPassword")}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--gd-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input pl-10 pr-10 py-2.5 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--gd-muted)] hover:text-[var(--gd-ink)] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full glass-btn-primary py-3 text-sm flex items-center justify-center gap-2 mt-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              )}
              <span>{mode === "signin" ? t("authSubmitSignIn") : t("authSubmitSignUp")}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-[var(--gd-line)] flex items-center justify-center gap-2 text-[11px] text-[var(--gd-muted)]">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--gd-teal)]" />
            <span>
              {lang === "id"
                ? "Sesi Terenkripsi & Terlindungi Keamanan Berlapis (SHA-256)"
                : "End-to-End Encrypted Session · 256-bit Security"}
            </span>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-4 text-center text-xs text-[var(--gd-muted)]">
        FlowDesk Operations • Authentication Gateway • 2026
      </footer>
    </div>
  );
}
