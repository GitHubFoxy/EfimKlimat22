const fs = require("fs");
const path = require("path");

const tempDir = "/home/coder/Projects/EfimKlimat22/temp";
const temp2Dir = "/home/coder/Projects/EfimKlimat22/temp2";

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

const categories = readJsonl(path.join(tempDir, "categories/documents.jsonl"));
const oldCategorys = readJsonl(path.join(temp2Dir, "categorys/documents.jsonl"));
const oldSubcategorys = readJsonl(path.join(temp2Dir, "subcategorys/documents.jsonl"));

// Create set of valid category IDs
const validCategoryIds = new Set(categories.map((c) => c._id));

console.log("🔧 Fixing categories parentId references...\n");
console.log(`Valid category IDs: ${validCategoryIds.size}`);

// Create mapping of old subcategory IDs to their parent category IDs
const parentMap = {};
oldSubcategorys.forEach((sub) => {
  if (sub.categoryId) {
    parentMap[sub._id] = sub.categoryId;
  } else if (sub.category) {
    parentMap[sub._id] = sub.category;
  }
});

console.log(`Parent mappings found: ${Object.keys(parentMap).length}`);

// Fix categories
const fixedCategories = categories.map((cat) => {
  if (!cat.parentId) {
    return cat; // Top level, no fix needed
  }

  // Check if parentId is valid
  if (!validCategoryIds.has(cat.parentId)) {
    console.log(`❌ Category "${cat.name}" (${cat._id}) has invalid parentId: ${cat.parentId}`);
    
    // Try to find correct parent
    const correctParent = parentMap[cat._id];
    if (correctParent && validCategoryIds.has(correctParent)) {
      console.log(`  ✓ Fixed to: ${correctParent}`);
      cat.parentId = correctParent;
    } else {
      console.log(`  ✓ Removed parentId (making it top-level)`);
      cat.parentId = null;
      cat.level = 0;
    }
  }

  return cat;
});

writeJsonl(path.join(tempDir, "categories/documents.jsonl"), fixedCategories);
console.log(`\n✅ Fixed categories table`);

// Verify
const brokenRefs = fixedCategories.filter(
  (c) => c.parentId && !validCategoryIds.has(c.parentId)
);
if (brokenRefs.length > 0) {
  console.log(`\n⚠️  Still have ${brokenRefs.length} broken references`);
  brokenRefs.forEach((c) => {
    console.log(`  ${c.name} → ${c.parentId}`);
  });
} else {
  console.log(`\n✅ All parentId references are valid!`);
}
