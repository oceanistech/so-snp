import { Bookmark, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * ReportCard — research / market report tile.
 *
 * Mirrors the prototype's `.report-card`:
 *   - top row: type badge + date
 *   - title (link out)
 *   - summary
 *   - tags
 *   - footer: Read More + PDF + Save bookmark
 */
export type ReportType =
  | "Quarterly Outlook"
  | "Analysis"
  | "Data Digest"
  | "Alert"
  | "Research";

const TYPE_STYLE: Record<ReportType, string> = {
  "Quarterly Outlook": "bg-primary/15 text-primary",
  Analysis: "bg-signal-green/15 text-signal-green",
  "Data Digest": "bg-primary/10 text-primary",
  Alert: "bg-signal-magenta/15 text-signal-magenta",
  Research: "bg-signal-purple/15 text-signal-purple",
};

export type Report = {
  id: string;
  type: ReportType;
  date: string;
  title: string;
  summary: string;
  tags: string[];
  saved?: boolean;
};

export function ReportCard({ report }: { report: Report }) {
  return (
    <Card className="flex flex-col gap-3 p-4 transition-colors hover:border-primary/60">
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest",
            TYPE_STYLE[report.type],
          )}
        >
          {report.type}
        </span>
        <span className="text-[11px] text-muted-foreground">{report.date}</span>
      </div>

      <h3 className="text-[14px] font-bold leading-snug text-foreground">
        {report.title}
      </h3>

      <p className="line-clamp-3 flex-1 text-[12px] leading-relaxed text-muted-foreground">
        {report.summary}
      </p>

      <ul className="flex flex-wrap gap-1.5">
        {report.tags.map((t) => (
          <li
            key={t}
            className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
          >
            {t}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t pt-3">
        <div className="flex items-center gap-1.5">
          <Button size="sm" className="h-7 gap-1.5 px-2 text-[11px]">
            <FileText className="size-3" />
            Read More
          </Button>
          <Button size="sm" variant="outline" className="h-7 gap-1.5 px-2 text-[11px]">
            <Download className="size-3" />
            PDF
          </Button>
        </div>
        <button
          type="button"
          title={report.saved ? "Remove bookmark" : "Save report"}
          className={cn(
            "inline-flex size-7 items-center justify-center rounded-md border transition-colors",
            report.saved
              ? "border-primary bg-primary/10 text-primary"
              : "border-input text-muted-foreground hover:border-primary hover:text-primary",
          )}
        >
          <span className="sr-only">
            {report.saved ? "Saved" : "Save report"}
          </span>
          <Bookmark
            className={cn("size-3.5", report.saved && "fill-current")}
          />
        </button>
      </div>
    </Card>
  );
}
