import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Construction } from "lucide-react";

/**
 * PageStub — placeholder used by every sidebar nav item until that module is
 * ported from the html/ prototype. Keeps the navigation surface complete so
 * sidebar links never 404.
 *
 * When porting a page, replace `<PageStub />` with the real implementation
 * inside the same `app/(app)/<route>/page.tsx` file.
 */
type PageStubProps = {
  /** Section breadcrumb (e.g. "Market"). */
  group?: string;
  /** Page title. */
  title: string;
  /** Short subtitle from the prototype's page header. */
  subtitle?: string;
  /** Source filename in html/ for cross-reference. */
  source?: string;
  /** Module ID per platform-brd.md §6 (e.g. "M11"). */
  module?: string;
};

export function PageStub({
  group,
  title,
  subtitle,
  source,
  module,
}: PageStubProps) {
  return (
    <div className="flex flex-col">
      <div className="border-b bg-card px-6 py-5">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {group ? <>{group} <span className="px-1">/</span></> : null}
          <span className="text-foreground/80">{title}</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle ? (
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </div>
      <div className="p-6">
        <Card className="border-dashed">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Construction className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base">Module placeholder</CardTitle>
                <CardDescription>
                  This page is part of the navigation surface but has not been
                  ported from the prototype yet.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {module ? (
                <div className="flex items-baseline gap-2">
                  <dt className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/70">
                    Module
                  </dt>
                  <dd className="font-mono text-foreground">{module}</dd>
                </div>
              ) : null}
              {source ? (
                <div className="flex items-baseline gap-2">
                  <dt className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/70">
                    Prototype
                  </dt>
                  <dd className="font-mono text-foreground">{source}</dd>
                </div>
              ) : null}
            </dl>
            <p className="mt-4">
              Replace this stub with the real page when you port the module.
              The route, layout, and auth gating are already wired.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
