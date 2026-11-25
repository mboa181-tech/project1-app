import { createClient } from "@supabase/supabase-js";
import { Invoice } from "./types";
import { initialInvoices } from "./mock-data";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "https://your-project.supabase.co" &&
    !supabaseUrl.includes("your-project")
);

export const supabaseDiagnostics = {
  hasUrl: Boolean(supabaseUrl),
  hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  hasPublishableKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  hasPublishableDefaultKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY),
  isSupabaseConfigured,
};

// Real Supabase Client (if environment variables exist)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database Mapper Functions (snake_case in Postgres <-> camelCase in TypeScript)
export function mapFromDb(row: any): Invoice {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    clientName: row.client_name,
    clientEmail: row.client_email,
    issueDate: row.issue_date,
    dueDate: row.due_date,
    status: row.status,
    subtotal: Number(row.subtotal),
    taxRate: Number(row.tax_rate),
    taxAmount: Number(row.tax_amount),
    total: Number(row.total),
    currency: row.currency || "IDR",
    notes: row.notes,
    items: typeof row.items === "string" ? JSON.parse(row.items) : row.items || [],
  };
}

export function mapToDb(inv: Invoice) {
  return {
    id: inv.id,
    invoice_number: inv.invoiceNumber,
    client_name: inv.clientName,
    client_email: inv.clientEmail,
    issue_date: inv.issueDate,
    due_date: inv.dueDate,
    status: inv.status,
    subtotal: inv.subtotal,
    tax_rate: inv.taxRate,
    tax_amount: inv.taxAmount,
    total: inv.total,
    currency: inv.currency,
    notes: inv.notes,
    items: inv.items,
  };
}
