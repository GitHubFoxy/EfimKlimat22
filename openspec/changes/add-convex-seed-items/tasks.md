## 1. Implementation
- [ ] 1.1 Confirm existing mutations and schema (generateUploadUrl, addItemsPublic, items schema)
- [ ] 1.2 Add backend action convex/seed.ts to batch insert items using addItemsPublic (no file I/O)
- [ ] 1.3 Create scripts/seed.mjs to read public/test.json, convert images to WebP (sharp), upload via generateUploadUrl, insert items
- [ ] 1.4 Add pnpm script: "seed": "node scripts/seed.mjs"
- [ ] 1.5 Document prerequisites: Convex URL in .env.local, categories/subcategories existing, JSON format
- [ ] 1.6 Manual run and verify items created with imagesUrls and imageStorageIds populated

## 2. Validation
- [ ] 2.1 Validate successful uploads (storage IDs returned)
- [ ] 2.2 Validate image URLs are generated and stored in DB
- [ ] 2.3 Validate fields mapping (brand, name, variant, partNumber, quantity, price, description, category, subcategory)
- [ ] 2.4 Validate error handling and logging for missing images

## 3. Follow-ups (optional)
- [ ] 3.1 Add idempotency (skip or update by unique partNumber)
- [ ] 3.2 Add concurrency controls or rate limiting for uploads
- [ ] 3.3 Extend script to support CSV and multiple directories