/**
 * Tests for the Actions dropdown trigger on /vessels/[id].
 *
 * Asserts the trigger renders with the right label + accessibility hooks.
 * Asserting the rendered menu items themselves is brittle in jsdom because
 * Radix's DropdownMenu portals into <body> and relies on ResizeObserver /
 * popper measurements that jsdom doesn't simulate. Functional coverage
 * of the open + click flow happens via Playwright in the E2E suite.
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

vi.mock("sonner", () => ({ toast: { info: vi.fn() } }));

// `next/navigation` is used by the menu's "Remove Vessel" → router
// refresh path. Stub it so jsdom doesn't blow up on an unmocked
// useRouter call.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));

// Server actions can't be imported into vitest cleanly: the chain
//   vessel.actions → @/lib/auth/session → @/auth → next-auth
// triggers `import 'next/server'` (bare specifier without `.js`) inside
// next-auth@5.0.0-beta, which Node's ESM resolver rejects under vitest.
// Stubbing the actions module short-circuits the chain so
// `VesselActionsMenu`'s component-only behaviour can be exercised in
// jsdom. The actions themselves are covered by `lib/actions/__tests__/`.
vi.mock("@/lib/actions/vessel.actions", () => ({
  createVesselAction: vi.fn(),
  deleteVesselAction: vi.fn(),
  duplicateVesselAction: vi.fn(),
  suggestDuplicateVesselNameAction: vi.fn(),
  moveVesselToFleetAction: vi.fn(),
  detachVesselFromOtherFleetsAction: vi.fn(),
  editVesselAction: vi.fn(),
}));

import { VesselActionsMenu } from "../vessel-actions-menu";

describe("VesselActionsMenu", () => {
  it("renders the Actions trigger button", () => {
    render(
      <VesselActionsMenu
        vesselId="v-1"
        vesselName="MV Pacific Star"
        vesselImo="9623148"
        fleets={[{ id: "f-1", name: "Fleet Alpha" }]}
      />,
    );
    const trigger = screen.getByRole("button", { name: /actions/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
  });
});
