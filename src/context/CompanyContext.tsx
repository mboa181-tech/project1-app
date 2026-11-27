"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

export interface CompanyProfile {
  companyName: string;
  tagline: string;
  address: string;
  billingEmail: string;
  phone: string;
  website: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  signatoryName: string;
  taxId: string;
}

export const defaultCompanyProfile: CompanyProfile = {
  companyName: "FlowDesk Inc.",
  tagline: "Financial Operations & Enterprise Billing",
  address: "Jl. Sudirman No. 100, Suite 400, Jakarta Selatan 12190",
  billingEmail: "billing@flowdesk.app",
  phone: "+62 812-8888-9999",
  website: "https://flowdesk.aads.my.id",
  bankName: "BCA / Bank Mandiri",
  bankAccountNumber: "1234-567-890",
  bankAccountHolder: "PT FlowDesk Solusi Nusantara",
  signatoryName: "FlowDesk Finance",
  taxId: "NPWP: 01.234.567.8-012.000",
};

interface CompanyContextType {
  companyProfile: CompanyProfile;
  updateCompanyProfile: (profile: Partial<CompanyProfile>) => void;
  resetCompanyProfile: () => void;
  isCustomized: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userKey = user?.id || user?.email || "default_user";
  const storageKey = `flowdesk_company_profile_${userKey}`;

  const baseDefault: CompanyProfile = {
    ...defaultCompanyProfile,
    companyName: user?.user_metadata?.full_name
      ? `${user.user_metadata.full_name} Workspace`
      : defaultCompanyProfile.companyName,
    billingEmail: user?.email || defaultCompanyProfile.billingEmail,
  };

  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(defaultCompanyProfile);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCompanyProfile({ ...baseDefault, ...parsed });
      } else {
        setCompanyProfile(baseDefault);
      }
    } catch (e) {
      console.warn("Failed to load company profile from storage", e);
      setCompanyProfile(baseDefault);
    }
    setMounted(true);
  }, [storageKey]);

  const updateCompanyProfile = (updated: Partial<CompanyProfile>) => {
    setCompanyProfile((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch (e) {
        console.warn("Failed to save company profile to storage", e);
      }
      return next;
    });
  };

  const resetCompanyProfile = () => {
    setCompanyProfile(baseDefault);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {}
  };

  const isCustomized =
    companyProfile.companyName !== defaultCompanyProfile.companyName ||
    companyProfile.address !== defaultCompanyProfile.address ||
    companyProfile.bankAccountNumber !== defaultCompanyProfile.bankAccountNumber;

  return (
    <CompanyContext.Provider
      value={{
        companyProfile,
        updateCompanyProfile,
        resetCompanyProfile,
        isCustomized,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
}
