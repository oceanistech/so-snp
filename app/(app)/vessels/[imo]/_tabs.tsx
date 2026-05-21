/**
 * Dead module — the original `_tabs.tsx` rendered the vessel-details
 * prototype tab strip against hard-coded mock data. The new page.tsx
 * pulls real data via VesselService.getDetailById and lays out detail
 * sections inline; the tab strip will return as part of M06 (Vessel
 * Detail with sub-tabs for Valuations, Net Fleet, etc.).
 *
 * Kept as a stub to avoid a destructive `rm` from a permission-gated
 * shell. Safe to delete when M06 starts.
 */
export {};
