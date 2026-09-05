// CSV yasash va yuklab berish — Tashkiliy tuzilma va Sotuv hisoboti uchun umumiy.

// Vergul, qo'shtirnoq yoki yangi qator bo'lsa maydonni o'rash shart.
export function csvCell(value: string | number | null | undefined) {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows: (string | number | null | undefined)[][]) {
  return rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
}

export function downloadCsv(filename: string, rows: (string | number | null | undefined)[][]) {
  // Excel UTF-8'ni BOM'siz noto'g'ri o'qiydi — o'zbekcha belgilar buziladi.
  const blob = new Blob(["﻿" + toCsv(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
