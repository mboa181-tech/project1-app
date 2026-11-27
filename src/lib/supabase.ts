import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Invoice } from "./types";

const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const supabaseUrl = rawUrl.replace(/^["']|["']$/g, "");

const rawKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  ""
).trim();
const supabaseAnonKey = rawKey.replace(/^["']|["']$/g, "");

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    isValidHttpUrl(supabaseUrl) &&
    supabaseUrl !== "https://your-project.supabase.co" &&
    !supabaseUrl.includes("your-project")
);

export const supabaseDiagnostics = {
  hasUrl: Boolean(supabaseUrl),
  isValidUrl: isValidHttpUrl(supabaseUrl),
  urlPrefix: supabaseUrl ? supabaseUrl.slice(0, 16) : null,
  hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  hasPublishableKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  hasPublishableDefaultKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY),
  isSupabaseConfigured,
};

// Real Supabase Client (safely initialized only when URL is valid)
let client: SupabaseClient | null = null;
if (isSupabaseConfigured) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
    client = null;
  }
}

export const supabase = client;

// Database Mapper Functions (snake_case in Postgres <-> camelCase in TypeScript)
export function mapFromDb(row: any): Invoice {
  return {
    id: row.id,
    userId: row.user_id || undefined,
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
    user_id: inv.userId || "default_user",
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
