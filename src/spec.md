# Specification

## Summary
**Goal:** Build a per-user digital photocard binder app where users can sign in, create binders, upload and organize photocards, edit cards with stickers, and customize binder appearance.

**Planned changes:**
- Add Internet Identity sign-in and scope all binder/card data to the signed-in user (by Principal), with UI sign-in status and sign-out.
- Create backend models and APIs for binder CRUD, photocard CRUD within binders, and persisted ordering.
- Implement photocard image upload (PNG/JPEG), storage, retrieval/display, and clear error handling for invalid/oversized files.
- Build core screens: Binder Library, Binder View (with add/delete/open editor and reorder), Add Card (upload), Edit Card (sticker editor), Binder Settings (theme customization).
- Add in-browser sticker editor to place multiple stickers with move/scale/rotate/delete, plus save/cancel behavior that updates the card display image only on save.
- Implement drag-and-drop reordering of cards within a binder and persist order to the backend.
- Implement per-binder theme customization (at minimum cover style and page/background style) with immediate preview and persistence.
- Apply a consistent warm “scrapbook stationery” visual theme (cream paper, muted coral + sage accents, subtle texture, rounded corners, playful readable typography).
- Add and use generated static assets (textures + starter stickers) under `frontend/public/assets/generated` for theme previews and the sticker tray.

**User-visible outcome:** After signing in, a user can create and manage multiple binders, upload photocards, reorder them via drag-and-drop, decorate cards with stickers in an editor, and customize each binder’s look; all data persists per user across refreshes.
