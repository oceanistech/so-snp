/**
 * RTL tests for FleetspaceClient.
 *
 * The component takes server-fetched data as props, so we can assert
 * rendering without any DB or session machinery — just feed it FleetSummary
 * and VesselListItem fixtures.
 *
 * Coverage:
 *   - empty state when there are zero fleets
 *   - fleet table renders with type-mix tags
 *   - selecting a fleet swaps to the detail view + KPI share pills
 *   - "just created" success banner shows and dismisses
 */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import type { FleetSummary } from "@/lib/services/fleet.service";
import type { VesselListItem } from "@/lib/services/vessel.service";

const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

// Sonner is used by row-level menus for placeholder toasts. Stub it so
// the import doesn't pull in a window-only side-effect.
vi.mock("sonner", () => ({ toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() } }));

// FleetspaceClient pulls in `VesselActionsMenu`, `FleetActionsMenu` and
// the row-level menus, all of which import server actions from
// `@/lib/actions/{vessel,fleet}.actions`. Those modules transitively
// reach `next-auth@5.0.0-beta`, which contains an `import 'next/server'`
// (bare specifier without `.js`) that Node's ESM resolver rejects under
// vitest. Stubbing the action modules here short-circuits the import
// chain. The actions themselves are covered by `lib/actions/__tests__/`.
vi.mock("@/lib/actions/vessel.actions", () => ({
  createVesselAction: vi.fn(),
  deleteVesselAction: vi.fn(),
  duplicateVesselAction: vi.fn(),
  suggestDuplicateVesselNameAction: vi.fn(),
  moveVesselToFleetAction: vi.fn(),
  detachVesselFromOtherFleetsAction: vi.fn(),
  editVesselAction: vi.fn(),
}));
vi.mock("@/lib/actions/fleet.actions", () => ({
  createFleetAction: vi.fn(),
  deleteFleetAction: vi.fn(),
  editFleetAction: vi.fn(),
  duplicateFleetAction: vi.fn(),
  suggestDuplicateFleetNameAction: vi.fn(),
}));

import { FleetspaceClient } from "../fleetspace-client";

function fleet(overrides: Partial<FleetSummary> = {}): FleetSummary {
  return {
    id: overrides.id ?? "f1",
    slug: overrides.slug ?? "fleet-alpha",
    name: overrides.name ?? "Fleet Alpha",
    type: overrides.type ?? "Mixed",
    description: overrides.description ?? null,
    currency: overrides.currency ?? "USD",
    visibility: overrides.visibility ?? "TEAM",
    tag: overrides.tag ?? null,
    ownerUserId: overrides.ownerUserId ?? null,
    createdAt: overrides.createdAt ?? new Date("2026-01-15"),
    updatedAt: overrides.updatedAt ?? new Date("2026-01-15"),
    vesselCount: overrides.vesselCount ?? 2,
    totalDwt: overrides.totalDwt ?? 200_000,
    totalFmvUsd: overrides.totalFmvUsd ?? 60,
    avgAgeYears: overrides.avgAgeYears ?? 8,
    typeMix: overrides.typeMix ?? { BULK: 2 },
  };
}

function vessel(overrides: Partial<VesselListItem> = {}): VesselListItem {
  return {
    id: overrides.id ?? "v1",
    imo: overrides.imo ?? "9623148",
    name: overrides.name ?? "MV Pacific Star",
    typeCode: overrides.typeCode ?? "BULK.PANAMAX",
    typeLabel: overrides.typeLabel ?? "Panamax Bulk",
    typeRoot: overrides.typeRoot ?? "BULK",
    yearBuilt: overrides.yearBuilt ?? 2016,
    dwt: overrides.dwt ?? 82_000,
    // `currentFmvUsd` is raw USD (matches the real Prisma projection
    // — `Decimal(14, 2)` columns are stored as full dollar amounts).
    // 28_500_000 renders as "$28.5M" in the table.
    currentFmvUsd: overrides.currentFmvUsd ?? 28_500_000,
    envScore: overrides.envScore ?? "A",
    lifecycleStatus: overrides.lifecycleStatus ?? "ACTIVE",
    employmentStatus: overrides.employmentStatus ?? "CURRENT_EARNINGS",
    isOnSale: overrides.isOnSale ?? false,
    fleets: overrides.fleets ?? [{ id: "f1", slug: "fleet-alpha", name: "Fleet Alpha" }],
  };
}

describe("FleetspaceClient — empty state", () => {
  it("shows the empty state when there are zero fleets", () => {
    render(
      <FleetspaceClient
        initialFleets={[]}
        initialVessels={[]}
        justCreated={null}
      />,
    );
    expect(screen.getByText(/no fleets yet/i)).toBeInTheDocument();
    // Two "Create Fleet" links render when the page is empty: one in the
    // page header, one in the EmptyState CTA. Confirm both are present.
    expect(
      screen.getAllByRole("link", { name: /create fleet/i }).length,
    ).toBeGreaterThanOrEqual(2);
  });
});

