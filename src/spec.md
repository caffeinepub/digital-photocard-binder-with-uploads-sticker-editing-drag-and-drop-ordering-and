# Specification

## Summary
**Goal:** Refine binder-limit subscription UX and add a configurable, Shopify-ready external upgrade link for Free users.

**Planned changes:**
- Add a configurable setting for an external “Upgrade” URL (no hard-coded store URL) and use it in binder-limit UI states.
- Surface an “Upgrade” call-to-action wherever binder limits are communicated (e.g., binder limit reached alert in the binder library, and the disabled “New Binder” create dialog state), opening in a new tab with safe anchor attributes.
- Improve binder-limit error handling so backend binder-limit enforcement errors display friendly, actionable English messages while retaining underlying error details for debugging.
- Ensure the UI does not break if the upgrade URL is not configured (hide the CTA or show a non-clickable unavailable message).

**User-visible outcome:** Free users who hit binder limits see clear guidance and an optional “Upgrade” link that opens in a new tab; binder-limit failures show friendly messages instead of raw errors, while other failures remain handled safely.
