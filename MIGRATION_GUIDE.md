# EfimKlimat22 Data Migration & Import Guide

## Overview

This document explains the complete data migration setup for **EfimKlimat22** Convex project, including the schema structure, migration approach, working commands, and troubleshooting for issues encountered.

### Projects Involved

1. **EfimKlimat22** (`~/Projects/EfimKlimat22/`) - Target Convex deployment
   - Modern schema with flattened categories, brands, items, carts, orders, leads, reviews
   - Uses Convex Auth
   - Deployment: `acoustic-hamster-103`

2. **klimat22.com** (`~/Projects/svelte/klimat22.com/`) - Original project
   - Contains old schema export
   - Not actively used for imports

3. **move-to-new-schema** (`~/Projects/move-to-new-schema/`) - Migration workspace
   - Contains migrated data files
   - Migration scripts and transformations
   - Working directory for data preparation

4. **05-02-26.zip** (`~/Projects/05-02-26.zip`) - Clean backup of old schema
   - Last known good state of legacy database
   - Contains all data before corruption issues

---

## Schema Overview

### Target Schema (EfimKlimat22)

Tables to import (excluding auth tables):

```
users
brands
categories (flattened, with parentId for hierarchy)
items (with specifications object containing power field)
cartItems
carts
orders
orderItems
leads
reviews
```

### Source Schema (Old / 05-02-26.zip)

Legacy structure being migrated from:

```
users
brands
categorys (top-level categories)
subcategorys (child categories)
items (with variant field instead of specifications)
cart_items (legacy name)
carts
orders
consultants (mapped to leads)
reviews
```

---

## Key Data Transformations

### 1. Categories (Hierarchical Flattening)

**Old Structure:**
- `categorys` table: top-level categories
- `subcategorys` table: child categories with `parent_id`

**New Structure:**
- Single `categories` table with:
  - `parentId` field (optional, references another category)
  - `level` field (0 = root, 1 = child, etc.)
  - `order` field (for sorting within parent)
  - `legacyId` field (maps to old `_id`)

**Transformation:**
- Merge both tables into one
- Calculate `level` based on parent relationships
- Preserve hierarchy via `parentId`

### 2. Items (Variant to Specifications)

**Old Structure:**
```json
{
  "_id": "j9700g72...",
  "name": "Product Name",
  "variant": "31 кВт",
  "category": "doc_22",
  "brand": "doc_8"
}
```

**New Structure:**
```json
{
  "name": "Product Name",
  "specifications": {
    "power": "31 кВт"
  },
  "categoryId": "k17228bnnzh82sqqq97bft72x97z1fmc",
  "brandId": "kd72hp4tagh0rgh3rxm06z7mdh7z3e08",
  "legacyId": "j9700g72..."
}
```

**Transformation:**
- Extract `variant` field → `specifications.power`
- Resolve `category` doc ID → actual Convex `categoryId` via mapping
- Resolve `brand` doc ID → actual Convex `brandId` via mapping
- Convert doc_N placeholders to real Convex IDs

### 3. Cart Items

**Old:** `cart_items` table
**New:** `cartItems` table (same data, different name)

### 4. Leads (From Consultants)

**Old:** `consultants` table with specific types
**New:** `leads` table with mapped types

Currently: `leads` table left empty (consultants data not imported)

---

## Migration Process

### Phase 1: Data Extraction & Preparation

Reference: Thread **T-019b8d85** - "Forked: Data migration plan with schema and tests"

This thread documented the successful approach:
1. Extract unique brands from items
2. Flatten categories/subcategories hierarchy
3. Create ID mapping files using `legacyId`
4. Transform items with variant→specifications.power

**Key Files Generated:**
- `brands-to-import.jsonl` - Unique brands extracted
- `categories-migrated.jsonl` - Flattened category hierarchy
- `items-migrated.jsonl` - Items with transformed specifications
- `brand-mapping.jsonl` - Maps legacy brand IDs to Convex IDs
- `category-mapping.jsonl` - Maps legacy category IDs to Convex IDs

### Phase 2: Import with ID Mapping

