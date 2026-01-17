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

import { Preloaded, usePreloadedQuery, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useCartSessionId } from "@/hooks/useCartSession";

type FilterType = "Хиты продаж" | "Новинки" | "Со скидкой";
const ALLOWED_FILTERS = new Set<FilterType>([
  "Хиты продаж",
  "Новинки",
  "Со скидкой",
]);

function CatalogResultsInner({
  effectiveCategoryId,
  filter,
  priceSort,
  selectedBrand,
  onClearBrandFilter,
  groupByCollection,
}: {
  effectiveCategoryId: Id<"categories"> | undefined;
  filter: FilterType;
  priceSort?: "asc" | "desc" | null;
  selectedBrand?: Id<"brands"> | null;
  onClearBrandFilter: () => void;
  groupByCollection: boolean;
}) {
  const [cursor, setCursor] = useState(0);
  const [accumulatedResults, setAccumulatedResults] = useState<any[]>([]);

  // Don't group when showing "Хиты продаж" or "Со скидкой" to ensure accurate filtering
  const shouldGroup =
    groupByCollection && filter !== "Хиты продаж" && filter !== "Со скидкой";
  
  const queryResult = useQuery(
    shouldGroup
      ? api.catalog.catalog_query_grouped_by_collection
      : api.catalog.catalog_query_based_on_category_and_filter,
    {
      category: effectiveCategoryId,
      filter,
      brand: selectedBrand || undefined,
      priceSort: priceSort || undefined,
      cursor,
    },
  );

  // Compute displayed results: accumulated + current page (deduplicated)
  let displayedResults: any[];
  if (!queryResult?.page) {
    displayedResults = accumulatedResults;
  } else if (cursor === 0) {
    displayedResults = queryResult.page;
  } else {
    const existingIds = new Set(accumulatedResults.map((item) => item._id));
    const newItems = queryResult.page.filter(
      (item: any) => !existingIds.has(item._id),
    );
    displayedResults = [...accumulatedResults, ...newItems];
  }

  const isLoading = queryResult === undefined;
  const isDone = queryResult?.isDone ?? true;

  const handleLoadMore = () => {
    if (
      queryResult?.nextCursor !== null &&
      queryResult?.nextCursor !== undefined
    ) {
      setAccumulatedResults(displayedResults);
      setCursor(queryResult.nextCursor);
    }
  };

  return (
    <CatalogResultsGrid
      isLoading={isLoading}
      results={displayedResults}
      selectedBrand={selectedBrand}
      onClearBrandFilter={onClearBrandFilter}
      onLoadMore={handleLoadMore}
      isDone={isDone}
    />
  );
}

function CatalogResults({
  categoryId,
  filter,
  subcategory,
  priceSort,
  selectedBrand,
  onClearBrandFilter,
  groupByCollection,
}: {
  categoryId: Id<"categories"> | null;
  filter: FilterType;
  subcategory?: string | null;
  priceSort?: "asc" | "desc" | null;
  selectedBrand?: Id<"brands"> | null;
  onClearBrandFilter: () => void;
  groupByCollection: boolean;
}) {
  const effectiveCategoryId = subcategory
    ? (subcategory as Id<"categories">)
    : categoryId;

  // Use key to remount component when filters change, resetting cursor state
  const filterKey = `${effectiveCategoryId}-${filter}-${priceSort}-${selectedBrand}-${groupByCollection}`;

  return (
    <CatalogResultsInner
      key={filterKey}
      effectiveCategoryId={effectiveCategoryId || undefined}
      filter={filter}
      priceSort={priceSort}
      selectedBrand={selectedBrand}
      onClearBrandFilter={onClearBrandFilter}
      groupByCollection={groupByCollection}
    />
  );
}

