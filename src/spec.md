# Specification

## Summary
**Goal:** Fix Binder View screen displaying empty state instead of photocard grids, and resolve Master Admin Key authentication issues in the Admin portal.

**Planned changes:**
- Debug and fix data fetching, pagination, and card rendering logic in BinderViewScreen.tsx
- Fix Master Admin Key validation in MasterAdminKeyGate component to correctly authenticate against backend
- Add error handling and diagnostic logging for Binder View failures
- Verify backend query endpoints for binder cards and Master Admin Key validation return correct data structures

**User-visible outcome:** Users can view their photocard collections in the Binder View screen with proper grid display, and administrators can successfully authenticate into the Admin portal using their Master Admin Key.
