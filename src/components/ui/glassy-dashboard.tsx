"use client";

import { useId, useState, useMemo, type CSSProperties, type ReactNode, useEffect, useRef, type MouseEvent } from "react";
import Link from "next/link";
import { Invoice } from "@/lib/types";
import { formatRupiah } from "@/lib/format-currency";
import { openWhatsAppInvoice } from "@/lib/whatsapp";
import { useCompany } from "@/context/CompanyContext";

import { ArrowDownRight, ArrowRight, ArrowUpRight, Box, CircleDollarSign, Clock3, Download, Ellipsis, Eye, Filter, ListChecks, Search, ShieldCheck, ShoppingBag, TriangleAlert, Users, Zap, ArrowDownToLine, BarChart3, Bell, BriefcaseBusiness, ChevronRight, Command, LayoutDashboard, Moon, Sun, TrendingUp, X, Plus, Pencil, Trash2, History, LogIn, LogOut, FileText, Globe, MessageCircle, Building2 } from "lucide-react";

import { useGSAP } from "@gsap/react";

import { gsap } from "gsap";

import "@fontsource-variable/manrope";
import { useLanguage } from "@/context/LanguageContext";



/** A spatial analytics workspace with four views, sample records, and local CSV export.

 * Pass a background image and credit to use your own scene. Use panelFrost (0–36px)

 * for the main glass and initialTheme for the initial palette. All data stays in the browser. */

export interface GlassyDashboardProps {
  backgroundImage?: string;
  backgroundCredit?: { label: string; href: string };
  workspaceName?: string;
  panelFrost?: number;
  initialTheme?: "light" | "dark";
  invoices?: Invoice[];
  onCreateInvoice?: () => void;
  onViewInvoice?: (invoice: Invoice) => void;
  onEditInvoice?: (invoice: Invoice) => void;
  onToggleStatus?: (invoiceId: string) => void;
  onDeleteInvoice?: (invoiceId: string) => void;
  onSimulateWebhook?: () => void;
  onOpenAuditLog?: () => void;
  onOpenCompanySettings?: () => void;
  auditCount?: number;
  userLabel?: string;
  userEmail?: string;
  userRole?: string;
  isAuthenticated?: boolean;
  onSignOut?: () => void;
}

const studioPhoto = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80";

