"use client";
/**
 * SanctionsListInput — dynamic list editor for a vessel's Sanctions
 * History. Used inside both the Add Vessel and Edit Vessel forms in
 * the "Sanctions History" card.
 *
 * UX:
 *   - Empty state: a "+ Add Entry" button + an explanatory note. No
 *     rows render until the user starts adding.
 *   - Rows: each row carries Authority (required) / Program / Start
 *     Date / End Date inputs in a 4-column grid, plus a magenta
 *     remove icon button on the right.
 *   - Add Entry pushes a fresh empty row onto the list with a unique
 *     temp id (used for the React key only; not sent to the server).
 *
 * Data flow: every keystroke updates internal React state. A single
 * hidden `<input type="hidden" name="sanctions" value={JSON.stringify(...)}>`
 * sits below the visible rows so the server action receives the whole
 * list in one field. The action JSON.parses it and the Zod schema
 * validates each row's shape.
 *
 * The Description field exists in the schema but is intentionally not
 * surfaced in the UI (per the product decision to keep the row light).
 */
import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SanctionEntry = {
  /** Optional id for entries that already exist in the DB. Used only
   *  as a stable React key; the server action does a full replace so
   *  the id isn't strictly needed in the payload but doesn't hurt. */
  id?: string;
  authority: string;
  program?: string;
  startDate?: string;
  endDate?: string;
};

type RowState = SanctionEntry & {
  /** Stable per-row id used for the React key. Combines a saved row's
   *  DB id with a client-side fallback for newly-added rows. */
  _key: string;
};

let _seq = 0;
function nextKey(): string {
  _seq += 1;
  return `s-${_seq}-${Date.now()}`;
}

export function SanctionsListInput({
  initialEntries = [],
}: {
  /** Existing entries loaded from the server (edit form). Empty for
   *  the create form. */
  initialEntries?: SanctionEntry[];
}) {
  const [rows, setRows] = React.useState<RowState[]>(() =>
    initialEntries.map((e) => ({
      ...e,
      _key: e.id ?? nextKey(),
    })),
  );

  function update<K extends keyof RowState>(
    key: string,
    field: K,
    value: RowState[K],
  ) {
    setRows((prev) =>
      prev.map((r) => (r._key === key ? { ...r, [field]: value } : r)),
    );
  }

  function add() {
    setRows((prev) => [...prev, { _key: nextKey(), authority: "" }]);
  }

  function remove(key: string) {
    setRows((prev) => prev.filter((r) => r._key !== key));
  }

  // Serialise the current rows for the hidden input. Strip the `_key`
  // helper (server doesn't need it) and trim authority + program.
  const serialised = JSON.stringify(
    rows
      .map(({ _key: _, ...rest }) => ({
        ...rest,
        authority: rest.authority.trim(),
        program: rest.program?.trim() || undefined,
      }))
      // Drop completely-empty rows so a user who added a row but never
      // filled anything in doesn't trip the "authority required" Zod
      // rule.
      .filter((r) => r.authority !== ""),
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12px] text-muted-foreground">
          Record any past or active sanctions. Use one row per authority
          (OFAC, EU, UK HMT, etc.). Authority is required; the rest are
          optional. Leave End Date blank for an active sanction.
        </p>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={add}
          className="shrink-0"
        >
          <Plus className="size-3" />
          Add Entry
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-md border border-dashed bg-muted/30 p-3 text-[12px] text-muted-foreground">
          No sanctions on record. Click <strong>Add Entry</strong> above to
          record a sanctioning authority and dates.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((row) => (
            <li
              key={row._key}
              className="rounded-md border bg-card p-3"
            >
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_140px_140px_36px]">
                <Field label="Authority" required>
                  <input
                    type="text"
                    value={row.authority}
                    onChange={(e) =>
                      update(row._key, "authority", e.target.value)
                    }
                    placeholder="e.g. OFAC"
                    className={inputCls}
                    required
                  />
                </Field>
                <Field label="Program">
                  <input
                    type="text"
                    value={row.program ?? ""}
                    onChange={(e) =>
                      update(row._key, "program", e.target.value)
                    }
                    placeholder="e.g. SDN List"
                    className={inputCls}
                  />
                </Field>
                <Field label="Start Date">
                  <input
                    type="date"
                    value={row.startDate ?? ""}
                    onChange={(e) =>
                      update(row._key, "startDate", e.target.value)
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="End Date">
                  <input
                    type="date"
                    value={row.endDate ?? ""}
                    onChange={(e) =>
                      update(row._key, "endDate", e.target.value)
                    }
                    className={inputCls}
                  />
                </Field>
                <button
                  type="button"
                  onClick={() => remove(row._key)}
                  aria-label="Remove sanctions entry"
                  className="mt-[18px] inline-flex size-9 items-center justify-center self-start rounded-md border border-input text-signal-magenta transition-colors hover:bg-signal-magenta/8 hover:border-signal-magenta/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Hidden carrier — the server action reads this field, JSON.parses
          it, and the Zod schema validates each entry. */}
      <input type="hidden" name="sanctions" value={serialised} />
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Internal field shell — small label + child input
 * -------------------------------------------------------------------------- */

const inputCls =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("flex flex-col gap-1")}>
      <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-muted-foreground">
        {label}
        {required ? <span className="ml-0.5 text-signal-magenta">*</span> : null}
      </span>
      {children}
    </label>
  );
}
