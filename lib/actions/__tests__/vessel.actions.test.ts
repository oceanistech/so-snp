/**
 * Tests for createVesselAction.
 *
 * Mocks the same set as the fleet action tests:
 *   - `requireSession()` → fixed user + org
 *   - `VesselService.create` → controlled return / throw
 *   - `redirect()` → throws a tagged Error so we can assert the target URL
 *
 * Covers:
 *   - happy path redirects to /vessels/<id>?created=1
 *   - required field missing → field errors
 *   - VesselConflictError → inline error on imo + name
 *   - unexpected error → formError + clean field errors
 *   - empty optional fields collapse to undefined before the service call
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    const err = new Error(`REDIRECT: ${url}`);
    err.name = "RedirectError";
    throw err;
  }),
}));

const requireSessionMock = vi.fn();
vi.mock("@/lib/auth/session", () => ({
  requireSession: () => requireSessionMock(),
}));

const createMock = vi.fn();
vi.mock("@/lib/services/vessel.service", async (importOriginal) => {
  const actual =
    (await importOriginal()) as typeof import("@/lib/services/vessel.service");
  return {
    ...actual,
    VesselService: class {
      create(...args: unknown[]) {
        return createMock(...args);
      }
    },
  };
});

import { createVesselAction } from "../vessel.actions";
import { INITIAL_VESSEL_FORM_STATE } from "../vessel.form-state";
import { VesselConflictError } from "@/lib/services/vessel.service";

function buildFormData(fields: Record<string, string | string[]>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    if (Array.isArray(v)) v.forEach((item) => fd.append(k, item));
    else fd.set(k, v);
  }
  return fd;
}

const validCuid = "clxxabc0000099qq8w7vr5l9j";
const anotherCuid = "clyyabc0000088pp7v6tw4k8i";

const minimumValidForm = {
  name: "MV Pacific Star",
  imo: "9623148",
  vesselTypeId: validCuid,
  yearBuilt: "2016",
  dwt: "82000",
  flagCountryId: anotherCuid,
};

beforeEach(() => {
  requireSessionMock.mockReset();
  createMock.mockReset();
  requireSessionMock.mockResolvedValue({
    userId: "user_1",
    email: "engineroom@oceanis.io",
    orgId: "org_1",
  });
});

describe("createVesselAction — happy path", () => {
  it("redirects to /vessels/<id>?created=1 on success", async () => {
    createMock.mockResolvedValueOnce({ id: "vessel_123" });
    const fd = buildFormData(minimumValidForm);
    await expect(createVesselAction(INITIAL_VESSEL_FORM_STATE, fd))
      .rejects.toThrow(/REDIRECT: \/vessels\/vessel_123\?created=1/);
    expect(createMock).toHaveBeenCalledOnce();
    expect(createMock).toHaveBeenCalledWith(
      "org_1",
      expect.objectContaining({
        name: "MV Pacific Star",
        imo: "9623148",
        vesselTypeId: validCuid,
        yearBuilt: 2016,
        dwt: 82_000,
        flagCountryId: anotherCuid,
      }),
      "user_1",
    );
  });

  it("passes fleetId through when assigning at create time", async () => {
    createMock.mockResolvedValueOnce({ id: "vessel_124" });
    const fleetCuid = "clzzabc0000077pp6v5tw3k7h";
    const fd = buildFormData({ ...minimumValidForm, fleetId: fleetCuid });
    await expect(createVesselAction(INITIAL_VESSEL_FORM_STATE, fd)).rejects.toThrow();
    expect(createMock.mock.calls[0]![1]).toMatchObject({ fleetId: fleetCuid });
  });

  it("collapses empty optional fields to undefined", async () => {
    createMock.mockResolvedValueOnce({ id: "vessel_125" });
    const fd = buildFormData({
      ...minimumValidForm,
      mmsi: "",
      callSign: "   ",
      grt: "",
      notes: "",
    });
    await expect(createVesselAction(INITIAL_VESSEL_FORM_STATE, fd)).rejects.toThrow();
    const call = createMock.mock.calls[0]![1];
    expect(call.mmsi).toBeUndefined();
    expect(call.callSign).toBeUndefined();
    expect(call.grt).toBeUndefined();
    expect(call.notes).toBeUndefined();
  });
});

describe("createVesselAction — validation failures", () => {
  it("returns name field error when name is missing", async () => {
    const fd = buildFormData({ ...minimumValidForm, name: "" });
    const state = await createVesselAction(INITIAL_VESSEL_FORM_STATE, fd);
    expect(state.ok).toBe(false);
    if (!state.ok) {
      expect(state.fieldErrors.name).toBeDefined();
    }
    expect(createMock).not.toHaveBeenCalled();
  });

  it("returns imo field error when IMO is malformed", async () => {
    const fd = buildFormData({ ...minimumValidForm, imo: "abc" });
    const state = await createVesselAction(INITIAL_VESSEL_FORM_STATE, fd);
    expect(state.ok).toBe(false);
    if (!state.ok) {
      expect(state.fieldErrors.imo?.[0]).toMatch(/7 digits/i);
    }
  });

  it("returns flagCountryId error when neither flagCountryId nor flagOther is set", async () => {
    const fd = buildFormData({ ...minimumValidForm, flagCountryId: "" });
    const state = await createVesselAction(INITIAL_VESSEL_FORM_STATE, fd);
    expect(state.ok).toBe(false);
    if (!state.ok) {
      expect(state.fieldErrors.flagCountryId?.[0]).toMatch(/flag state/i);
    }
  });

  it("returns both imo + name field errors on a VesselConflictError", async () => {
    createMock.mockRejectedValueOnce(new VesselConflictError("9623148", "MV Pacific Star"));
    const fd = buildFormData(minimumValidForm);
    const state = await createVesselAction(INITIAL_VESSEL_FORM_STATE, fd);
    expect(state.ok).toBe(false);
    if (!state.ok) {
      expect(state.fieldErrors.imo?.[0]).toMatch(/already exists/i);
      expect(state.fieldErrors.name?.[0]).toMatch(/already exists/i);
    }
  });

  it("returns a formError on unexpected service failure", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    createMock.mockRejectedValueOnce(new Error("kaboom"));
    const fd = buildFormData(minimumValidForm);
    const state = await createVesselAction(INITIAL_VESSEL_FORM_STATE, fd);
    expect(state.ok).toBe(false);
    if (!state.ok) {
      expect(state.formError).toMatch(/something went wrong/i);
    }
    errSpy.mockRestore();
  });
});