const dashboardStyles = `
.gd-app {
  --gd-ink: #25201e;
  --gd-muted: #423731;
  --gd-line: rgb(74 49 33 / 15%);
  --gd-grid: rgb(74 49 33 / 19%);
  --gd-rim: rgb(255 253 246 / 51%);
  --gd-edge-light: rgb(255 254 247 / 84%);
  --gd-edge-shade: rgb(57 40 28 / 19%);
  --gd-gloss: rgb(255 251 242 / 45%);
  --gd-frame: rgb(247 234 219 / 23%);
  --gd-rail: rgb(241 222 206 / 48%);
  --gd-card: rgb(250 242 232 / 46%);
  --gd-card-light: rgb(255 251 245 / 34%);
  --gd-raised: rgb(255 249 243 / 81%);
  --gd-inner: rgb(255 250 245 / 37%);
  --gd-surface: #f6ece2;
  --gd-track: rgb(81 49 32 / 14%);
  --gd-primary: #261e1b;
  --gd-primary-ink: #fffaf5;
  --gd-pick: #fff9f3;
  --gd-pick-ink: #241b17;
  --gd-coral: #a43c27;
  --gd-teal: #09644f;
  --gd-ochre: #996300;
  --gd-graph-ink: #40332d;
  --gd-focus: #194b48;
  --gd-dark-shadow: 35 21 14;
  inline-size: 100%;
  min-inline-size: 0;
  flex: 1 1 100%;
  position: relative;
  isolation: isolate;
  min-block-size: 100svh;
  overflow-x: clip;
  background: #ab8e76;
  color: var(--gd-ink);
  color-scheme: light;
  font-family: "Manrope Variable", Manrope, system-ui, sans-serif;
  font-size: 13px;
  font-weight: 550;
  font-variant-numeric: tabular-nums;
}
.gd-app[data-theme="dark"] {
  --gd-ink: #fff6e9;
  --gd-muted: #e5d5c7;
  --gd-line: rgb(243 221 198 / 19%);
  --gd-grid: rgb(243 221 198 / 19%);
  --gd-rim: rgb(255 236 212 / 31%);
  --gd-edge-light: rgb(255 242 225 / 49%);
  --gd-edge-shade: rgb(11 6 5 / 30%);
  --gd-gloss: rgb(255 237 213 / 13%);
  --gd-frame: rgb(42 31 29 / 52%);
  --gd-rail: rgb(45 32 30 / 59%);
  --gd-card: rgb(47 36 34 / 53%);
  --gd-card-light: rgb(106 88 81 / 30%);
  --gd-raised: rgb(80 67 61 / 82%);
  --gd-inner: rgb(78 61 56 / 49%);
  --gd-surface: #3b302c;
  --gd-track: rgb(245 226 212 / 16%);
  --gd-primary: #f3ddca;
  --gd-primary-ink: #231a16;
  --gd-pick: #f9eee0;
  --gd-pick-ink: #241b17;
  --gd-coral: #ff9177;
  --gd-teal: #75dac0;
  --gd-ochre: #f1be58;
  --gd-graph-ink: #e7d9cd;
  --gd-focus: #f9bf9b;
  --gd-dark-shadow: 10 4 3;
  background: #40322b;
  color-scheme: dark;
}

.gd-app *, .gd-app *::before, .gd-app *::after { box-sizing: border-box; }
.gd-app :where(button, input, select) { color: inherit; font: inherit; }
.gd-app :where(button, a, input, select):focus-visible { outline: 2px solid var(--gd-focus); outline-offset: 3px; }
.gd-app a { color: inherit; text-decoration: none; }
.gd-app button { cursor: pointer; }
.gd-app :where(h1, h2, h3, p, figure) { margin: 0; }
.gd-app svg { flex: none; }
.gd-sr { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.gd-background, .gd-app::before {
  position: fixed;
  z-index: -2;
  inset: 0;
  inline-size: 100%;
  block-size: 100%;
  pointer-events: none;
}
.gd-background {
  object-fit: cover;
  object-position: center 60%;
  filter: sepia(.22) saturate(.78) brightness(.86);
}
.gd-app::before {
  content: "";
  z-index: -1;
  background: linear-gradient(116deg, rgb(73 48 37 / 35%), transparent 43%, rgb(162 101 63 / 24%) 76%, transparent 100%),
    linear-gradient(0deg, rgb(53 33 25 / 34%), transparent 58%);
}
.gd-app[data-theme="dark"] .gd-background { filter: sepia(.15) saturate(.75) brightness(.61); }
.gd-surround {
  inline-size: min(calc(100% - 100px), 1380px);
  margin-inline: auto;
  padding-block: 24px 8px;
}
.gd-top, .gd-dock {
  border: 1px solid var(--gd-rim);
  background: linear-gradient(165deg, var(--gd-gloss), transparent 32% 73%, var(--gd-gloss)), var(--gd-rail);
  box-shadow: inset 1px 1px 1px var(--gd-edge-light), inset -1px -1px 1px var(--gd-edge-shade),
    inset 0 -2px 5px var(--gd-gloss), 0 7px 20px rgb(var(--gd-dark-shadow) / 17%);
  backdrop-filter: blur(15px) saturate(1.35);
  -webkit-backdrop-filter: blur(15px) saturate(1.35);
}
.gd-top {
  position: sticky;
  top: 12px;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-block-size: 60px;
  border-radius: 999px;
  padding: 6px 12px;
}
.gd-brand { display: flex; align-items: center; gap: 10px; min-inline-size: 0; flex-shrink: 0; padding-inline-start: 3px; }
.gd-logo {
  inline-size: 35px; block-size: 35px; display: grid; place-items: center;
  border-radius: 50%; background: var(--gd-pick); color: var(--gd-pick-ink);
  box-shadow: inset 0 0 0 1px var(--gd-gloss), 0 2px 7px rgb(var(--gd-dark-shadow) / 12%);
}
.gd-logo svg { width: 22px; height: 22px; }
.gd-brand strong { display: block; font-size: 12px; letter-spacing: .17em; line-height: 1.1; font-weight: 850; }
.gd-brand small { display: block; margin-block-start: 3px; font-size: 10px; color: var(--gd-muted); }
.gd-ask {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1 1 auto;
  max-inline-size: 360px;
  min-inline-size: 130px;
  min-block-size: 43px;
  border: 1px solid var(--gd-line);
  border-radius: 999px;
  background: var(--gd-inner);
  box-shadow: inset 0 1px 0 var(--gd-gloss);
  padding: 4px 13px 4px 9px;
  text-align: start;
  overflow: hidden;
}
.gd-ask:hover, .gd-icon-button:hover { background: var(--gd-raised); }
.gd-orb {
  flex: none;
  inline-size: 25px;
  block-size: 25px;
  border-radius: 50%;
  background:
    radial-gradient(ellipse at 32% 24%, #faf7fe 5%, #72ecf1 25%, transparent 58%),
    radial-gradient(ellipse at 67% 54%, #e1b7f9, #815add 55%, #353467 79%);
  box-shadow: inset 0 0 0 .75px rgb(246 245 255 / 75%), inset 0 -2px 5px #604db4, 0 0 0 3px rgb(91 70 115 / 13%), 0 2px 8px rgb(71 46 113 / 35%);
}
.gd-prompt {
  overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
  font-size: 12px; font-weight: 750;
  animation: gd-prompt-in .74s steps(28, end) both;
}
@keyframes gd-prompt-in { from { clip-path: inset(0 100% 0 0); } }
.gd-ask-search { margin-inline-start: auto; width: 15px; height: 15px; color: var(--gd-muted); flex-shrink: 0; }
.gd-top-actions { display: flex; align-items: center; justify-content: flex-end; gap: 6px; flex-shrink: 0; }
.gd-icon-button {
  position: relative; min-inline-size: 44px; min-block-size: 44px; display: inline-grid; place-items: center;
  border-radius: 999px; border: 1px solid var(--gd-line); padding: 0; background: var(--gd-inner);
}
.gd-icon-button svg { width: 17px; height: 17px; stroke-width: 1.75; }
.gd-notices { background: var(--gd-raised); }
.gd-notices i {
  position: absolute; block-size: 6px; inline-size: 6px; inset: 9px 9px auto auto; border-radius: 50%;
  background: var(--gd-coral); box-shadow: 0 0 0 2px var(--gd-surface);
}

.gd-stage-wrap {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-block: 14px 0;
}
.gd-stage {
  flex: 1;
  min-inline-size: 0;
  color: var(--gd-ink);
  border: 1px solid var(--gd-rim);
  border-radius: 34px;
  background:
    linear-gradient(148deg, var(--gd-gloss), transparent 19% 77%, color-mix(in srgb, var(--gd-gloss) 48%, transparent)),
    var(--gd-frame);
  box-shadow: inset 1px 1px 1px var(--gd-edge-light), inset -1px -1px 1px var(--gd-edge-shade),
    inset 0 0 7px var(--gd-gloss),
    0 1px 3px rgb(var(--gd-dark-shadow) / 17%), 0 22px 72px rgb(var(--gd-dark-shadow) / 22%);
  backdrop-filter: blur(var(--gd-panel-frost, 12px)) saturate(1.24);
  -webkit-backdrop-filter: blur(var(--gd-panel-frost, 12px)) saturate(1.24);
}
.gd-stage-scroll {
  block-size: max(520px, min(865px, calc(100svh - 165px)));
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--gd-rim) transparent;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  border-radius: inherit;
  padding: clamp(19px, 2.15vw, 35px) clamp(25px, 3.2vw, 49px) 41px;
}
.gd-stage-scroll::-webkit-scrollbar { width: 6px; }
.gd-stage-scroll::-webkit-scrollbar-track { background: transparent; }
.gd-stage-scroll::-webkit-scrollbar-thumb { background: var(--gd-line); border-radius: 999px; }
.gd-stage-scroll::-webkit-scrollbar-thumb:hover { background: var(--gd-rim); }
.gd-view-head {
  display: flex; align-items: flex-end; justify-content: space-between; gap: 12px 22px;
  margin-block-end: 19px;
}
.gd-view-head h1 {
  font-size: clamp(29px, 3.35vw, 49px);
  font-weight: 760;
  line-height: 1.03;
  letter-spacing: -.062em;
}
.gd-view-head p { color: var(--gd-muted); font-size: 13px; margin-block-start: 8px; }
.gd-view-actions { display: flex; align-items: center; flex-wrap: wrap; justify-content: flex-end; gap: 7px; }
.gd-period {
  display: inline-flex; align-items: center; padding: 3px; border-radius: 999px;
  border: 1px solid var(--gd-rim); background: var(--gd-inner);
  box-shadow: inset 0 1px 0 var(--gd-gloss);
}
.gd-period button {
  min-block-size: 35px; min-inline-size: 56px; border: 0; border-radius: 999px; background: transparent;
  padding: 0 11px; font-size: 11px; font-weight: 750; white-space: nowrap;
}
.gd-period button[aria-pressed="true"] { background: var(--gd-primary); color: var(--gd-primary-ink); }
.gd-period button[aria-pressed="false"]:hover { background: var(--gd-inner); }

.gd-primary, .gd-secondary {
  display: inline-flex; justify-content: center; align-items: center; gap: 7px;
  min-block-size: 40px; padding: 7px 12px;
  font-size: 11.5px; font-weight: 790; line-height: 1.2; border-radius: 999px;
  border: 1px solid transparent; white-space: nowrap; flex-shrink: 0;
}
.gd-primary { background: var(--gd-primary); color: var(--gd-primary-ink); }
.gd-secondary { background: var(--gd-raised); border-color: var(--gd-rim); color: var(--gd-ink); }
.gd-primary:hover { filter: brightness(1.17); }
.gd-secondary:hover { background: var(--gd-surface); }
.gd-primary svg, .gd-secondary svg { width: 14px; height: 14px; }
.gd-export { white-space: nowrap; }
.gd-content { min-inline-size: 0; }
.gd-analytics, .gd-command-grid, .gd-command-side, .gd-summary, .gd-metric-grid, .gd-analytics-grid { display: grid; gap: 12px; }
.gd-command-grid { grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr) minmax(0, 1.05fr); align-items: stretch; }
.gd-command-side { grid-column: 1; align-content: start; }
.gd-command-grid > .gd-activity { grid-column: 2 / -1; }
.gd-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; padding: 6px; }
.gd-analytics-grid { grid-template-columns: minmax(0, 1.75fr) minmax(0, 1fr); }
.gd-metric-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }

.gd-panel, .gd-metric, .gd-summary {
  min-inline-size: 0;
  border: 1px solid var(--gd-rim);
  border-radius: 20px;
  background: linear-gradient(144deg, var(--gd-card-light), transparent 66%), var(--gd-card);
  box-shadow: inset 0 1px 1px var(--gd-edge-light), inset 0 -1px 1px var(--gd-edge-shade), 0 6px 18px rgb(var(--gd-dark-shadow) / 9%);
}
.gd-summary { border-radius: 20px; background: var(--gd-inner); }
.gd-summary .gd-metric { border-radius: 15px; }
.gd-panel { padding: 15px 16px; }
.gd-panel-head {
  display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-start;
  gap: 7px 12px; margin-block-end: 12px;
}
.gd-panel-head h2 { font-size: 14px; font-weight: 810; letter-spacing: -.024em; }
.gd-panel-head p { font-size: 11px; color: var(--gd-muted); margin-block-start: 3px; }
.gd-metric { display: flex; flex-direction: column; justify-content: space-between; min-block-size: 112px; padding: 11px 12px; }
.gd-metric[data-tone="teal"] {
  --gd-coral: #ffc8b8;
  --gd-teal: #b8f1dd;
  --gd-muted: #e4f5ef;
  color: #fff;
  border-color: rgb(196 248 231 / 55%);
  background: radial-gradient(ellipse at 5% -20%, #3a9381, transparent 68%), linear-gradient(145deg, #1e7461, #08443a);
  box-shadow: inset 0 1px 2px rgb(214 252 240 / 45%), 0 6px 14px rgb(19 78 64 / 17%);
}
.gd-metric-head { display: flex; justify-content: space-between; align-items: center; gap: 4px; min-inline-size: 0; font-size: 11px; font-weight: 740; }
.gd-metric-icon, .gd-list-icon {
  display: grid; place-items: center; flex: none; color: inherit;
  inline-size: 28px; block-size: 28px; border-radius: 10px;
  background: var(--gd-inner); box-shadow: inset 0 1px 0 var(--gd-gloss);
}
.gd-metric-icon svg, .gd-list-icon svg { width: 14px; height: 14px; }
.gd-metric[data-tone="teal"] .gd-metric-icon { background: rgb(235 255 247 / 16%); }
.gd-metric-value { display: block; font-size: clamp(22px, 2.35vw, 35px); line-height: 1.05; margin-block: 3px 7px; letter-spacing: -.052em; font-weight: 815; }
.gd-summary .gd-metric-value { font-size: clamp(20px, 2vw, 31px); }
.gd-metric-caption, .gd-balance-change { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; color: var(--gd-muted); font-size: 10px; font-weight: 680; }
.gd-delta {
  display: inline-flex; align-items: center; gap: 2px; color: var(--gd-teal); font-weight: 850;
  border-radius: 6px; padding: 2px 4px;
  background: color-mix(in srgb, var(--gd-teal) 12%, transparent);
}
.gd-delta[data-attention="true"] { color: var(--gd-coral); background: color-mix(in srgb, var(--gd-coral) 11%, transparent); }
.gd-delta svg { width: 11px; height: 11px; stroke-width: 2.4; }

.gd-balance .gd-panel-head { align-items: center; margin-block-end: 9px; }
.gd-unit { border-radius: 6px; padding: 4px 6px; background: var(--gd-raised); font-size: 10px; font-weight: 810; }
.gd-balance-number { font-size: clamp(28px, 3.85vw, 57px); font-weight: 820; letter-spacing: -.077em; line-height: 1.02; }
.gd-balance-change { margin-block-start: 7px; }
.gd-balance-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-block: 13px 12px; }
.gd-streams { display: flex; border-radius: 12px; background: var(--gd-inner); padding: 8px 2px; }
.gd-streams div { flex: 1; min-inline-size: 0; padding: 0 7px; }
.gd-streams div + div { border-inline-start: 1px solid var(--gd-line); }
.gd-streams span, .gd-streams strong { display: block; }
.gd-streams span { font-size: 9px; color: var(--gd-muted); }
.gd-streams strong { font-size: 11px; font-weight: 810; margin-block-start: 4px; }
.gd-capacity .gd-panel-head, .gd-approvals .gd-panel-head { margin-block-end: 10px; }
.gd-capacity-track, .gd-mix-track { display: block; height: 7px; border-radius: 999px; overflow: hidden; background: var(--gd-track); }
.gd-capacity-track .gd-fill { display: block; block-size: 100%; border-radius: inherit; background: var(--gd-teal); transform-origin: left center; }
.gd-capacity-label { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px; color: var(--gd-muted); font-size: 10px; margin-top: 8px; }
.gd-capacity-label strong { color: var(--gd-ink); }
.gd-approval-content { display: flex; align-items: center; gap: 9px; min-inline-size: 0; }
.gd-approval-content .gd-list-icon { inline-size: 37px; block-size: 37px; color: var(--gd-teal); background: color-mix(in srgb, var(--gd-teal) 12%, var(--gd-inner)); }
.gd-approval-content div { flex: 1; min-inline-size: 0; }
.gd-approval-content strong, .gd-approval-content small { display: block; }
.gd-approval-content strong { font-size: 12px; font-weight: 810; }
.gd-approval-content small { margin-top: 4px; font-size: 10px; color: var(--gd-muted); }
.gd-statement .gd-panel-head { margin-block-end: 8px; }

.gd-table-tools { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; max-inline-size: 100%; }
.gd-search, .gd-filter {
  display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--gd-line); border-radius: 10px;
  background: var(--gd-inner); min-block-size: 35px; padding: 0 8px;
}
.gd-search svg, .gd-filter svg { width: 13px; height: 13px; color: var(--gd-muted); }
.gd-search input { width: 105px; flex: 1; min-inline-size: 0; border: 0; background: transparent; min-block-size: 33px; }
.gd-search input::placeholder { color: var(--gd-muted); opacity: 1; }
.gd-search input, .gd-filter select { font-size: 11px; }
.gd-filter select { border: 0; background: transparent; padding: 5px 0; min-inline-size: 0; }
.gd-filter select option { color: var(--gd-ink); background: var(--gd-surface); }
.gd-search:focus-within, .gd-filter:focus-within { outline: 2px solid var(--gd-focus); }
.gd-app .gd-search input:focus-visible, .gd-app .gd-filter select:focus-visible { outline: none; }
.gd-table-scroll {
  max-inline-size: 100%;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--gd-rim) transparent;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x pan-y;
  overscroll-behavior-x: contain;
}
.gd-table-scroll::-webkit-scrollbar { height: 5px; }
.gd-table-scroll::-webkit-scrollbar-track { background: var(--gd-inner); border-radius: 999px; }
.gd-table-scroll::-webkit-scrollbar-thumb { background: var(--gd-line); border-radius: 999px; }
.gd-table-scroll::-webkit-scrollbar-thumb:hover { background: var(--gd-rim); }
.gd-table-scroll table { inline-size: 100%; min-inline-size: 640px; border-spacing: 0; text-align: start; }
.gd-table-scroll th, .gd-table-scroll td { padding: 9px 10px; text-align: start; }
.gd-table-scroll th { background: var(--gd-inner); font-size: 10px; color: var(--gd-muted); font-weight: 800; }
.gd-table-scroll th:first-child { border-radius: 8px 0 0 8px; }
.gd-table-scroll th:last-child { border-radius: 0 8px 8px 0; }
.gd-table-scroll td { white-space: nowrap; font-size: 11px; }
.gd-table-scroll td:first-child { font-weight: 750; }
.gd-table-scroll tr + tr td { border-top: 1px solid var(--gd-line); }
.gd-status {
  --gd-status-color: var(--gd-graph-ink);
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 6px; border-radius: 999px; font-size: 10px; font-weight: 790;
  background: color-mix(in srgb, var(--gd-status-color) 11%, var(--gd-inner));
  color: var(--gd-status-color); white-space: nowrap;
}
.gd-status[data-state="teal"] { --gd-status-color: var(--gd-teal); }
.gd-status[data-state="coral"] { --gd-status-color: var(--gd-coral); }
.gd-status i { inline-size: 5px; block-size: 5px; border-radius: 50%; background: currentColor; }
.gd-empty { padding: 12px 3px; color: var(--gd-muted); font-size: 12px; }

.gd-app [data-tone="ink"] { --gd-series: var(--gd-graph-ink); }
.gd-app [data-tone="coral"] { --gd-series: var(--gd-coral); }
.gd-app [data-tone="teal"] { --gd-series: var(--gd-teal); }
.gd-app [data-tone="ochre"] { --gd-series: var(--gd-ochre); }
.gd-legend { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 6px 12px; color: var(--gd-muted); }
.gd-legend span, .gd-device-list button span:first-child { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 740; }
.gd-legend i, .gd-device-list button span:first-child i { inline-size: 7px; block-size: 7px; border-radius: 50%; background: var(--gd-series); }
.gd-stack-meta { display: flex; justify-content: space-between; align-items: center; height: 20px; gap: 4px; }
.gd-chart-readout { font-size: 10px; font-weight: 830; white-space: nowrap; }
.gd-stack-plot { display: grid; grid-template-columns: repeat(var(--gd-series-count), minmax(0, 1fr)); gap: 4px; block-size: 194px; margin-top: 5px; }
.gd-command-chart .gd-stack-plot { block-size: 141px; }
.gd-stack-column { display: flex; flex-direction: column; align-items: center; min-inline-size: 0; border: 0; border-radius: 8px; background: transparent; padding: 3px 0 0; }
.gd-stack-column:is(:focus-visible, :hover, [aria-pressed="true"]) { background: var(--gd-inner); }
.gd-stack-track { display: flex; justify-content: center; align-items: end; flex: 1; inline-size: 100%; border-bottom: 1px solid var(--gd-line); }
.gd-stack-bar {
  display: flex; flex-direction: column; transform-origin: center bottom;
  inline-size: min(65%, 40px); min-inline-size: 6px; border-radius: 6px 6px 3px 3px; overflow: hidden;
}
.gd-stack-bar i { display: block; flex-basis: 0; background: var(--gd-series); min-block-size: 2px; }
.gd-stack-bar i:first-child { background: repeating-linear-gradient(138deg, var(--gd-series) 0 4px, color-mix(in srgb, var(--gd-series) 76%, white) 4px 6px); }
.gd-stack-label { font-size: 9px; color: var(--gd-muted); margin-top: 7px; white-space: nowrap; }
.gd-revenue-main { display: grid; grid-template-columns: 38px minmax(0, 1fr); }
.gd-chart-y { display: flex; flex-direction: column; justify-content: space-between; padding-block: 0; font-size: 10px; color: var(--gd-muted); }
.gd-line-plot { position: relative; min-inline-size: 0; block-size: 208px; }
.gd-line-plot svg { display: block; width: 100%; height: 100%; overflow: visible; }
.gd-grid-line { stroke: var(--gd-grid); stroke-dasharray: 3 4; vector-effect: non-scaling-stroke; }
.gd-chart-path { fill: none; stroke: var(--gd-series); stroke-width: 2.5; stroke-linecap: round; vector-effect: non-scaling-stroke; }
.gd-line-cursor { stroke: var(--gd-muted); stroke-dasharray: 2 4; vector-effect: non-scaling-stroke; }
.gd-chart-zones { position: absolute; inset: 0; display: flex; align-items: stretch; }
.gd-chart-zones button { flex: 1; min-inline-size: 0; border: 0; background: transparent; padding: 0; border-radius: 2px; }
.gd-line-tooltip {
  pointer-events: none; position: absolute; top: 6px; left: clamp(70px, var(--gd-tooltip-x), calc(100% - 70px)); translate: -50% 0;
  display: grid; gap: 2px; min-inline-size: 132px; padding: 7px 8px; background: var(--gd-surface);
  border: 1px solid var(--gd-line); border-radius: 9px; font-size: 10px; box-shadow: 0 4px 10px rgb(var(--gd-dark-shadow) / 15%);
}
.gd-line-tooltip span { display: flex; justify-content: space-between; gap: 10px; }
.gd-chart-axis { display: flex; justify-content: space-between; margin: 9px 0 0 38px; font-size: 9px; color: var(--gd-muted); }
.gd-device { display: grid; gap: 8px; justify-items: stretch; }
.gd-device-ring { position: relative; inline-size: min(100%, 150px); aspect-ratio: 1; justify-self: center; }
.gd-device-ring svg { display: block; inline-size: 100%; block-size: 100%; }
.gd-device-segment { stroke: var(--gd-series); transition: opacity .2s ease; }
.gd-device-segment[data-muted="true"] { opacity: .29; }
.gd-device-total { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; pointer-events: none; }
.gd-device-total strong { font-size: 23px; line-height: 1.05; letter-spacing: -.05em; font-weight: 850; }
.gd-device-total > span { font-size: 10px; margin-top: 5px; color: var(--gd-muted); }
.gd-device-list { display: grid; gap: 2px; }
.gd-device-list button {
  display: grid; grid-template-columns: 66px minmax(0, 1fr) 34px; gap: 7px; align-items: center;
  min-block-size: 32px; text-align: start; background: transparent; border: 0; border-radius: 8px; padding: 3px 6px;
}
.gd-device-list button:is(:hover, [aria-pressed="true"]) { background: var(--gd-inner); }
.gd-device-list button strong { text-align: end; font-weight: 850; font-size: 11px; }
.gd-mix-track { height: 4px; }
.gd-mix-track .gd-fill { display: block; block-size: 100%; border-radius: inherit; background: var(--gd-series); transform-origin: left center; }

.gd-lanes { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 9px; }
.gd-lanes[data-filtered="true"] { grid-template-columns: minmax(0, 1fr); }
.gd-lane { min-inline-size: 0; border: 1px solid var(--gd-line); background: var(--gd-inner); padding: 7px; border-radius: 14px; }
.gd-lane header { display: flex; align-items: center; gap: 5px; padding: 3px 4px 8px; }
.gd-lane header i { display: inline-grid; place-items: center; border-radius: 7px; width: 23px; height: 23px; color: var(--gd-series); background: color-mix(in srgb, var(--gd-series) 13%, transparent); }
.gd-lane header svg { width: 13px; height: 13px; }
.gd-lane header h3 { min-inline-size: 0; font-size: 11px; font-weight: 840; }
.gd-lane header span { margin-inline-start: auto; color: var(--gd-muted); font-size: 10px; }
.gd-work-item {
  display: grid; gap: 5px; width: 100%; text-align: start; border-radius: 11px; padding: 9px;
  border: 1px solid var(--gd-rim); background: var(--gd-card);
  box-shadow: inset 0 1px 0 var(--gd-gloss);
}
.gd-work-item + .gd-work-item { margin-top: 6px; }
.gd-work-item:hover { background: var(--gd-raised); }
.gd-work-titlerow, .gd-work-meta { display: flex; align-items: flex-start; justify-content: space-between; gap: 6px; }
.gd-work-titlerow strong { font-size: 11.5px; font-weight: 820; }
.gd-work-titlerow svg { width: 14px; height: 14px; }
.gd-work-detail { font-size: 10.5px; line-height: 1.42; color: var(--gd-muted); }
.gd-work-meta { font-size: 9.5px; font-weight: 750; margin-top: 2px; color: var(--gd-muted); }

.gd-dock {
  z-index: 10;
  display: flex; align-items: center; gap: 4px; padding: 5px; border-radius: 999px;
}
.gd-dock-side {
  position: sticky;
  top: 92px;
  margin-top: 14px;
  left: auto;
  flex-direction: column;
  flex-shrink: 0;
  border-radius: 999px;
  padding: 6px;
  gap: 8px;
  z-index: 20;
  box-shadow: inset 1px 1px 1px var(--gd-edge-light), inset -1px -1px 1px var(--gd-edge-shade),
    inset 0 -2px 5px var(--gd-gloss), 0 8px 24px rgb(var(--gd-dark-shadow) / 18%);
}
.gd-dock-bottom { display: none !important; }
.gd-dock a {
  z-index: 1; position: relative; display: flex; gap: 6px; justify-content: center; align-items: center;
  min-inline-size: 44px; min-block-size: 44px; padding: 0 13px; border-radius: 999px;
  font-size: 11px; font-weight: 800; white-space: nowrap;
}
.gd-dock-side a {
  padding: 0;
  inline-size: 42px;
  block-size: 42px;
  min-inline-size: 42px;
  min-block-size: 42px;
  border-radius: 50%;
}
.gd-dock a svg { width: 17px; height: 17px; stroke-width: 1.9; }
.gd-dock a[aria-current="page"] { color: var(--gd-pick-ink); }
.gd-dock a:not([aria-current="page"]):hover { background: var(--gd-inner); }
.gd-dock-indicator {
  position: absolute; inset: 0 auto auto 0; pointer-events: none; visibility: hidden;
  border-radius: 999px; background: var(--gd-pick); box-shadow: inset 0 1px 0 white, 0 2px 7px rgb(var(--gd-dark-shadow) / 16%);
}
.gd-dock-side .gd-dock-indicator { border-radius: 50%; }
.gd-dock-indicator[data-ready="true"] { visibility: visible; transition: transform .36s cubic-bezier(.24, .89, .26, 1), width .36s cubic-bezier(.24, .89, .26, 1), height .36s cubic-bezier(.24, .89, .26, 1); }
.gd-dock-side .gd-dock-text, .gd-dock-short { display: none; }
.gd-dock-tip {
  display: none; position: absolute; left: calc(100% + 10px); z-index: 20; pointer-events: none;
  color: var(--gd-ink); background: var(--gd-surface); padding: 6px 10px; border: 1px solid var(--gd-rim);
  border-radius: 8px; box-shadow: 0 4px 12px rgb(var(--gd-dark-shadow) / 22%);
  white-space: nowrap; font-size: 11px; font-weight: 750;
}
.gd-dock-side a:is(:hover, :focus-visible) .gd-dock-tip { display: inline; }
.gd-footer { padding: 33px 3px 1px; display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.gd-footer > * {
  border-radius: 999px; padding: 5px 8px; color: var(--gd-ink); font-size: 10px; font-weight: 740;
  background: var(--gd-raised); min-block-size: 24px; display: flex; align-items: center; gap: 4px;
}
.gd-footer a:hover { text-decoration: underline; }
.gd-footer a svg { width: 10px; height: 10px; }

.gd-dialog {
  max-inline-size: min(calc(100% - 24px), 550px); inline-size: 100%;
  border-radius: 24px; border: 1px solid var(--gd-rim); color: var(--gd-ink); padding: 0;
  background: var(--gd-surface); box-shadow: 0 24px 80px rgb(var(--gd-dark-shadow) / 45%);
}
.gd-dialog::backdrop { background: rgb(30 21 17 / 43%); backdrop-filter: blur(5px); }
.gd-dialog-inner { padding: 20px; display: flex; flex-direction: column; max-height: 85vh; }
.gd-dialog-inner > header { display: flex; gap: 10px; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.gd-dialog-inner h2 { font-size: 20px; font-weight: 830; letter-spacing: -.03em; }
.gd-command-input { inline-size: 100%; padding-inline: 12px; margin-bottom: 12px; min-block-size: 44px; border-radius: 14px; }
.gd-command-input input { min-block-size: 42px; font-size: 13.5px; }
.gd-quick-scroll {
  overflow-y: auto;
  max-height: calc(85vh - 130px);
  padding-right: 4px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.gd-quick-section-title {
  font-size: 10px;
  font-weight: 850;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--gd-muted);
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.gd-quick-list { display: grid; gap: 6px; }
.gd-quick-list button {
  display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 12px;
  text-align: start; border: 1px solid var(--gd-line); border-radius: 12px; background: var(--gd-inner);
  transition: all .15s ease;
}
.gd-quick-list button:hover { background: var(--gd-raised); border-color: var(--gd-rim); transform: translateY(-1px); }
.gd-quick-list button svg { width: 16px; height: 16px; color: var(--gd-muted); flex-shrink: 0; }
.gd-quick-list button div { flex: 1; min-width: 0; }
.gd-quick-list strong, .gd-quick-list small { display: block; }
.gd-quick-list strong { font-size: 12px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gd-quick-list small { color: var(--gd-muted); margin-top: 2px; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gd-quick-badge {
  font-size: 9.5px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
}
.gd-quick-badge-paid {
  background: color-mix(in srgb, var(--gd-teal) 18%, transparent);
  color: var(--gd-teal);
}
.gd-quick-badge-pending {
  background: color-mix(in srgb, var(--gd-ochre) 20%, transparent);
  color: var(--gd-ochre);
}
.gd-quick-badge-overdue {
  background: color-mix(in srgb, var(--gd-coral) 20%, transparent);
  color: var(--gd-coral);
}
.gd-work-dialog-description { margin: 12px 0; }
.gd-work-facts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; margin-bottom: 12px; }
.gd-work-facts div { border: 1px solid var(--gd-line); border-radius: 9px; padding: 8px; }
.gd-work-facts dt { font-size: 11px; color: var(--gd-muted); }
.gd-work-facts dd { margin: 4px 0 0; font-weight: 790; }

@media (max-height: 850px) {
  .gd-stage-scroll { block-size: auto; overflow: visible; }
}
@media (max-width: 1220px) {
  .gd-top { gap: 10px; padding: 6px 10px; }
  .gd-top-actions { gap: 4px; }
  .gd-ask { max-inline-size: 300px; min-inline-size: 110px; }
}
@media (max-width: 1060px) {
  .gd-surround { inline-size: calc(100% - 40px); }
  .gd-top-actions .gd-icon-button { min-inline-size: 38px; min-block-size: 38px; }
  .gd-top-actions .gd-icon-button svg { width: 15px; height: 15px; }
  .gd-top-actions .gd-primary { min-block-size: 38px !important; padding: 0 10px !important; font-size: 12px; }
  .gd-ask { max-inline-size: 240px; }
  .gd-prompt { font-size: 11px; }
  .gd-stage-scroll { padding-inline: 22px; }
  .gd-command-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  .gd-command-grid > .gd-command-chart { grid-column: 1; }
  .gd-command-side { grid-column: 2; }
  .gd-command-grid > .gd-activity { grid-column: 1 / -1; }
  .gd-metric-grid, .gd-lanes { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .gd-analytics-grid { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 760px) {
  .gd-surround { padding-top: 10px; padding-bottom: calc(85px + env(safe-area-inset-bottom)); inline-size: calc(100% - 20px); }
  .gd-top {
    flex-wrap: wrap;
    padding: 8px 10px;
    gap: 8px;
    border-radius: 21px;
  }
  .gd-brand { order: 1; flex: 1; min-width: 0; padding-inline-start: 2px; }
  .gd-brand strong { font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 105px; }
  .gd-brand small { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 105px; }
  .gd-top-actions { order: 2; gap: 4px; align-items: center; }
  .gd-top-actions .gd-primary { display: none !important; }
  .gd-top-actions .gd-icon-button { width: 35px; height: 35px; min-inline-size: 35px; min-block-size: 35px; }
  .gd-top-actions .gd-icon-button svg { width: 15px; height: 15px; }
  .gd-ask {
    order: 3;
    width: 100%;
    max-inline-size: 100%;
    min-inline-size: 100%;
    min-block-size: 39px;
  }
  .gd-stage { border-radius: 23px; }
  .gd-stage-scroll { block-size: auto; padding: 15px 12px calc(90px + env(safe-area-inset-bottom)); overflow: visible; touch-action: auto; }
  .gd-view-head { align-items: flex-start; flex-direction: column; gap: 8px; margin-bottom: 14px; }
  .gd-view-head h1 { font-size: 26px; }
  .gd-view-head p { font-size: 11.5px; margin-top: 4px; }
  .gd-view-actions { justify-content: flex-start; width: 100%; }
  .gd-view-actions .gd-export { width: 100%; justify-content: center; }
  .gd-command-grid, .gd-analytics-grid { grid-template-columns: minmax(0, 1fr); gap: 10px; }
  .gd-command-side, .gd-command-grid > .gd-activity { grid-column: 1; }
  .gd-metric-grid, .gd-lanes { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .gd-stage-wrap { display: block; }
  .gd-dock-side { display: none !important; }
  .gd-dock-bottom { display: flex !important; position: fixed; inset: auto 8px calc(9px + env(safe-area-inset-bottom)); translate: none; justify-content: space-between; z-index: 40; }
  .gd-dock-bottom a { flex: 1; flex-direction: column; gap: 2px; padding: 3px 4px; min-block-size: 46px; line-height: 1.2; font-size: 9px; }
  .gd-dock-bottom a svg { width: 14px; height: 14px; }
  .gd-dock-bottom .gd-dock-text { display: none; }
  .gd-dock-bottom .gd-dock-short { display: inline; }
  .gd-footer { padding-top: 9px; padding-bottom: calc(80px + env(safe-area-inset-bottom)); flex-direction: column; gap: 6px; text-align: center; }
  .gd-period button { min-block-size: 38px; }
  .gd-primary, .gd-secondary { min-block-size: 42px; }
  .gd-table-scroll { max-inline-size: 100%; width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; touch-action: pan-x pan-y; }
  .gd-table-scroll table { min-inline-size: 640px; }
}
@media (max-width: 420px) {
  .gd-panel { padding: 12px; }
  .gd-metric { padding: 9px; min-block-size: 96px; }
  .gd-metric-value { font-size: 20px; }
  .gd-summary { gap: 6px; padding: 6px; }
  .gd-chart-axis span:nth-child(even) { visibility: hidden; }
  .gd-chart-y { font-size: 9px; }
  .gd-stack-label { font-size: 8px; }
  .gd-lanes { grid-template-columns: 1fr; }
  .gd-balance-number { font-size: 24px !important; }
  .gd-streams { padding: 6px 2px; }
  .gd-streams div { padding: 0 4px; }
  .gd-streams span { font-size: 8.5px; }
  .gd-streams strong { font-size: 10px; }
}
@media (prefers-reduced-motion: reduce) {
  .gd-app *, .gd-app *::before, .gd-app *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
}
@media (prefers-reduced-transparency: reduce), (prefers-contrast: more), (forced-colors: active) {
  .gd-top, .gd-stage, .gd-dock, .gd-panel, .gd-metric, .gd-summary { background: var(--gd-surface); backdrop-filter: none; -webkit-backdrop-filter: none; }
  .gd-metric[data-tone="teal"] { background: var(--gd-surface); color: var(--gd-ink); --gd-muted: var(--gd-ink); --gd-teal: var(--gd-ink); }
}
@media (forced-colors: active) {
  .gd-app { --gd-ink: CanvasText; --gd-muted: CanvasText; --gd-focus: Highlight; --gd-coral: LinkText; --gd-teal: Highlight; --gd-graph-ink: CanvasText; --gd-surface: Canvas; }
  .gd-app :is(.gd-metric, .gd-panel, .gd-lane, .gd-dock, button, .gd-stage) { border: 1px solid CanvasText; }
  .gd-dock a[aria-current="page"] { border: 2px solid Highlight; }
}
`;

