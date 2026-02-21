# Specification

## Summary
**Goal:** Fix the binder grid layout selection so that choosing different grid options (2x2, 3x3, 4x3, 5x4) properly updates the display instead of always showing 3x3.

**Planned changes:**
- Fix BinderViewScreen component to correctly apply the selected grid layout from user settings
- Verify useGetUserLayout hook properly fetches and returns the current layout preference
- Ensure CSS Grid implementation correctly maps layout presets to the appropriate column and row configurations
- Verify useUpdateUserLayout mutation successfully saves layout changes and invalidates queries

**User-visible outcome:** Users can select any grid layout option (2x2, 3x3, 4x3, 5x4) in their profile settings and see the binder view immediately update to display cards in the chosen grid configuration. The selected layout persists across page navigations and browser refreshes.
