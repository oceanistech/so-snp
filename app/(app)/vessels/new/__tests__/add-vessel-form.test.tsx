/**
 * RTL tests for AddVesselForm.
 *
 * Covers:
 *   - all four sections + required-field markers render
 *   - parent-type dropdown enables/disables subtype dropdown
 *   - subtype filter updates when parent changes
 *   - live preview reflects name / imo / year / dwt / flag / type / fleet
 *   - hidden vesselTypeId input carries the leaf (or parent if no subtypes)
 *   - field errors render under the right input
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import type * as ReactModule from "react";
import type { VesselFormState } from "@/lib/actions/vessel.form-state";
import type {
  AddVesselReferenceData,
  VesselTypeNode,
} from "@/lib/services/reference.service";

let stateFixture: VesselFormState = { ok: false, formError: null, fieldErrors: {} };

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof ReactModule>("react");
  return {
    ...actual,
    useActionState: () => [stateFixture, () => undefined, false],
  };
});

vi.mock("@/lib/actions/vessel.actions", () => ({
  createVesselAction: vi.fn(),
}));

import { AddVesselForm } from "../add-vessel-form";

const types: VesselTypeNode[] = [
  { id: "t-bulk", code: "BULK", name: "Bulk Carrier", shortLabel: "BULK", parentId: null },
  {
    id: "t-bulk-panamax",
    code: "BULK.PANAMAX",
    name: "Panamax",
    shortLabel: "BULK",
    parentId: "t-bulk",
  },
  {
    id: "t-bulk-cape",
    code: "BULK.CAPESIZE",
    name: "Capesize",
    shortLabel: "BULK",
    parentId: "t-bulk",
  },
  { id: "t-tank", code: "TANKER", name: "Tanker", shortLabel: "TANKER", parentId: null },
  {
    id: "t-tank-vlcc",
    code: "TANKER.VLCC",
    name: "VLCC",
    shortLabel: "TANKER",
    parentId: "t-tank",
  },
  { id: "t-gas", code: "GAS", name: "Gas Carrier", shortLabel: "GAS", parentId: null },
];

const refData: AddVesselReferenceData = {
  vesselTypes: types,
  countries: [
    { id: "c-lr", iso2: "LR", name: "Liberia", isFlagState: true },
    { id: "c-pa", iso2: "PA", name: "Panama", isFlagState: true },
    { id: "c-fr", iso2: "FR", name: "France", isFlagState: false },
  ],
  ports: [{ id: "p-1", name: "Monrovia", countryId: "c-lr" }],
  shipyards: [{ id: "s-1", name: "Hyundai HI", city: "Ulsan" }],
  classSocieties: [{ id: "cs-1", code: "DNV", name: "Det Norske Veritas" }],
  engineModels: [
    { id: "em-1", name: "6G60ME-C9.5", maker: { id: "ma-1", name: "MAN B&W" } },
  ],
};

const fleets = [
  { id: "f-alpha", name: "Fleet Alpha" },
  { id: "f-beta", name: "Fleet Beta" },
];

function renderForm(state: VesselFormState = { ok: false, formError: null, fieldErrors: {} }) {
  stateFixture = state;
  return render(
    <AddVesselForm
      referenceData={refData}
      fleets={fleets}
    />,
  );
}

beforeEach(() => {
  stateFixture = { ok: false, formError: null, fieldErrors: {} };
});

describe("AddVesselForm — structure", () => {
  it("renders the IMO Quick Lookup placeholder + all four sections", () => {
    renderForm();
    expect(screen.getByText(/quick lookup by imo/i)).toBeInTheDocument();
    expect(screen.getByText("Vessel Identification")).toBeInTheDocument();
    expect(screen.getByText("Vessel Specifications")).toBeInTheDocument();
    expect(screen.getByText("Commercial & Financial")).toBeInTheDocument();
    expect(screen.getByText("Notes")).toBeInTheDocument();
  });

  it("marks Vessel Name, IMO, Vessel Type, Year Built, DWT, Flag State as required", () => {
    renderForm();
    for (const label of [
      "Vessel Name",
      "IMO Number",
      "Vessel Type",
      "Year Built",
      "DWT (tonnes)",
      "Flag State",
    ]) {
      const parent = screen.getByText(label).parentElement!;
      expect(parent.textContent).toContain("*");
    }
  });

  it("renders only flag-state countries in the Flag State dropdown", () => {
    renderForm();
    const flagSelect = screen.getByRole("combobox", { name: /flag state/i }) as HTMLSelectElement;
    const optionTexts = Array.from(flagSelect.options).map((o) => o.textContent);
    expect(optionTexts).toContain("Liberia");
    expect(optionTexts).toContain("Panama");
    expect(optionTexts).not.toContain("France");
  });
});

describe("AddVesselForm — two-level type picker", () => {
  it("disables the subtype dropdown until a parent is chosen", () => {
    renderForm();
    const subtype = screen.getByRole("combobox", { name: /sub-type/i }) as HTMLSelectElement;
    expect(subtype).toBeDisabled();
  });

  it("populates subtypes filtered by parent", () => {
    renderForm();
    const parent = screen.getByRole("combobox", { name: /vessel type/i }) as HTMLSelectElement;
    fireEvent.change(parent, { target: { value: "t-bulk" } });
    const subtype = screen.getByRole("combobox", { name: /sub-type/i }) as HTMLSelectElement;
    const opts = Array.from(subtype.options).map((o) => o.textContent);
    expect(opts).toContain("Panamax");
    expect(opts).toContain("Capesize");
    expect(opts).not.toContain("VLCC");
  });

  it("submits parent id when the parent has no subtypes", () => {
    renderForm();
    const parent = screen.getByRole("combobox", { name: /vessel type/i }) as HTMLSelectElement;
    fireEvent.change(parent, { target: { value: "t-gas" } });
    const hidden = document.querySelector(
      'input[type="hidden"][name="vesselTypeId"]',
    ) as HTMLInputElement;
    expect(hidden.value).toBe("t-gas");
  });

  it("submits subtype id when one is picked", () => {
    renderForm();
    const parent = screen.getByRole("combobox", { name: /vessel type/i }) as HTMLSelectElement;
    fireEvent.change(parent, { target: { value: "t-bulk" } });
    const subtype = screen.getByRole("combobox", { name: /sub-type/i }) as HTMLSelectElement;
    fireEvent.change(subtype, { target: { value: "t-bulk-panamax" } });
    const hidden = document.querySelector(
      'input[type="hidden"][name="vesselTypeId"]',
    ) as HTMLInputElement;
    expect(hidden.value).toBe("t-bulk-panamax");
  });

  it("resets subtype when parent changes", () => {
    renderForm();
    const parent = screen.getByRole("combobox", { name: /vessel type/i }) as HTMLSelectElement;
    fireEvent.change(parent, { target: { value: "t-bulk" } });
    const subtype = screen.getByRole("combobox", { name: /sub-type/i }) as HTMLSelectElement;
    fireEvent.change(subtype, { target: { value: "t-bulk-panamax" } });
    fireEvent.change(parent, { target: { value: "t-tank" } });
    expect(subtype.value).toBe("");
  });
});

describe("AddVesselForm — live preview", () => {
  it("updates as the user types name, IMO, year, DWT", () => {
    renderForm();
    fireEvent.change(screen.getByPlaceholderText(/MV Ocean Voyager/i), {
      target: { value: "MV Pacific Star" },
    });
    fireEvent.change(screen.getByPlaceholderText(/9XXXXXXX/), {
      target: { value: "9623148" },
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. 2016/i), {
      target: { value: "2016" },
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. 82000/i), {
      target: { value: "82000" },
    });

    const preview = screen.getByTestId("vessel-preview");
    expect(preview).toHaveTextContent("MV Pacific Star");
    expect(preview).toHaveTextContent(/IMO 9623148/);
    expect(preview).toHaveTextContent("Year 2016");
    expect(preview).toHaveTextContent(/82,000 t/);
  });

  it("shows 'Ready to save' once required fields are filled", () => {
    renderForm();
    fireEvent.change(screen.getByPlaceholderText(/MV Ocean Voyager/i), {
      target: { value: "MV Pacific Star" },
    });
    fireEvent.change(screen.getByPlaceholderText(/9XXXXXXX/), {
      target: { value: "9623148" },
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. 82000/i), {
      target: { value: "82000" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: /vessel type/i }), {
      target: { value: "t-bulk" },
    });
    expect(screen.getByTestId("vessel-preview")).toHaveTextContent(/ready to save/i);
  });
});

describe("AddVesselForm — errors", () => {
  it("renders field-level errors from the action's state", () => {
    renderForm({
      ok: false,
      formError: null,
      fieldErrors: {
        name: ["Vessel name is required"],
        imo: ["IMO must be exactly 7 digits"],
      },
    });
    expect(screen.getByText("Vessel name is required")).toBeInTheDocument();
    expect(screen.getByText("IMO must be exactly 7 digits")).toBeInTheDocument();
  });

  it("renders a form-level error above the form", () => {
    renderForm({
      ok: false,
      formError: "Something went wrong saving the vessel. Please try again.",
      fieldErrors: {},
    });
    expect(screen.getByRole("alert")).toHaveTextContent(/something went wrong/i);
  });
});
