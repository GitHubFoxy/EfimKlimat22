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
import {
  Preloaded,
  usePreloadedQuery,
  usePaginatedQuery,
  useQuery,
} from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState, useMemo } from "react";
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
  preloadedItemsData,
  isInitialLoad,
}: {
  categoryId: Id<"categories">;
  filter: "Хиты продаж" | "Новинки" | "Со скидкой";
  subcategory?: string | null;
  priceSort?: "asc" | "desc" | null;
  variantSort?: "asc" | "desc" | null;
  selectedBrand?: string | null;
  onClearBrandFilter: () => void;
  groupByCollection: boolean;
  preloadedItemsData?: any;
  isInitialLoad?: boolean;
}) {
  const effectiveCategoryId = subcategory
    ? (subcategory as Id<"categories">)
    : categoryId;

  // Use paginated query for catalog items
  const paginatedQuery = usePaginatedQuery(
    groupByCollection
      ? api.catalog.catalog_query_grouped_by_collection
      : api.catalog.catalog_query_based_on_category_and_filter,
    {
      category: effectiveCategoryId,
      filter,
      brand: selectedBrand || undefined,
    },
    { initialNumItems: 12 },
  );

  // Use preloaded data on initial load if available
  let results = paginatedQuery.results;
  let status = paginatedQuery.status;
  let isLoading = paginatedQuery.isLoading;
  const loadMore = paginatedQuery.loadMore;

  if (isInitialLoad && preloadedItemsData?.page) {
    results = preloadedItemsData.page;
    status = preloadedItemsData.status;
    isLoading = false;
  }

  // Apply client-side sorting only (brand filtering is now done in query)
  const sortedResults = [...results];

  // Sort by price if selected
  if (priceSort === "asc") {
    sortedResults.sort((a, b) => a.price - b.price);
  } else if (priceSort === "desc") {
    sortedResults.sort((a, b) => b.price - a.price);
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

function HydratedCatalogResultsWrapper({
  preloadedItems,
  ...props
}: any) {
  const preloadedItemsData = usePreloadedQuery(preloadedItems);
  return <CatalogResultsWrapper {...props} preloadedItemsData={preloadedItemsData} />;
}

export function CatalogClient({
  preloadedCategories,
  preloadedBrands,
  preloadedItems,
}: {
  preloadedCategories: Preloaded<
    typeof api.catalog.catalog_list_all_categories
  >;
  preloadedBrands: Preloaded<typeof api.catalog.show_all_brands>;
  preloadedItems: Preloaded<
    typeof api.catalog.catalog_query_grouped_by_collection
  > | null;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const query = params.get("query") ?? "";
  const sessionId = useCartSessionId();

  const categoriesRaw = usePreloadedQuery(preloadedCategories);
  const categories = useMemo(() => categoriesRaw ?? [], [categoriesRaw]);
  const brandsAll = usePreloadedQuery(preloadedBrands) ?? [];

  // URL Params Sync
  const categorySlug = params.get("category");
  const brandParam = params.get("brand");
  const subcategorySlug = params.get("subcategory");

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(brandParam);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  const [prevCategorySlug, setPrevCategorySlug] = useState<string | null>(null);
  if (categorySlug !== prevCategorySlug && categories.length > 0) {
    setPrevCategorySlug(categorySlug);
    if (categorySlug) {
      const cat = categories.find((c) => c.slug === categorySlug);
      if (cat) setSelectedCategoryId(cat._id);
    } else if (!selectedCategoryId) {
      setSelectedCategoryId(categories[0]._id);
    }
  }

  // Fetch brands based on selected category (if any)
  const categoryBrandsQuery = useQuery(
    api.catalog.catalog_brands_by_category,
    selectedCategoryId
      ? { categoryId: selectedCategoryId as Id<"categories"> }
      : "skip",
  );

  // Use category-specific brands if available, fallback to all preloaded brands
  const brands = categoryBrandsQuery ?? brandsAll;

  // Subcategories data
  const subcategoriesData = useQuery(
    api.catalog.show_subcategories_by_category,
    selectedCategoryId
      ? { parent: selectedCategoryId as Id<"categories"> }
      : "skip",
  );
  const subcategories = useMemo(
    () => subcategoriesData?.subcategories ?? [],
    [subcategoriesData?.subcategories],
  );

  const [prevSubcategorySlug, setPrevSubcategorySlug] = useState<string | null>(null);
  if (subcategorySlug !== prevSubcategorySlug && subcategories.length > 0) {
    setPrevSubcategorySlug(subcategorySlug);
    if (subcategorySlug) {
      const sub = subcategories.find((s) => s.slug === subcategorySlug);
      if (sub) setSelectedSubcategory(sub._id);
    }
  }

  const [prevSelectedCategoryId, setPrevSelectedCategoryId] = useState<string | null>(null);
  if (selectedCategoryId !== prevSelectedCategoryId) {
    setPrevSelectedCategoryId(selectedCategoryId);
    setSelectedSubcategory(null);
  }

  // Sync state back to URL
  useEffect(() => {
    const newParams = new URLSearchParams(params.toString());

    if (selectedCategoryId) {
      const cat = categories.find((c) => c._id === selectedCategoryId);
      if (cat) newParams.set("category", cat.slug);
    }

    if (selectedBrand) newParams.set("brand", selectedBrand);
    else newParams.delete("brand");

    if (selectedSubcategory && selectedSubcategory !== "none") {
      const sub = subcategories.find((s) => s._id === selectedSubcategory);
      if (sub) newParams.set("subcategory", sub.slug);
    } else {
      newParams.delete("subcategory");
    }

    const search = newParams.toString();
    const queryStr = search ? `?${search}` : "";
    // Avoid infinite loop by checking if params actually changed
    if (search !== params.toString()) {
      router.replace(`/catalog${queryStr}`, { scroll: false });
    }
  }, [
    selectedCategoryId,
    selectedBrand,
    selectedSubcategory,
    categories,
    subcategories,
    router,
    params,
  ]);

  const [priceSort, setPriceSort] = useState<"asc" | "desc" | null>(null);
  const [variantSort, setVariantSort] = useState<"asc" | "desc" | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<
    "Хиты продаж" | "Новинки" | "Со скидкой"
  >("Новинки");
  const [groupByCollection] = useState(true);

  // Cart data for floating button
  const itemsData = useQuery(
    api.cart.listItems,
    sessionId ? { sessionId } : "skip",
  );

  // Search results (from header search link)
  const searchResults = useQuery(api.main.search_items, { query }) ?? [];

  return (
    <div className="px-6 py-2 md:px-12 lg:px-28 xl:max-w-7xl xl:mx-auto">
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
        variantSort={variantSort}
        onVariantSortChange={setVariantSort}
      />

      {/* Disclaimer message for gas-related subcategories */}
      <DisclaimerMessage selectedSubcategory={selectedSubcategory} />
      {/* Paginated catalog results by category & filter */}
      {preloadedItems ? (
        <HydratedCatalogResultsWrapper
          preloadedItems={preloadedItems}
          selectedCategoryId={selectedCategoryId as Id<"categories"> | null}
          selectedFilter={selectedFilter}
          selectedSubcategory={selectedSubcategory}
          priceSort={priceSort}
          variantSort={variantSort}
          selectedBrand={selectedBrand}
          onClearBrandFilter={() => setSelectedBrand(null)}
          groupByCollection={groupByCollection}
          CatalogResultsComponent={CatalogResults}
          isInitialLoad={
            !selectedBrand && selectedFilter === "Новинки" && !selectedSubcategory
          }
        />
      ) : (
        <CatalogResultsWrapper
          selectedCategoryId={selectedCategoryId as Id<"categories"> | null}
          selectedFilter={selectedFilter}
          selectedSubcategory={selectedSubcategory}
          priceSort={priceSort}
          variantSort={variantSort}
          selectedBrand={selectedBrand}
          onClearBrandFilter={() => setSelectedBrand(null)}
          groupByCollection={groupByCollection}
          CatalogResultsComponent={CatalogResults}
          preloadedItemsData={null}
          isInitialLoad={false}
        />
      )}

      <div id="free-consult">
        <FreeConsultmant />
      </div>
      <Footer />

      <FloatingCheckoutButton />
    </div>
  );
}
