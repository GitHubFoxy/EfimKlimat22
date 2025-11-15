import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { CatalogClient } from "./CatalogClient";

// Ensure this page renders dynamically to avoid prerender errors during production builds
export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  // Preload initial data on the server for better SEO and initial load performance
  const [preloadedCategories, preloadedBrands] = await Promise.all([
    preloadQuery(api.catalog.catalog_list_all_categories),
    preloadQuery(api.dashboard.show_all_brands),
  ]);

  return (
    <CatalogClient
      preloadedCategories={preloadedCategories}
      preloadedBrands={preloadedBrands}
    />
  );
}