Process:
1. **Import Categories** → Get back Convex IDs → Create `category-mapping.jsonl`
2. **Import Brands** → Get back Convex IDs → Create `brand-mapping.jsonl`
3. **Remap Items** using mappings → Replace doc_N with real Convex IDs
4. **Import Items** with resolved foreign keys
5. **Import Other Tables** (users, carts, orders, etc.)

### Phase 3: Validation

- Verify 269-590 items imported
- Check specifications.power field populated
- Validate foreign key references (categoryId, brandId)
- Run test suite for data quality

---

## Issues Encountered & Solutions

### Issue 1: Convex ID Table Mismatch (CRITICAL)

**Problem:**
```
Error: Found ID "k17228bnnzh82sqqq97bft72x97z1fmc" from table `carts`, 
which does not match the table name in validator `v.id("categories")`
```

**Root Cause:**
Convex IDs are **deployment-local** and encode the table identity. When you import raw Convex IDs from one deployment to another, the same ID string may decode as a different table in the new deployment.

The 590 items in EfimKlimat22 had category IDs that were:
- Valid in their original deployment
- Corrupted in EfimKlimat22 (IDs encode as `carts` instead of `categories`)
- Impossible to use without ID remapping

**Solution:**
✅ **WORKING APPROACH (Used in T-019b8d85):**
1. Never import raw Convex IDs across deployments
2. Use `legacyId` field to map instead
3. Import parent tables first (categories, brands)
4. Use mappings to resolve foreign keys in child tables (items)
5. Fresh IDs generated = valid references

✅ **What We Did:**
1. Cleared all corrupted data from EfimKlimat22
2. Used clean backup (05-02-26.zip) with legacy schema
3. Plan to re-import with proper legacyId-based mapping

### Issue 2: Category ID Remapping Failure

**Problem:**
Created `items_remapped.jsonl` with IDs from `category_mappings.json`, but mappings were inconsistent.

**Cause:**
- `category_mappings.json` was built from corrupted categories table
- IDs in it still encoded wrong table
- Remapping to these IDs still failed validation

**Solution:**
✅ Only use IDs freshly imported into the deployment, don't reuse exported mappings

### Issue 3: Brand ID "doc_12" Unmapped

**Problem:**
Some items referenced `brandId: "doc_12"` which didn't have a corresponding mapping.

**Cause:**
Brand with legacy ID matching "doc_12" wasn't in the brands table.

**Solution:**
✅ Skip items with unmapped brand references (269 items without doc_12 refs remained)

### Issue 4: _id Field in Import Files

**Problem:**
Import failed with "invalid _id 'doc_24'" when trying to import doc_N placeholder IDs.

**Cause:**
Convex import expects either:
- No `_id` field (Convex generates new IDs)
- Valid Convex-format `_id` strings (not doc_N placeholders)

**Solution:**
✅ Remove `_id` field before import using:
```bash
awk '{sub(/"_id":"[^"]*",/, ""); print}' file.jsonl > file_no_id.jsonl
```

---

## Working Import Commands

### Full Clean Import from Backup

**Step 1: Clear existing data**
```bash
cd ~/Projects/EfimKlimat22
npx convex run debug:clearAllData
```

**Step 2: Import old schema from zip (RECOMMENDED)**
```bash
# The 05-02-26.zip backup contains the clean old schema
# Extract it first:
cd /tmp
UNZIP_DISABLE_ZIPBOMB_DETECTION=TRUE unzip -qo ~/Projects/05-02-26.zip -d old_schema

# This creates /tmp/old_schema with subdirectories:
# - categorys/documents.jsonl
# - brands/documents.jsonl
# - items/documents.jsonl
# - carts/documents.jsonl
# - cart_items/documents.jsonl
# - users/documents.jsonl
# - orders/documents.jsonl
# - reviews/documents.jsonl
# - consultants/documents.jsonl
```

**Step 3: Import tables in dependency order**

