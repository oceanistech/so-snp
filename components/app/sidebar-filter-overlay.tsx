"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  ChevronDown,
  Search as SearchIcon,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * SidebarFilterOverlay — pop-out vessel filter panel anchored beneath the
 * sidebar search wrap. Mirrors the prototype's `#sidebarFilterOverlay` from
 * html/dashboard.html (the SFO):
 *   - 600px wide light-mode card with rounded corners + drop shadow
 *   - sticky header: "Filter Vessels" title, "Reset All" link, close button
 *   - 2-column scrollable body with grouped controls (range inputs,
 *     multi-selects, env/CII chips, dry-dock pills, free-text inputs)
 *   - sticky footer: blue "Apply Filters" + neutral "Save Search"
 *
 * Anchored to a DOM element via `anchorRef` — on open we compute the screen
 * position so the overlay sits flush below the search wrap with a 6px gap,
 * clamped to the viewport's right edge. Click-outside and Escape close it.
 *
 * State is local — applying navigates to `/vessel-search` (the equivalent
 * of the prototype's `advanced-search.html`).
 */

type SidebarFilterOverlayProps = {
  open: boolean;
  onClose: () => void;
  /** The element the panel anchors to (the sidebar search wrap). */
  anchorRef: React.RefObject<HTMLDivElement | null>;
  /** Optional ref to the toggle button — clicks on it shouldn't trigger clickaway. */
  toggleRef?: React.RefObject<HTMLButtonElement | null>;
};

const PANEL_WIDTH = 600;

const ENV_GRADES = [
  { id: "A", className: "bg-[rgba(15,210,154,0.12)] text-[#0aab7e]", borderActive: "border-[#0aab7e]" },
  { id: "B", className: "bg-[rgba(36,143,249,0.12)] text-[#1a7de0]", borderActive: "border-[#1a7de0]" },
  { id: "C", className: "bg-[rgba(255,150,31,0.12)] text-[#c97a10]", borderActive: "border-[#c97a10]" },
  { id: "D", className: "bg-[rgba(220,60,60,0.10)] text-[#c23b3b]", borderActive: "border-[#c23b3b]" },
] as const;

const CII_GRADES = [
  ...ENV_GRADES,
  { id: "E", className: "bg-[rgba(220,60,60,0.10)] text-[#b01f1f]", borderActive: "border-[#b01f1f]" },
] as const;

const DRY_DOCK_OPTIONS = [
  "Within 3 months",
  "3–6 months",
  "6–12 months",
  "1–2 years",
  "2+ years",
];

const FLAGS = [
  { label: "Panama", count: "641" },
  { label: "Marshall Islands", count: "498" },
  { label: "Liberia", count: "387" },
  { label: "Bahamas", count: "215" },
  { label: "Malta", count: "176" },
  { label: "Greece", count: "143" },
  { label: "Singapore", count: "112" },
  { label: "Norway", count: "87" },
];

const VESSEL_TYPES = [
  { label: "Bulk Carrier", count: "1,124" },
  { label: "Tanker", count: "892" },
  { label: "Container", count: "345" },
  { label: "Gas Carrier", count: "188" },
  { label: "LNG", count: "97" },
  { label: "LPG", count: "74" },
  { label: "Chemical Tanker", count: "63" },
  { label: "Car Carrier", count: "41" },
  { label: "General Cargo", count: "23" },
];

const SOCIETIES = [
  { label: "DNV", count: "712" },
  { label: "Lloyd's Register", count: "545" },
  { label: "Bureau Veritas", count: "488" },
  { label: "ABS", count: "321" },
  { label: "ClassNK", count: "214" },
  { label: "RINA", count: "98" },
];

const ECO_FEATURES = [
  { label: "Scrubber Fitted (EGCS)", count: "498" },
  { label: "BWTS Installed", count: "1,241" },
  { label: "Eco Design Hull", count: "634" },
  { label: "Air Lubrication System", count: "187" },
  { label: "Shore Power Ready", count: "93" },
  { label: "Solar PV Installed", count: "37" },
];

const COMMERCIAL_STATUS = [
  { label: "Listed for Sale", count: "142" },
  { label: "Under Offer / In Negotiation", count: "31" },
  { label: "On Time Charter", count: "984" },
  { label: "Open (Spot Available)", count: "213" },
  { label: "In Dry Dock", count: "89" },
];

export function SidebarFilterOverlay({
  open,
  onClose,
  anchorRef,
  toggleRef,
}: SidebarFilterOverlayProps) {
  const router = useRouter();
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = React.useState(false);

  // Local form state (visual-only — Apply navigates to /vessel-search).
  const [dwtMin, setDwtMin] = React.useState("");
  const [dwtMax, setDwtMax] = React.useState("");
  const [yearFrom, setYearFrom] = React.useState("");
  const [yearTo, setYearTo] = React.useState("");
  const [fmvMin, setFmvMin] = React.useState("");
  const [fmvMax, setFmvMax] = React.useState("");
  const [owner, setOwner] = React.useState("");
  const [techMgr, setTechMgr] = React.useState("");
  const [operator, setOperator] = React.useState("");
  const [flags, setFlags] = React.useState<Set<string>>(() => new Set());
  const [types, setTypes] = React.useState<Set<string>>(() => new Set());
  const [societies, setSocieties] = React.useState<Set<string>>(() => new Set());
  const [eco, setEco] = React.useState<Set<string>>(() => new Set());
  const [statuses, setStatuses] = React.useState<Set<string>>(() => new Set());
  const [envScore, setEnvScore] = React.useState<Set<string>>(() => new Set());
  const [ciiRating, setCiiRating] = React.useState<Set<string>>(() => new Set());
  const [dryDock, setDryDock] = React.useState<Set<string>>(() => new Set());
  const [openMs, setOpenMs] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Compute anchor position on open + on resize/scroll.
  React.useEffect(() => {
    if (!open) return;
    const computePosition = () => {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      let left = rect.left;
      const maxLeft = window.innerWidth - PANEL_WIDTH - 8;
      if (left > maxLeft) left = maxLeft;
      if (left < 8) left = 8;
      setPos({ top: rect.bottom + 6, left });
    };
    computePosition();
    window.addEventListener("resize", computePosition);
    window.addEventListener("scroll", computePosition, true);
    return () => {
      window.removeEventListener("resize", computePosition);
      window.removeEventListener("scroll", computePosition, true);
    };
  }, [open, anchorRef]);

  // Click-outside + Escape.
  React.useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (panelRef.current?.contains(target)) return;
      if (toggleRef?.current?.contains(target)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, toggleRef]);

  const resetAll = () => {
    setDwtMin(""); setDwtMax("");
    setYearFrom(""); setYearTo("");
    setFmvMin(""); setFmvMax("");
    setOwner(""); setTechMgr(""); setOperator("");
    setFlags(new Set());
    setTypes(new Set());
    setSocieties(new Set());
    setEco(new Set());
    setStatuses(new Set());
    setEnvScore(new Set());
    setCiiRating(new Set());
    setDryDock(new Set());
    setOpenMs(null);
  };

  const apply = () => {
    onClose();
    router.push("/vessel-search");
  };

  if (!mounted || !open || !pos) return null;

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Filter vessels"
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width: PANEL_WIDTH,
        maxHeight: "82vh",
        zIndex: 1200,
      }}
      className="flex flex-col overflow-hidden rounded-[10px] border border-[#dde3ea] bg-white text-[#1a2a3a] shadow-[0_16px_48px_rgba(0,0,0,0.22),0_4px_12px_rgba(0,0,0,0.10)]"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex flex-shrink-0 items-center justify-between border-b border-[#eaeff5] bg-white px-[18px] py-[11px] pt-[13px]">
        <span className="text-[13px] font-bold text-[#1a2a3a]">Filter Vessels</span>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={resetAll}
            className="bg-transparent p-0 text-[11px] font-bold text-[#0082F3] hover:underline"
          >
            Reset All
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Close"
            className="inline-flex size-6 items-center justify-center rounded text-[#6b7280] hover:bg-[#f0f4f8] hover:text-[#1a2a3a]"
          >
            <X className="size-3.5" strokeWidth={2.5} />
            <span className="sr-only">Close</span>
          </button>
        </div>
      </div>

      {/* Scroll area */}
      <div className="min-h-0 flex-1 overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded-sm [&::-webkit-scrollbar-thumb]:bg-[#dde3ea] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1">
        <div className="grid grid-cols-2">
          {/* LEFT COLUMN */}
          <div className="flex flex-col px-4 py-3">
            <FilterGroup label="Deadweight (DWT)">
              <RangeRow>
                <RangeInput label="Min DWT" placeholder="0" value={dwtMin} onChange={setDwtMin} />
                <RangeInput label="Max DWT" placeholder="500,000" value={dwtMax} onChange={setDwtMax} />
              </RangeRow>
            </FilterGroup>

            <FilterGroup label="Year Built">
              <RangeRow>
                <RangeInput label="From Year" placeholder="1990" value={yearFrom} onChange={setYearFrom} />
                <RangeInput label="To Year" placeholder="2026" value={yearTo} onChange={setYearTo} />
              </RangeRow>
            </FilterGroup>

            <FilterGroup label="Flag State">
              <MultiSelect
                id="flags"
                placeholder="All flags"
                options={FLAGS}
                selected={flags}
                onChange={setFlags}
                openId={openMs}
                setOpenId={setOpenMs}
              />
            </FilterGroup>

            <FilterGroup label="Environmental Score">
              <ChipRow
                grades={ENV_GRADES}
                selected={envScore}
                onToggle={(id) => toggleSet(envScore, setEnvScore, id)}
              />
            </FilterGroup>

            <FilterGroup label="CII Rating (2024)">
              <ChipRow
                grades={CII_GRADES}
                selected={ciiRating}
                onToggle={(id) => toggleSet(ciiRating, setCiiRating, id)}
              />
            </FilterGroup>

            <FilterGroup label="Dry Dock / Survey Due" last>
              <div className="flex flex-wrap gap-1.5">
                {DRY_DOCK_OPTIONS.map((opt) => {
                  const active = dryDock.has(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleSet(dryDock, setDryDock, opt)}
                      className={cn(
                        "inline-flex items-center rounded-full border px-[9px] py-[3px] text-[11px] font-semibold transition-colors",
                        active
                          ? "border-[#0082F3] bg-[#0082F3] text-white"
                          : "border-[#dde3ea] bg-[#f8fafc] text-[#4b5563] hover:border-[#0082F3] hover:text-[#0082F3]",
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </FilterGroup>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col border-l border-[#eaeff5] px-4 py-3">
            <FilterGroup label="Vessel Type">
              <MultiSelect
                id="types"
                placeholder="All types"
                options={VESSEL_TYPES}
                selected={types}
                onChange={setTypes}
                openId={openMs}
                setOpenId={setOpenMs}
              />
            </FilterGroup>

            <FilterGroup label="Classification Society">
              <MultiSelect
                id="societies"
                placeholder="All societies"
                options={SOCIETIES}
                selected={societies}
                onChange={setSocieties}
                openId={openMs}
                setOpenId={setOpenMs}
              />
            </FilterGroup>

            <FilterGroup label="FMV Range ($M)">
              <RangeRow>
                <RangeInput label="Min ($M)" placeholder="0" value={fmvMin} onChange={setFmvMin} />
                <RangeInput label="Max ($M)" placeholder="500" value={fmvMax} onChange={setFmvMax} />
              </RangeRow>
            </FilterGroup>

            <FilterGroup label="Owner / Manager">
              <div className="flex flex-col gap-1.5">
                <TextInput placeholder="Owner name or country…" value={owner} onChange={setOwner} />
                <TextInput placeholder="Technical Manager (e.g. V.Ships)" value={techMgr} onChange={setTechMgr} />
                <TextInput placeholder="Operator / Charterer" value={operator} onChange={setOperator} />
              </div>
            </FilterGroup>

            <FilterGroup label="Eco & Compliance Features">
              <MultiSelect
                id="eco"
                placeholder="Any feature"
                options={ECO_FEATURES}
                selected={eco}
                onChange={setEco}
                openId={openMs}
                setOpenId={setOpenMs}
              />
            </FilterGroup>

            <FilterGroup label="Commercial Status" last>
              <MultiSelect
                id="statuses"
                placeholder="Any status"
                options={COMMERCIAL_STATUS}
                selected={statuses}
                onChange={setStatuses}
                openId={openMs}
                setOpenId={setOpenMs}
              />
            </FilterGroup>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-shrink-0 gap-2 border-t border-[#eaeff5] bg-white px-[18px] py-3">
        <button
          type="button"
          onClick={apply}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-[#0082F3] px-4 py-2 text-[12px] font-bold text-white transition-colors hover:bg-[#006bd1]"
        >
          <SearchIcon className="size-3" strokeWidth={2} />
          Apply Filters
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[#dde3ea] bg-[#f0f4f8] px-3.5 py-2 text-[12px] font-semibold text-[#374151] transition-colors hover:bg-[#e4eaf0]"
        >
          <Bookmark className="size-3" strokeWidth={2} />
          Save Search
        </button>
      </div>
    </div>,
    document.body,
  );
}

/* ── helpers ───────────────────────────────────────────────────────── */

function toggleSet<T>(
  set: Set<T>,
  setSet: React.Dispatch<React.SetStateAction<Set<T>>>,
  value: T,
) {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  setSet(next);
}

function FilterGroup({
  label,
  last,
  children,
}: {
  label: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "border-b border-[#eaeff5] pb-3",
        last ? "mb-0 border-b-0 pb-0" : "mb-3",
      )}
    >
      <div className="mb-[7px] text-[10px] font-bold uppercase tracking-[0.5px] text-[#374151]">
        {label}
      </div>
      {children}
    </div>
  );
}

function RangeRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>;
}

function RangeInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-[3px]">
      <div className="text-[10px] font-semibold uppercase tracking-[0.3px] text-[#9ca3af]">
        {label}
      </div>
      <input
        type="number"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-[#dde3ea] bg-[#f8fafc] px-2 py-[5px] text-[12px] text-[#1a2a3a] placeholder:text-[#c0c9d4] focus:border-[#0082F3] focus:bg-white focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </div>
  );
}

function TextInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-[#dde3ea] bg-[#f8fafc] px-2 py-[5px] text-[12px] text-[#1a2a3a] placeholder:text-[#c0c9d4] focus:border-[#0082F3] focus:bg-white focus:outline-none"
    />
  );
}

function ChipRow({
  grades,
  selected,
  onToggle,
}: {
  grades: readonly { id: string; className: string; borderActive: string }[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-[5px]">
      {grades.map((g) => {
        const active = selected.has(g.id);
        return (
          <button
            key={g.id}
            type="button"
            onClick={() => onToggle(g.id)}
            className={cn(
              "inline-flex items-center rounded-full border-2 px-2.5 py-[3px] text-[11px] font-bold transition-colors",
              g.className,
              active ? g.borderActive : "border-transparent",
            )}
          >
            {g.id}
          </button>
        );
      })}
    </div>
  );
}

function MultiSelect({
  id,
  placeholder,
  options,
  selected,
  onChange,
  openId,
  setOpenId,
}: {
  id: string;
  placeholder: string;
  options: { label: string; count: string }[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  openId: string | null;
  setOpenId: (id: string | null) => void;
}) {
  const isOpen = openId === id;
  const count = selected.size;
  const triggerLabel =
    count === 0
      ? placeholder
      : count === 1
        ? Array.from(selected)[0]
        : `${count} selected`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpenId(isOpen ? null : id)}
        className={cn(
          "flex w-full items-center justify-between gap-1.5 rounded-md border px-2.5 py-1.5 text-left text-[12px] text-[#374151] transition-colors",
          isOpen
            ? "border-[#0082F3] bg-white"
            : "border-[#dde3ea] bg-[#f8fafc] hover:border-[#a0aec0]",
        )}
      >
        <span className="flex-1 truncate">{triggerLabel}</span>
        {count > 1 ? (
          <span className="inline-block flex-shrink-0 rounded-full bg-[#0082F3] px-1.5 py-px text-[10px] font-bold leading-[14px] text-white">
            {count}
          </span>
        ) : null}
        <ChevronDown
          className={cn(
            "size-2.5 flex-shrink-0 text-[#9ca3af] transition-transform",
            isOpen && "rotate-180",
          )}
          strokeWidth={2.5}
        />
      </button>
      {isOpen ? (
        <div className="absolute inset-x-0 top-[calc(100%+3px)] z-[200] max-h-[190px] overflow-y-auto rounded-[7px] border border-[#dde3ea] bg-white py-[3px] shadow-[0_6px_20px_rgba(0,0,0,0.13)] [&::-webkit-scrollbar-thumb]:rounded-sm [&::-webkit-scrollbar-thumb]:bg-[#dde3ea] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1">
          {options.map((opt) => {
            const checked = selected.has(opt.label);
            return (
              <label
                key={opt.label}
                className="flex cursor-pointer select-none items-center gap-[7px] px-2.5 py-1.5 transition-colors hover:bg-[#f0f4f8]"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = new Set(selected);
                    if (checked) next.delete(opt.label);
                    else next.add(opt.label);
                    onChange(next);
                  }}
                  className="size-[13px] flex-shrink-0 cursor-pointer accent-[#0082F3]"
                />
                <span className="flex-1 text-[12px] text-[#374151]">
                  {opt.label}
                </span>
                <span className="text-[10px] font-semibold text-[#9ca3af]">
                  {opt.count}
                </span>
              </label>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
