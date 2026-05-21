/**
 * Tests for createFleetAction.
 *
 * The action depends on:
 *   - `requireSession()` — mocked to return a fixed session.
 *   - `FleetService.create` — mocked to avoid touching Prisma.
 *   - `redirect()` from next/navigation — mocked so we can assert the URL
 *      without the test runner blowing up on the "NEXT_REDIRECT" throw.
 *
 * Covers:
 *   - happy path with all fields → redirects to /fleetspace?created=<id>
 *   - missing name → returns field error
 *   - duplicate name → returns inline name field error
 *   - unexpected service error → returns formError
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as FleetServiceModule from "@/lib/services/fleet.service";

// Mock next/navigation's redirect — we don't want a thrown NEXT_REDIRECT
// to interfere with assertions. We throw a plain Error with a tagged
// message so tests can assert on the redirect URL.
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
vi.mock("@/lib/services/fleet.service", async (importOriginal) => {
  const actual = (await importOriginal()) as typeof FleetServiceModule;
  return {
    ...actual,
    FleetService: class {
      create(...args: unknown[]) {
        return createMock(...args);
      }
    },
  };
});

import { createFleetAction } from "../fleet.actions";
import { INITIAL_FLEET_FORM_STATE } from "../fleet.form-state";
import { FleetNameConflictError } from "@/lib/services/fleet.service";

function buildFormData(fields: Record<string, string | string[]>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    if (Array.isArray(v)) v.forEach((item) => fd.append(k, item));
    else fd.set(k, v);
  }
  return fd;
}

beforeEach(() => {
  requireSessionMock.mockReset();
  createMock.mockReset();
  requireSessionMock.mockResolvedValue({
    userId: "user_1",
    email: "engineroom@oceanis.io",
    orgId: "org_1",
  });
});

describe("createFleetAction — happy path", () => {
  it("redirects to /fleetspace?created=<id> on success", async () => {
    createMock.mockResolvedValueOnce({ id: "fleet_123", slug: "fleet-gamma" });
    const fd = buildFormData({
      name: "Fleet Gamma",
      type: "Bulk Carriers",
      currency: "USD",
      description: "Bulk carriers for ore routes.",
      visibility: "TEAM",
      tag: "Q1 Review",
      vesselIds: ["clxxabc0000099qq8w7vr5l9j"],
    });
    await expect(createFleetAction(INITIAL_FLEET_FORM_STATE, fd))
      .rejects.toThrow(/REDIRECT: \/fleetspace\?created=fleet_123/);
    expect(createMock).toHaveBeenCalledOnce();
    expect(createMock).toHaveBeenCalledWith(
      "org_1",
      expect.objectContaining({
        name: "Fleet Gamma",
        type: "Bulk Carriers",
        currency: "USD",
        visibility: "TEAM",
        tag: "Q1 Review",
        ownerUserId: "user_1",
        vesselIds: ["clxxabc0000099qq8w7vr5l9j"],
      }),
    );
  });

  it("collapses empty-string optional fields to undefined", async () => {
    createMock.mockResolvedValueOnce({ id: "f2", slug: "fleet-x" });
    const fd = buildFormData({
      name: "Fleet X",
      type: "",
      description: "   ",
      tag: "",
    });
    await expect(createFleetAction(INITIAL_FLEET_FORM_STATE, fd)).rejects.toThrow();
    const call = createMock.mock.calls[0];
    expect(call).toBeDefined();
    const callArgs = call![1];
    expect(callArgs.description).toBeUndefined();
    expect(callArgs.tag).toBeUndefined();
    // type/currency/visibility had no value → schema default applies in service
  });
});

describe("createFleetAction — validation failures", () => {
  it("returns field errors when name is missing", async () => {
    const fd = buildFormData({ name: "" });
    const state = await createFleetAction(INITIAL_FLEET_FORM_STATE, fd);
    expect(state.ok).toBe(false);
    if (!state.ok) {
      expect(state.fieldErrors.name).toBeDefined();
      expect(state.fieldErrors.name?.[0]).toMatch(/required/i);
    }
    expect(createMock).not.toHaveBeenCalled();
  });

  it("returns name field error on duplicate-name conflict", async () => {
    createMock.mockRejectedValueOnce(new FleetNameConflictError("Fleet Gamma"));
    const fd = buildFormData({ name: "Fleet Gamma" });
    const state = await createFleetAction(INITIAL_FLEET_FORM_STATE, fd);
    expect(state.ok).toBe(false);
    if (!state.ok) {
      expect(state.fieldErrors.name?.[0]).toMatch(/already exists/i);
    }
  });

  it("returns a formError on unexpected service failure", async () => {
    // The action logs `console.error` for the unexpected path; mute it so
    // the test output stays clean.
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    createMock.mockRejectedValueOnce(new Error("kaboom"));
    const fd = buildFormData({ name: "Fleet Gamma" });
    const state = await createFleetAction(INITIAL_FLEET_FORM_STATE, fd);
    expect(state.ok).toBe(false);
    if (!state.ok) {
      expect(state.formError).toMatch(/something went wrong/i);
      expect(state.fieldErrors).toEqual({});
    }
    errSpy.mockRestore();
  });
});