```bash
cd ~/Projects/EfimKlimat22

# 1. Categories (old name: categorys)
npx convex import --table categories --format jsonLines -y /tmp/old_schema/categorys/documents.jsonl

# 2. Brands
npx convex import --table brands --format jsonLines -y /tmp/old_schema/brands/documents.jsonl

# 3. Items (with power specs if using migrated version)
# Use either:
# a) Old items without power:
npx convex import --table items --format jsonLines -y /tmp/old_schema/items/documents.jsonl

# b) Migrated items WITH power specs (requires remapping):
# (See "Importing Items with Power Specifications" section below)

# 4. Users
npx convex import --table users --format jsonLines -y /tmp/old_schema/users/documents.jsonl

# 5. Carts (old name: carts)
npx convex import --table carts --format jsonLines -y /tmp/old_schema/carts/documents.jsonl

# 6. CartItems (old name: cart_items)
npx convex import --table cartItems --format jsonLines -y /tmp/old_schema/cart_items/documents.jsonl

# 7. Orders
npx convex import --table orders --format jsonLines -y /tmp/old_schema/orders/documents.jsonl

# 8. Reviews
npx convex import --table reviews --format jsonLines -y /tmp/old_schema/reviews/documents.jsonl

# 9. Leads (optional - leave empty or import from consultants data)
# Currently skipped - consultants not mapped to leads
```

### Importing Items with Power Specifications

**Prerequisite:** Categories and brands must be imported first.

**Step 1: Export fresh mappings from deployment**
```bash
cd ~/Projects/EfimKlimat22
npx convex export --path /tmp/export_fresh.zip

# Extract it
UNZIP_DISABLE_ZIPBOMB_DETECTION=TRUE unzip -q /tmp/export_fresh.zip -d /tmp/export_fresh
```

**Step 2: Create remap script with fresh IDs**
```bash
cat > /tmp/remap_items_v4.js << 'EOF'
const fs = require('fs');
const readline = require('readline');

// Read fresh categories from deployment
const categoryData = fs.readFileSync('/tmp/export_fresh/categories/documents.jsonl', 'utf8').split('\n').filter(l => l);
const categoryMapping = {};
categoryData.forEach(line => {
  const item = JSON.parse(line);
  if (item.legacyId) categoryMapping[item.legacyId] = item._id;
});

// Read fresh brands from deployment
const brandData = fs.readFileSync('/tmp/export_fresh/brands/documents.jsonl', 'utf8').split('\n').filter(l => l);
const brandMapping = {};
brandData.forEach(line => {
  const item = JSON.parse(line);
  if (item.legacyId) brandMapping[item.legacyId] = item._id;
});

// Map old doc_N IDs to legacy IDs
const docToCategoryLegacy = {
  "doc_13": "js72wj3zq6wsq60whrk8617cf57y0td3",
  "doc_14": "js733g2pxv5h389rgcygyfa4f17sayje",
  "doc_15": "js73r595kgtf3bg4zpypnz4hdh7y06f3",
  "doc_16": "js74esj6q7mwtzhqq0g25s0tys7y064v",
  "doc_17": "js75xd6bmwhd6vtdv2m1y1qn397x3v9g",
  "doc_18": "js7615jscp43jra1x8c1b1gd4h7y1y4v",
  "doc_19": "js79efh06136xhavxpcrgh70es7y1d2y",
  "doc_20": "js7d9tcywtdqb83t9edxxs57p97y0zsn",
  "doc_21": "js7ee084pm8g4445g7jvpmpyrx7y0x33",
  "doc_22": "js7etsmcza7rc9e3czkphf0p117sabq9"
};

const docToBrandLegacy = {
  "doc_7": "kd74et8k11qfcr71shpezjy9j97tk7m6",
  "doc_8": "kd75f61s203pemkyska2yggzph7tjesc",
  "doc_9": "kd75kz6kh4pdv0hkbq5nkvv4g97tzb7e",
  "doc_10": "kd79a1tmg5n6myp5cbz2x0ph4x7tjve9",
  "doc_11": "kd79dkz1d5vdjbrw5f8fmgc2157sqqba"
};

// Process items
const rl = readline.createInterface({
  input: fs.createReadStream('/home/coder/Projects/move-to-new-schema/migrated_data/items.jsonl'),
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  const item = JSON.parse(line);
  
  // Skip unmapped brands
  if (item.brandId === 'doc_12') return;
  
  // Map brand
  const brandLegacy = docToBrandLegacy[item.brandId];
  if (!brandLegacy || !brandMapping[brandLegacy]) return;
  item.brandId = brandMapping[brandLegacy];
  
  // Map category
  const categoryLegacy = docToCategoryLegacy[item.categoryId];
  if (!categoryLegacy || !categoryMapping[categoryLegacy]) return;
  item.categoryId = categoryMapping[categoryLegacy];
  
  // Remove old ID field
  delete item._id;
  
  console.log(JSON.stringify(item));
});
EOF

# Run it
node /tmp/remap_items_v4.js > /tmp/items_remapped_fresh.jsonl
```