describe("FleetspaceClient — populated", () => {
  it("renders the fleet list with type-mix tags", () => {
    render(
      <FleetspaceClient
        initialFleets={[
          fleet({ name: "Fleet Alpha", typeMix: { BULK: 2, TANKER: 1 } }),
        ]}
        initialVessels={[
          vessel({ name: "MV Pacific Star" }),
          vessel({ id: "v2", name: "MV Cape Fortuna" }),
          vessel({ id: "v3", name: "MT Helios", typeRoot: "TANKER" }),
        ]}
        justCreated={null}
      />,
    );
    expect(screen.getByText("Fleet Alpha")).toBeInTheDocument();
    expect(screen.getByText(/2×BULK/i)).toBeInTheDocument();
    expect(screen.getByText(/1×TANKER/i)).toBeInTheDocument();
    // KPI row shows total vessel count from the vessels prop (3)
    expect(screen.getAllByText("3")[0]).toBeInTheDocument();
  });

  it("opens the fleet detail view when the Open button is clicked", () => {
    render(
      <FleetspaceClient
        initialFleets={[fleet({ name: "Fleet Alpha", vesselCount: 1 })]}
        initialVessels={[vessel({ name: "MV Pacific Star" })]}
        justCreated={null}
      />,
    );
    // The standalone "Open" button was removed in OT-175 — the fleet
    // row itself is clickable now (the <tr> carries the onOpenFleet
    // handler). Clicking the fleet-name span bubbles up to the row
    // and triggers the same open behaviour.
    fireEvent.click(screen.getByText("Fleet Alpha"));
    // Detail view: filter bar + vessel row
    expect(screen.getByPlaceholderText(/search vessel name/i)).toBeInTheDocument();
    // Vessel name is now a button that opens the vessel as a sub-tab,
    // not a navigation link.
    expect(screen.getByRole("button", { name: "MV Pacific Star" })).toBeInTheDocument();
  });

  it("opens a vessel name click as a nested sub-tab", async () => {
    // Mock the lazy fetch to /api/vessels/<id>
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ id: "v1", name: "MV Pacific Star" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    render(
      <FleetspaceClient
        initialFleets={[fleet({ name: "Fleet Alpha", vesselCount: 1 })]}
        initialVessels={[vessel({ name: "MV Pacific Star" })]}
        justCreated={null}
      />,
    );
    fireEvent.click(screen.getByText("Fleet Alpha"));
    fireEvent.click(screen.getByRole("button", { name: "MV Pacific Star" }));
    // After click, the vessel-browser-bar should have both "All Vessels"
    // (with badge 1) and "MV Pacific Star" as a sub-tab.
    expect(screen.getByRole("tab", { name: /All Vessels/ })).toBeInTheDocument();
    const vesselTab = screen.getByRole("tab", { name: /MV Pacific Star/ });
    expect(vesselTab).toBeInTheDocument();
    expect(vesselTab).toHaveAttribute("aria-selected", "true");
    expect(fetchSpy).toHaveBeenCalledWith("/api/vessels/v1");
    fetchSpy.mockRestore();
  });

  it("filters vessels by name in the detail view", () => {
    render(
      <FleetspaceClient
        initialFleets={[fleet({ name: "Fleet Alpha", vesselCount: 2 })]}
        initialVessels={[
          vessel({ name: "MV Pacific Star" }),
          vessel({ id: "v2", name: "MV Cape Fortuna" }),
        ]}
        justCreated={null}
      />,
    );
    fireEvent.click(screen.getByText("Fleet Alpha"));
    const input = screen.getByPlaceholderText(/search vessel name/i);
    fireEvent.change(input, { target: { value: "cape" } });
    expect(screen.queryByText("MV Pacific Star")).not.toBeInTheDocument();
    expect(screen.getByText("MV Cape Fortuna")).toBeInTheDocument();
  });
});

describe("FleetspaceClient — justCreated banner", () => {
  it("renders the success banner with the fleet name", () => {
    render(
      <FleetspaceClient
        initialFleets={[fleet({ id: "f-new", name: "Fleet Gamma" })]}
        initialVessels={[]}
        justCreated={{ id: "f-new", name: "Fleet Gamma" }}
      />,
    );
    // "Fleet Gamma" appears in the banner AND in the fleet list row, so
    // we assert on the banner-specific copy + the inline action button.
    expect(screen.getByText(/was created/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "open it now" })).toBeInTheDocument();
    // …and confirm the name renders inside the banner element specifically.
    const banner = screen.getByText(/was created/i).closest("div")!;
    expect(banner.textContent).toContain("Fleet Gamma");
  });

  it("dismisses on the X button and clears the search params", () => {
    render(
      <FleetspaceClient
        initialFleets={[fleet({ id: "f-new", name: "Fleet Gamma" })]}
        initialVessels={[]}
        justCreated={{ id: "f-new", name: "Fleet Gamma" }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /dismiss/i }));
    expect(screen.queryByText(/was created/i)).not.toBeInTheDocument();
    expect(replaceMock).toHaveBeenCalledWith("/fleetspace");
  });
});
