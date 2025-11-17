"use client";

import { Footer } from "@/components/Footer";
import FreeConsultmant from "@/components/FreeConsultmant";
import Header from "@/components/Header/Header";
import ItemCard from "@/components/ItemCard";
import EmptyState from "@/components/ui/EmptyState";
import FloatingCheckoutButton from "@/components/CatalogComponents/FloatingCheckoutButton";
import CatalogResultsWrapper from "@/components/CatalogComponents/CatalogResultsWrapper";
import DisclaimerMessage from "@/components/CatalogComponents/DisclaimerMessage";
import CatalogFilters from "@/components/CatalogComponents/CatalogFilters";
import CatalogResultsGrid from "@/components/CatalogComponents/CatalogResultsGrid";
import { Preloaded, usePreloadedQuery, usePaginatedQuery, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useCartSessionId } from "@/hooks/useCartSession";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function CatalogResults({
  categoryId,
  filter,
  subcategory,
  priceSort,
  variantSort,
  selectedBrand,
  onClearBrandFilter,
  groupByCollection,
}: {
  categoryId: Id<"categorys">;
  filter: "Хиты продаж" | "Новинки" | "Со скидкой";
  subcategory?: string | null;
  priceSort?: "asc" | "desc" | null;
  variantSort?: "asc" | "desc" | null;
  selectedBrand?: string | null;
  onClearBrandFilter: () => void;
  groupByCollection: boolean;
}) {
  const { results, status, isLoading, loadMore } = usePaginatedQuery(
    groupByCollection
      ? api.catalog.catalog_query_grouped_by_collection
      : api.catalog.catalog_query_based_on_category_and_filter,
    {
      category: categoryId,
      filter,
      subcategory: (subcategory as Id<"subcategorys">) ?? undefined,
      brand: selectedBrand ?? undefined,
    },
    { initialNumItems: 12 },
  );

  // Apply client-side sorting only (brand filtering is now done in query)
  let sortedResults = [...results];

  // Sort by price if selected
  if (priceSort === "asc") {
    sortedResults.sort((a, b) => a.price - b.price);
  } else if (priceSort === "desc") {
    sortedResults.sort((a, b) => b.price - a.price);
  }

  // Sort by variant (as number) if selected
  if (variantSort === "asc") {
    sortedResults.sort((a, b) => {
      const variantA = parseFloat(a.variant) || 0;
      const variantB = parseFloat(b.variant) || 0;
      return variantA - variantB;
    });
  } else if (variantSort === "desc") {
    sortedResults.sort((a, b) => {
      const variantA = parseFloat(a.variant) || 0;
      const variantB = parseFloat(b.variant) || 0;
      return variantB - variantA;
    });
  }

  return (
    <CatalogResultsGrid
      isLoading={isLoading}
      results={results}
      sortedResults={sortedResults}
      status={status}
      selectedBrand={selectedBrand}
      onClearBrandFilter={onClearBrandFilter}
      onLoadMore={() => loadMore(12)}
    />
  );
}

export function CatalogClient({
  preloadedCategories,
  preloadedBrands,
}: {
  preloadedCategories: Preloaded<typeof api.catalog.catalog_list_all_categories>;
  preloadedBrands: Preloaded<typeof api.dashboard.show_all_brands>;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const query = params.get("query") ?? "";
  const sessionId = useCartSessionId();

  // Use preloaded data - this gives us server-rendered content
  // that becomes reactive after hydration
  const categories = usePreloadedQuery(preloadedCategories) ?? [];
  const brands = usePreloadedQuery(preloadedBrands) ?? [];

  // Cart data for floating button
  const itemsData = useQuery(
    api.cart.listItems,
    sessionId ? { sessionId } : "skip",
  );

  // Search results (from header search link)
  const searchResults = useQuery(api.main.search_items, { query }) ?? [];

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  // Subcategories data
  const subcategoriesData = useQuery(
    api.dashboard.show_subcategories_by_category,
    selectedCategoryId
      ? { parent: selectedCategoryId as Id<"categorys"> }
      : "skip",
  );
  const subcategories = subcategoriesData?.subcategories ?? [];
  const [selectedFilter, setSelectedFilter] = useState<
    "Хиты продаж" | "Новинки" | "Со скидкой"
  >("Новинки");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null,
  );
  const [priceSort, setPriceSort] = useState<"asc" | "desc" | null>(null);
  const [variantSort, setVariantSort] = useState<"asc" | "desc" | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [groupByCollection] = useState(true);

  useEffect(() => {
    if (!selectedCategoryId && categories.length > 0) {
      setSelectedCategoryId(categories[0]._id);
    }
  }, [categories, selectedCategoryId]);

  useEffect(() => {
    // Reset subcategory when category changes
    setSelectedSubcategory(null);
  }, [selectedCategoryId]);

  return (
    <div className="px-6 py-2 md:px-12 lg:px-28 xl:max-w-7xl xl:mx-auto">
      <Header />
      {/* Optional search results section (from header search) */}
      {query && (
        <div className="px-4 mb-10">
          <h2 className="text-xl font-semibold mb-4">
            Результаты поиска: "{query}"
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {searchResults.length === 0 ? (
              <div className="col-span-full">
                <EmptyState
                  title="Ничего не найдено"
                  description="Проверьте запрос или попробуйте выбрать категорию"
                  primaryAction={{
                    label: "Очистить поиск",
                    onClick: () => router.push("/catalog"),
                  }}
                  secondaryActions={[
                    { label: "Перейти в каталог", href: "/catalog" },
                    {
                      label: "Связаться с консультантом",
                      href: "#free-consult",
                    },
                  ]}
                />
              </div>
            ) : (
              searchResults.map((e: any, index: number) => (
                <div
                  key={e._id?.toString?.() ?? index}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 p-4 md:p-5"
                >
                  <ItemCard e={e} />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Filters & Categories - Two Row Layout */}
      <CatalogFilters
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={setSelectedCategoryId}
        subcategories={subcategories}
        selectedSubcategory={selectedSubcategory}
        onSubcategoryChange={setSelectedSubcategory}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        brands={brands}
        selectedBrand={selectedBrand}
        onBrandChange={setSelectedBrand}
        priceSort={priceSort}
        onPriceSortChange={setPriceSort}
        variantSort={variantSort}
        onVariantSortChange={setVariantSort}
      />

      {/* Disclaimer message for gas-related subcategories */}
      <DisclaimerMessage selectedSubcategory={selectedSubcategory} />
      {/* Paginated catalog results by category & filter */}
      <CatalogResultsWrapper
        selectedCategoryId={selectedCategoryId as Id<"categorys"> | null}
        selectedFilter={selectedFilter}
        selectedSubcategory={selectedSubcategory}
        priceSort={priceSort}
        variantSort={variantSort}
        selectedBrand={selectedBrand}
        onClearBrandFilter={() => setSelectedBrand(null)}
        groupByCollection={groupByCollection}
        CatalogResultsComponent={CatalogResults}
      />

      <div id="free-consult">
        <FreeConsultmant />
      </div>
      <Footer />

      <FloatingCheckoutButton />
    </div>
  );
}
