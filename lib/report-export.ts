"use client";

// Hisobotni PDF / Word / rasm ko'rinishida chiqarish.
// Qo'shimcha kutubxona ishlatilmaydi:
//  - PDF  — brauzerning chop etish oynasi (u yerdan "Save as PDF")
//  - Word — Word o'qiydigan HTML hujjat (.doc)
//  - Rasm — canvas'da chizilgan kartochka (.png)
import type { ReportModel } from "./report";

const BRAND = "#4f46e5";
const INK = "#0f172a";
const MUTED = "#64748b";
const LINE = "#e2e8f0";

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  // Yuklab olish boshlanishiga ulgurishi uchun biroz kechiktiramiz
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** PDF va Word uchun umumiy HTML tanasi. */
function reportHtml(r: ReportModel) {
  const kpis = r.kpis
    .map(
      (k) => `<td class="kpi">
        <div class="kpi-label">${esc(k.label)}</div>
        <div class="kpi-value">${esc(k.value)}</div>
        <div class="kpi-hint">${esc(k.hint)}</div>
      </td>`
    )
    .join("");

  const funnel = r.funnel
    .map(
      (f) => `<tr>
        <td>${esc(f.stage)}</td>
        <td class="num">${f.count}</td>
        <td class="num">${f.value}M</td>
        <td class="num">${f.conversion}%</td>
      </tr>`
    )
    .join("");

  const atRisk = r.atRisk.length
    ? r.atRisk
        .map(
          (d) => `<tr>
            <td>${esc(d.client)}</td>
            <td class="num">${d.value}M</td>
            <td class="num">${d.days} kun</td>
            <td>${esc(d.owner)}</td>
          </tr>`
        )
        .join("")
    : `<tr><td colspan="4" class="muted">E'tibor talab qiladigan bitim yo'q</td></tr>`;

  const notes = r.notes.length
    ? `<div class="notes"><div class="notes-title">Eslatmalar</div>${r.notes
        .map((n) => `<div class="note">• ${esc(n)}</div>`)
        .join("")}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="uz"><head><meta charset="utf-8"><title>${esc(r.title)}</title>
<style>
  body { font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: ${INK}; margin: 32px; }
  .head { border-bottom: 3px solid ${BRAND}; padding-bottom: 14px; margin-bottom: 20px; }
  h1 { font-size: 22px; margin: 0 0 6px; }
  .meta { color: ${MUTED}; font-size: 12px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px;
           font-weight: 700; margin-left: 6px;
           background: ${r.isReal ? "#dcfce7" : "#fef3c7"}; color: ${r.isReal ? "#166534" : "#92400e"}; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 22px; }
  .kpis td { border: 1px solid ${LINE}; border-radius: 8px; padding: 10px 12px; width: 20%; vertical-align: top; }
  .kpi-label { font-size: 10px; text-transform: uppercase; letter-spacing: .04em; color: ${MUTED}; }
  .kpi-value { font-size: 20px; font-weight: 700; margin: 3px 0; }
  .kpi-hint { font-size: 10px; color: ${MUTED}; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .05em; color: ${MUTED};
       margin: 0 0 8px; }
  .data th { text-align: left; font-size: 11px; color: ${MUTED}; border-bottom: 1px solid ${LINE};
             padding: 6px 8px; }
  .data td { font-size: 12px; padding: 7px 8px; border-bottom: 1px solid ${LINE}; }
  .num { text-align: right; }
  .muted { color: ${MUTED}; }
  .notes { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 14px; }
  .notes-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #92400e;
                 margin-bottom: 6px; }
  .note { font-size: 12px; color: #78350f; margin-bottom: 4px; }
  .foot { margin-top: 24px; font-size: 10px; color: ${MUTED}; border-top: 1px solid ${LINE}; padding-top: 10px; }
</style></head>
<body>
  <div class="head">
    <h1>${esc(r.title)}<span class="badge">${r.isReal ? "REAL" : "DEMO"}</span></h1>
    <div class="meta">${esc(r.date)} · ${esc(r.periodLabel)} · ${esc(r.sourceLine)}</div>
  </div>

  <table class="kpis"><tr>${kpis}</tr></table>

  <h2>Voronka</h2>
  <table class="data">
    <tr><th>Bosqich</th><th class="num">Bitimlar</th><th class="num">Qiymat</th><th class="num">Conversion</th></tr>
    ${funnel}
  </table>

  <h2>E'tibor talab qiladigan bitimlar</h2>
  <table class="data">
    <tr><th>Mijoz</th><th class="num">Qiymat</th><th class="num">Aloqasiz</th><th>Mas'ul</th></tr>
    ${atRisk}
  </table>

  ${notes}
  <div class="foot">UTAX AI — Boshqaruv platformasi · avtomatik yaratilgan hisobot</div>
</body></html>`;
}

/** PDF — brauzerning chop etish oynasi orqali ("Save as PDF"). */
export function exportPdf(r: ReportModel) {
  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) {
    alert("Chop etish oynasi bloklandi. Brauzer sozlamasida pop-up'ga ruxsat bering.");
    return;
  }
  w.document.write(reportHtml(r));
  w.document.close();
  // Uslub va shriftlar joylashishiga ulgursin
  w.onload = () => setTimeout(() => w.print(), 250);
}

