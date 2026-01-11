"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Id } from "@/convex/_generated/dataModel";

type FilterType = "Хиты продаж" | "Новинки" | "Со скидкой";

interface CatalogFiltersProps {
  categories: any[];
  selectedCategoryId: Id<"categories"> | null;
  onCategoryChange: (categoryId: Id<"categories"> | null) => void;

  subcategories: any[];
  selectedSubcategory: Id<"categories"> | null;
  onSubcategoryChange: (subcategoryId: Id<"categories"> | null) => void;

  selectedFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;

  brands: any[];
  selectedBrand: Id<"brands"> | null;
  onBrandChange: (brand: Id<"brands"> | null) => void;

  priceSort: "asc" | "desc" | null;
  onPriceSortChange: (sort: "asc" | "desc" | null) => void;

  variantSort: "asc" | "desc" | null;
  onVariantSortChange: (sort: "asc" | "desc" | null) => void;
}

export default function CatalogFilters({
  categories,
  selectedCategoryId,
  onCategoryChange,
  subcategories,
  selectedSubcategory,
  onSubcategoryChange,
  selectedFilter,
  onFilterChange,
  brands,
  selectedBrand,
  onBrandChange,
  priceSort,
  onPriceSortChange,
  variantSort,
  onVariantSortChange,
}: CatalogFiltersProps) {
  const filters = ["Новинки", "Хиты продаж", "Со скидкой"] as const;

  return (
    <div id="catalog-filters" className="px-4 mb-6 flex flex-col gap-4">
      {/* First Row: Category, Subcategory */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-sm text-gray-600 whitespace-nowrap">
            Категория:
          </span>
          <Select
            value={selectedCategoryId ?? "all"}
            onValueChange={(val) =>
              onCategoryChange(val === "all" ? null : (val as Id<"categories">))
            }
          >
            <SelectTrigger className="w-full sm:min-w-[200px]">
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все товары</SelectItem>
              {categories.map((c: any) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {subcategories.length > 0 && (
          <div className="flex items-center gap-3 flex-1">
            <span className="text-sm text-gray-600 whitespace-nowrap">
              Подкатегория:
            </span>
            <Select
              value={selectedSubcategory ?? undefined}
              onValueChange={(val) =>
                onSubcategoryChange(
                  val === "none" ? null : (val as Id<"categories">),
                )
              }
            >
              <SelectTrigger className="w-full sm:min-w-[200px]">
                <SelectValue placeholder="Выберите подкатегорию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Без подкатегории</SelectItem>
                {subcategories.map((sc: any) => (
                  <SelectItem key={sc._id} value={sc._id}>
                    {sc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Second Row: Brand and Sort options */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[180px]">
          <Select
            value={selectedBrand ?? "all"}
            onValueChange={(val) =>
              onBrandChange(val === "all" ? null : (val as Id<"brands">))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Все бренды" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все бренды</SelectItem>
              {brands.map((brand: any) => (
                <SelectItem key={brand._id} value={brand._id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3 flex-1 min-w-[180px]">
          <Select
            value={priceSort ?? "none"}
            onValueChange={(val) => {
              if (val === "none") {
                onPriceSortChange(null);
              } else {
                onPriceSortChange(val as "asc" | "desc");
                onVariantSortChange(null);
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Цена" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Цена</SelectItem>
              <SelectItem value="asc">По возрастанию</SelectItem>
              <SelectItem value="desc">По убыванию</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3 flex-1 min-w-[180px]">
          <Select
            value={variantSort ?? "none"}
            onValueChange={(val) => {
              if (val === "none") {
                onVariantSortChange(null);
              } else {
                onVariantSortChange(val as "asc" | "desc");
                onPriceSortChange(null);
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Мощность" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Мощность</SelectItem>
              <SelectItem value="asc">По возрастанию</SelectItem>
              <SelectItem value="desc">По убыванию</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Third Row: Filter buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-600 whitespace-nowrap">
          Фильтр:
        </span>
        {filters.map((f) => (
          <button
            key={f}
            className={`px-3 py-2 rounded-md border text-sm transition whitespace-nowrap ${selectedFilter === f
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white hover:bg-gray-50"
              }`}
            onClick={() => onFilterChange(f)}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}
