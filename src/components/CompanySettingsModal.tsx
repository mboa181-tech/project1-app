"use client";

import React, { useState, useEffect } from "react";
import { useCompany, CompanyProfile } from "@/context/CompanyContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  Building2,
  X,
  Check,
  RotateCcw,
  CreditCard,
  FileText,
  Mail,
  Phone,
  Globe,
  MapPin,
  ShieldCheck,
  Eye,
  CheckCircle2,
} from "lucide-react";

interface CompanySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavedToast?: (message: string) => void;
}

export function CompanySettingsModal({
  isOpen,
  onClose,
  onSavedToast,
}: CompanySettingsModalProps) {
  const { companyProfile, updateCompanyProfile, resetCompanyProfile, isCustomized } =
    useCompany();
  const { lang } = useLanguage();

  const [formData, setFormData] = useState<CompanyProfile>(companyProfile);
  const [activeTab, setActiveTab] = useState<"general" | "bank" | "legal">("general");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(companyProfile);
      setSavedSuccess(false);
    }
  }, [isOpen, companyProfile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (field: keyof CompanyProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyProfile(formData);
    setSavedSuccess(true);
    if (onSavedToast) {
      onSavedToast(
        lang === "id"
          ? `Profil ${formData.companyName} berhasil disimpan!`
          : `Company profile for ${formData.companyName} saved!`
      );
    }
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleReset = () => {
    if (
      window.confirm(
        lang === "id"
          ? "Kembalikan profil perusahaan ke default FlowDesk Inc.?"
          : "Reset company profile to default FlowDesk Inc.?"
      )
    ) {
      resetCompanyProfile();
      setFormData(companyProfile);
      if (onSavedToast) {
        onSavedToast(lang === "id" ? "Profil berhasil di-reset ke default!" : "Profile reset to default!");
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-md animate-fade-in print:hidden">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 max-w-2xl w-full my-auto">
        {/* Tombol Tutup Mengambang di Pojok Kanan Atas */}
        <button
          type="button"
          onClick={onClose}
          className="glass-icon-btn absolute -top-3 -right-2 sm:-top-3.5 sm:-right-3.5 z-30 shadow-2xl hover:scale-105 active:scale-95 hover:border-[var(--gd-coral)] hover:text-[var(--gd-coral)] transition-all cursor-pointer"
          title="Tutup (Esc)"
          aria-label="Tutup dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="glass-modal rounded-[28px] w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[var(--gd-rim)]">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[var(--gd-line)] flex items-center justify-between sticky top-0 bg-[var(--gd-surface)]/90 backdrop-blur-xl z-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--gd-pick)] text-[var(--gd-pick-ink)] border border-[var(--gd-rim)] flex items-center justify-center shadow-md shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-[var(--gd-ink)] tracking-tight">
                    {lang === "id" ? "Profil Perusahaan & Rekening" : "Company & Bank Settings"}
                  </h2>
                  {isCustomized && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--gd-teal)_15%,transparent)] text-[var(--gd-teal)] border border-[color-mix(in_srgb,var(--gd-teal)_35%,transparent)]">
                      Kustom Aktif
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--gd-muted)] mt-0.5">
                  {lang === "id"
                    ? "Identitas toko/PT ini otomatis tercetak pada faktur dan portal pembayaran."
                    : "Merchant profile used across official invoices and client payment portals."}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-5 pt-3 border-b border-[var(--gd-line)] flex gap-2 overflow-x-auto text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-all ${
                activeTab === "general"
                  ? "border-[var(--gd-teal)] text-[var(--gd-teal)]"
                  : "border-transparent text-[var(--gd-muted)] hover:text-[var(--gd-ink)]"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{lang === "id" ? "Identitas Bisnis" : "Business Identity"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("bank")}
              className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-all ${
                activeTab === "bank"
                  ? "border-[var(--gd-teal)] text-[var(--gd-teal)]"
                  : "border-transparent text-[var(--gd-muted)] hover:text-[var(--gd-ink)]"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{lang === "id" ? "Rekening Pembayaran" : "Bank Accounts"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("legal")}
              className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-all ${
                activeTab === "legal"
                  ? "border-[var(--gd-teal)] text-[var(--gd-teal)]"
                  : "border-transparent text-[var(--gd-muted)] hover:text-[var(--gd-ink)]"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{lang === "id" ? "Legalitas & Tanda Tangan" : "Legal & Signatory"}</span>
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
            {activeTab === "general" && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-[11px] font-extrabold text-[var(--gd-muted)] uppercase tracking-wider mb-1.5">
                    {lang === "id" ? "Nama Perusahaan / Toko / Agensi *" : "Company / Business Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => handleChange("companyName", e.target.value)}
                    placeholder="misal: PT Nusantara Teknologi Mandiri"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--gd-inner)] border border-[var(--gd-line)] text-sm font-semibold text-[var(--gd-ink)] focus:outline-none focus:border-[var(--gd-teal)] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-[var(--gd-muted)] uppercase tracking-wider mb-1.5">
                    {lang === "id" ? "Tagline / Slogan Bisnis" : "Business Tagline / Subtitle"}
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => handleChange("tagline", e.target.value)}
                    placeholder="misal: Software Development & IT Consulting"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--gd-inner)] border border-[var(--gd-line)] text-sm font-semibold text-[var(--gd-ink)] focus:outline-none focus:border-[var(--gd-teal)] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-[var(--gd-muted)] uppercase tracking-wider mb-1.5">
                    {lang === "id" ? "Alamat Lengkap Kantor *" : "Office Address *"}
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="misal: Gedung Menara Cyber Lt. 12, Jl. Kuningan Barat No. 8, Jakarta Selatan 12710"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--gd-inner)] border border-[var(--gd-line)] text-sm font-semibold text-[var(--gd-ink)] focus:outline-none focus:border-[var(--gd-teal)] transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-[var(--gd-muted)] uppercase tracking-wider mb-1.5">
                      {lang === "id" ? "Email Resmi Tagihan *" : "Billing Email *"}
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.billingEmail}
                      onChange={(e) => handleChange("billingEmail", e.target.value)}
                      placeholder="finance@perusahaananda.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--gd-inner)] border border-[var(--gd-line)] text-sm font-semibold text-[var(--gd-ink)] focus:outline-none focus:border-[var(--gd-teal)] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-[var(--gd-muted)] uppercase tracking-wider mb-1.5">
                      {lang === "id" ? "WhatsApp / Telepon Bisnis" : "Business Phone / WhatsApp"}
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="+62 812-3456-7890"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--gd-inner)] border border-[var(--gd-line)] text-sm font-semibold text-[var(--gd-ink)] focus:outline-none focus:border-[var(--gd-teal)] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-[var(--gd-muted)] uppercase tracking-wider mb-1.5">
                    {lang === "id" ? "Website Perusahaan" : "Company Website URL"}
                  </label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                    placeholder="https://perusahaananda.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--gd-inner)] border border-[var(--gd-line)] text-sm font-semibold text-[var(--gd-ink)] focus:outline-none focus:border-[var(--gd-teal)] transition-all"
                  />
                </div>
              </div>
            )}

            {activeTab === "bank" && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-3.5 rounded-2xl glass-panel-sub text-xs text-[var(--gd-muted)] flex items-start gap-2.5 border border-[var(--gd-line)]">
                  <CreditCard className="w-4 h-4 text-[var(--gd-teal)] shrink-0 mt-0.5" />
                  <span>
                    {lang === "id"
                      ? "Informasi rekening bank ini akan tercantum di bagian instruksi pembayaran transfer pada setiap nota / faktur tagihan yang dicetak."
                      : "These remittance bank details will be printed on standard invoice receipts for clients to transfer funds."}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-[var(--gd-muted)] uppercase tracking-wider mb-1.5">
                    {lang === "id" ? "Nama Bank Tujuan *" : "Bank Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bankName}
                    onChange={(e) => handleChange("bankName", e.target.value)}
                    placeholder="misal: BCA / Bank Mandiri / BRI"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--gd-inner)] border border-[var(--gd-line)] text-sm font-semibold text-[var(--gd-ink)] focus:outline-none focus:border-[var(--gd-teal)] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-[var(--gd-muted)] uppercase tracking-wider mb-1.5">
                    {lang === "id" ? "Nomor Rekening Bank *" : "Bank Account Number *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bankAccountNumber}
                    onChange={(e) => handleChange("bankAccountNumber", e.target.value)}
                    placeholder="misal: 1234-567-890"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--gd-inner)] border border-[var(--gd-line)] text-sm font-mono font-bold text-[var(--gd-ink)] focus:outline-none focus:border-[var(--gd-teal)] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-[var(--gd-muted)] uppercase tracking-wider mb-1.5">
                    {lang === "id" ? "Nama Pemilik Rekening (Atas Nama) *" : "Account Beneficiary Holder *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bankAccountHolder}
                    onChange={(e) => handleChange("bankAccountHolder", e.target.value)}
                    placeholder="misal: PT Nusantara Teknologi Mandiri"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--gd-inner)] border border-[var(--gd-line)] text-sm font-semibold text-[var(--gd-ink)] focus:outline-none focus:border-[var(--gd-teal)] transition-all"
                  />
                </div>
              </div>
            )}

            {activeTab === "legal" && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-[11px] font-extrabold text-[var(--gd-muted)] uppercase tracking-wider mb-1.5">
                    {lang === "id" ? "NPWP / No. Pokok Wajib Pajak" : "Tax ID / Corporate NPWP"}
                  </label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={(e) => handleChange("taxId", e.target.value)}
                    placeholder="misal: NPWP: 01.234.567.8-012.000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--gd-inner)] border border-[var(--gd-line)] text-sm font-mono text-[var(--gd-ink)] focus:outline-none focus:border-[var(--gd-teal)] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-[var(--gd-muted)] uppercase tracking-wider mb-1.5">
                    {lang === "id" ? "Nama / Bagian Penandatangan Nota *" : "Invoice Signatory / Signer *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.signatoryName}
                    onChange={(e) => handleChange("signatoryName", e.target.value)}
                    placeholder="misal: Bagian Keuangan & Penagihan / Budi Santoso"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--gd-inner)] border border-[var(--gd-line)] text-sm font-semibold text-[var(--gd-ink)] focus:outline-none focus:border-[var(--gd-teal)] transition-all"
                  />
                </div>
              </div>
            )}

            {/* Live Mini Preview Box */}
            <div className="p-4 rounded-2xl bg-[var(--gd-inner)] border border-[var(--gd-line)] space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--gd-muted)] flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[var(--gd-teal)]" />
                {lang === "id" ? "Pratinjau Langsung Header Nota:" : "Live Header Preview:"}
              </span>
              <div className="p-3 rounded-xl bg-[var(--gd-surface)] border border-[var(--gd-line)] text-xs">
                <h4 className="font-black text-sm text-[var(--gd-ink)]">{formData.companyName || "Nama Perusahaan"}</h4>
                <p className="text-[11px] text-[var(--gd-muted)] mt-0.5 leading-tight">
                  {formData.address || "Alamat Perusahaan"}
                  <br />
                  Email: {formData.billingEmail || "email@bisnis.com"} • {formData.website || "https://..."}
                </p>
                <div className="mt-2 pt-2 border-t border-[var(--gd-line)] text-[10.5px] text-[var(--gd-muted)]">
                  Bank: <strong>{formData.bankName}</strong> ({formData.bankAccountNumber}) a.n. <strong>{formData.bankAccountHolder}</strong>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 text-xs font-bold rounded-xl text-[var(--gd-muted)] hover:text-[var(--gd-coral)] hover:bg-[color-mix(in_srgb,var(--gd-coral)_10%,transparent)] border border-[var(--gd-line)] transition-all flex items-center gap-1.5"
                title="Kembalikan ke default FlowDesk Inc."
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="glass-btn-secondary px-4 py-2 text-xs font-bold"
                >
                  {lang === "id" ? "Batal" : "Cancel"}
                </button>

                <button
                  type="submit"
                  className="glass-btn-teal px-5 py-2 text-xs font-bold flex items-center gap-2 shadow-lg"
                >
                  {savedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>{lang === "id" ? "Tersimpan!" : "Saved!"}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{lang === "id" ? "Simpan Perubahan" : "Save Changes"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
