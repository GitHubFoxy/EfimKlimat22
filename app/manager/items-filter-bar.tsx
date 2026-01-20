"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

type ItemStatus = "active" | "draft" | "preorder";

interface ItemsFilterBarProps {
  brandId: Id<"brands"> | undefined;
  categoryId: Id<"categories"> | undefined;
  status: ItemStatus | undefined;
  onBrandChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onClearFilters: () => void;
}

export function ItemsFilterBar({
  brandId,
  categoryId,
  status,
  onBrandChange,
  onCategoryChange,
  onStatusChange,
  onClearFilters,
}: ItemsFilterBarProps) {
  const [parentCategoryId, setParentCategoryId] = useState<Id<"categories"> | undefined>(undefined);
  const brands = useQuery(api.manager.list_brands_all);
  const catHierarchy = useQuery(api.manager.list_categories_hierarchy);
  
  const parents = catHierarchy?.parents || [];
  const childrenMap = catHierarchy?.childrenMap || {};
  const currentSubcategories = parentCategoryId ? (childrenMap[parentCategoryId.toString()] || []) : [];
  
  // When parent category changes, reset subcategory
  const handleParentCategoryChange = (parentId: string) => {
    if (parentId === "__all__") {
      setParentCategoryId(undefined);
      onCategoryChange("__all__");
    } else {
      setParentCategoryId(parentId as Id<"categories">);
      onCategoryChange("__all__");
    }
  };
  
  // When subcategory changes
  const handleSubcategoryChange = (subcatId: string) => {
    onCategoryChange(subcatId);
  };

  const hasActiveFilters = brandId || categoryId || status;

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-lg mb-4">
      <span className="text-sm font-medium text-gray-700">Фильтры:</span>

      {/* Brand Filter */}
      <Select value={brandId ?? "__all__"} onValueChange={onBrandChange}>
        <SelectTrigger className="w-[180px] bg-white">
          <SelectValue placeholder="Все бренды" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Все бренды</SelectItem>
          {brands?.map((brand) => (
            <SelectItem key={brand._id} value={brand._id}>
              {brand.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Parent Category Filter */}
      <Select value={parentCategoryId ?? "__all__"} onValueChange={handleParentCategoryChange}>
        <SelectTrigger className="w-[200px] bg-white">
          <SelectValue placeholder="Все категории" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Все категории</SelectItem>
          {parents.map((cat) => (
            <SelectItem key={cat._id} value={cat._id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Subcategory Filter */}
      {parentCategoryId && (
        <Select value={categoryId ?? "__all__"} onValueChange={handleSubcategoryChange}>
          <SelectTrigger className="w-[200px] bg-white">
            <SelectValue placeholder="Все подкатегории" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Все подкатегории</SelectItem>
            {currentSubcategories.map((cat) => (
              <SelectItem key={cat._id} value={cat._id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Status Filter */}
      <Select value={status ?? "__all__"} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[150px] bg-white">
          <SelectValue placeholder="Все статусы" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Все статусы</SelectItem>
          <SelectItem value="active">Активный</SelectItem>
          <SelectItem value="draft">Черновик</SelectItem>
          <SelectItem value="preorder">Предзаказ</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4 mr-1" />
          Сбросить
        </Button>
      )}

      {/* Active filters count */}
      {hasActiveFilters && (
        <span className="text-xs text-gray-500 ml-auto">
          Активных фильтров:{" "}
          {[brandId, categoryId, status].filter(Boolean).length}
        </span>
      )}
    </div>
  );
}