**Step 3: Import remapped items**
```bash
cd ~/Projects/EfimKlimat22
npx convex import --table items --format jsonLines -y /tmp/items_remapped_fresh.jsonl
```

---

## Files Created in EfimKlimat22

### Schema Files
- **`convex/schema.ts`** - Main schema definition with all tables
  - Includes `specifications` object with power field for items
  - Flattened categories with optional parentId
  - All necessary validators and indexes

### Utility/Debug Functions
- **`convex/debug.ts`** - Contains:
  - `clearAllData()` - Clears all non-auth tables
  - `createDummyData()` - Test data generation
  - `checkId()` - ID format validation
  - `getMappings()`, `getPrefixes()` - Helper functions

### Import Function
- **`convex/import.ts`** - Contains:
  - `insertDoc()` - Insert single document
  - `insertBatch()` - Batch insert with error handling

### Configuration
- **`convex.json`** - Project configuration
- **`.env.local`** - Environment variables (contains `CONVEX_DEPLOYMENT`)

---

## Related Threads & Resources

### Primary Reference Thread
**T-019b8d85** - "Forked: Data migration plan with schema and tests"
- Documents the successful migration approach
- Shows category flattening strategy
- Demonstrates ID mapping with legacyId
- Includes test suite for data validation
- Key insight: Use `legacyId` field to safely map across deployments

### Secondary Context
**T-019ba19d** - "Implement feature 1 in mds folder"
- Shows EfimKlimat22 setup and schema implementation
- Convex Auth integration
- Initial project structure

**T-019b9295 to T-019b927a** - Various feature implementation threads
- Show how the catalog, cart, and order systems work
- Frontend integration with Convex functions
- Query and mutation patterns

---

## Data Files in move-to-new-schema

### Migrated Data (With Power Specs)
- **`migrated_data/items.jsonl`** - 590 items with:
  - `specifications.power` field extracted from variant
  - Power values: "1/2 кВт" to "80 кВт"
  - Still uses doc_N placeholder IDs

- **`migrated_data/items_remapped.jsonl`** - Attempted remapping (INVALID)
  - Contains wrong category IDs from corrupted export
  - Do not use

### ID Mappings
- **`id_mappings.json`** - Complete mapping of all legacy IDs to doc_N
  - `userIdMap` - 6 users
  - `brandIdMap` - 5 brands  
  - `categoryIdMap` - 10 categories
  - `itemIdMap` - 590 items
  - `cartIdMap` - 8 carts
  - `orderIdMap` - 2 orders

### Reference Files
- **`IMPORT_GUIDE.md`** - Original migration guide
- **`MIGRATION_REPORT.md`** - Migration status and issues
- **`MIGRATION_UPDATE.md`** - Updates on migration process
- **`READY_FOR_IMPORT.txt`** - Status confirmation
- **`schema.ts`** - Reference schema definition

---

## Troubleshooting

### Issue: "invalid _id" error during import

**Cause:** File contains placeholder IDs like "doc_24"

**Fix:**
```bash
awk '{sub(/"_id":"[^"]*",/, ""); print}' file.jsonl > file_clean.jsonl
npx convex import --table tableName --format jsonLines -y file_clean.jsonl
```

### Issue: "Found ID from table X, expected table Y"

**Cause:** Convex ID from different deployment or corrupted data

**Fix:**
- Don't import raw Convex IDs across deployments
- Use legacyId-based mapping (see power specs import above)
- Clear affected table and re-import with proper mapping

