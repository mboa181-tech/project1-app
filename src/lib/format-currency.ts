/**
 * Formats a number as Indonesian Rupiah (IDR) currency.
 * Uses "id-ID" locale for proper thousand separators (dot) and no decimals.
 *
 * Example: formatRupiah(68500000) => "Rp 68.500.000"
 */
export function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}
