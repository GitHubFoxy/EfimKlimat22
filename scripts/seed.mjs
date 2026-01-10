/* global fetch, console */
// Seed script: reads public/test.json, converts images to WebP using sharp,
// uploads to Convex storage, then inserts items via dashboard.addItemsPublic.
// If an item's image folder is missing or contains no images, the item is inserted without images.
// Usage: pnpm seed

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";
import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";
import { api } from "../convex/_generated/api.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
if (!CONVEX_URL) {
  console.error(
    "Missing Convex URL. Set NEXT_PUBLIC_CONVEX_URL or CONVEX_URL in .env.local",
  );
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function readJson(filePath) {
  const data = await fs.readFile(filePath, "utf8");
  return JSON.parse(data);
}

function isImageFile(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  return [".jpg", ".jpeg", ".png", ".webp", ".gif", ".tiff", ".bmp"].includes(ext);
}

async function getDirImages(absDir) {
  const entries = await fs.readdir(absDir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && isImageFile(e.name))
    .map((e) => path.join(absDir, e.name))
    .sort((a, b) => a.localeCompare(b));
}

async function toWebpBuffer(filePath) {
  const input = await fs.readFile(filePath);
  // Re-encode everything to WebP for consistency
  return sharp(input)
    .webp({ quality: 80, effort: 6 })
    .toBuffer();
}

async function uploadWebp(buffer) {
  const uploadUrl = await client.mutation(api.dashboard.generateUploadUrl);
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Type": "image/webp",
    },
    body: buffer,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${res.status} ${text}`);
  }
  const json = await res.json();
  return json.storageId;
}

async function seed() {
  const projectRoot = process.cwd();
  const publicRoot = path.join(projectRoot, "public");
  const jsonPath = path.join(publicRoot, "seed2.json");
  const items = await readJson(jsonPath);

  // NOTE: Category in the items schema expects a Convex id, but the seed JSON
  // provides a string. To match subcategory behavior (string), we will insert
  // the category string into the subcategory field when subcategory is absent,
  // and leave the 'category' (id) unset.

  for (const item of items) {
    // Normalize path to avoid leading slash breaking path.join on Windows
    const imagesDirRelRaw = item.images; // e.g. "/images/ZOTA/box-10"
    let files = [];
    if (!imagesDirRelRaw || typeof imagesDirRelRaw !== "string" || imagesDirRelRaw.trim() === "") {
      console.warn(`No images path provided for ${item.name}, inserting without images`);
    } else {
      const imagesDirRel = imagesDirRelRaw.startsWith("/")
        ? imagesDirRelRaw.slice(1)
        : imagesDirRelRaw;
      const imagesDirAbs = path.join(publicRoot, imagesDirRel);
      try {
        files = await getDirImages(imagesDirAbs);
      } catch {
        console.warn(`Images directory not found at ${imagesDirAbs} for ${item.name}, inserting without images`);
      }
      if (!files.length) {
        console.warn(`No images found at ${imagesDirAbs} for ${item.name}, inserting without images`);
      }
    }

    const storageIds = [];
    for (const file of files) {
      try {
        const webpBuf = await toWebpBuffer(file);
        const storageId = await uploadWebp(webpBuf);
        storageIds.push(storageId);
      } catch (err) {
        console.error(`Error processing ${file}:`, err);
      }
    }

    // Map fields from test.json to mutation args
    const catName = item.category ? String(item.category) : undefined;
    const subcategoriestr = item.subcategory ? String(item.subcategory) : undefined;
    const collectionStr = item.Collection ? String(item.Collection) : undefined;

    const args = {
      name: item.name,
      quantity: Number(item.quantity ?? 1),
      price: Number(item.price ?? 0),
      description: String(item.description ?? ""),
      brand: item.brand ? String(item.brand) : undefined,
      variant: item.Variant ? String(item.Variant) : undefined,
      // Extract category and subcategory exactly as they appear in test.json
      category: catName,
      subcategory: subcategoriestr,
      collection: collectionStr,
      partNumber: item.partNumber ? String(item.partNumber) : undefined,
      imageStorageIds: storageIds,
    };

    console.log(`Inserting: ${args.name} (${storageIds.length} images)`);
    await client.mutation(api.dashboard.addItemsPublic, args);
  }

  console.log("Seeding complete");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});