import { preloadQuery, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { CatalogClient } from "./CatalogClient";

// Ensure this page renders dynamically to avoid prerender errors during production builds
export const dynamic = "force-dynamic";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const categorySlug = resolvedParams.category as string | undefined;
  const filter = (resolvedParams.filter as any) || "Новинки";

  // Preload initial data on the server for better SEO and initial load performance
  const preloadedCategories = await preloadQuery(api.catalog.catalog_list_all_categories);
  const preloadedBrands = await preloadQuery(api.catalog.show_all_brands);

  // Get category ID for item preloading
  let preloadedItems = null;
  try {
    const categories = await fetchQuery(api.catalog.catalog_list_all_categories);
    let targetCategoryId = null;

    if (categorySlug) {
      const cat = categories.find((c: any) => c.slug === categorySlug);
      if (cat) targetCategoryId = cat._id;
    }

    if (!targetCategoryId && categories.length > 0) {
      targetCategoryId = categories[0]._id;
    }

    // Preload items for target category
    if (targetCategoryId) {
      preloadedItems = await preloadQuery(
        api.catalog.catalog_query_grouped_by_collection,
        {
          category: targetCategoryId,
          filter: filter,
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
