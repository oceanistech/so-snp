"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * TablePagination — shared footer row used inside data-table cards.
 *
 * Mirrors the prototype's `.pagination` block from
 * html/assets/css/signal-design-system.css:
 *
 *   .pagination {
 *     display: flex; align-items: center;
 *     justify-content: space-between;
 *     padding: var(--sp-md) var(--sp-lg);    // 16px 24px
 *     border-top: 1px solid var(--color-border);
 *     font-size: var(--text-xs);             // 11px
 *     color: var(--color-text-muted);
 *     // NOTE: no background — sits on the card's white surface
 *   }
 *   .pagination-pages { display: flex; gap: 2px; }
 *   .page-btn {
 *     width: 28px; height: 28px;
 *     border-radius: var(--radius-sm);       // 4px
 *     font-size: 11px; font-weight: 600;
 *     color: var(--color-text-secondary);
 *   }
 *   .page-btn:hover  { background: var(--color-bg); color: text-primary; }
 *   .page-btn.active { background: var(--color-blue); color: #fff; }
 *
 * The component is uncontrolled — pages own current page / total / per-page
 * and pass them in.
 */
type TablePaginationProps = {
  /** Current page (1-based). */
  page: number;
  /** Total number of pages. */
  totalPages: number;
  /** Total number of rows across all pages — used for the "Showing X–Y of Z" label. */
  totalRows: number;
  /** Current per-page count. */
  perPage: number;
  /** Per-page options — defaults to [10, 25, 50]. */
  perPageOptions?: readonly number[];
  /** Singular noun for the rows (e.g. "fleet", "vessel"). Pluralised with "s". */
  rowLabel?: string;
  /** Optional pluralisation override (irregular plurals). */
  rowLabelPlural?: string;
  onPageChange?: (next: number) => void;
  onPerPageChange?: (next: number) => void;
  className?: string;
};

export function TablePagination({
  page,
  totalPages,
  totalRows,
  perPage,
  perPageOptions = [10, 25, 50],
  rowLabel = "row",
  rowLabelPlural,
  onPageChange,
  onPerPageChange,
  className,
}: TablePaginationProps) {
  const safePages = Math.max(1, totalPages);
  const start = totalRows === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, totalRows);
  const noun = totalRows === 1 ? rowLabel : rowLabelPlural ?? `${rowLabel}s`;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-t bg-card px-6 py-4 text-[11px] text-muted-foreground",
        className,
      )}
    >
      <span>
        {totalRows === 0
          ? `No ${rowLabelPlural ?? `${rowLabel}s`} found`
          : `Showing ${start}–${end} of ${totalRows} ${noun}`}
      </span>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-[2px]">
          <PageBtn
            disabled={page <= 1}
            onClick={() => onPageChange?.(page - 1)}
            aria-label="Previous page"
          >
            ‹
          </PageBtn>
          {Array.from({ length: safePages }, (_, i) => i + 1).map((p) => (
            <PageBtn
              key={p}
              active={p === page}
              onClick={() => onPageChange?.(p)}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </PageBtn>
          ))}
          <PageBtn
            disabled={page >= safePages}
            onClick={() => onPageChange?.(page + 1)}
            aria-label="Next page"
          >
            ›
          </PageBtn>
        </div>
        {onPerPageChange ? (
          <select
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            className="h-7 rounded border border-input bg-background px-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {perPageOptions.map((n) => (
              <option key={n} value={n}>
                {n} per page
              </option>
            ))}
          </select>
        ) : (
          <select
            disabled
            className="h-7 rounded border border-input bg-background px-1.5 text-[11px] opacity-60"
          >
            <option>{perPage} per page</option>
          </select>
        )}
      </div>
    </div>
  );
}

function PageBtn({
  children,
  active = false,
  disabled = false,
  onClick,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded text-[11px] font-semibold transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        disabled && "pointer-events-none opacity-40",
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
