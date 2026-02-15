# Specification

## Summary
**Goal:** Enable exporting the currently viewed binder page as a GoodNotes-friendly PDF and sharing/downloading it from the binder view.

**Planned changes:**
- Add a binder page PDF export flow that captures the 12-card grid exactly as displayed (including edited card images from the local edited image cache, rarity badge, condition sticker, and legendary glint) while excluding all app UI chrome.
- Add export settings optimized for GoodNotes, including selectable page size (A4 Portrait and US Letter Portrait) and a high-quality output mode with crisp rendering and consistent margins/centering.
- Add a Share option for the generated PDF using the browser’s native share sheet when supported, with a fallback to downloading the PDF, using a deterministic, user-friendly filename (binder name + page number).

**User-visible outcome:** From the binder view, the user can export the current page to a high-quality PDF suitable for importing into GoodNotes, and then share it via the native share sheet (or download it if sharing isn’t available).