const periods = ["7 days", "30 days", "90 days"] as const;
type Period = typeof periods[number];

const analytics = {
  "7 days": {
    revenue: 11600, orders: 319, visitors: 2184, refunds: 14, automation: 304, subscribers: 1847,
    revenueChange: "+4.7%", orderChange: "+7.4%", visitorChange: "+5.2%", refundChange: "−8.0%",
    axis: ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"],
    collected: [1.2, 1.5, 1.35, 1.9, 1.59, 1.72, 2.34],
    costs: [.8, .92, .72, .85, 1.04, 1.01, .84],
    desktop: [58, 63, 61, 57, 59, 64, 60],
    devices: [54, 38, 8],
  },
  "30 days": {
    revenue: 47200, orders: 1328, visitors: 8344, refunds: 56, automation: 1284, subscribers: 1847,
    revenueChange: "+8.3%", orderChange: "+12.2%", visitorChange: "+9.0%", refundChange: "−3.4%",
    axis: ["Oct 19", "Oct 24", "Oct 29", "Nov 3", "Nov 8", "Nov 13", "Nov 17"],
    collected: [5.5, 6.4, 5.2, 7.6, 6.8, 7.1, 8.6],
    costs: [4.3, 4.85, 4.52, 4.2, 5.85, 5.15, 5.5],
    desktop: [66, 57, 64, 58, 60, 55, 61],
    devices: [56, 36, 8],
  },
  "90 days": {
    revenue: 126100, orders: 3728, visitors: 24132, refunds: 162, automation: 3562, subscribers: 1847,
    revenueChange: "+13.4%", orderChange: "+17.5%", visitorChange: "+11.6%", refundChange: "−5.2%",
    axis: ["Aug 20", "Sep 4", "Sep 19", "Oct 4", "Oct 19", "Nov 3", "Nov 17"],
    collected: [13.7, 16.2, 15.4, 16.8, 18.6, 20.4, 25],
    costs: [10.2, 11.2, 12.1, 11.16, 13.4, 13.1, 14.9],
    desktop: [64, 62, 59, 53, 56, 63, 57],
    devices: [58, 33, 9],
  },
} satisfies Record<Period, {
  revenue: number; orders: number; visitors: number; refunds: number; automation: number; subscribers: number;
  revenueChange: string; orderChange: string; visitorChange: string; refundChange: string;
  axis: string[]; collected: number[]; costs: number[]; desktop: number[]; devices: number[];
}>;

const automationActivity = [
  { label: "Tue", complete: 108, review: 10 },
  { label: "Wed", complete: 176, review: 11 },
  { label: "Thu", complete: 138, review: 14 },
  { label: "Fri", complete: 213, review: 19 },
  { label: "Sat", complete: 155, review: 12 },
  { label: "Sun", complete: 161, review: 15 },
  { label: "Mon", complete: 238, review: 14 },
];

type WorkStatus = "Needs review" | "Scheduled" | "Running" | "Exceptions";
const workStatuses: WorkStatus[] = ["Needs review", "Scheduled", "Running", "Exceptions"];

type WorkItem = {
  id: string;
  name: string;
  description: string;
  tool: string;
  owner: string;
  status: WorkStatus;
  timestamp: string;
};

