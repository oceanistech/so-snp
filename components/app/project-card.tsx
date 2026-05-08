import Link from "next/link";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * ProjectCard — analysis project tile.
 *
 * Mirrors projects.html `.project-card`:
 *   - header: title + status pill + category pill + overflow menu
 *   - description
 *   - vessel tag chips
 *   - 4 meta rows (Created / Last modified / Scenarios / Owner)
 *   - footer: Open + Compare + delete icon
 */
export type ProjectStatus = "Active" | "Complete" | "Draft" | "Archived";
export type ProjectCategory =
  | "Investment"
  | "Performance"
  | "Newbuild"
  | "Refinance"
  | "ESG";

const STATUS_STYLE: Record<ProjectStatus, string> = {
  Active: "bg-signal-green/15 text-signal-green",
  Complete: "bg-primary/15 text-primary",
  Draft: "bg-muted text-muted-foreground",
  Archived: "bg-muted text-muted-foreground",
};

const CATEGORY_STYLE: Record<ProjectCategory, string> = {
  Investment: "bg-primary/15 text-primary",
  Performance: "bg-signal-orange/15 text-signal-orange",
  Newbuild: "bg-accent/20 text-accent-foreground",
  Refinance: "bg-signal-purple/15 text-signal-purple",
  ESG: "bg-signal-green/15 text-signal-green",
};

export type Project = {
  id: string;
  title: string;
  status: ProjectStatus;
  category: ProjectCategory;
  description: string;
  vessels: string[];
  created: string;
  modified: string;
  scenarios: string;
  owner: string;
};

type ProjectCardProps = {
  project: Project;
  /** When provided, the card body becomes clickable (e.g. to open it as a tab). */
  onClick?: () => void;
};

export function ProjectCard({ project: p, onClick }: ProjectCardProps) {
  const clickable = typeof onClick === "function";
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!clickable) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  };
  const stop = (e: React.MouseEvent | React.KeyboardEvent) => e.stopPropagation();
  return (
    <Card
      onClick={clickable ? onClick : undefined}
      onKeyDown={clickable ? handleKeyDown : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      className={cn(
        "flex flex-col gap-3 p-4 transition-colors hover:border-primary/60",
        clickable && "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-bold leading-snug">{p.title}</h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
                STATUS_STYLE[p.status],
              )}
            >
              {p.status}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
                CATEGORY_STYLE[p.category],
              )}
            >
              {p.category}
            </span>
          </div>
        </div>
        <button
          type="button"
          aria-label="Open project menu"
          onClick={stop}
          className="inline-flex size-7 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </div>

      <p className="line-clamp-3 text-[12px] leading-relaxed text-muted-foreground">
        {p.description}
      </p>

      <div>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Vessels ({p.vessels.length})
        </p>
        <ul className="flex flex-wrap gap-1.5">
          {p.vessels.map((v) => (
            <li
              key={v}
              className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground"
            >
              {v}
            </li>
          ))}
        </ul>
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 border-t pt-3 text-[11px]">
        <MetaRow label="Created" value={p.created} />
        <MetaRow label="Last modified" value={p.modified} />
        <MetaRow label="Scenarios" value={p.scenarios} />
        <MetaRow label="Owner" value={p.owner} />
      </dl>

      <div className="mt-auto flex items-center gap-1.5 border-t pt-3" onClick={stop}>
        {clickable ? (
          <Button
            type="button"
            size="sm"
            className="h-7 flex-1 text-[11px]"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            Open
          </Button>
        ) : (
          <Button asChild size="sm" className="h-7 flex-1 text-[11px]">
            <Link href={`/projects/${p.id}`}>Open</Link>
          </Button>
        )}
        <Button asChild size="sm" variant="outline" className="h-7 flex-1 text-[11px]">
          <Link href={`/projects/${p.id}/compare`}>Compare</Link>
        </Button>
        <button
          type="button"
          title="Delete project"
          aria-label="Delete project"
          onClick={stop}
          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-signal-magenta/10 hover:text-signal-magenta"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </Card>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </dt>
      <dd className="font-semibold text-foreground">{value}</dd>
    </div>
  );
}
