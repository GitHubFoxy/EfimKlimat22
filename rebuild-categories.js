const fs = require("fs");
const path = require("path");

const temp2Dir = "/home/coder/Projects/EfimKlimat22/temp2";
const tempDir = "/home/coder/Projects/EfimKlimat22/temp";

function readJsonl(filepath) {
  if (!fs.existsSync(filepath)) return [];
  return fs
    .readFileSync(filepath, "utf-8")
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
}

function writeJsonl(filepath, data) {
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, data.map((item) => JSON.stringify(item)).join("\n"));
  if (data.length > 0) fs.appendFileSync(filepath, "\n");
}

const oldCategorys = readJsonl(path.join(temp2Dir, "categorys/documents.jsonl"));
const oldSubcategorys = readJsonl(path.join(temp2Dir, "subcategorys/documents.jsonl"));

console.log("🔄 Rebuilding categories from original data...\n");
console.log(`Old categorys: ${oldCategorys.length}`);
console.log(`Old subcategorys: ${oldSubcategorys.length}`);

const allCategories = [];

// Add main categories
oldCategorys.forEach((cat) => {
  allCategories.push({
    _id: cat._id,
    _creationTime: cat._creationTime || Date.now(),
    name: cat.name,
    slug: (cat.name || "").toLowerCase().replace(/\s+/g, "-"),
    level: 0,
    order: cat.order || 0,
    isVisible: true,
  });
});

// Add subcategories with correct parentId
oldSubcategorys.forEach((subcat) => {
  const parentCatId = subcat.categoryId || (subcat.category ? subcat.category : null);
  
  allCategories.push({
    _id: subcat._id,
    _creationTime: subcat._creationTime || Date.now(),
    name: subcat.name,
    slug: (subcat.name || "").toLowerCase().replace(/\s+/g, "-"),
    parentId: parentCatId,
    level: 1,
    order: subcat.order || 0,
    isVisible: true,
  });
});

console.log(`\nTotal categories: ${allCategories.length}`);

// Verify parentId references
const categoryIds = new Set(allCategories.map((c) => c._id));
const brokenRefs = allCategories.filter(
  (c) => c.parentId && !categoryIds.has(c.parentId)
);

if (brokenRefs.length > 0) {
  console.log(`\n⚠️  Found ${brokenRefs.length} broken parent references:`);
  brokenRefs.forEach((c) => {
    console.log(`  "${c.name}" → parentId: ${c.parentId}`);
    // Remove broken reference
    c.parentId = null;
    c.level = 0;
  });
}

writeJsonl(path.join(tempDir, "categories/documents.jsonl"), allCategories);
console.log(`\n✅ Rebuilt categories table`);
