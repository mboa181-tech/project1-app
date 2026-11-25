/**
 * Formats a number as Indonesian Rupiah (IDR) currency.
 * Uses "id-ID" locale for proper thousand separators (dot) and no decimals.
 *
 * Example: formatRupiah(68500000) => "Rp 68.500.000"
 */
export function formatRupiah(amount: number): string {
  return `Rp ${Math.round(amount).toLocaleString("id-ID")}`;
}

const satuan = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];

function terbilangAngka(n: number): string {
  n = Math.floor(Math.abs(n));
  if (n < 12) {
    return satuan[n];
  } else if (n < 20) {
    return `${terbilangAngka(n - 10)} Belas`;
  } else if (n < 100) {
    const sisa = n % 10;
    return `${terbilangAngka(Math.floor(n / 10))} Puluh${sisa > 0 ? " " + terbilangAngka(sisa) : ""}`;
  } else if (n < 200) {
    const sisa = n - 100;
    return `Seratus${sisa > 0 ? " " + terbilangAngka(sisa) : ""}`;
  } else if (n < 1000) {
    const sisa = n % 100;
    return `${terbilangAngka(Math.floor(n / 100))} Ratus${sisa > 0 ? " " + terbilangAngka(sisa) : ""}`;
  } else if (n < 2000) {
    const sisa = n - 1000;
    return `Seribu${sisa > 0 ? " " + terbilangAngka(sisa) : ""}`;
  } else if (n < 1000000) {
    const sisa = n % 1000;
    return `${terbilangAngka(Math.floor(n / 1000))} Ribu${sisa > 0 ? " " + terbilangAngka(sisa) : ""}`;
  } else if (n < 1000000000) {
    const sisa = n % 1000000;
    return `${terbilangAngka(Math.floor(n / 1000000))} Juta${sisa > 0 ? " " + terbilangAngka(sisa) : ""}`;
  } else if (n < 1000000000000) {
    const sisa = n % 1000000000;
    return `${terbilangAngka(Math.floor(n / 1000000000))} Miliar${sisa > 0 ? " " + terbilangAngka(sisa) : ""}`;
  } else {
    const sisa = n % 1000000000000;
    return `${terbilangAngka(Math.floor(n / 1000000000000))} Triliun${sisa > 0 ? " " + terbilangAngka(sisa) : ""}`;
  }
}

/**
 * Converts a numeric amount to Indonesian Terbilang words.
 * Example: terbilangRupiah(83250000) => "Delapan Puluh Tiga Juta Dua Ratus Lima Puluh Ribu Rupiah"
 */
export function terbilangRupiah(amount: number): string {
  if (!amount || amount === 0) return "Nol Rupiah";
  const teks = terbilangAngka(amount).replace(/\s+/g, " ").trim();
  return `${teks} Rupiah`;
}
