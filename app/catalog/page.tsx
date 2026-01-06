import { preloadQuery, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { CatalogClient } from "./CatalogClient";

// Ensure this page renders dynamically to avoid prerender errors during production builds
export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  // Preload initial data on the server for better SEO and initial load performance
  const preloadedCategories = await preloadQuery(api.catalog.catalog_list_all_categories);
  const preloadedBrands = await preloadQuery(api.catalog.show_all_brands);

  // Get first category ID by fetching categories (for item preloading)
  let preloadedItems = null;
  try {
    const categories = await fetchQuery(api.catalog.catalog_list_all_categories);
    const firstCategoryId = categories?.[0]?._id;

    // Preload items for first category
    if (firstCategoryId) {
      preloadedItems = await preloadQuery(
        api.catalog.catalog_query_grouped_by_collection,
        {
          category: firstCategoryId,
          filter: "Новинки",
          paginationOpts: { numItems: 12, cursor: null },
        }
      );
    }
  } catch (error) {
    console.error("Failed to preload items:", error);
  }

  return (
    <CatalogClient
      preloadedCategories={preloadedCategories}
      preloadedBrands={preloadedBrands}
      preloadedItems={preloadedItems}
    />
  );
}
