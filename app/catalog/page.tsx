"use client";

import { Footer } from "@/components/Footer";
import FreeConsultmant from "@/components/FreeConsultmant";
import Header from "@/components/Header/header";
import ItemCard from "@/components/ItemCard";
import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Doc, Id } from "@/convex/_generated/dataModel";
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
}: {
  categoryId: Id<"categorys">;
  filter: "Хиты продаж" | "Новинки" | "Со скидкой";
}) {
  const { results, status, isLoading, loadMore } = usePaginatedQuery(
    api.catalog.catalog_query_based_on_category_and_filter,
    { category: categoryId, filter },
    { initialNumItems: 12 },
  );
  useEffect(() => {
    console.log(status);
  }, [status]);

  return (
    <div className="px-4 mb-8">
      {isLoading && results.length === 0 ? (
        <div className="text-center py-8">Загрузка...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {results.map((e, index: number) => (
            <div
              key={e._id?.toString?.() ?? index}
              className="flex flex-col items-center bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 p-4 md:p-5"
            >
              <ItemCard e={e} />
            </div>
          ))}
        </div>
      )}
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
    </div>
  );
}

export default function Catalog() {
  const params = useSearchParams();
  const query = useMemo(() => params.get("query") ?? "", [params]);

  // Search results (from header search link)
  const searchResults = useQuery(api.main.search_items, { query }) ?? [];

  // Categories and filters
  const categoriesData = useQuery(api.catalog.catalog_list_all_categories);
  const categories = categoriesData ?? [];
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [selectedFilter, setSelectedFilter] = useState<
    "Хиты продаж" | "Новинки" | "Со скидкой"
  >("Новинки");

  useEffect(() => {
    if (!selectedCategoryId && categories.length > 0) {
      setSelectedCategoryId(categories[0]._id);
    }
  }, [categories, selectedCategoryId]);

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
              <div className="col-span-full text-center py-6 text-gray-500">
                Ничего не найдено
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
      {/* Filters & Categories */}
      <div className="px-4 mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Категория:</span>
          <Select
            value={selectedCategoryId ?? undefined}
            onValueChange={(val) => setSelectedCategoryId(val)}
          >
            <SelectTrigger className="min-w-[220px]">
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

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 mr-2">Фильтр:</span>
          {["Новинки", "Хиты продаж", "Со скидкой"].map((f) => (
            <button
              key={f}
              className={`px-3 py-2 rounded-md border text-sm transition ${
                selectedFilter === f
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
      {/* Paginated catalog results by category & filter */}
      {selectedCategoryId ? (
        <CatalogResults
          categoryId={selectedCategoryId as Id<"categorys">}
          filter={selectedFilter}
        />
      ) : (
        <div className="px-4 mb-8">
          <div className="text-center py-8">Загрузка категорий...</div>
        </div>
      )}

      <FreeConsultmant />
      <Footer />
    </div>
  );
}
