/**
 * RTL tests for CreateFleetForm.
 *
 * Covers:
 *   - all three sections render with their required-field markers
 *   - the vessel checklist toggles selection state
 *   - the vessel filter narrows the visible list
 *   - field errors render under the right input (driven via mock useActionState)
 *   - form-level error renders above the form
 *
 * We mock `react`'s `useActionState` so we can inject the form state the
 * client would normally only see after a server-action round trip. The
 * action itself is covered by `lib/actions/__tests__/fleet.actions.test.ts`.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import type * as ReactModule from "react";
import type { AttachableVessel } from "@/lib/services/vessel.service";
import type { FleetFormState } from "@/lib/actions/fleet.form-state";

let stateFixture: FleetFormState = { ok: false, formError: null, fieldErrors: {} };

vi.mock("react", async () => {
  const actual = (await vi.importActual<typeof ReactModule>("react"));
  return {
    ...actual,
    useActionState: () => [stateFixture, () => undefined, false],
  };
});

vi.mock("@/lib/actions/fleet.actions", () => ({
  createFleetAction: vi.fn(),
}));

import { CreateFleetForm } from "../create-fleet-form";

const vesselFixture = (
  id: string,
  name: string,
  root: AttachableVessel["typeRoot"] = "BULK",
): AttachableVessel => ({
  id,
  imo: "9000000",
  name,
  yearBuilt: 2020,
  typeCode: `${root}.X`,
  typeLabel: `${root} Vessel`,
  typeRoot: root,
});

function renderForm(
  state: FleetFormState,
  vessels: AttachableVessel[] = [],
) {
  stateFixture = state;
  return render(
    <CreateFleetForm
      attachableVessels={vessels}
      ownerLabel="engineroom@oceanis.io"
    />,
  );
}

beforeEach(() => {
  stateFixture = { ok: false, formError: null, fieldErrors: {} };
});

describe("CreateFleetForm — structure", () => {
  it("renders all three numbered sections + required name *", () => {
    renderForm({ ok: false, formError: null, fieldErrors: {} }, [
      vesselFixture("v1", "MV Pacific Star"),
    ]);
    expect(screen.getByText("Fleet Details")).toBeInTheDocument();
    expect(screen.getByText("Add Vessels")).toBeInTheDocument();
    expect(screen.getByText("Visibility & Access")).toBeInTheDocument();
    const nameLabel = screen.getByText("Fleet Name").parentElement!;
    expect(nameLabel.textContent).toContain("*");
  });

  it("renders attachable vessels as a checklist", () => {
    renderForm({ ok: false, formError: null, fieldErrors: {} }, [
      vesselFixture("v1", "MV Pacific Star"),
      vesselFixture("v2", "MT Helios", "TANKER"),
    ]);
    expect(screen.getByText("MV Pacific Star")).toBeInTheDocument();
    expect(screen.getByText("MT Helios")).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
  });

  it("shows an empty-state CTA when there are no attachable vessels", () => {
    renderForm({ ok: false, formError: null, fieldErrors: {} }, []);
    expect(screen.getByText(/no vessels in this organisation/i)).toBeInTheDocument();
  });
});

describe("CreateFleetForm — interaction", () => {
  it("toggles checkbox state when a vessel row is clicked", () => {
    renderForm({ ok: false, formError: null, fieldErrors: {} }, [
      vesselFixture("v1", "MV Pacific Star"),
    ]);
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    expect(screen.queryByTestId("selected-vessels-count")).not.toBeInTheDocument();
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
    expect(screen.getByTestId("selected-vessels-count")).toHaveTextContent("1");
  });

  it("filters the vessel list by name", () => {
    renderForm({ ok: false, formError: null, fieldErrors: {} }, [
      vesselFixture("v1", "MV Pacific Star"),
      vesselFixture("v2", "MV Cape Fortuna"),
    ]);
    const input = screen.getByPlaceholderText(/filter vessels/i);
    fireEvent.change(input, { target: { value: "cape" } });
    expect(screen.queryByText("MV Pacific Star")).not.toBeInTheDocument();
    expect(screen.getByText("MV Cape Fortuna")).toBeInTheDocument();
  });
});

describe("CreateFleetForm — error rendering", () => {
  it("renders field error under the name input", () => {
    renderForm({
      ok: false,
      formError: null,
      fieldErrors: { name: ["Fleet name is required"] },
    });
    expect(screen.getByText("Fleet name is required")).toBeInTheDocument();
  });

  it("renders the form-level error above the form", () => {
    renderForm({
      ok: false,
      formError: "Something went wrong creating the fleet. Please try again.",
      fieldErrors: {},
    });
    expect(screen.getByRole("alert")).toHaveTextContent(/something went wrong/i);
  });
});
