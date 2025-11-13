"use client";

import { Footer } from "@/components/Footer";
import FreeConsultmant from "@/components/FreeConsultmant";
import Header from "@/components/Header/Header";
import ItemCard from "@/components/ItemCard";
import EmptyState from "@/components/ui/EmptyState";
import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Doc, Id } from "@/convex/_generated/dataModel";
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

// Ensure this page renders dynamically to avoid prerender errors during production builds
export const dynamic = "force-dynamic";

function CatalogResults({
  categoryId,
  filter,
  subcategory,
  priceSort,
  variantSort,
  selectedBrand,
  onClearBrandFilter,
}: {
  categoryId: Id<"categorys">;
  filter: "Хиты продаж" | "Новинки" | "Со скидкой";
  subcategory?: string | null;
  priceSort?: "asc" | "desc" | null;
  variantSort?: "asc" | "desc" | null;
  selectedBrand?: string | null;
  onClearBrandFilter: () => void;
}) {
  const { results, status, isLoading, loadMore } = usePaginatedQuery(
    api.catalog.catalog_query_based_on_category_and_filter,
    {
      category: categoryId,
      filter,
      subcategory: (subcategory as Id<"subcategorys">) ?? undefined,
    },
    { initialNumItems: 12 },
  );

  // Apply client-side filtering and sorting
  const sortedResults = useMemo(() => {
    let sorted = [...results];

    // Filter by brand if selected
    if (selectedBrand && selectedBrand !== "all") {
      sorted = sorted.filter((item) => item.brand === selectedBrand);
    }

    // Sort by price if selected
    if (priceSort === "asc") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (priceSort === "desc") {
      sorted.sort((a, b) => b.price - a.price);
    }

    // Sort by variant (as number) if selected
    if (variantSort === "asc") {
      sorted.sort((a, b) => {
        const variantA = parseFloat(a.variant) || 0;
        const variantB = parseFloat(b.variant) || 0;
        return variantA - variantB;
      });
    } else if (variantSort === "desc") {
      sorted.sort((a, b) => {
        const variantA = parseFloat(a.variant) || 0;
        const variantB = parseFloat(b.variant) || 0;
        return variantB - variantA;
      });
    }

    return sorted;
  }, [results, priceSort, variantSort, selectedBrand]);

  return (
    <div className="px-4 mb-8">
      {isLoading && results.length === 0 ? (
        <div className="text-center py-8">Загрузка...</div>
      ) : results.length === 0 ? (
        <EmptyState
          title="В этой категории пока нет товаров по выбранному фильтру"
          description="Если вам нужна помощь с подбором, свяжитесь с консультантом"
          secondaryActions={[
            { label: "Связаться с консультантом", href: "#free-consult" },
          ]}
        />
      ) : sortedResults.length === 0 ? (
        <EmptyState
          title={`Товары бренда "${selectedBrand}" не найдены`}
          description="Попробуйте выбрать другой бренд или сбросьте фильтр"
          primaryAction={{
            label: "Сбросить фильтр по бренду",
            onClick: onClearBrandFilter,
          }}
          secondaryActions={[
            { label: "Связаться с консультантом", href: "#free-consult" },
          ]}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {sortedResults.map((e, index: number) => (
              <div
                key={e._id?.toString?.() ?? index}
                className="flex flex-col items-center bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 p-4 md:p-5"
              >
                <ItemCard e={e} />
              </div>
            ))}
          </div>
          {status !== "Exhausted" && (
            <div className="flex justify-center mt-6">
              <button
                className="px-4 py-2 rounded-md border  disabled:opacity-50"
                onClick={() => loadMore(12)}
              >
                Показать еще
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function Catalog() {
  const router = useRouter();
  const params = useSearchParams();
  const query = useMemo(() => params.get("query") ?? "", [params]);
  const sessionId = useCartSessionId();

  // Cart data for floating button
  const itemsData = useQuery(
    api.cart.listItems,
    sessionId ? { sessionId } : "skip",
  );

  // Search results (from header search link)
  const searchResults = useQuery(api.main.search_items, { query }) ?? [];

  // Categories and filters
  const categoriesData = useQuery(api.catalog.catalog_list_all_categories);
  const categories = categoriesData ?? [];

  // Brands data
  const brandsData = useQuery(api.dashboard.show_all_brands);
  const brands = brandsData ?? [];
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
    <div className="px-6 py-2 md:px-12 lg:px-28 xl:max-w-[1280px] xl:mx-auto">
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
      <div id="catalog-filters" className="px-4 mb-6 flex flex-col gap-4">
        {/* First Row: Category, Subcategory, Filter */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 whitespace-nowrap">Категория:</span>
            <Select
              value={selectedCategoryId ?? undefined}
              onValueChange={(val) => setSelectedCategoryId(val)}
            >
              <SelectTrigger className="min-w-[200px]">
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c: any) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 whitespace-nowrap">Подкатегория:</span>
            <Select
              value={selectedSubcategory ?? undefined}
              onValueChange={(val) => setSelectedSubcategory(val)}
            >
              <SelectTrigger className="min-w-[200px]">
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

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 whitespace-nowrap">Фильтр:</span>
            {["Новинки", "Хиты продаж", "Со скидкой"].map((f) => (
              <button
                key={f}
                className={`px-3 py-2 rounded-md border text-sm transition whitespace-nowrap ${selectedFilter === f
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white hover:bg-gray-50"
                  }`}
                onClick={() => setSelectedFilter(f as any)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Second Row: Brand Filter, Price Sort and Variant Sort */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 whitespace-nowrap">Бренд:</span>
            <Select
              value={selectedBrand ?? "all"}
              onValueChange={(val) => setSelectedBrand(val === "all" ? null : val)}
            >
              <SelectTrigger className="min-w-[180px]">
                <SelectValue placeholder="Все бренды" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все бренды</SelectItem>
                {brands.map((brand: any) => (
                  <SelectItem key={brand._id} value={brand.name}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 whitespace-nowrap">Сортировка по цене:</span>
            <Select
              value={priceSort ?? "none"}
              onValueChange={(val) => {
                if (val === "none") {
                  setPriceSort(null);
                } else {
                  setPriceSort(val as "asc" | "desc");
                  setVariantSort(null);
                }
              }}
            >
              <SelectTrigger className="min-w-[180px]">
                <SelectValue placeholder="Без сортировки" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Без сортировки</SelectItem>
                <SelectItem value="asc">По возрастанию</SelectItem>
                <SelectItem value="desc">По убыванию</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 whitespace-nowrap">Сортировка по варианту:</span>
            <Select
              value={variantSort ?? "none"}
              onValueChange={(val) => {
                if (val === "none") {
                  setVariantSort(null);
                } else {
                  setVariantSort(val as "asc" | "desc");
                  setPriceSort(null);
                }
              }}
            >
              <SelectTrigger className="min-w-[180px]">
                <SelectValue placeholder="Без сортировки" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Без сортировки</SelectItem>
                <SelectItem value="asc">По возрастанию</SelectItem>
                <SelectItem value="desc">По убыванию</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Disclaimer message for gas-related subcategories */}
      {selectedSubcategory === "k974vfejt24xdkaf0dvmx731957se0s5" && (
        <div className="px-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-900">
            <p className="font-medium">Все цены указаны с дымоходом</p>
          </div>
        </div>
      )}
      {/* Paginated catalog results by category & filter */}
      {selectedCategoryId ? (
        <CatalogResults
          categoryId={selectedCategoryId as Id<"categorys">}
          filter={selectedFilter}
          subcategory={
            selectedSubcategory === "none" ? null : selectedSubcategory
          }
          priceSort={priceSort}
          variantSort={variantSort}
          selectedBrand={selectedBrand}
          onClearBrandFilter={() => setSelectedBrand(null)}
        />
      ) : (
        <div className="px-4 mb-8">
          <div className="text-center py-8">Загрузка категорий...</div>
        </div>
      )}

      <div id="free-consult">
        <FreeConsultmant />
      </div>
      <Footer />

      {/* Floating Checkout Button */}
      {itemsData && itemsData.count > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => router.push("/checkout")}
            className="bg-light-orange hover:bg-amber-500 rounded-full h-14 px-6 shadow-lg flex items-center gap-3"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium">
              Оформить заказ ({itemsData.count})
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {itemsData.subtotal.toLocaleString("ru-RU")} ₽
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
