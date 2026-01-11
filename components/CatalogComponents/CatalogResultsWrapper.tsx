"use client";

import { Id } from "@/convex/_generated/dataModel";

interface CatalogResultsWrapperProps {
  selectedCategoryId: Id<"categories"> | null;
  selectedFilter: "Хиты продаж" | "Новинки" | "Со скидкой";
  selectedSubcategory: string | null;
  priceSort: "asc" | "desc" | null;
  variantSort: "asc" | "desc" | null;
  selectedBrand: Id<"brands"> | null;
  onClearBrandFilter: () => void;
  groupByCollection: boolean;
  CatalogResultsComponent: React.ComponentType<{
    categoryId: Id<"categories"> | null;
    filter: "Хиты продаж" | "Новинки" | "Со скидкой";
    subcategory?: string | null;
    priceSort?: "asc" | "desc" | null;
    variantSort?: "asc" | "desc" | null;
    selectedBrand?: Id<"brands"> | null;
    onClearBrandFilter: () => void;
    groupByCollection: boolean;
    preloadedItemsData?: any;
    isInitialLoad?: boolean;
  }>;
  preloadedItemsData?: any;
  isInitialLoad?: boolean;
}

export default function CatalogResultsWrapper({
  selectedCategoryId,
  selectedFilter,
  selectedSubcategory,
  priceSort,
  variantSort,
  selectedBrand,
  onClearBrandFilter,
  groupByCollection,
  CatalogResultsComponent,
  preloadedItemsData,
  isInitialLoad,
}: CatalogResultsWrapperProps) {
  return (
    <CatalogResultsComponent
      categoryId={selectedCategoryId}
      filter={selectedFilter}
      subcategory={selectedSubcategory === "none" ? null : selectedSubcategory}
      priceSort={priceSort}
      variantSort={variantSort}
      selectedBrand={selectedBrand}
      onClearBrandFilter={onClearBrandFilter}
      groupByCollection={groupByCollection}
      preloadedItemsData={preloadedItemsData}
      isInitialLoad={isInitialLoad}
    />
  );
}