/** Word — .doc kengaytmali HTML hujjat, Word va Pages to'g'ri ochadi. */
export function exportWord(r: ReportModel, filename: string) {
  const html = reportHtml(r).replace(
    "<head>",
    `<head><!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->`
  );
  download(new Blob(["﻿" + html], { type: "application/msword;charset=utf-8" }), filename);
}

/** Rasm — canvas'da chizilgan kartochka (.png), 2x aniqlikda. */
export function exportImage(r: ReportModel, filename: string) {
  const W = 1000;
  const pad = 48;
  const rowH = 30;
  const height = 300 + r.funnel.length * rowH + r.atRisk.length * rowH + r.notes.length * 34;
  const scale = 2;

  const canvas = document.createElement("canvas");
  canvas.width = W * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(scale, scale);

  const font = (size: number, weight = "400") =>
    `${weight} ${size}px -apple-system, "Segoe UI", Roboto, Arial, sans-serif`;

  // Fon
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, height);

  // Yuqori chiziq — brend
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, BRAND);
  grad.addColorStop(1, "#7c3aed");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, 6);

  let y = 58;
  ctx.fillStyle = INK;
  ctx.font = font(28, "700");
  ctx.fillText(r.title, pad, y);

  // REAL / DEMO belgisi
  const badge = r.isReal ? "REAL" : "DEMO";
  ctx.font = font(12, "700");
  const bw = ctx.measureText(badge).width + 18;
  const bx = pad + ctx.measureText(r.title).width + 14;
  ctx.fillStyle = r.isReal ? "#dcfce7" : "#fef3c7";
  ctx.beginPath();
  ctx.roundRect(bx, y - 15, bw, 22, 11);
  ctx.fill();
  ctx.fillStyle = r.isReal ? "#166534" : "#92400e";
  ctx.fillText(badge, bx + 9, y);

  y += 24;
  ctx.fillStyle = MUTED;
  ctx.font = font(13);
  ctx.fillText(`${r.date} · ${r.periodLabel}`, pad, y);
  y += 20;
  ctx.fillText(r.sourceLine, pad, y);

  // KPI kartochkalari
  y += 28;
  const cardW = (W - pad * 2 - 12 * 4) / 5;
  r.kpis.forEach((k, idx) => {
    const x = pad + idx * (cardW + 12);
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.roundRect(x, y, cardW, 82, 12);
    ctx.fill();
    ctx.strokeStyle = LINE;
    ctx.stroke();

    ctx.fillStyle = MUTED;
    ctx.font = font(10, "600");
    ctx.fillText(k.label.toUpperCase().slice(0, 18), x + 12, y + 22);
    ctx.fillStyle = INK;
    ctx.font = font(24, "700");
    ctx.fillText(k.value, x + 12, y + 52);
    ctx.fillStyle = MUTED;
    ctx.font = font(10);
    ctx.fillText(k.hint.slice(0, 24), x + 12, y + 70);
  });

  // Bo'lim sarlavhasi + jadval chizuvchi
  y += 118;
  const section = (title: string) => {
    ctx.fillStyle = MUTED;
    ctx.font = font(11, "700");
    ctx.fillText(title.toUpperCase(), pad, y);
    y += 10;
    ctx.strokeStyle = LINE;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(W - pad, y);
    ctx.stroke();
    y += 22;
  };

  const row = (cells: string[], widths: number[], bold = false) => {
    ctx.font = font(13, bold ? "600" : "400");
    let x = pad;
    cells.forEach((c, idx) => {
      ctx.fillStyle = idx === 0 ? INK : MUTED;
      const right = idx > 0 && idx < cells.length - 1;
      if (right) {
        ctx.textAlign = "right";
        ctx.fillText(c, x + widths[idx], y);
        ctx.textAlign = "left";
      } else {
        ctx.fillText(c.slice(0, 42), x, y);
      }
      x += widths[idx] + 16;
    });
    y += rowH;
  };

  const cols = [360, 120, 120, 200];
  section("Voronka");
  r.funnel.forEach((f) => row([f.stage, String(f.count), `${f.value}M`, `${f.conversion}%`], cols));

  y += 14;
  section("E'tibor talab qiladigan bitimlar");
  if (r.atRisk.length === 0) {
    ctx.fillStyle = MUTED;
    ctx.font = font(13);
    ctx.fillText("Bunday bitim yo'q", pad, y);
    y += rowH;
  } else {
    r.atRisk.forEach((d) => row([d.client, `${d.value}M`, `${d.days} kun`, d.owner], cols));
  }

  // Eslatmalar
  if (r.notes.length) {
    y += 10;
    const boxH = r.notes.length * 24 + 20;
    ctx.fillStyle = "#fffbeb";
    ctx.beginPath();
    ctx.roundRect(pad, y - 6, W - pad * 2, boxH, 10);
    ctx.fill();
    ctx.strokeStyle = "#fde68a";
    ctx.stroke();
    y += 16;
    ctx.fillStyle = "#78350f";
    ctx.font = font(12);
    r.notes.forEach((n) => {
      ctx.fillText("• " + n.slice(0, 110), pad + 14, y);
      y += 24;
    });
  }

  canvas.toBlob((blob) => blob && download(blob, filename), "image/png");
}
