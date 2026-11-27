import { Invoice, InvoiceStatus, InvoiceItem } from "./types";

const ALLOWED_STATUSES: InvoiceStatus[] = ["PAID", "PENDING", "OVERDUE", "DRAFT"];

/**
 * Basic HTML/Script tag sanitization to prevent Stored XSS
 */
export function sanitizeString(input: unknown, maxLength = 255): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[<>]/g, "") // remove < and >
    .trim()
    .slice(0, maxLength);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim()) && email.length <= 150;
}

/**
 * Validate and sanitize line items
 */
export function validateInvoiceItems(items: unknown): { valid: boolean; items: InvoiceItem[]; error?: string } {
  if (!Array.isArray(items)) {
    return { valid: false, items: [], error: "Items harus berupa array daftar pekerjaan" };
  }

  if (items.length === 0) {
    return { valid: false, items: [], error: "Invoice minimal memiliki 1 baris item pekerjaan" };
  }

  if (items.length > 50) {
    return { valid: false, items: [], error: "Maksimal 50 baris item per invoice" };
  }

  const cleanedItems: InvoiceItem[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item || typeof item !== "object") {
      return { valid: false, items: [], error: `Format item #${i + 1} tidak valid` };
    }

    const description = sanitizeString(item.description, 300);
    const quantity = Number(item.quantity);
    const rate = Number(item.rate);
    const amount = Number(item.amount);

    if (!description) {
      return { valid: false, items: [], error: `Deskripsi item #${i + 1} wajib diisi` };
    }

    if (isNaN(quantity) || quantity <= 0 || quantity > 1000000) {
      return { valid: false, items: [], error: `Jumlah (kuantitas) item #${i + 1} harus lebih dari 0` };
    }

    if (isNaN(rate) || rate < 0 || rate > 1000000000000) {
      return { valid: false, items: [], error: `Tarif item #${i + 1} tidak valid atau melebihi batas` };
    }

    if (isNaN(amount) || amount < 0 || amount > 1000000000000) {
      return { valid: false, items: [], error: `Nominal item #${i + 1} tidak valid` };
    }

    cleanedItems.push({
      id: sanitizeString(item.id || `item-${i + 1}`, 50),
      description,
      quantity,
      rate,
      amount,
    });
  }

  return { valid: true, items: cleanedItems };
}

/**
 * Validate full invoice payload on POST / PUT
 */
export function validateInvoicePayload(payload: unknown): { valid: boolean; invoice?: Invoice; error?: string } {
  if (!payload || typeof payload !== "object") {
    return { valid: false, error: "Data tagihan tidak valid atau kosong" };
  }

  const raw = payload as Record<string, any>;

  const id = sanitizeString(raw.id || `inv-${Date.now()}`, 64);
  const invoiceNumber = sanitizeString(raw.invoiceNumber, 50);
  const clientName = sanitizeString(raw.clientName, 120);
  const clientEmail = (raw.clientEmail || "").trim();
  const issueDate = sanitizeString(raw.issueDate, 20);
  const dueDate = sanitizeString(raw.dueDate, 20);
  const status = raw.status as InvoiceStatus;
  const currency = sanitizeString(raw.currency || "IDR", 10);
  const notes = sanitizeString(raw.notes || "", 1000);

  if (!invoiceNumber) {
    return { valid: false, error: "Nomor invoice wajib diisi" };
  }

  if (!clientName) {
    return { valid: false, error: "Nama klien wajib diisi" };
  }

  if (!isValidEmail(clientEmail)) {
    return { valid: false, error: "Format email klien tidak valid" };
  }

  if (!ALLOWED_STATUSES.includes(status)) {
    return { valid: false, error: `Status invoice '${status}' tidak valid. Pilihan: ${ALLOWED_STATUSES.join(", ")}` };
  }

  const subtotal = Number(raw.subtotal);
  const taxRate = Number(raw.taxRate);
  const taxAmount = Number(raw.taxAmount);
  const total = Number(raw.total);

  if (isNaN(subtotal) || subtotal < 0 || isNaN(total) || total < 0) {
    return { valid: false, error: "Nominal subtotal dan total tagihan tidak boleh bernilai negatif" };
  }

  if (isNaN(taxRate) || taxRate < 0 || taxRate > 100) {
    return { valid: false, error: "Besaran PPN harus antara 0% hingga 100%" };
  }

  const itemsValidation = validateInvoiceItems(raw.items);
  if (!itemsValidation.valid) {
    return { valid: false, error: itemsValidation.error };
  }

  const cleanInvoice: Invoice = {
    id,
    invoiceNumber,
    clientName,
    clientEmail: clientEmail.toLowerCase(),
    issueDate: issueDate || new Date().toISOString().split("T")[0],
    dueDate: dueDate || new Date().toISOString().split("T")[0],
    status,
    items: itemsValidation.items,
    subtotal,
    taxRate,
    taxAmount,
    total,
    currency,
    notes,
  };

  return { valid: true, invoice: cleanInvoice };
}

/**
 * Validate status change payload on PATCH
 */
export function validateStatusPayload(payload: unknown): { valid: boolean; id?: string; status?: InvoiceStatus; error?: string } {
  if (!payload || typeof payload !== "object") {
    return { valid: false, error: "Data update status tidak valid" };
  }

  const raw = payload as Record<string, any>;
  const id = sanitizeString(raw.id, 64);
  const status = raw.status as InvoiceStatus;

  if (!id) {
    return { valid: false, error: "ID invoice wajib disertakan" };
  }

  if (!ALLOWED_STATUSES.includes(status)) {
    return { valid: false, error: `Status '${status}' tidak diizinkan. Pilihan: ${ALLOWED_STATUSES.join(", ")}` };
  }

  return { valid: true, id, status };
}