export function CatalogClient({
  preloadedCategories,
  preloadedBrands,
  initialFilter,
}: {
  preloadedCategories: Preloaded<
    typeof api.catalog.catalog_list_all_categories
  >;
  preloadedBrands: Preloaded<typeof api.catalog.show_all_brands>;
  initialFilter: FilterType;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const query = params.get("query") ?? "";
  const sessionId = useCartSessionId();

  const categoriesRaw = usePreloadedQuery(preloadedCategories);
  const categories = useMemo(() => categoriesRaw ?? [], [categoriesRaw]);
  const brandsAll = usePreloadedQuery(preloadedBrands) ?? [];

  const [priceSort, setPriceSort] = useState<"asc" | "desc" | null>(null);
  const [groupByCollection] = useState(true);

  // Derive category from URL
  const categorySlug = params.get("category");
  const selectedCategoryId = useMemo<Id<"categories"> | null>(() => {
    if (!categorySlug || categorySlug === "all" || !categories.length)
      return null;
    const cat = categories.find((c) => c.slug === categorySlug);
    return cat?._id ?? null;
  }, [categorySlug, categories]);

  // Derive brand from URL
  const brandParam = params.get("brand");
  const selectedBrand = useMemo<Id<"brands"> | null>(
    () => (brandParam as Id<"brands">) ?? null,
    [brandParam],
  );

  // Derive filter from URL
  const filterParam = params.get("filter");
  const selectedFilter = useMemo<FilterType>(() => {
    if (filterParam && ALLOWED_FILTERS.has(filterParam as FilterType)) {
      return filterParam as FilterType;
    }
    return initialFilter;
  }, [filterParam, initialFilter]);

  // Fetch brands based on selected category (if any)
  const categoryBrandsQuery = useQuery(
    api.catalog.catalog_brands_by_category,
    selectedCategoryId ? { categoryId: selectedCategoryId } : "skip",
  );

  const brands = categoryBrandsQuery ?? brandsAll;

  // Subcategories data
  const subcategoriesData = useQuery(
    api.catalog.show_subcategories_by_category,
    selectedCategoryId ? { parent: selectedCategoryId } : "skip",
  );
  const subcategories = useMemo(
    () => subcategoriesData?.subcategories ?? [],
    [subcategoriesData?.subcategories],
  );

  // Derive subcategory from URL (only valid when subcategories are loaded)
  const subcategorySlug = params.get("subcategory");
  const selectedSubcategory = useMemo<Id<"categories"> | null>(() => {
    if (!subcategorySlug || !subcategories.length) return null;
    const sub = subcategories.find((s) => s.slug === subcategorySlug);
    return sub?._id ?? null;
  }, [subcategorySlug, subcategories]);

  // URL update helpers
  const updateParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    }
    const search = newParams.toString();
    router.replace(`/catalog${search ? `?${search}` : ""}`, { scroll: false });
  };

  const setSelectedCategoryId = (id: Id<"categories"> | null) => {
    const cat = id ? categories.find((c) => c._id === id) : null;
    updateParams({
      category: cat?.slug ?? null,
      subcategory: null,
    });
  };

  const setSelectedBrand = (id: Id<"brands"> | null) => {
    updateParams({ brand: id });
  };

  const setSelectedSubcategory = (id: Id<"categories"> | null) => {
    const sub = id ? subcategories.find((s) => s._id === id) : null;
    updateParams({ subcategory: sub?.slug ?? null });
  };

  const setSelectedFilter = (filter: FilterType) => {
    updateParams({ filter });
  };

  const clearAllFilters = () => {
    updateParams({
      category: null,
      subcategory: null,
      brand: null,
      filter: null,
    });
    setPriceSort(null);
  };

  // Cart data for floating button
  const itemsData = useQuery(
    api.cart.listItems,
    sessionId ? { sessionId } : "skip",
  );

  // Search results (from header search link)
  const searchResults = useQuery(api.main.search_items, { query }) ?? [];

  return (
    <div className="px-6 py-2 md:px-12 lg:px-28 xl:max-w-7xl xl:mx-auto" suppressHydrationWarning>
      <Header />
      {/* Optional search results section (from header search) */}
      {query && (
        <div className="px-4 mb-10">
          <h2 className="text-xl font-semibold mb-4">
            Результаты поиска: &quot;{query}&quot;
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
        onClearAll={clearAllFilters}
      />

      {/* Disclaimer message for gas-related subcategories */}
      <DisclaimerMessage selectedSubcategory={selectedSubcategory} />

      {/* Paginated catalog results by category & filter */}
      <CatalogResultsWrapper
        selectedCategoryId={selectedCategoryId as Id<"categories"> | null}
        selectedFilter={selectedFilter}
        selectedSubcategory={selectedSubcategory}
        priceSort={priceSort}
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