const initialWork: WorkItem[] = [
  { id: "OP-241", name: "Refund approval", description: "A refund exception is ready for the owner to review.", tool: "Stripe", owner: "Finance", status: "Needs review", timestamp: "10:42" },
  { id: "OP-238", name: "Send cap review", description: "Review the first batch size for the renewal campaign.", tool: "HubSpot", owner: "Marketing", status: "Needs review", timestamp: "10:16" },
  { id: "OP-235", name: "Inventory check", description: "Review 23 low-stock items for the next supplier order.", tool: "Shopify", owner: "Operations", status: "Scheduled", timestamp: "15:00" },
  { id: "OP-234", name: "Executive summary", description: "Compile revenue, customer support and campaign performance.", tool: "Reports", owner: "Analytics", status: "Scheduled", timestamp: "Fri 09:00" },
  { id: "OP-232", name: "Sync 142 orders", description: "Update CRM and fulfillment records with validated orders.", tool: "Shopify", owner: "Operations", status: "Running", timestamp: "09:52" },
  { id: "OP-229", name: "Lead enrichment", description: "Match recent support requests to the sales pipeline.", tool: "HubSpot", owner: "Sales", status: "Running", timestamp: "09:23" },
  { id: "OP-227", name: "Duplicate account", description: "Two CRM entries share a billing address. Updates are on hold.", tool: "Salesforce", owner: "Operations", status: "Exceptions", timestamp: "09:06" },
  { id: "OP-223", name: "Calendar access", description: "The scheduling connector needs an owner to restore write access.", tool: "Google", owner: "Marketing", status: "Exceptions", timestamp: "08:41" },
];

const recentActivity = [
  { id: "ACT-108", event: "Order records validated", source: "Shopify", status: "Complete", time: "10:38" },
  { id: "ACT-107", event: "Refund sent to review", source: "Stripe", status: "Needs review", time: "10:24" },
  { id: "ACT-106", event: "Renewal sequence scheduled", source: "HubSpot", status: "Scheduled", time: "10:07" },
  { id: "ACT-105", event: "Support digest delivered", source: "Reports", status: "Complete", time: "09:51" },
  { id: "ACT-104", event: "Account match paused", source: "Salesforce", status: "Exceptions", time: "09:06" },
] as const;

const number = new Intl.NumberFormat("en-US");
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format;
const usdCompact = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format;
const idrCompact = (value: number) => {
  if (Math.abs(value) >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)} M`;
  if (Math.abs(value) >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)} jt`;
  return formatRupiah(Math.round(value));
};

type ChartTone = "coral" | "ink" | "teal" | "ochre";
type CountFormat = "number" | "usd" | "compact" | "percent" | "idr" | "idrCompact";

const formatCount: Record<CountFormat, (value: number) => string> = {
  number: value => number.format(Math.round(value)),
  usd,
  compact: usdCompact,
  percent: value => `${value.toFixed(1)}%`,
  idr: value => formatRupiah(Math.round(value)),
  idrCompact,
};

function Counter({ value, format = "number" }: { value: number; format?: CountFormat }) {
  const text = formatCount[format](value);
  return <>
    <span data-gd-count={value} data-format={format} aria-hidden="true">{text}</span>
    <span className="gd-sr">{text}</span>
  </>;
}

function Legend({ entries }: { entries: { label: string; tone: ChartTone }[] }) {
  return <div className="gd-legend">{entries.map(({ label, tone }) => (
    <span key={label}><i data-tone={tone} aria-hidden="true" />{label}</span>
  ))}</div>;
}

type Stack = { label: string; lower: number; upper: number };

function StackChart({ items, labels, tones, format, title }: {
  items: Stack[];
  labels: [string, string];
  tones: [ChartTone, ChartTone];
  format: (value: number) => string;
  title: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...items.map(item => item.lower + item.upper)) * 1.11;
  const selected = active === null ? undefined : items[active];

  return <figure className="gd-stack" aria-label={title}>
    <div className="gd-stack-meta">
      <Legend entries={labels.map((label, index) => ({ label, tone: tones[index] }))} />
      {selected && <span className="gd-chart-readout">{selected.label} · {format(selected.lower + selected.upper)}</span>}
    </div>
    <div className="gd-stack-plot" style={{ "--gd-series-count": items.length } as CSSProperties} onMouseLeave={() => setActive(null)}>
      {items.map((item, index) => (
        <button type="button" className="gd-stack-column" key={item.label}
          aria-label={`${item.label}: ${format(item.lower)} ${labels[0]}, ${format(item.upper)} ${labels[1]}`}
          aria-pressed={active === index}
          onFocus={() => setActive(index)} onBlur={() => setActive(null)}
          onMouseEnter={() => setActive(index)} onClick={() => setActive(index)}>
          <span className="gd-stack-track" aria-hidden="true">
            <span className="gd-stack-bar" style={{ height: `${(item.lower + item.upper) / max * 100}%` }}>
              <i data-tone={tones[1]} style={{ flexGrow: item.upper }} />
              <i data-tone={tones[0]} style={{ flexGrow: item.lower }} />
            </span>
          </span>
          <span className="gd-stack-label" aria-hidden="true">{item.label}</span>
        </button>
      ))}
    </div>
  </figure>;
}

type Point = [number, number];

function curve(points: Point[]) {
  return points.reduce((path, [x, y], index) => {
    if (index === 0) return `M ${x} ${y}`;
    const [previousX, previousY] = points[index - 1];
    const midpoint = (x + previousX) / 2;
    return `${path} C ${midpoint} ${previousY}, ${midpoint} ${y}, ${x} ${y}`;
  }, "");
}

