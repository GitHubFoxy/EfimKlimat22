import { preloadQuery, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { CatalogClient } from "./CatalogClient";

export const dynamic = "force-dynamic";

type FilterType = "Хиты продаж" | "Новинки" | "Со скидкой";
const ALLOWED_FILTERS = new Set<FilterType>(["Хиты продаж", "Новинки", "Со скидкой"]);

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const categorySlug = resolvedParams.category as string | undefined;
  const rawFilter = resolvedParams.filter as string | undefined;
  const filter: FilterType =
    rawFilter && ALLOWED_FILTERS.has(rawFilter as FilterType)
      ? (rawFilter as FilterType)
      : "Новинки";

  const preloadedCategories = await preloadQuery(api.catalog.catalog_list_all_categories);
  const preloadedBrands = await preloadQuery(api.catalog.show_all_brands);

  let preloadedItems = null;
  try {
    let targetCategoryId = undefined;

    if (categorySlug && categorySlug !== "all") {
      const categories = await fetchQuery(api.catalog.catalog_list_all_categories);
      const cat = categories.find((c: any) => c.slug === categorySlug);
      if (cat) targetCategoryId = cat._id;
    }

    preloadedItems = await preloadQuery(
      api.catalog.catalog_query_grouped_by_collection,
      {
        category: targetCategoryId,
        filter,
        paginationOpts: { numItems: 24, cursor: null },
      },
    );
  } catch (error) {
    console.error("Failed to preload items:", error);
  }

  return (
    <CatalogClient
      preloadedCategories={preloadedCategories}
      preloadedBrands={preloadedBrands}
      preloadedItems={preloadedItems}
      initialFilter={filter}
    />
  );
}
