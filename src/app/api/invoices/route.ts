import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured, mapFromDb, mapToDb } from "@/lib/supabase";
import { initialInvoices } from "@/lib/mock-data";
import { Invoice } from "@/lib/types";
import {
  validateInvoicePayload,
  validateStatusPayload,
  sanitizeString,
} from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// In-memory fallback cache for development/demo when Supabase keys aren't set
let localInvoicesStore: Invoice[] = [...initialInvoices];

// GET /api/invoices - Fetch all invoices
export async function GET(req: NextRequest) {
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(`get_${clientIp}`, 120, 60000);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Silakan coba sesaat lagi." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase query error (masked from client):", error.message);
      } else if (data && data.length > 0) {
        return NextResponse.json({
          source: "supabase",
          invoices: data.map(mapFromDb),
        });
      }
    } catch (err) {
      console.error("Internal query exception (masked from client):", err);
    }
  }

  return NextResponse.json({
    source: "local-persistent",
    invoices: localInvoicesStore,
  });
}

// POST /api/invoices - Create new invoice
export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(`mutate_${clientIp}`, 40, 60000);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Batas pembuatan data terlampaui. Silakan coba 1 menit lagi." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  try {
    const rawBody = await req.json();
    const validation = validateInvoicePayload(rawBody);

    if (!validation.valid || !validation.invoice) {
      return NextResponse.json(
        { error: validation.error || "Validasi data faktur gagal" },
        { status: 400 }
      );
    }

    const cleanInvoice = validation.invoice;

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from("invoices")
        .insert([mapToDb(cleanInvoice)]);

      if (error) {
        console.error("Supabase insert error (masked):", error.message);
        return NextResponse.json(
          { error: "Gagal menyimpan data ke database server." },
          { status: 500 }
        );
      }
    }

    // Update in-memory fallback
    localInvoicesStore = [cleanInvoice, ...localInvoicesStore.filter(i => i.id !== cleanInvoice.id)];

    return NextResponse.json(
      { success: true, invoice: cleanInvoice },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/invoices parsing exception:", err);
    return NextResponse.json(
      { error: "Format request tidak valid atau payload rusak" },
      { status: 400 }
    );
  }
}

// PATCH /api/invoices - Update invoice status
export async function PATCH(req: NextRequest) {
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(`mutate_${clientIp}`, 40, 60000);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan pembaruan status. Mohon tunggu." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  try {
    const rawBody = await req.json();
    const validation = validateStatusPayload(rawBody);

    if (!validation.valid || !validation.id || !validation.status) {
      return NextResponse.json(
        { error: validation.error || "Parameter status tidak valid" },
        { status: 400 }
      );
    }

    const { id, status } = validation;

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from("invoices")
        .update({ status })
        .eq("id", id);

      if (error) {
        console.error("Supabase status update error (masked):", error.message);
        return NextResponse.json(
          { error: "Gagal memperbarui status pada database." },
          { status: 500 }
        );
      }
    }

    localInvoicesStore = localInvoicesStore.map((inv) =>
      inv.id === id ? { ...inv, status } : inv
    );

    return NextResponse.json({ success: true, id, status });
  } catch (err) {
    console.error("PATCH /api/invoices parsing exception:", err);
    return NextResponse.json(
      { error: "Payload status tidak dapat diproses" },
      { status: 400 }
    );
  }
}

// PUT /api/invoices - Full update of an existing invoice
export async function PUT(req: NextRequest) {
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(`mutate_${clientIp}`, 40, 60000);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan edit data. Mohon tunggu." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  try {
    const rawBody = await req.json();
    const validation = validateInvoicePayload(rawBody);

    if (!validation.valid || !validation.invoice) {
      return NextResponse.json(
        { error: validation.error || "Validasi data pembaharuan gagal" },
        { status: 400 }
      );
    }

    const updatedInvoice = validation.invoice;

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from("invoices")
        .update(mapToDb(updatedInvoice))
        .eq("id", updatedInvoice.id);

      if (error) {
        console.error("Supabase full update error (masked):", error.message);
        return NextResponse.json(
          { error: "Gagal memperbarui faktur pada database." },
          { status: 500 }
        );
      }
    }

    localInvoicesStore = localInvoicesStore.map((inv) =>
      inv.id === updatedInvoice.id ? updatedInvoice : inv
    );

    return NextResponse.json({ success: true, invoice: updatedInvoice });
  } catch (err) {
    console.error("PUT /api/invoices parsing exception:", err);
    return NextResponse.json(
      { error: "Format data edit invoice tidak valid" },
      { status: 400 }
    );
  }
}

// DELETE /api/invoices - Delete invoice
export async function DELETE(req: NextRequest) {
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(`mutate_${clientIp}`, 40, 60000);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan hapus. Mohon tunggu." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const rawId = searchParams.get("id");
    const id = sanitizeString(rawId, 64);

    if (!id) {
      return NextResponse.json(
        { error: "ID invoice yang akan dihapus wajib disertakan" },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("invoices").delete().eq("id", id);
      if (error) {
        console.error("Supabase delete error (masked):", error.message);
        return NextResponse.json(
          { error: "Gagal menghapus data dari database." },
          { status: 500 }
        );
      }
    }

    localInvoicesStore = localInvoicesStore.filter((inv) => inv.id !== id);

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("DELETE /api/invoices exception:", err);
    return NextResponse.json(
      { error: "Gagal memproses penghapusan data" },
      { status: 400 }
    );
  }
}