function RevenueChart({ labels, revenue, costs }: { labels: string[]; revenue: number[]; costs: number[] }) {
  const fillId = `revenue-fill-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [active, setActive] = useState<number | null>(null);
  const plotHeight = 204;
  const width = 600;
  const max = Math.ceil(Math.max(...revenue, ...costs) * 1.14 / 2.5) * 2.5;
  const points = (values: number[]): Point[] => values.map((value, index) => [
    index * width / Math.max(1, values.length - 1),
    plotHeight - value / max * plotHeight,
  ]);
  const revenuePoints = points(revenue);
  const costPoints = points(costs);
  const revenueLine = curve(revenuePoints);
  const last = (revenuePoints.length - 1) * width / Math.max(1, revenuePoints.length - 1);
  const point = active === null ? undefined : revenuePoints[active];
  const costPoint = active === null ? undefined : costPoints[active];
  const ticks = [max, max * .75, max * .5, max * .25, 0];

  return <figure className="gd-revenue-chart" aria-label="Revenue and operating costs by date">
    <div className="gd-revenue-main">
      <div className="gd-chart-y" aria-hidden="true">{ticks.map(value => <span key={value}>{value === 0 ? "0" : `$${Number(value.toFixed(1))}k`}</span>)}</div>
      <div className="gd-line-plot" onMouseLeave={() => setActive(null)}>
        <svg viewBox={`0 0 ${width} ${plotHeight}`} preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1" gradientUnits="objectBoundingBox">
              <stop offset="0" stopColor="var(--gd-coral)" stopOpacity=".30" />
              <stop offset="1" stopColor="var(--gd-coral)" stopOpacity=".025" />
            </linearGradient>
          </defs>
          {ticks.map((tick, index) => <line className="gd-grid-line" key={tick} x1="0" x2={width} y1={plotHeight * index / 4} y2={plotHeight * index / 4} />)}
          <g className="gd-line-reveal">
            <path d={`${revenueLine} L ${last} ${plotHeight} H 0 Z`} fill={`url(#${fillId})`} />
            <path className="gd-chart-path" data-tone="coral" d={revenueLine} />
            <path className="gd-chart-path" data-tone="ink" d={curve(costPoints)} />
          </g>
          {point && costPoint && <g>
            <line className="gd-line-cursor" x1={point[0]} x2={point[0]} y1="0" y2={plotHeight} />
            <circle cx={point[0]} cy={point[1]} r="4" fill="var(--gd-coral)" />
            <circle cx={costPoint[0]} cy={costPoint[1]} r="4" fill="var(--gd-graph-ink)" />
          </g>}
        </svg>
        <div className="gd-chart-zones">
          {labels.map((label, index) => <button type="button" key={label}
            aria-label={`${label}, revenue ${usd(revenue[index] * 1000)}, operating costs ${usd(costs[index] * 1000)}`}
            aria-pressed={active === index}
            onFocus={() => setActive(index)} onBlur={() => setActive(null)}
            onMouseEnter={() => setActive(index)} onClick={() => setActive(index)} />)}
        </div>
        {active !== null && <div className="gd-line-tooltip" style={{ "--gd-tooltip-x": `${active / (labels.length - 1) * 100}%` } as CSSProperties}>
          <strong>{labels[active]}</strong>
          <span>Revenue <b>{usd(revenue[active] * 1000)}</b></span>
          <span>Costs <b>{usd(costs[active] * 1000)}</b></span>
        </div>}
      </div>
    </div>
    <div className="gd-chart-axis" aria-hidden="true">{labels.map(label => <span key={label}>{label}</span>)}</div>
  </figure>;
}

const deviceLabels = ["Desktop", "Mobile", "Tablet"];
const deviceTones: ChartTone[] = ["coral", "ink", "teal"];

function DeviceChart({
  mix,
  visitors,
  labels = deviceLabels,
  tones = deviceTones,
  unit = "Visitors",
}: {
  mix: number[];
  visitors: number;
  labels?: string[];
  tones?: ChartTone[];
  unit?: string;
}) {
  const maskId = `gd-ring-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [active, setActive] = useState<number | null>(null);
  return <div className="gd-device" aria-label={unit}>
    <div className="gd-device-ring">
      <svg viewBox="0 0 124 124" aria-hidden="true">
        <defs>
          <mask id={maskId}>
            <circle className="gd-donut-draw" cx="62" cy="62" r="47" fill="none" stroke="white" strokeWidth="15"
              pathLength="100" strokeDasharray="100 0" transform="rotate(-90 62 62)" />
          </mask>
        </defs>
        <circle cx="62" cy="62" r="47" fill="none" stroke="var(--gd-track)" strokeWidth="14" />
        <g mask={`url(#${maskId})`} transform="rotate(-90 62 62)">
          {mix.map((ratio, index) => <circle key={labels[index] || index} cx="62" cy="62" r="47" pathLength="100"
            fill="none" strokeWidth="14" data-tone={tones[index] || "ink"} className="gd-device-segment"
            data-muted={active !== null && index !== active}
            strokeDasharray={`${Math.max(0, ratio - 1.1)} 100`}
            strokeDashoffset={-mix.slice(0, index).reduce((sum, value) => sum + value, 0)} />)}
        </g>
      </svg>
      <div className="gd-device-total">
        <strong>{active === null ? <Counter value={visitors} /> : number.format(Math.round(visitors * mix[active] / 100))}</strong>
        <span>{active === null ? unit : labels[active]}</span>
      </div>
    </div>
    <div className="gd-device-list">
      {mix.map((ratio, index) => (
        <button type="button" key={labels[index] || index} aria-pressed={active === index}
          aria-label={`${labels[index]}, ${ratio}%`}
          onClick={() => setActive(active === index ? null : index)}>
          <span><i data-tone={tones[index] || "ink"} aria-hidden="true" />{labels[index]}</span>
          <span className="gd-mix-track" aria-hidden="true"><i className="gd-fill" data-tone={tones[index] || "ink"} style={{ width: `${ratio}%` }} /></span>
          <strong>{ratio}%</strong>
        </button>
      ))}
    </div>
  </div>;
}

function Panel({ title, subtitle, action, className = "", children }: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return <section className={`gd-panel ${className}`} data-gd-enter>
    <header className="gd-panel-head">
      <div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
      {action}
    </header>
    {children}
  </section>;
}

type View = "command" | "trends" | "metrics" | "operations";

type MetricProps = {
  title: string;
  icon: ReactNode;
  value: number;
  format?: CountFormat;
  change?: string;
  detail?: string;
  tone?: "teal" | "coral";
};

function Metric({ title, icon, value, format, change, detail, tone }: MetricProps) {
  return <article className="gd-metric" data-tone={tone} data-gd-enter>
    <div className="gd-metric-head"><span>{title}</span><span className="gd-metric-icon" aria-hidden="true">{icon}</span></div>
    <strong className="gd-metric-value"><Counter value={value} format={format} /></strong>
    <div className="gd-metric-caption">
      {change && <span className="gd-delta" data-attention={tone === "coral"}>
        {change.startsWith("−") ? <ArrowDownRight aria-hidden="true" /> : <ArrowUpRight aria-hidden="true" />}{change}
      </span>}
      <span>{detail ?? "vs prior period"}</span>
    </div>
  </article>;
}

function Badge({ status }: { status: string }) {
  const color = status === "Complete" || status === "Running" || status === "PAID" || status === "Lunas" ? "teal"
    : status === "Needs review" || status === "Exceptions" || status === "OVERDUE" || status === "Jatuh Tempo" ? "coral" : "ink";
  return <span className="gd-status" data-state={color}><i aria-hidden="true" />{status}</span>;
}

const invoiceStatusLabel: Record<Invoice["status"], string> = {
  PAID: "Lunas",
  PENDING: "Tertunda",
  OVERDUE: "Jatuh Tempo",
  DRAFT: "Draf",
};

function InvoiceLedger({
  invoices,
  onViewInvoice,
  onEditInvoice,
  onToggleStatus,
  onDeleteInvoice,
}: {
  invoices: Invoice[];
  onViewInvoice?: (inv: Invoice) => void;
  onEditInvoice?: (inv: Invoice) => void;
  onToggleStatus?: (id: string) => void;
  onDeleteInvoice?: (id: string) => void;
}) {
  const { lang } = useLanguage();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const show = invoices.filter(
    (inv) =>
      [inv.invoiceNumber, inv.clientName, inv.clientEmail, inv.status]
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase()) &&
      (status === "ALL" || inv.status === status)
  );

  return (
    <Panel
      title="Daftar Tagihan & Invoice"
      subtitle="Geser ke samping untuk melihat seluruh data · Klik badge untuk ubah status"
      className="gd-activity"
      action={
        <div className="gd-table-tools">
          <label className="gd-search">
            <Search aria-hidden="true" />
            <input
              type="search"
              placeholder="Cari invoice / klien..."
              aria-label="Cari invoice"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label className="gd-filter">
            <Filter aria-hidden="true" />
            <select
              aria-label="Filter status invoice"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="ALL">Semua Status</option>
              <option value="PAID">Lunas</option>
              <option value="PENDING">Tertunda</option>
              <option value="OVERDUE">Jatuh Tempo</option>
              <option value="DRAFT">Draf</option>
            </select>
          </label>
        </div>
      }
    >
      <div className="gd-table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">No. Invoice</th>
              <th scope="col">Klien</th>
              <th scope="col">Jatuh Tempo</th>
              <th scope="col">Total</th>
              <th scope="col">Status</th>
              <th scope="col">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {show.map((inv) => (
              <tr key={inv.id}>
                <td>{inv.invoiceNumber}</td>
                <td>{inv.clientName}</td>
                <td>{inv.dueDate}</td>
                <td>{formatRupiah(inv.total)}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => onToggleStatus?.(inv.id)}
                    title="Klik untuk ubah status"
                    style={{ background: "transparent", border: 0, padding: 0 }}
                  >
                    <Badge status={invoiceStatusLabel[inv.status]} />
                  </button>
                </td>
                <td>
                  <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={() => openWhatsAppInvoice(inv, typeof window !== "undefined" ? window.location.origin : "", lang)}
                      title={lang === "id" ? "Kirim rincian tagihan via WhatsApp" : "Send invoice details via WhatsApp"}
                      className="gd-secondary"
                      style={{
                        minBlockSize: "28px",
                        padding: "3px 8px",
                        fontSize: "10.5px",
                        color: "#25D366",
                        borderColor: "rgba(37, 211, 102, 0.35)",
                      }}
                    >
                      <MessageCircle style={{ width: 12, height: 12 }} />
                    </button>
                    {onViewInvoice && (
                      <button
                        type="button"
                        onClick={() => onViewInvoice(inv)}
                        title="Pratinjau Invoice"
                        className="gd-secondary"
                        style={{ minBlockSize: "28px", padding: "3px 8px", fontSize: "10.5px" }}
                      >
                        <Eye style={{ width: 12, height: 12 }} />
                      </button>
                    )}
                    {onEditInvoice && (
                      <button
                        type="button"
                        onClick={() => onEditInvoice(inv)}
                        title="Edit Invoice"
                        className="gd-secondary"
                        style={{ minBlockSize: "28px", padding: "3px 8px", fontSize: "10.5px" }}
                      >
                        <Pencil style={{ width: 12, height: 12 }} />
                      </button>
                    )}
                    {onDeleteInvoice && (
                      <button
                        type="button"
                        onClick={() => onDeleteInvoice(inv.id)}
                        title="Hapus Invoice"
                        className="gd-secondary"
                        style={{ minBlockSize: "28px", padding: "3px 8px", fontSize: "10.5px", color: "var(--gd-coral)" }}
                      >
                        <Trash2 style={{ width: 12, height: 12 }} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {show.length === 0 && (
        <p className="gd-empty" role="status">
          Tidak ada tagihan yang cocok.
        </p>
      )}
    </Panel>
  );
}

function Activity() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const show = recentActivity.filter(item => [item.event, item.source, item.status].join(" ").toLowerCase().includes(query.trim().toLowerCase())
    && (status === "All statuses" || item.status === status));

  return <Panel title="Recent activity" className="gd-activity" action={
    <div className="gd-table-tools">
      <label className="gd-search"><Search aria-hidden="true" /><input type="search" placeholder="Search activity" aria-label="Search activity" value={query} onChange={event => setQuery(event.target.value)} /></label>
      <label className="gd-filter"><Filter aria-hidden="true" /><select aria-label="Filter activity" value={status} onChange={event => setStatus(event.target.value)}>
        {["All statuses", "Complete", "Needs review", "Scheduled", "Exceptions"].map(item => <option key={item}>{item}</option>)}
      </select></label>
    </div>
  }>
    <div className="gd-table-scroll">
      <table><thead><tr><th scope="col">Activity</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">Time</th></tr></thead>
        <tbody>{show.map(item => <tr key={item.id}><td>{item.event}</td><td>{item.source}</td><td><Badge status={item.status} /></td><td>{item.time}</td></tr>)}</tbody>
      </table>
    </div>
    {show.length === 0 && <p className="gd-empty" role="status">No matching activity.</p>}
  </Panel>;
}

function CommandView({
  period,
  open,
  invoices,
  onCreateInvoice,
  onViewInvoice,
  onEditInvoice,
  onToggleStatus,
  onDeleteInvoice,
  onSimulateWebhook,
}: {
  period: Period;
  open: (view: View) => void;
  invoices?: Invoice[];
  onCreateInvoice?: () => void;
  onViewInvoice?: (inv: Invoice) => void;
  onEditInvoice?: (inv: Invoice) => void;
  onToggleStatus?: (id: string) => void;
  onDeleteInvoice?: (id: string) => void;
  onSimulateWebhook?: () => void;
}) {
  if (invoices) {
    const paidInvoices = invoices.filter((i) => i.status === "PAID");
    const pendingInvoices = invoices.filter((i) => i.status === "PENDING");
    const overdueInvoices = invoices.filter((i) => i.status === "OVERDUE");
    const totalPaid = paidInvoices.reduce((s, i) => s + i.total, 0);
    const totalPending = pendingInvoices.reduce((s, i) => s + i.total, 0);
    const totalOverdue = overdueInvoices.reduce((s, i) => s + i.total, 0);
    const totalAll = invoices.reduce((s, i) => s + i.total, 0);
    const collectionRate = invoices.length > 0 ? (paidInvoices.length / invoices.length) * 100 : 0;

    return (
      <div className="gd-command-grid">
        <Panel title="Pendapatan Lunas" className="gd-balance" action={<span className="gd-unit">IDR</span>}>
          <div className="gd-balance-number" style={{ fontSize: "clamp(24px, 2.8vw, 42px)" }}>
            <Counter value={totalPaid} format="idr" />
          </div>
          <div className="gd-balance-change">
            <span className="gd-delta">
              <ArrowUpRight aria-hidden="true" />
              {paidInvoices.length} / {invoices.length} Lunas
            </span>
            <span>transaksi terverifikasi</span>
          </div>
          <div className="gd-balance-actions">
            {onCreateInvoice ? (
              <button type="button" className="gd-primary" onClick={onCreateInvoice}>
                <Plus aria-hidden="true" /> Buat Tagihan
              </button>
            ) : (
              <button type="button" className="gd-primary" onClick={() => open("trends")}>
                Analitik <ArrowUpRight aria-hidden="true" />
              </button>
            )}
            {onSimulateWebhook ? (
              <button type="button" className="gd-secondary" onClick={onSimulateWebhook}>
                <Zap aria-hidden="true" /> Simulasi Webhook
              </button>
            ) : (
              <button type="button" className="gd-secondary" onClick={() => open("metrics")}>
                Metrik <ArrowRight aria-hidden="true" />
              </button>
            )}
          </div>
          <div className="gd-streams" aria-label="Rincian Tagihan">
            <div>
              <span>Lunas</span>
              <strong>{idrCompact(totalPaid)}</strong>
            </div>
            <div>
              <span>Tertunda</span>
              <strong>{idrCompact(totalPending)}</strong>
            </div>
            <div>
              <span>Jatuh Tempo</span>
              <strong>{idrCompact(totalOverdue)}</strong>
            </div>
          </div>
        </Panel>

        <div className="gd-summary">
          <Metric title="Pendapatan Lunas" icon={<CircleDollarSign />} value={totalPaid} format="idrCompact" detail={`${paidInvoices.length} tagihan lunas`} tone="teal" />
          <Metric title="Tagihan Tertunda" icon={<Clock3 />} value={totalPending} format="idrCompact" detail={`${pendingInvoices.length} menunggu bayar`} />
          <Metric title="Jatuh Tempo" icon={<TriangleAlert />} value={totalOverdue} format="idrCompact" detail={`${overdueInvoices.length} perlu ditagih`} tone="coral" />
          <Metric title="Pelunasan" icon={<ListChecks />} value={collectionRate} format="percent" detail={`${paidInvoices.length} dari ${invoices.length} invoice`} />
        </div>

        <Panel title="Komposisi Invoice" subtitle="Subtotal vs Pajak PPN 11% per tagihan" className="gd-command-chart">
          <StackChart
            items={invoices.slice(0, 7).map((inv) => ({
              label: inv.invoiceNumber.replace("INV-2026-", "#"),
              lower: inv.subtotal,
              upper: inv.taxAmount,
            }))}
            labels={["Subtotal", "PPN"]}
            tones={["ink", "teal"]}
            format={idrCompact}
            title="Komposisi Subtotal dan PPN per invoice"
          />
        </Panel>

        <div className="gd-command-side">
          <Panel title="Target Pelunasan" className="gd-capacity">
            <div
              className="gd-capacity-track"
              role="meter"
              aria-label="Persentase pelunasan tagihan"
              aria-valuenow={Math.round(totalPaid)}
              aria-valuemin={0}
              aria-valuemax={Math.max(1, Math.round(totalAll))}
            >
              <span className="gd-fill" style={{ width: `${totalAll > 0 ? (totalPaid / totalAll) * 100 : 0}%` }} />
            </div>
            <div className="gd-capacity-label">
              <span><strong>{idrCompact(totalPaid)}</strong> lunas</span>
              <span>dari {idrCompact(totalAll)}</span>
            </div>
          </Panel>
          <Panel title="CRM & Portal Bayar" subtitle="Kelola klien & link pembayaran" className="gd-approvals">
            <div className="gd-approval-content">
              <span className="gd-list-icon">
                <Users aria-hidden="true" />
              </span>
              <div>
                <strong>Direktori Klien & LTV</strong>
                <small>Lihat profil akun & portal bayar</small>
              </div>
              <Link href="/clients" className="gd-icon-button" aria-label="Buka CRM Klien">
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </div>
          </Panel>
        </div>

        <InvoiceLedger
          invoices={invoices}
          onViewInvoice={onViewInvoice}
          onEditInvoice={onEditInvoice}
          onToggleStatus={onToggleStatus}
          onDeleteInvoice={onDeleteInvoice}
        />
      </div>
    );
  }

  const stats = analytics[period];
  const streams = [{ label: "Subscriptions", ratio: .686 }, { label: "Services", ratio: .208 }, { label: "Add-ons", ratio: .106 }];
  const sources = streams.map(({ label, ratio }) => ({ label, value: Math.round(stats.revenue * ratio) }));
  return <div className="gd-command-grid">
    <Panel title="Total revenue" className="gd-balance" action={<span className="gd-unit">USD</span>}>
      <div className="gd-balance-number"><Counter value={stats.revenue} format="usd" /></div>
      <div className="gd-balance-change"><span className="gd-delta"><ArrowUpRight aria-hidden="true" />{stats.revenueChange}</span><span>vs prior period</span></div>
      <div className="gd-balance-actions">
        <button type="button" className="gd-primary" onClick={() => open("trends")}>View trends <ArrowUpRight aria-hidden="true" /></button>
        <button type="button" className="gd-secondary" onClick={() => open("metrics")}>View metrics <ArrowRight aria-hidden="true" /></button>
      </div>
      <div className="gd-streams" aria-label="Revenue sources">{sources.map(item => (
        <div key={item.label}><span>{item.label}</span><strong>{usd(item.value)}</strong></div>
      ))}</div>
    </Panel>
    <div className="gd-summary">
      <Metric title="Automations run" icon={<Zap />} value={stats.automation} change="+9.6%" tone="teal" />
      <Metric title="Subscribers" icon={<Users />} value={stats.subscribers} change="+124" detail="this month" />
      <Metric title="Churn rate" icon={<ArrowDownRight />} value={4.2} format="percent" change="+0.6%" tone="coral" />
      <Metric title="Open tickets" icon={<ListChecks />} value={12} detail="9 resolved today" />
    </div>
    <Panel title="Automation activity" subtitle="Completed and sent to review · last 7 days" className="gd-command-chart">
      <StackChart items={automationActivity.map(item => ({ label: item.label, lower: item.complete, upper: item.review }))}
        labels={["Complete", "Review"]} tones={["ink", "teal"]} format={number.format} title="Automation runs by day" />
    </Panel>
    <div className="gd-command-side">
      <Panel title="Automation capacity" className="gd-capacity">
        <div className="gd-capacity-track" role="meter" aria-label="Monthly automation capacity" aria-valuenow={1284} aria-valuemin={0} aria-valuemax={2200}>
          <span className="gd-fill" style={{ width: `${1284 / 2200 * 100}%` }} />
        </div>
        <div className="gd-capacity-label"><span><strong>1,284</strong> used</span><span>2,200 monthly runs</span></div>
      </Panel>
      <Panel title="Approvals" subtitle="Decisions that need an owner" className="gd-approvals">
        <div className="gd-approval-content"><span className="gd-list-icon"><ShieldCheck aria-hidden="true" /></span>
          <div><strong>Owner review</strong><small>Refunds and renewal campaigns</small></div>
          <button type="button" className="gd-icon-button" aria-label="Open Premium Operations" onClick={() => open("operations")}><ArrowUpRight aria-hidden="true" /></button></div>
      </Panel>
    </div>
    <Activity />
  </div>;
}

function AnalyticsMetrics({ period, trend }: { period: Period; trend?: boolean }) {
  const stats = analytics[period];
  const costTotal = Math.round(stats.costs.reduce((total, cost) => total + cost, 0) * 1000);
  const margin = (stats.revenue - costTotal) / stats.revenue * 100;
  return <div className="gd-metric-grid">
    <Metric title="Revenue" icon={<CircleDollarSign />} value={stats.revenue} format="compact" change={stats.revenueChange} tone="teal" />
    {trend ? <>
      <Metric title="Operating costs" icon={<ArrowDownRight />} value={costTotal} format="compact" detail="in this period" />
      <Metric title="Net revenue" icon={<Box />} value={stats.revenue - costTotal} format="compact" detail="after operating costs" />
      <Metric title="Operating margin" icon={<CircleDollarSign />} value={margin} format="percent" detail="of revenue" />
    </> : <>
      <Metric title="Orders" icon={<ShoppingBag />} value={stats.orders} change={stats.orderChange} />
      <Metric title="Visitors" icon={<Eye />} value={stats.visitors} change={stats.visitorChange} />
      <Metric title="Refunds" icon={<ArrowDownRight />} value={stats.refunds} change={stats.refundChange} />
    </>}
  </div>;
}

function AnalyticsView({ period, type, download, invoices, onViewInvoice, onEditInvoice, onToggleStatus, onDeleteInvoice }: {
  period: Period;
  type: "trends" | "metrics";
  download: () => void;
  invoices?: Invoice[];
  onViewInvoice?: (inv: Invoice) => void;
  onEditInvoice?: (inv: Invoice) => void;
  onToggleStatus?: (id: string) => void;
  onDeleteInvoice?: (id: string) => void;
}) {
  if (invoices) {
    const trend = type === "trends";
    const totalAll = invoices.reduce((s, i) => s + i.total, 0);
    const totalPaid = invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.total, 0);
    const totalTax = invoices.reduce((s, i) => s + i.taxAmount, 0);
    const avgInvoice = invoices.length > 0 ? totalAll / invoices.length : 0;

    const paidPct = invoices.length > 0 ? Math.round((invoices.filter((i) => i.status === "PAID").length / invoices.length) * 100) : 0;
    const pendingPct = invoices.length > 0 ? Math.round((invoices.filter((i) => i.status === "PENDING").length / invoices.length) * 100) : 0;
    const otherPct = Math.max(0, 100 - paidPct - pendingPct);

    return (
      <div className="gd-analytics">
        <div className="gd-metric-grid">
          <Metric title="Total Tagihan" icon={<CircleDollarSign />} value={totalAll} format="idrCompact" detail={`${invoices.length} invoice`} tone="teal" />
          <Metric title="Pendapatan Lunas" icon={<ShieldCheck />} value={totalPaid} format="idrCompact" detail="sudah terverifikasi" />
          <Metric title="Total PPN (11%)" icon={<Box />} value={totalTax} format="idrCompact" detail="akumulasi pajak" />
          <Metric title="Rata-rata Invoice" icon={<BarChart3 />} value={avgInvoice} format="idrCompact" detail="per kontrak" />
        </div>
        <div className="gd-analytics-grid">
          <Panel
            title={trend ? "Nilai Tagihan per Invoice (Rp)" : "Rincian Subtotal & Pajak"}
            subtitle="Perbandingan nilai tagihan berdasarkan data transaksi aktif"
          >
            <StackChart
              title="Nilai tagihan per invoice"
              labels={["Subtotal", "PPN 11%"]}
              tones={["ink", "coral"]}
              format={idrCompact}
              items={invoices.slice(0, 8).map((inv) => ({
                label: inv.invoiceNumber.replace("INV-2026-", "#"),
                lower: inv.subtotal,
                upper: inv.taxAmount,
              }))}
            />
          </Panel>
          <Panel title="Distribusi Status" className="gd-device-panel">
            <DeviceChart
              mix={[paidPct, pendingPct, otherPct]}
              visitors={invoices.length}
              labels={["Lunas", "Tertunda", "Lainnya"]}
              tones={["teal", "ochre", "coral"]}
              unit="Tagihan"
            />
          </Panel>
        </div>
        {trend ? (
          <Panel title="Ekspor Laporan Keuangan" className="gd-statement">
            <div className="gd-approval-content">
              <span className="gd-list-icon">
                <Clock3 aria-hidden="true" />
              </span>
              <div>
                <strong>Laporan Tagihan FlowDesk (IDR)</strong>
                <small>{invoices.length} tagihan aktif · Unduh format CSV</small>
              </div>
              <button type="button" className="gd-icon-button" aria-label="Unduh CSV" onClick={download}>
                <Download aria-hidden="true" />
              </button>
            </div>
          </Panel>
        ) : (
          <InvoiceLedger
            invoices={invoices}
            onViewInvoice={onViewInvoice}
            onEditInvoice={onEditInvoice}
            onToggleStatus={onToggleStatus}
            onDeleteInvoice={onDeleteInvoice}
          />
        )}
      </div>
    );
  }

  const stats = analytics[period];
  const trend = type === "trends";
  return <div className="gd-analytics">
    <AnalyticsMetrics period={period} trend={trend} />
    <div className="gd-analytics-grid">
      <Panel title={trend ? "Revenue vs operating costs" : "Revenue by device"}
        subtitle={trend ? "Compare revenue and costs across the selected period" : "Desktop and mobile revenue across the selected period"}
        action={trend && <Legend entries={[{ label: "Revenue", tone: "coral" }, { label: "Costs", tone: "ink" }]} />}>
        {trend ? <RevenueChart labels={stats.axis} revenue={stats.collected} costs={stats.costs} />
          : <StackChart title="Revenue by device and date" labels={["Desktop", "Mobile"]} tones={["ink", "coral"]} format={usd}
            items={stats.axis.map((label, index) => {
              const sum = stats.collected[index] * 1000;
              const lower = Math.round(sum * stats.desktop[index] / 100);
              return { label, lower, upper: sum - lower };
            })} />}
      </Panel>
      <Panel title="Traffic by device" className="gd-device-panel">
        <DeviceChart mix={stats.devices} visitors={stats.visitors} />
      </Panel>
    </div>
    {trend ? <Panel title="Reporting snapshot" className="gd-statement">
      <div className="gd-approval-content"><span className="gd-list-icon"><Clock3 aria-hidden="true" /></span>
        <div><strong>Revenue and operating costs</strong><small>{period} · {stats.axis[0]} to {stats.axis.at(-1)}</small></div>
        <button type="button" className="gd-icon-button" aria-label="Download revenue and expense CSV" onClick={download}><Download aria-hidden="true" /></button>
      </div>
    </Panel> : <Activity />}
  </div>;
}

const statusStyle: Record<WorkStatus, { icon: ReactNode; tone: "teal" | "coral" | "ochre" | "ink" }> = {
  "Needs review": { icon: <ListChecks />, tone: "coral" },
  "Scheduled": { icon: <Clock3 />, tone: "ochre" },
  "Running": { icon: <Zap />, tone: "teal" },
  "Exceptions": { icon: <TriangleAlert />, tone: "ink" },
};

const invoiceLaneOrder: { status: Invoice["status"]; label: string; icon: ReactNode; tone: "teal" | "coral" | "ochre" | "ink" }[] = [
  { status: "DRAFT", label: "Draf", icon: <FileText />, tone: "ink" },
  { status: "PENDING", label: "Tertunda", icon: <Clock3 />, tone: "ochre" },
  { status: "OVERDUE", label: "Jatuh Tempo", icon: <TriangleAlert />, tone: "coral" },
  { status: "PAID", label: "Lunas", icon: <ShieldCheck />, tone: "teal" },
];

function OperationsView({
  work,
  inspect,
  invoices,
  onViewInvoice,
}: {
  work: WorkItem[];
  inspect: (item: WorkItem) => void;
  invoices?: Invoice[];
  onViewInvoice?: (inv: Invoice) => void;
}) {
  const [filter, setFilter] = useState<WorkStatus | "All lanes">("All lanes");

  if (invoices) {
    const totalAll = invoices.reduce((s, i) => s + i.total, 0);
    const overdueCount = invoices.filter((i) => i.status === "OVERDUE").length;
    const pendingCount = invoices.filter((i) => i.status === "PENDING").length;
    const paidCount = invoices.filter((i) => i.status === "PAID").length;

    return (
      <div className="gd-analytics">
        <div className="gd-metric-grid">
          <Metric title="Total Portofolio" icon={<CircleDollarSign />} value={totalAll} format="idrCompact" detail="semua tagihan" tone="teal" />
          <Metric title="Total Invoice" icon={<Zap />} value={invoices.length} detail="dalam pipeline" />
          <Metric title="Perlu Tindak Lanjut" icon={<ListChecks />} value={overdueCount + pendingCount} detail="tertunda & jatuh tempo" />
          <Metric title="Sudah Lunas" icon={<ShieldCheck />} value={paidCount} detail="terverifikasi" />
        </div>
        <Panel title="Papan Status Invoice (Kanban)" subtitle="Klik kartu invoice untuk membuka pratinjau, cetak PDF, atau tandai lunas." className="gd-board">
          <div className="gd-lanes">
            {invoiceLaneOrder.map((lane) => {
              const items = invoices.filter((inv) => inv.status === lane.status);
              return (
                <section className="gd-lane" key={lane.status} aria-label={lane.label}>
                  <header>
                    <i data-tone={lane.tone} aria-hidden="true">{lane.icon}</i>
                    <h3>{lane.label}</h3>
                    <span>{items.length}</span>
                  </header>
                  {items.map((inv) => (
                    <button
                      className="gd-work-item"
                      type="button"
                      onClick={() => onViewInvoice?.(inv)}
                      key={inv.id}
                    >
                      <span className="gd-work-titlerow">
                        <strong>{inv.invoiceNumber}</strong>
                        <Ellipsis aria-hidden="true" />
                      </span>
                      <span className="gd-work-detail">
                        {inv.clientName} · {formatRupiah(inv.total)}
                      </span>
                      <span className="gd-work-meta">
                        <span>Due: {inv.dueDate}</span>
                        <span>{inv.items.length} item</span>
                      </span>
                    </button>
                  ))}
                  {items.length === 0 && <p className="gd-empty">Kosong.</p>}
                </section>
              );
            })}
          </div>
        </Panel>
      </div>
    );
  }
  const review = work.filter(item => item.status === "Needs review").length;
  const tools = new Set(work.map(item => item.tool)).size;
  const lanes = filter === "All lanes" ? workStatuses : [filter];
  return <div className="gd-analytics">
    <div className="gd-metric-grid">
      <Metric title="Revenue at work" icon={<CircleDollarSign />} value={126100} format="compact" detail="last 90 days" tone="teal" />
      <Metric title="Active work items" icon={<Zap />} value={work.length} detail="in the operations queue" />
      <Metric title="Needs approval" icon={<ListChecks />} value={review} detail="waiting for an owner" />
      <Metric title="Connected systems" icon={<ShieldCheck />} value={tools} detail="represented in the queue" />
    </div>
    <Panel title="Active work board" subtitle="Track queued actions, approvals, and connector exceptions."
      className="gd-board" action={<label className="gd-filter"><Filter aria-hidden="true" />
        <select aria-label="Filter operations lanes" value={filter} onChange={event => setFilter(event.target.value as WorkStatus | "All lanes")}>
          {["All lanes", ...workStatuses].map(status => <option key={status}>{status}</option>)}
        </select></label>}>
      <div className="gd-lanes" data-filtered={filter !== "All lanes"}>
        {lanes.map(lane => {
          const items = work.filter(item => item.status === lane);
          return <section className="gd-lane" key={lane} aria-label={lane}>
            <header><i data-tone={statusStyle[lane].tone} aria-hidden="true">{statusStyle[lane].icon}</i><h3>{lane}</h3><span>{items.length}</span></header>
            {items.map(item => <button className="gd-work-item" type="button" onClick={() => inspect(item)} key={item.id}>
              <span className="gd-work-titlerow"><strong>{item.name}</strong><Ellipsis aria-hidden="true" /></span>
              <span className="gd-work-detail">{item.description}</span>
              <span className="gd-work-meta"><span>{item.tool}</span><span>{item.timestamp}</span></span>
            </button>)}
            {items.length === 0 && <p className="gd-empty">Queue clear.</p>}
          </section>;
        })}
      </div>
    </Panel>
  </div>;
}

function useNavigationReducedMotion(motion: boolean) {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    media.addEventListener("change", update);
    update();
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced || !motion;
}

gsap.registerPlugin(useGSAP);

function getViews(lang: "id" | "en" = "id") {
  return [
    {
      id: "command" as const,
      label: "Command Center",
      short: "Command",
      icon: LayoutDashboard,
      description: lang === "id" ? "Pendapatan, otomatisasi, dan ringkasan tagihan yang perlu perhatian." : "Revenue, automations, and what needs your attention.",
      prompt: lang === "id" ? "Tampilkan apa yang perlu perhatian saya." : "Show me what needs attention.",
    },
    {
      id: "trends" as const,
      label: lang === "id" ? "Tren Finansial" : "Trends",
      short: lang === "id" ? "Tren" : "Trends",
      icon: TrendingUp,
      description: lang === "id" ? "Bandingkan biaya operasional dan pendapatan dari waktu ke waktu." : "Compare operating costs and revenue over time.",
      prompt: lang === "id" ? "Bagaimana tren pendapatan bulan ini?" : "How is revenue trending this month?",
    },
    {
      id: "metrics" as const,
      label: lang === "id" ? "Metrik & Performa" : "Metrics",
      short: lang === "id" ? "Metrik" : "Metrics",
      icon: BarChart3,
      description: lang === "id" ? "Pantau pesanan, volume lalu lintas, dan performa sistem." : "Track orders, traffic, and device performance.",
      prompt: lang === "id" ? "Tampilkan performa lalu lintas per perangkat." : "Show me traffic by device.",
    },
    {
      id: "operations" as const,
      label: lang === "id" ? "Papan Operasional" : "Operations",
      short: lang === "id" ? "Operasi" : "Operations",
      icon: BriefcaseBusiness,
      description: lang === "id" ? "Kelola persetujuan, jadwal penagihan, dan eksepsi sistem." : "Manage approvals, schedules, and exceptions across systems.",
      prompt: lang === "id" ? "Tindakan apa saja yang menunggu peninjauan?" : "Which actions are waiting for review?",
    },
  ];
}

const defaultViews = getViews("id");
const views = defaultViews;
const routeOrder: View[] = defaultViews.map(view => view.id);

function routeFromHash(): View {
  if (typeof location === "undefined") return "command";
  const id = location.hash.slice(1);
  return routeOrder.find(view => view === id) ?? "command";
}

function saveCsv(filename: string, rows: (string | number)[][]) {
  const csvBody = rows.map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\r\n");
  // Prepend UTF-8 BOM (\uFEFF) and Excel separator hint (sep=,) so Excel automatically splits columns on Windows
  const excelCsv = "\uFEFFsep=,\r\n" + csvBody;
  const url = URL.createObjectURL(new Blob([excelCsv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function Dock({ active, side = false, select, lang = "id" }: {
  active: View;
  side?: boolean;
  select: (view: View) => void;
  lang?: "id" | "en";
}) {
  const nav = useRef<HTMLElement>(null);
  const marker = useRef<HTMLSpanElement>(null);
  const currentViews = getViews(lang);

  useEffect(() => {
    const container = nav.current;
    const indicator = marker.current;
    if (!container || !indicator) return;
    const adjust = () => {
      const current = container.querySelector<HTMLElement>('[aria-current="page"]');
      if (!current) return;
      indicator.style.width = `${current.offsetWidth}px`;
      indicator.style.height = `${current.offsetHeight}px`;
      indicator.style.transform = `translate(${current.offsetLeft}px, ${current.offsetTop}px)`;
      indicator.dataset.ready = "true";
    };
    const observer = new ResizeObserver(adjust);
    observer.observe(container);
    container.querySelectorAll("a").forEach(link => observer.observe(link));
    adjust();
    return () => observer.disconnect();
  }, [active]);

  const onSelect = (event: MouseEvent<HTMLAnchorElement>, id: View) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    event.preventDefault();
    select(id);
  };

  return <nav ref={nav} className={side ? "gd-dock gd-dock-side" : "gd-dock gd-dock-bottom"}
    aria-label={side ? "Workspace shortcuts" : "Workspace views"}>
    <span ref={marker} className="gd-dock-indicator" aria-hidden="true" />
    {currentViews.map(({ id, label, short, icon: Icon }) => (
      <a href={`#${id}`} key={id} aria-label={label} aria-current={active === id ? "page" : undefined} onClick={event => onSelect(event, id)}>
        <Icon aria-hidden="true" />
        <span className="gd-dock-text" aria-hidden="true">{label}</span>
        <span className="gd-dock-short" aria-hidden="true">{short}</span>
        {side && <span className="gd-dock-tip" aria-hidden="true">{label}</span>}
      </a>
    ))}
  </nav>;
}

function Dialog({ title, children, close }: { title: string; children: ReactNode; close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const label = useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    dialog?.querySelector("input")?.focus();
  }, []);
  return <dialog className="gd-dialog" ref={ref} aria-labelledby={label} onClose={close}
    onClick={event => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
    <section className="gd-dialog-inner">
      <header><h2 id={label}>{title}</h2><button type="button" className="gd-icon-button" aria-label="Close dialog" onClick={() => ref.current?.close()}><X aria-hidden="true" /></button></header>
      {children}
    </section>
  </dialog>;
}

function QuickActions({
  workspaceName,
  select,
  close,
  lang = "id",
  invoices,
  onViewInvoice,
  onCreateInvoice,
  onOpenAuditLog,
  onOpenCompanySettings,
  onSimulateWebhook,
  toggleLang,
  theme,
  setTheme,
  downloadReport,
}: {
  workspaceName: string;
  select: (view: View) => void;
  close: () => void;
  lang?: "id" | "en";
  invoices?: Invoice[];
  onViewInvoice?: (inv: Invoice) => void;
  onCreateInvoice?: () => void;
  onOpenAuditLog?: () => void;
  onOpenCompanySettings?: () => void;
  onSimulateWebhook?: () => void;
  toggleLang?: () => void;
  theme?: "light" | "dark";
  setTheme?: (theme: "light" | "dark") => void;
  downloadReport?: () => void;
}) {
  const [query, setQuery] = useState("");
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const currentViews = getViews(lang);

  // 1. Tagihan yang memerlukan perhatian (Overdue & Pending)
  const attentionInvoices = useMemo(() => {
    return (invoices || []).filter(inv => inv.status === "OVERDUE" || inv.status === "PENDING");
  }, [invoices]);

  // 2. Pencarian faktur / invoice berdasarkan nomor, klien, status, atau nominal
  const matchingInvoices = useMemo(() => {
    if (terms.length === 0 || !invoices) return [];
    return invoices.filter(inv => {
      const searchStr = `${inv.invoiceNumber} ${inv.clientName} ${inv.clientEmail} ${inv.status} ${formatRupiah(inv.total)} ${inv.notes || ""}`.toLowerCase();
      return terms.every(term => searchStr.includes(term));
    });
  }, [invoices, terms]);

  // 3. Aksi cepat & perintah sistem
  const allActions = useMemo(() => [
    {
      id: "action-create",
      label: lang === "id" ? "Buat Tagihan Baru" : "Create New Invoice",
      description: lang === "id" ? "Terbitkan invoice baru dengan perhitungan PPN 11% otomatis" : "Issue a new invoice with auto VAT calculation",
      icon: Plus,
      action: () => { close(); onCreateInvoice?.(); },
      keywords: "buat tagihan invoice baru create new tambah faktur",
    },
    {
      id: "action-crm",
      label: lang === "id" ? "Direktori Klien & CRM" : "Client Directory & CRM",
      description: lang === "id" ? "Kelola akun klien korporat, riwayat pembayaran, dan nilai LTV" : "Manage corporate accounts, history, and LTV",
      icon: Users,
      action: () => { close(); window.location.href = "/clients"; },
      keywords: "klien client crm ltv kontak perusahaan direktori",
    },
    {
      id: "action-export",
      label: lang === "id" ? "Ekspor Laporan Tagihan (CSV)" : "Export Invoices to CSV",
      description: lang === "id" ? "Unduh seluruh rekap tagihan ke file spreadsheet" : "Download invoice summary as CSV",
      icon: ArrowDownToLine,
      action: () => { close(); downloadReport?.(); },
      keywords: "ekspor export download csv unduh excel laporan rekap",
    },
    {
      id: "action-company-settings",
      label: lang === "id" ? "Pengaturan Profil Perusahaan / Toko" : "Company & Bank Settings",
      description: lang === "id" ? "Kustomisasi nama PT, alamat kantor, dan rekening bank pada nota" : "Customize business name, address, and remittance bank",
      icon: Building2,
      action: () => { close(); onOpenCompanySettings?.(); },
      keywords: "pengaturan profil perusahaan toko pt rekening bank setting company profile alamat nota",
    },
    {
      id: "action-audit",
      label: lang === "id" ? "Log Audit & Jejak Aktivitas" : "Audit Log & Activity History",
      description: lang === "id" ? "Lihat riwayat pembuatan tagihan dan aktivitas akun" : "View invoice creation and account activity logs",
      icon: History,
      action: () => { close(); onOpenAuditLog?.(); },
      keywords: "audit log riwayat aktivitas history jejak supabase",
    },
    {
      id: "action-webhook",
      label: lang === "id" ? "Simulasi Webhook Pembayaran" : "Simulate Payment Webhook",
      description: lang === "id" ? "Uji coba otomatisasi penerimaan notifikasi pelunasan" : "Test automated payment settlement notification",
      icon: Zap,
      action: () => { close(); onSimulateWebhook?.(); },
      keywords: "webhook simulasi payment bayar test notifikasi",
    },
    {
      id: "action-lang",
      label: lang === "id" ? "Ganti Bahasa ke English" : "Switch Language to Bahasa Indonesia",
      description: lang === "id" ? "Bahasa saat ini: Bahasa Indonesia (ID)" : "Current language: English (EN)",
      icon: Globe,
      action: () => { close(); toggleLang?.(); },
      keywords: "bahasa language english indonesia ganti switch translate",
    },
    {
      id: "action-theme",
      label: theme === "light"
        ? (lang === "id" ? "Beralih ke Mode Gelap" : "Switch to Dark Mode")
        : (lang === "id" ? "Beralih ke Mode Terang" : "Switch to Light Mode"),
      description: lang === "id" ? "Ubah estetika visual antarmuka" : "Toggle interface visual theme",
      icon: theme === "light" ? Moon : Sun,
      action: () => { close(); setTheme?.(theme === "light" ? "dark" : "light"); },
      keywords: "tema theme gelap terang dark light mode warna",
    },
  ], [lang, theme, onCreateInvoice, onOpenAuditLog, onOpenCompanySettings, onSimulateWebhook, toggleLang, setTheme, downloadReport, close]);

  const matchingActions = useMemo(() => {
    if (terms.length === 0) return allActions.slice(0, 4);
    return allActions.filter(act => {
      const searchStr = `${act.label} ${act.description} ${act.keywords}`.toLowerCase();
      return terms.every(term => searchStr.includes(term));
    });
  }, [allActions, terms]);

  // 4. Navigasi tampilan dashboard
  const matchingViews = useMemo(() => {
    if (terms.length === 0) return currentViews;
    return currentViews.filter(view => {
      const searchStr = `${view.label} ${view.description} ${view.prompt} ${view.short}`.toLowerCase();
      return terms.every(term => searchStr.includes(term));
    });
  }, [currentViews, terms]);

  const hasAnyResults = matchingInvoices.length > 0 || matchingActions.length > 0 || matchingViews.length > 0;

  return (
    <Dialog title={lang === "id" ? "Pusat Perintah & Pencarian" : "Command Palette & Search"} close={close}>
      <label className="gd-search gd-command-input">
        <Search aria-hidden="true" />
        <input
          type="search"
          aria-label="Cari invoice, klien, atau perintah"
          placeholder={lang === "id" ? "Ketik nomor invoice, klien, nominal, aksi..." : "Search invoice #, client, amount, action..."}
          value={query}
          onChange={event => setQuery(event.target.value)}
          autoFocus
        />
      </label>

      <div className="gd-quick-scroll">
        {/* Ketika belum mengetik: Tampilkan tagihan yang perlu perhatian di bagian teratas */}
        {terms.length === 0 && attentionInvoices.length > 0 && (
          <div>
            <div className="gd-quick-section-title">
              <span className="flex items-center gap-1.5 text-[var(--gd-coral)]">
                <TriangleAlert className="w-3.5 h-3.5" />
                {lang === "id" ? "Perlu Tindak Lanjut Segera" : "Needs Immediate Attention"}
              </span>
              <span className="text-[10px] text-[var(--gd-muted)] font-mono">{attentionInvoices.length} {lang === "id" ? "tagihan" : "invoices"}</span>
            </div>
            <div className="gd-quick-list">
              {attentionInvoices.slice(0, 3).map(inv => (
                <button key={inv.id} type="button" onClick={() => { close(); onViewInvoice?.(inv); }}>
                  <Clock3 aria-hidden="true" className="text-[var(--gd-ochre)]" />
                  <div>
                    <strong>{inv.invoiceNumber} · {inv.clientName}</strong>
                    <small>{formatRupiah(inv.total)} · Jatuh tempo: {inv.dueDate}</small>
                  </div>
                  <span className={`gd-quick-badge ${inv.status === "OVERDUE" ? "gd-quick-badge-overdue" : "gd-quick-badge-pending"}`}>
                    {inv.status === "OVERDUE" ? (lang === "id" ? "Jatuh Tempo" : "Overdue") : (lang === "id" ? "Tertunda" : "Pending")}
                  </span>
                  <ChevronRight aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hasil Pencarian Invoice / Faktur */}
        {matchingInvoices.length > 0 && (
          <div>
            <div className="gd-quick-section-title">
              <span>{lang === "id" ? "Faktur & Tagihan Ditemukan" : "Matching Invoices"}</span>
              <span className="text-[10px] text-[var(--gd-muted)] font-mono">{matchingInvoices.length}</span>
            </div>
            <div className="gd-quick-list">
              {matchingInvoices.map(inv => (
                <button key={inv.id} type="button" onClick={() => { close(); onViewInvoice?.(inv); }}>
                  <FileText aria-hidden="true" className="text-[var(--gd-teal)]" />
                  <div>
                    <strong>{inv.invoiceNumber} · {inv.clientName}</strong>
                    <small>{formatRupiah(inv.total)} · {inv.dueDate}</small>
                  </div>
                  <span className={`gd-quick-badge ${
                    inv.status === "PAID"
                      ? "gd-quick-badge-paid"
                      : inv.status === "OVERDUE"
                      ? "gd-quick-badge-overdue"
                      : "gd-quick-badge-pending"
                  }`}>
                    {inv.status === "PAID"
                      ? (lang === "id" ? "Lunas" : "Paid")
                      : inv.status === "OVERDUE"
                      ? (lang === "id" ? "Jatuh Tempo" : "Overdue")
                      : (lang === "id" ? "Tertunda" : "Pending")}
                  </span>
                  <ChevronRight aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hasil Aksi Cepat */}
        {matchingActions.length > 0 && (
          <div>
            <div className="gd-quick-section-title">
              <span>{lang === "id" ? "Aksi Cepat & Pintasan" : "Quick Actions & Tools"}</span>
            </div>
            <div className="gd-quick-list">
              {matchingActions.map(({ id, label, description, icon: Icon, action }) => (
                <button key={id} type="button" onClick={action}>
                  <Icon aria-hidden="true" />
                  <div>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </div>
                  <ChevronRight aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigasi Layar Dashboard */}
        {matchingViews.length > 0 && (
          <div>
            <div className="gd-quick-section-title">
              <span>{lang === "id" ? "Navigasi Layar Dashboard" : "Dashboard Views"}</span>
            </div>
            <div className="gd-quick-list">
              {matchingViews.map(({ label, id, description, icon: Icon }) => (
                <button key={id} type="button" onClick={() => { close(); select(id); }}>
                  <Icon aria-hidden="true" />
                  <div>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </div>
                  <ChevronRight aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Jika Tidak Ada Hasil */}
        {!hasAnyResults && (
          <p className="gd-empty" role="status">
            {lang === "id" ? `Tidak ada invoice atau aksi yang cocok dengan "${query}".` : `No matching invoice or action for "${query}".`}
          </p>
        )}
      </div>
    </Dialog>
  );
}

type Modal = "search" | "notifications" | { itemId: string } | null;

function GlassyDashboard({
  backgroundImage = studioPhoto,
  backgroundCredit,
  workspaceName = "ATLAS",
  panelFrost = 12,
  initialTheme = "light",
  invoices,
  onCreateInvoice,
  onViewInvoice,
  onEditInvoice,
  onToggleStatus,
  onDeleteInvoice,
  onSimulateWebhook,
  onOpenAuditLog,
  onOpenCompanySettings,
  auditCount = 0,
  userLabel,
  userEmail,
  userRole = "Owner",
  isAuthenticated,
  onSignOut,
}: GlassyDashboardProps = {}) {
  const { companyProfile } = useCompany();
  const [view, setView] = useState<View>(routeFromHash);
  const [active, setActive] = useState(view);
  const [period, setPeriod] = useState<Period>("30 days");
  const [theme, setTheme] = useState(initialTheme);
  useEffect(() => setTheme(initialTheme), [initialTheme]);
  const [modal, setModal] = useState<Modal>(null);
  const [work, setWork] = useState(initialWork);
  const [readNotices, setReadNotices] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const scrollArea = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const pending = useRef<View>(view);
  const exit = useRef<gsap.core.Tween | null>(null);
  const reduced = useNavigationReducedMotion(true);
  const { contextSafe } = useGSAP({ scope: root });

  const changeView = contextSafe((next: View) => {
    if (pending.current === next) return;
    pending.current = next;
    setActive(next);
    exit.current?.kill();
    if (reduced || !content.current) {
      setView(next);
      return;
    }
    if (next === view) {
      exit.current = gsap.to(content.current, { opacity: 1, filter: "blur(0px)", duration: .18, clearProps: "opacity,filter" });
      return;
    }
    exit.current = gsap.to(content.current, { opacity: 0, filter: "blur(8px)", duration: .14, ease: "power1.in", onComplete: () => setView(next) });
  });

  function selectView(next: View) {
    if (location.hash !== `#${next}`) history.pushState(null, "", `#${next}`);
    changeView(next);
  }

  useEffect(() => {
    const restore = () => changeView(routeFromHash());
    addEventListener("popstate", restore);
    addEventListener("hashchange", restore);
    return () => {
      removeEventListener("popstate", restore);
      removeEventListener("hashchange", restore);
    };
  }, [changeView]);

  useEffect(() => {
    scrollArea.current?.scrollTo({ top: 0 });
    if (root.current && root.current.getBoundingClientRect().top < -20) root.current.scrollIntoView({ block: "start" });
  }, [view]);

  useGSAP(() => {
    const layer = content.current;
    if (!layer) return;
    const counts = layer.querySelectorAll<HTMLElement>("[data-gd-count]");
    gsap.set(layer, { clearProps: "opacity,filter" });
    if (reduced) {
      counts.forEach(el => { el.textContent = formatCount[el.dataset.format as CountFormat](Number(el.dataset.gdCount)); });
      return;
    }
    const animate = gsap.timeline({ defaults: { ease: "power3.out" } });
    animate.fromTo(layer, { opacity: .55, filter: "blur(5px)" }, { opacity: 1, filter: "blur(0px)", clearProps: "opacity,filter", duration: .32 }, 0);
    animate.from("[data-gd-enter]", { y: 18, opacity: 0, stagger: .045, duration: .50, clearProps: "transform,opacity" }, .035);
    const bars = layer.querySelectorAll(".gd-stack-bar");
    const line = layer.querySelector(".gd-line-reveal");
    const ring = layer.querySelector(".gd-donut-draw");
    const meters = layer.querySelectorAll(".gd-fill");
    if (bars.length) animate.from(bars, { scaleY: 0, stagger: .034, duration: .46, clearProps: "transform" }, .17);
    if (line) animate.fromTo(line, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: .74, clearProps: "clipPath" }, .14);
    if (ring) animate.fromTo(ring, { attr: { "stroke-dasharray": "0 100" } },
      { attr: { "stroke-dasharray": "100 0" }, duration: .76 }, .16);
    if (meters.length) animate.from(meters, { scaleX: 0, duration: .58, stagger: .045, clearProps: "transform" }, .18);
    counts.forEach((el, index) => {
      const value = Number(el.dataset.gdCount);
      const format = formatCount[el.dataset.format as CountFormat];
      const counter = { value: 0 };
      animate.to(counter, { value, duration: .75, onUpdate: () => { el.textContent = format(counter.value); } }, .09 + index * .02);
    });
  }, { scope: content, dependencies: [view, period, reduced], revertOnUpdate: true });

  const { lang, toggleLang } = useLanguage();
  const currentViews = getViews(lang);
  const current = currentViews.find(item => item.id === view) || currentViews[0];
  const workItem = typeof modal === "object" && modal ? work.find(item => item.id === modal.itemId) : undefined;
  const overdueOrPendingInvoices = invoices ? invoices.filter(i => i.status === "OVERDUE" || i.status === "PENDING") : [];
  const reviewCount = invoices ? overdueOrPendingInvoices.length : work.filter(item => item.status === "Needs review").length;
  const close = () => setModal(null);
  const inspect = (item: WorkItem) => setModal({ itemId: item.id });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setModal(prev => prev === "search" ? null : "search");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const downloadReport = () => {
    if (invoices) {
      saveCsv("flowdesk-invoices.csv", [
        ["Invoice Number", "Client", "Email", "Issue Date", "Due Date", "Status", "Subtotal (IDR)", "Tax (IDR)", "Total (IDR)"],
        ...invoices.map(i => [i.invoiceNumber, i.clientName, i.clientEmail, i.issueDate, i.dueDate, i.status, i.subtotal, i.taxAmount, i.total]),
      ]);
      return;
    }
    const stats = analytics[period];
    saveCsv(`atlas-trends-${period.replace(" ", "-")}.csv`, [
      ["Period ending", "Revenue (USD)", "Operating costs (USD)"],
      ...stats.axis.map((label, index) => [label, Math.round(stats.collected[index] * 1000), Math.round(stats.costs[index] * 1000)]),
    ]);
  };
  const downloadWork = () => {
    if (invoices) {
      downloadReport();
      return;
    }
    saveCsv("atlas-operations.csv", [
      ["ID", "Workflow", "System", "Owner", "Status", "Time"],
      ...work.map(item => [item.id, item.name, item.tool, item.owner, item.status, item.timestamp]),
    ]);
  };

  return <div className="gd-app" data-theme={theme} ref={root} style={{ "--gd-panel-frost": Math.max(0, Math.min(36, panelFrost)) + "px" } as CSSProperties}>
    <style>{dashboardStyles}</style>
    <img className="gd-background" src={backgroundImage} alt="" aria-hidden="true" fetchPriority="high" />
    <div className="gd-surround">
      <header className="gd-top">
        <div className="gd-brand"><span className="gd-logo" aria-hidden="true"><svg viewBox="0 0 28 28" fill="none"><path d="m5 22 7.4-16h3.2L23 22h-4l-5-11.4L9 22H5Z" fill="currentColor"/><path d="M10 18h8l1.4 3h-10.8l1.4-3Z" fill="currentColor"/></svg></span>
          <div>
            <strong>{companyProfile?.companyName ? companyProfile.companyName : workspaceName}</strong>
            <small>{companyProfile?.tagline ? companyProfile.tagline : (invoices ? (userLabel || "Financial Ops") : "Workspace")}</small>
          </div>
        </div>
        <button
          type="button"
          className="gd-ask"
          aria-label={lang === "id" ? "Pusat Perintah & Pencarian" : "Command Palette & Search"}
          onClick={() => setModal("search")}
          title={lang === "id" ? "Buka Pencarian & Pusat Perintah" : "Open Command Palette & Search"}
        >
          <span className="gd-orb" aria-hidden="true" />
          <span className="gd-prompt" key={lang + "-" + reviewCount}>
            {reviewCount > 0
              ? (lang === "id" ? `${reviewCount} tagihan perlu perhatian · Cari apa saja...` : `${reviewCount} need attention · Search anything...`)
              : (lang === "id" ? "Cari invoice, klien, perintah..." : "Search invoices, clients, actions...")}
          </span>
          <Search aria-hidden="true" className="gd-ask-search" />
        </button>
        <div className="gd-top-actions">
          {onCreateInvoice && (
            <button type="button" className="gd-primary" onClick={onCreateInvoice} style={{ minBlockSize: "40px", padding: "0 13px" }}>
              <Plus aria-hidden="true" /> <span>{lang === "id" ? "Buat Tagihan" : "New Invoice"}</span>
            </button>
          )}
          <button
            type="button"
            className="gd-icon-button"
            title={lang === "id" ? "Ganti Bahasa (Sekarang ID)" : "Change Language (Current EN)"}
            aria-label="Ganti Bahasa"
            onClick={toggleLang}
          >
            <Globe aria-hidden="true" />
            <span style={{
              position: "absolute",
              bottom: 2,
              right: 2,
              fontSize: 8.5,
              fontWeight: 900,
              background: "var(--gd-pick)",
              color: "var(--gd-pick-ink)",
              borderRadius: 999,
              padding: "1px 3.5px",
              lineHeight: 1,
              border: "1px solid var(--gd-rim)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
            }}>
              {lang === "en" ? "EN" : "ID"}
            </span>
          </button>
          {onOpenAuditLog && (
            <button type="button" className="gd-icon-button" title="Log Audit" aria-label="Log Audit" onClick={onOpenAuditLog}>
              <History aria-hidden="true" />
              {auditCount > 0 && (
                <span style={{ position: "absolute", top: 4, right: 4, fontSize: 9, fontWeight: 800, background: "var(--gd-teal)", color: "#fff", borderRadius: 999, padding: "1px 4px", lineHeight: 1.1 }}>
                  {auditCount}
                </span>
              )}
            </button>
          )}
          {invoices && (
            <Link href="/clients" className="gd-icon-button" title="CRM Klien" aria-label="CRM Klien">
              <Users aria-hidden="true" />
            </Link>
          )}
          {onOpenCompanySettings && (
            <button
              type="button"
              className="gd-icon-button"
              title={lang === "id" ? "Profil Perusahaan & Rekening (Pengaturan)" : "Company & Bank Settings"}
              aria-label="Pengaturan Perusahaan"
              onClick={onOpenCompanySettings}
            >
              <Building2 aria-hidden="true" />
            </button>
          )}
          <button title={theme === "light" ? "Switch to dark theme" : "Switch to light theme"} type="button" className="gd-icon-button"
            aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"} onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            {theme === "light" ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
          </button>
          <button type="button" className="gd-icon-button gd-notices" aria-label="Notifications" onClick={() => { setReadNotices(true); setModal("notifications"); }}>
            <Bell aria-hidden="true" />{!readNotices && reviewCount > 0 && <i aria-hidden="true" />}
          </button>
          {invoices && (
            isAuthenticated ? (
              <button type="button" className="gd-icon-button" title="Keluar (Sign Out)" aria-label="Keluar" onClick={onSignOut}>
                <LogOut aria-hidden="true" />
              </button>
            ) : (
              <Link href="/login" className="gd-icon-button" title={lang === "id" ? "Masuk ke Akun" : "Sign In"} aria-label="Masuk">
                <LogIn aria-hidden="true" />
              </Link>
            )
          )}
        </div>
      </header>

      <div className="gd-stage-wrap">
        <Dock active={active} side select={selectView} lang={lang} />
        <main className="gd-stage">
          <div className="gd-stage-scroll" ref={scrollArea}>
            {/* Executive Welcome & Account Identity Banner (Hanya di Dashboard Utama / Command Center) */}
            {invoices && view === "command" && (
              <div
                style={{
                  margin: "0 0 16px 0",
                  padding: "14px 18px",
                  borderRadius: "20px",
                  background: "var(--gd-card)",
                  border: "1px solid var(--gd-rim)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "14px",
                      background: "linear-gradient(135deg, var(--gd-pick) 0%, var(--gd-teal) 100%)",
                      color: "var(--gd-pick-ink)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                      fontWeight: 900,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    }}
                  >
                    {(userLabel || userEmail || "U")[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ fontSize: "15px", fontWeight: 900, color: "var(--gd-ink)", margin: 0 }}>
                      {lang === "id"
                        ? `Selamat datang kembali, ${userLabel || userEmail?.split("@")[0] || "Owner"}!`
                        : `Welcome back, ${userLabel || userEmail?.split("@")[0] || "Owner"}!`}
                    </h2>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {onCreateInvoice && (
                    <button
                      type="button"
                      onClick={onCreateInvoice}
                      className="gd-primary"
                      style={{ fontSize: "12px", minBlockSize: "32px", padding: "0 12px" }}
                    >
                      <Plus aria-hidden="true" style={{ width: 14, height: 14 }} />
                      <span>{lang === "id" ? "Buat Tagihan" : "New Invoice"}</span>
                    </button>
                  )}
                  {onOpenCompanySettings && (
                    <button
                      type="button"
                      onClick={onOpenCompanySettings}
                      className="gd-secondary"
                      style={{ fontSize: "12px", minBlockSize: "32px", padding: "0 10px" }}
                    >
                      <Building2 aria-hidden="true" style={{ width: 14, height: 14 }} />
                      <span>{lang === "id" ? "Profil PT" : "Profile"}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            <header className="gd-view-head">
              <div>
                <h1>{current.label}</h1>
                <p>{current.description}</p>
              </div>
              <div className="gd-view-actions">
                {view !== "operations" && !invoices && <div className="gd-period" role="group" aria-label="Reporting period">
                  {periods.map(item => <button type="button" key={item} aria-pressed={item === period} onClick={() => setPeriod(item)}>{item}</button>)}
                </div>}
                {(view === "operations" || view === "trends" || invoices) && <button type="button" className="gd-primary gd-export" onClick={view === "operations" ? downloadWork : downloadReport}>
                  <ArrowDownToLine aria-hidden="true" /> <span>{lang === "id" ? "Ekspor CSV" : "Export CSV"}</span>
                </button>}
              </div>
            </header>
            <div className="gd-content" ref={content} key={view} data-view={view}>
              {view === "command" && (
                <CommandView
                  period={period}
                  open={selectView}
                  invoices={invoices}
                  onCreateInvoice={onCreateInvoice}
                  onViewInvoice={onViewInvoice}
                  onEditInvoice={onEditInvoice}
                  onToggleStatus={onToggleStatus}
                  onDeleteInvoice={onDeleteInvoice}
                  onSimulateWebhook={onSimulateWebhook}
                />
              )}
              {(view === "trends" || view === "metrics") && (
                <AnalyticsView
                  period={period}
                  type={view}
                  download={downloadReport}
                  invoices={invoices}
                  onViewInvoice={onViewInvoice}
                  onEditInvoice={onEditInvoice}
                  onToggleStatus={onToggleStatus}
                  onDeleteInvoice={onDeleteInvoice}
                />
              )}
              {view === "operations" && (
                <OperationsView
                  work={work}
                  inspect={inspect}
                  invoices={invoices}
                  onViewInvoice={onViewInvoice}
                />
              )}
            </div>
          </div>
        </main>
        <Dock active={active} select={selectView} lang={lang} />
      </div>
      <footer className="gd-footer">
        <span>
          {lang === "id"
            ? "© 2026 FlowDesk • Sistem Operasi Finansial & Penagihan B2B"
            : "© 2026 FlowDesk • Enterprise Financial Operations & Invoicing"}
        </span>
        {backgroundCredit ? (
          <a href={backgroundCredit.href} target="_blank" rel="noreferrer">{backgroundCredit.label}<ArrowUpRight aria-hidden="true" /></a>
        ) : (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, opacity: 0.9 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gd-teal)", boxShadow: "0 0 6px var(--gd-teal)" }} />
            {lang === "id" ? "Sistem Aktif & Terenkripsi" : "All Systems Operational"}
          </span>
        )}
      </footer>
    </div>

    {modal === "search" && (
      <QuickActions
        workspaceName={workspaceName}
        select={selectView}
        close={close}
        lang={lang}
        invoices={invoices}
        onViewInvoice={onViewInvoice}
        onCreateInvoice={onCreateInvoice}
        onOpenAuditLog={onOpenAuditLog}
        onOpenCompanySettings={onOpenCompanySettings}
        onSimulateWebhook={onSimulateWebhook}
        toggleLang={toggleLang}
        theme={theme}
        setTheme={setTheme}
        downloadReport={downloadReport}
      />
    )}
    {modal === "notifications" && <Dialog title={invoices ? "Tagihan Perlu Perhatian" : "Notifications"} close={close}>
      <div className="gd-quick-list">
        {invoices ? (
          <>
            {overdueOrPendingInvoices.map(inv => (
              <button type="button" key={inv.id} onClick={() => { close(); onViewInvoice?.(inv); }}>
                <Bell aria-hidden="true" />
                <div>
                  <strong>{inv.invoiceNumber} · {inv.clientName}</strong>
                  <small>{invoiceStatusLabel[inv.status]} — {formatRupiah(inv.total)} (Due: {inv.dueDate})</small>
                </div>
                <ArrowRight aria-hidden="true" />
              </button>
            ))}
            {overdueOrPendingInvoices.length === 0 && <p className="gd-empty">Semua tagihan sudah lunas.</p>}
          </>
        ) : (
          <>
            {work.filter(item => item.status === "Needs review").map(item => <button type="button" key={item.id}
              onClick={() => { selectView("operations"); inspect(item); }}>
              <Bell aria-hidden="true" /><div><strong>{item.name}</strong><small>{item.description}</small></div><ArrowRight aria-hidden="true" />
            </button>)}
            {reviewCount === 0 && <p className="gd-empty">You’re all caught up.</p>}
          </>
        )}
      </div>
    </Dialog>}
    {workItem && <Dialog key={workItem.id} title={workItem.name} close={close}>
      <Badge status={workItem.status} />
      <p className="gd-work-dialog-description">{workItem.description}</p>
      <dl className="gd-work-facts">
        <div><dt>System</dt><dd>{workItem.tool}</dd></div>
        <div><dt>Owner</dt><dd>{workItem.owner}</dd></div>
        <div><dt>Reference</dt><dd>{workItem.id}</dd></div>
      </dl>
      {workItem.status === "Needs review" && <button type="button" className="gd-primary" onClick={() => {
        setWork(items => items.map(item => item.id === workItem.id ? { ...item, status: "Scheduled" } : item));
        close();
      }}>Mark reviewed <Command aria-hidden="true" /></button>}
    </Dialog>}
  </div>;
}

export { GlassyDashboard };

export default GlassyDashboard;
