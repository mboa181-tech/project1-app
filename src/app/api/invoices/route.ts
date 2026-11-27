import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured, mapFromDb, mapToDb, mapToDbWithoutUser } from "@/lib/supabase";
import { initialInvoices } from "@/lib/mock-data";
import { Invoice } from "@/lib/types";
import {
  validateInvoicePayload,
  validateStatusPayload,
  sanitizeString,
} from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// In-memory fallback cache for development/demo when Supabase keys aren't set
let localInvoicesStore: Invoice[] = initialInvoices.map((inv) => ({
  ...inv,
  userId: "usr_demo",
}));

// GET /api/invoices - Fetch invoices (Multi-Tenant isolated by userId or single invoice by id)
export async function GET(req: NextRequest) {
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(`get_${clientIp}`, 120, 60000);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Silakan coba sesaat lagi." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  const { searchParams } = new URL(req.url);
  const singleId = searchParams.get("id");
  const rawUserId = searchParams.get("userId");
  const userId = rawUserId ? sanitizeString(rawUserId, 128) : null;

  // 1. Single Invoice Lookup (for public payment portal /pay/[id])
  if (singleId) {
    const cleanId = sanitizeString(singleId, 64);
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("invoices")
          .select("*")
          .or(`id.eq.${cleanId},invoice_number.eq.${cleanId}`)
          .maybeSingle();

        if (data && !error) {
          return NextResponse.json({
            source: "supabase",
            invoice: mapFromDb(data),
          });
        }
      } catch (err) {
        console.error("Single invoice Supabase query exception:", err);
      }
    }

    const found = localInvoicesStore.find(
      (inv) =>
        inv.id.toLowerCase() === cleanId.toLowerCase() ||
        inv.invoiceNumber.toLowerCase() === cleanId.toLowerCase()
    );

    return NextResponse.json({
      source: "local-persistent",
      invoice: found || null,
    });
  }

  // 2. Multi-Tenant Workspace Lookup (strictly isolated by userId)
  if (userId) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("invoices")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (!error && data) {
          return NextResponse.json({
            source: "supabase",
            invoices: data.map(mapFromDb),
          });
        }
        if (error) {
          console.error("Supabase user query error:", error);
        }
      } catch (err) {
        console.error("Supabase user-isolated query exception:", err);
      }
    }

    const userInvoices = localInvoicesStore.filter(
      (inv) => inv.userId === userId
    );

    return NextResponse.json({
      source: "local-persistent",
      invoices: userInvoices,
    });
  }

  // 3. Fallback: unauthenticated or no userId provided -> return empty array for privacy
  return NextResponse.json({
    source: isSupabaseConfigured ? "supabase" : "local-persistent",
    isSupabaseConfigured,
    invoices: [],
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
      const dbPayload = mapToDb(cleanInvoice);
      let { error } = await supabase
        .from("invoices")
        .insert([dbPayload]);

      // Schema mismatch fallback: if user_id column does not exist in Supabase
      if (error && (error.message?.includes("user_id") || error.code === "42703")) {
        console.warn("Supabase table missing 'user_id' column. Retrying insert without user_id...");
        const payloadWithoutUser = mapToDbWithoutUser(cleanInvoice);
        const retry = await supabase
          .from("invoices")
          .insert([payloadWithoutUser]);
        error = retry.error;
      }

      // Unique constraint fallback: if invoice_number collision occurs (code 23505)
      if (
        error &&
        (error.code === "23505" ||
          error.message?.includes("unique constraint") ||
          error.message?.includes("invoice_number"))
      ) {
        console.warn("Supabase invoice_number collision. Retrying with randomized suffix...");
        const altInvoiceNumber = `${cleanInvoice.invoiceNumber}-${Math.floor(10 + Math.random() * 90)}`;
        cleanInvoice.invoiceNumber = altInvoiceNumber;
        const altPayload = mapToDb(cleanInvoice);
        let retry = await supabase.from("invoices").insert([altPayload]);
        if (retry.error && (retry.error.message?.includes("user_id") || retry.error.code === "42703")) {
          const altWithoutUser = mapToDbWithoutUser(cleanInvoice);
          retry = await supabase.from("invoices").insert([altWithoutUser]);
        }
        error = retry.error;
      }

      if (error) {
        console.error("Supabase insert error:", error);
        return NextResponse.json(
          {
            error: error.message || "Gagal menyimpan data ke database server.",
            code: error.code,
            details: error.details,
            hint: error.hint,
          },
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
        console.error("Supabase status update error:", error);
        return NextResponse.json(
          {
            error: error.message || "Gagal memperbarui status pada database.",
            code: error.code,
            details: error.details,
          },
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
      const dbPayload = mapToDb(updatedInvoice);
      let { error } = await supabase
        .from("invoices")
        .update(dbPayload)
        .eq("id", updatedInvoice.id);

      if (error && (error.message?.includes("user_id") || error.code === "42703")) {
        console.warn("Supabase table missing 'user_id' column. Retrying update without user_id...");
        const payloadWithoutUser = mapToDbWithoutUser(updatedInvoice);
        const retry = await supabase
          .from("invoices")
          .update(payloadWithoutUser)
          .eq("id", updatedInvoice.id);
        error = retry.error;
      }

      if (error) {
        console.error("Supabase full update error:", error);
        return NextResponse.json(
          {
            error: error.message || "Gagal memperbarui faktur pada database.",
            code: error.code,
            details: error.details,
            hint: error.hint,
          },
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
        console.error("Supabase delete error:", error);
        return NextResponse.json(
          {
            error: error.message || "Gagal menghapus data dari database.",
            code: error.code,
            details: error.details,
          },
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
