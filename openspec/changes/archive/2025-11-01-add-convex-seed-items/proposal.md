## Why

We need a reliable, scriptable way to seed the Items table from structured JSON data, processing local images into WebP and storing them in Convex Storage so that items reference canonical storage IDs and URLs. This enables fast initial catalog population and repeatable data loads.

## What Changes

- Add a documented seeding workflow that:
  - Reads items from public/test.json
  - Converts item images to WebP using sharp
  - Uploads images to Convex via generateUploadUrl
  - Inserts items using existing mutation (dashboard.addItemsPublic)
- Add a backend action (convex/seed.ts) for batch insert when provided storage IDs (no filesystem or image processing on server).
- Provide a local script (scripts/seed.mjs) that performs file I/O and image conversion, then calls Convex mutations over HTTP.
- Add a pnpm script to run the seeding process easily.

## Impact

- Affected specs: backend seeding, image handling patterns
- Affected code: convex/dashboard.ts (reuse existing generateUploadUrl and addItemsPublic), new convex/seed.ts (action wrapper), new scripts/seed.mjs (local seeding utility)
- Dependencies: sharp (image conversion), dotenv (env loading)
- Security: No public exposure of local filesystem; uploads go directly to Convex Storage via pre-signed URL
- Performance: WebP conversion reduces image weight; uploads batched per item

## Non-Goals

- Not changing Items schema
- Not implementing idempotent upsert logic (can be added later using partNumber uniqueness)
- Not building a UI for seeding

## Risks / Mitigations

- Invalid category/subcategory IDs in JSON → Validation and warnings; require categories exist before seeding.
- Large image sets → WebP conversion may be slow; use moderate quality/effort and sequential upload per item.
- Duplicate items → Document optional guard (by partNumber) for future enhancement.