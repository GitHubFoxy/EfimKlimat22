"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import { X } from "lucide-react";

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

  const hasActiveFilters =
    selectedCategoryId ||
    selectedSubcategory ||
    selectedBrand ||
    priceSort ||
    variantSort ||
    selectedFilter !== "Новинки";

  const clearAll = () => {
    onCategoryChange(null);
    onSubcategoryChange(null);
    onBrandChange(null);
    onPriceSortChange(null);
    onVariantSortChange(null);
    onFilterChange("Новинки");
  };

  return (
    <div className="mb-8 space-y-6 rounded-xl border bg-white p-4 shadow-sm md:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Category */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">
            Категория
          </Label>
          <Select
            value={selectedCategoryId ?? "all"}
            onValueChange={(val) =>
              onCategoryChange(val === "all" ? null : (val as Id<"categories">))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Все товары" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все товары</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subcategory */}
        <div className="space-y-2">
          <Label
            className={cn(
              "text-xs font-medium text-muted-foreground",
              subcategories.length === 0 && "opacity-50",
            )}
          >
            Подкатегория
          </Label>
          <Select
            disabled={subcategories.length === 0}
            value={selectedSubcategory ?? "none"}
            onValueChange={(val) =>
              onSubcategoryChange(
                val === "none" ? null : (val as Id<"categories">),
              )
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  subcategories.length === 0 ? "-" : "Выберите подкатегорию"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Все подкатегории</SelectItem>
              {subcategories.map((sc) => (
                <SelectItem key={sc._id} value={sc._id}>
                  {sc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Brand */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">
            Бренд
          </Label>
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
              {brands.map((brand) => (
                <SelectItem key={brand._id} value={brand._id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sorting Group */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">
            Сортировка
          </Label>
          <div className="grid grid-cols-2 gap-2">
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
      </div>

      {/* Filter Tags */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t pt-4 mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700 mr-2">
            Показать:
          </span>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                selectedFilter === f
                  ? "bg-slate-900 text-white shadow-md hover:bg-slate-800"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200",
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 self-start sm:self-auto"
          >
            <X className="w-4 h-4 mr-2" />
            Сбросить фильтры
          </Button>
        )}
      </div>
    </div>
  );
}
