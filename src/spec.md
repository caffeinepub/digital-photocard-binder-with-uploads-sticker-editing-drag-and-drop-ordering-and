# Specification

## Summary
**Goal:** Add three new vintage-style “Price Tag” sticker PNG assets (MINT / NEAR MINT / PLAYED) with transparent backgrounds for direct use in the frontend.

**Planned changes:**
- Generate 3 separate transparent PNG sticker images in a cohesive vintage price-tag style, each with subtle paper texture and a small peeled-corner detail, with label text and color per requirement (MINT green, NEAR MINT blue, PLAYED orange).
- Add the generated PNGs to `frontend/public/assets/generated` so they are directly accessible via `/assets/generated/<filename>`.

**User-visible outcome:** The app can load and display the three new sticker images directly from `/assets/generated/price-tag-mint.dim_512x512.png`, `/assets/generated/price-tag-near-mint.dim_512x512.png`, and `/assets/generated/price-tag-played.dim_512x512.png`.
