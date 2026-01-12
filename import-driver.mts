#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import { ConvexClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";

// Get Convex URL and key from environment
const CONVEX_URL = process.env.CONVEX_URL;
if (!CONVEX_URL) {
  console.error("❌ CONVEX_URL not set. Run: npx convex env set");
  process.exit(1);
}

const client = new ConvexClient(CONVEX_URL);

// Dependency order: parents before children
const COLLECTION_ORDER = [
  "users",
  "brands",
  "categories",
  "items",
  "carts",
  "orders",
  "cartItems",
  "orderItems",
  "leads",
  "reviews",
];

// FK field -> target collection mapping
const FK_FIELDS: Record<string, Record<string, string>> = {
  items: {
    brandId: "brands",
    categoryId: "categories",
  },
  carts: {
    userId: "users",
  },
  orders: {
    userId: "users",
    cartId: "carts",
  },
  cartItems: {
    cartId: "carts",
    itemId: "items",
  },
  orderItems: {
    orderId: "orders",
    itemId: "items",
  },
  leads: {
    relatedItemId: "items",
    assignedManagerId: "users",
  },
  reviews: {
    userId: "users",
    itemId: "items",
  },
};

// Load JSONL file
function loadJsonl(filePath: string): any[] {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${filePath}`);
    return [];
  }
  const data: any[] = [];
  const content = fs.readFileSync(filePath, "utf-8");
  content.split("\n").forEach((line) => {
    if (line.trim()) {
      try {
        data.push(JSON.parse(line));
      } catch (e) {
        console.error(`Failed to parse line in ${filePath}:`, e);
      }
    }
  });
  return data;
}

// Save ID mappings after import
function saveMappings(
  idMap: Record<string, Record<string, string>>,
  mappingPath: string
) {
  fs.writeFileSync(mappingPath, JSON.stringify(idMap, null, 2));
  console.log(`✓ Saved synthetic->Convex ID mappings to ${mappingPath}`);
}

// Resolve foreign keys in a document
function resolveForeignKeys(
  collection: string,
  doc: any,
  idMap: Record<string, Record<string, string>>
): any {
  const fkDefs = FK_FIELDS[collection] || {};
  const resolved = { ...doc };

  for (const [field, targetCollection] of Object.entries(fkDefs)) {
    const synthValue = resolved[field];
    if (synthValue == null) continue;

    const realId = idMap[targetCollection]?.[synthValue];
    if (!realId) {
      console.warn(
        `⚠️  Missing FK mapping: ${collection}.${field}=${synthValue} -> ${targetCollection}`
      );
      // Keep synthetic value for now - will fail on insert if truly required
      continue;
    }

    resolved[field] = realId;
  }

  return resolved;
}

// Main import function
async function main() {
  console.log("🚀 Starting EfimKlimat22 data import...\n");

  // Determine paths
  const dataDir = path.join(
    import.meta.dirname,
    "..",
    "move-to-new-schema",
    "migrated_data"
  );
  const mappingPath = path.join(dataDir, "convex_id_mapping.json");

  console.log(`📂 Data directory: ${dataDir}`);
  console.log(`🔗 Convex URL: ${CONVEX_URL}\n`);

  // ID mapping: { collection: { syntheticId -> ConvexId } }
  const idMap: Record<string, Record<string, string>> = {};

  // Initialize maps for all collections
  for (const collection of COLLECTION_ORDER) {
    idMap[collection] = {};
  }

  let totalImported = 0;
  let totalErrors = 0;

  // Import in dependency order
  for (const collection of COLLECTION_ORDER) {
    const filePath = path.join(dataDir, `${collection}.jsonl`);
    const rawDocs = loadJsonl(filePath);

    if (rawDocs.length === 0) {
      console.log(`⏭️  ${collection}: (empty, skipped)`);
      continue;
    }

    console.log(`📊 Importing ${collection} (${rawDocs.length} docs)...`);

    for (let i = 0; i < rawDocs.length; i++) {
      const rawDoc = rawDocs[i];
      const synthId = rawDoc._id;

      // Prepare document for import (remove Convex metadata)
      const docToImport = { ...rawDoc };
      delete docToImport._id;
      delete docToImport._creationTime;

      // Resolve foreign keys using already-imported collections
      const docWithResolvedFKs = resolveForeignKeys(
        collection,
        docToImport,
        idMap
      );

      try {
        // Insert document
        const result = await client.mutation(api.import.insertDoc, {
          collection,
          doc: docWithResolvedFKs,
        });

        if (!result.ok) {
          throw new Error(result.error || "Unknown error");
        }

        // Store mapping for later use by dependent collections
        idMap[collection][synthId] = result.id;
        totalImported++;

        if ((i + 1) % 50 === 0 || i === rawDocs.length - 1) {
          console.log(`  ✓ ${i + 1}/${rawDocs.length} imported`);
        }
      } catch (error: any) {
        console.error(
          `  ❌ Failed to import ${collection} ${synthId}:`
        );
        console.error(`     Doc: ${JSON.stringify(docWithResolvedFKs).substring(0, 200)}`);
        if (error?.message) console.error(`     Error: ${error.message}`);
        totalErrors++;
      }
    }

    console.log(`✓ ${collection} complete\n`);
  }

  // Save mappings
  saveMappings(idMap, mappingPath);

  // Print summary
  console.log("\n=== IMPORT SUMMARY ===");
  console.log(`✓ Imported: ${totalImported} documents`);
  if (totalErrors > 0) {
    console.log(`❌ Errors: ${totalErrors} documents`);
  }
  console.log(`\nID mappings saved to: ${mappingPath}`);
  console.log("\n✅ Import complete!");

  if (totalErrors > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Import failed:", error);
  process.exit(1);
});
