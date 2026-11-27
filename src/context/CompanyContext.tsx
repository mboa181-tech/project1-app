"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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

const STORAGE_KEY = "flowdesk_company_profile_v1";

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(defaultCompanyProfile);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCompanyProfile((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.warn("Failed to load company profile from storage", e);
    }
    setMounted(true);
  }, []);

  const updateCompanyProfile = (updated: Partial<CompanyProfile>) => {
    setCompanyProfile((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn("Failed to save company profile to storage", e);
      }
      return next;
    });
  };

  const resetCompanyProfile = () => {
    setCompanyProfile(defaultCompanyProfile);
    try {
      localStorage.removeItem(STORAGE_KEY);
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