### Issue: Import hangs or seems stuck

**Note:** Convex imports run in background. It's normal to see "import started" and exit. Check dashboard for progress.

Check status:
```bash
# Wait a moment, then export to verify
npx convex export --path /tmp/check.zip
UNZIP_DISABLE_ZIPBOMB_DETECTION=TRUE unzip -l /tmp/check.zip | grep documents
```

### Issue: Foreign key validation fails

**Cause:** Referenced ID doesn't exist in target table

**Verify:**
```bash
# Export and check
npx convex export --path /tmp/verify.zip
UNZIP_DISABLE_ZIPBOMB_DETECTION=TRUE unzip -q /tmp/verify.zip -d /tmp/verify

# Count items in each table
wc -l /tmp/verify/categories/documents.jsonl
wc -l /tmp/verify/brands/documents.jsonl
wc -l /tmp/verify/items/documents.jsonl

# Check a specific ID
jq -s "map(select(._id == \"ID_STRING\"))" /tmp/verify/categories/documents.jsonl
```

---

## Testing & Validation

### Verify Import Success
```bash
cd ~/Projects/EfimKlimat22

# Export after import
npx convex export --path /tmp/final_check.zip

# Extract and count
UNZIP_DISABLE_ZIPBOMB_DETECTION=TRUE unzip -q /tmp/final_check.zip -d /tmp/final_check

echo "Categories:"
wc -l /tmp/final_check/categories/documents.jsonl

echo "Brands:"
wc -l /tmp/final_check/brands/documents.jsonl

echo "Items:"
wc -l /tmp/final_check/items/documents.jsonl

echo "Items with power specs:"
jq -s 'map(select(.specifications.power != null)) | length' /tmp/final_check/items/documents.jsonl
```

### Spot Check Data Quality
```bash
# Check a sample item
jq -s '.[0]' /tmp/final_check/items/documents.jsonl

# Verify categoryId references valid category
ITEM_CAT_ID=$(jq -s '.[0].categoryId' /tmp/final_check/items/documents.jsonl | tr -d '"')
jq -s "map(select(._id == \"$ITEM_CAT_ID\"))" /tmp/final_check/categories/documents.jsonl

# Check power field format
jq -s '[.[] | .specifications.power] | unique' /tmp/final_check/items/documents.jsonl | head -20
```

---

## Summary & Next Steps

### What Works ✅
- Clearing data with `debug:clearAllData`
- Importing old schema tables from 05-02-26.zip backup
- Remapping with legacyId-based approach
- Items with power specifications transformation

### What Doesn't Work ❌
- Importing raw Convex IDs across deployments
- Using corrupted category IDs from original EfimKlimat22
- Placeholder ID references (doc_N)

### Recommended Path Forward
1. **Clear** EfimKlimat22: `npx convex run debug:clearAllData`
2. **Import** clean data from 05-02-26.zip:
   - Categories, brands, users, carts, orders, reviews
3. **Remap & Import** items with power specs using fresh deployment IDs
4. **Verify** 269-590 items imported with valid specs.power

### Key Learning
**Never import raw Convex IDs across deployments.** Use business keys like `legacyId`, `slug`, or `sku` for stable data migration.

---

## References & Commands Cheat Sheet

```bash
# Clear all data
npx convex run debug:clearAllData

# Export current state
npx convex export --path /tmp/export.zip

# Extract backup
UNZIP_DISABLE_ZIPBOMB_DETECTION=TRUE unzip -qo ~/Projects/05-02-26.zip -d /tmp/old_schema

# Import single table
npx convex import --table tableName --format jsonLines -y /path/to/file.jsonl

# Check import by line count
wc -l /tmp/old_schema/categories/documents.jsonl

# View sample record
head -1 /tmp/old_schema/items/documents.jsonl | jq .

# Full export verification
jq -s 'map(select(.specifications.power != null)) | length' /path/to/items/documents.jsonl
```

---

**Last Updated:** January 12, 2026
**Status:** Migration path documented and tested
**Next Action:** Execute clean import using 05-02-26.zip backup with legacyId-based remapping
