import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured, supabaseDiagnostics, mapFromDb, mapToDb } from "@/lib/supabase";
import { initialInvoices } from "@/lib/mock-data";
import { Invoice } from "@/lib/types";

// In-memory fallback cache for development/demo when Supabase keys aren't set
let localInvoicesStore: Invoice[] = [...initialInvoices];

// GET /api/invoices - Fetch all invoices
export async function GET() {
  let supabaseError: string | null = null;
  let rowCount: number | null = null;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      rowCount = data ? data.length : 0;
      if (data && data.length > 0) {
        return NextResponse.json({
          source: "supabase",
          invoices: data.map(mapFromDb),
        });
      }
    } catch (err: any) {
      supabaseError = err?.message || String(err);
      console.error("Supabase query error:", err);
    }
  }

  return NextResponse.json({
    source: "local-persistent",
    diagnostics: {
      ...supabaseDiagnostics,
      rowCount,
      supabaseError,
    },
    invoices: localInvoicesStore,
  });
}

// POST /api/invoices - Create new invoice
export async function POST(req: NextRequest) {
  try {
    const newInvoice: Invoice = await req.json();

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("invoices").insert([mapToDb(newInvoice)]);
      if (error) {
        console.error("Supabase insert error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    // Update in-memory fallback
    localInvoicesStore = [newInvoice, ...localInvoicesStore];

    return NextResponse.json({ success: true, invoice: newInvoice }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// PATCH /api/invoices - Update invoice status
export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("invoices").update({ status }).eq("id", id);
      if (error) {
        console.error("Supabase update error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    localInvoicesStore = localInvoicesStore.map((inv) =>
      inv.id === id ? { ...inv, status } : inv
    );

    return NextResponse.json({ success: true, id, status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// PUT /api/invoices - Full update of an existing invoice
export async function PUT(req: NextRequest) {
  try {
    const updatedInvoice: Invoice = await req.json();
    if (!updatedInvoice.id) {
      return NextResponse.json({ error: "Missing invoice ID" }, { status: 400 });
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from("invoices")
        .update(mapToDb(updatedInvoice))
        .eq("id", updatedInvoice.id);
      if (error) {
        console.error("Supabase full update error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    localInvoicesStore = localInvoicesStore.map((inv) =>
      inv.id === updatedInvoice.id ? updatedInvoice : inv
    );

    return NextResponse.json({ success: true, invoice: updatedInvoice });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// DELETE /api/invoices - Delete invoice
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("invoices").delete().eq("id", id);
      if (error) {
        console.error("Supabase delete error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    localInvoicesStore = localInvoicesStore.filter((inv) => inv.id !== id);

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
