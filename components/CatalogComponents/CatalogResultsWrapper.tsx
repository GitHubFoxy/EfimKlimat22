"use client";

import { Id } from "@/convex/_generated/dataModel";

interface CatalogResultsWrapperProps {
  selectedCategoryId: Id<"new_categories"> | null;
  selectedFilter: "Хиты продаж" | "Новинки" | "Со скидкой";
  selectedSubcategory: string | null;
  priceSort: "asc" | "desc" | null;
  variantSort: "asc" | "desc" | null;
  selectedBrand: string | null;
  onClearBrandFilter: () => void;
  groupByCollection: boolean;
  CatalogResultsComponent: React.ComponentType<{
    categoryId: Id<"new_categories">;
    filter: "Хиты продаж" | "Новинки" | "Со скидкой";
    subcategory?: string | null;
    priceSort?: "asc" | "desc" | null;
    variantSort?: "asc" | "desc" | null;
    selectedBrand?: string | null;
    onClearBrandFilter: () => void;
    groupByCollection: boolean;
  }>;
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
}: CatalogResultsWrapperProps) {
  if (!selectedCategoryId) {
    return (
      <div className="px-4 mb-8">
        <div className="text-center py-8">Загрузка категорий...</div>
      </div>
    );
  }

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
    />
  );
}
