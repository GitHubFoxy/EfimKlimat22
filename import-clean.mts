#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import { ConvexClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";

const CONVEX_URL = "https://grandiose-puffin-672.convex.cloud";
const client = new ConvexClient(CONVEX_URL);

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

const FK_FIELDS: Record<string, Record<string, string>> = {
  items: { brandId: "brands", categoryId: "categories" },
  carts: { userId: "users" },
  orders: { userId: "users", cartId: "carts" },
  cartItems: { cartId: "carts", itemId: "items" },
  orderItems: { orderId: "orders", itemId: "items" },
  leads: { relatedItemId: "items", assignedManagerId: "users" },
  reviews: { userId: "users", itemId: "items" },
};

function loadJsonl(filePath: string): any[] {
  if (!fs.existsSync(filePath)) return [];
  const data: any[] = [];
  const content = fs.readFileSync(filePath, "utf-8");
  content.split("\n").forEach((line) => {
    if (line.trim()) {
      try {
        data.push(JSON.parse(line));
      } catch (e) {
        //ignore
      }
    }
  });
  return data;
}

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
      // Skip unresolved FKs - they may not exist
      continue;
    }

    resolved[field] = realId;
  }

  return resolved;
}

async function main() {
  console.log("🚀 Starting import...\n");

  const dataDir = path.join(
    import.meta.dirname,
    "..",
    "move-to-new-schema",
    "migrated_data"
  );

  const idMap: Record<string, Record<string, string>> = {};
  for (const collection of COLLECTION_ORDER) {
    idMap[collection] = {};
  }

  let totalImported = 0;
  let totalErrors = 0;

  for (const collection of COLLECTION_ORDER) {
    const filePath = path.join(dataDir, `${collection}.jsonl`);
    const rawDocs = loadJsonl(filePath);

    if (rawDocs.length === 0) {
      console.log(`⏭️  ${collection}: (empty)`);
      continue;
    }

    console.log(`📊 ${collection}: importing ${rawDocs.length} docs...`);

    for (let i = 0; i < rawDocs.length; i++) {
      const rawDoc = rawDocs[i];
      const synthId = rawDoc._id;

      const docToImport = { ...rawDoc };
      delete docToImport._id;
      delete docToImport._creationTime;

      const docWithResolvedFKs = resolveForeignKeys(
        collection,
        docToImport,
        idMap
      );

      try {
        const result = await client.mutation(api.import.insertDoc, {
          collection,
          doc: docWithResolvedFKs,
        });

        if (!result.ok) {
          console.error(`  ❌ ${synthId}: ${result.error}`);
          totalErrors++;
          continue;
        }

        idMap[collection][synthId] = result.id;
        totalImported++;

        if ((i + 1) % 100 === 0 || i === rawDocs.length - 1) {
          console.log(`  ✓ ${i + 1}/${rawDocs.length}`);
        }
      } catch (error: any) {
        console.error(
          `  ❌ ${synthId}: ${error?.message || String(error)}`
        );
        totalErrors++;
      }
    }
  }

  console.log(`\n✅ Import complete: ${totalImported} imported, ${totalErrors} errors`);

  // Save mappings
  fs.writeFileSync(
    path.join(dataDir, "convex_final_mapping.json"),
    JSON.stringify(idMap, null, 2)
  );
  console.log(`💾 Saved mappings to convex_final_mapping.json`);
}

main().catch(console.error);
