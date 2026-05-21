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
