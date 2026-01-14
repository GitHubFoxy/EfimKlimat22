"use client";

import ItemCard from "@/components/ItemCard";
import EmptyState from "@/components/ui/EmptyState";

interface CatalogResultsGridProps {
  isLoading: boolean;
  results: any[];
  sortedResults: any[];
  status: "CanLoadMore" | "LoadingMore" | "LoadingFirstPage" | "Exhausted";
  selectedBrand?: string | null;
  onClearBrandFilter: () => void;
  onLoadMore: () => void;
}

export default function CatalogResultsGrid({
   isLoading,
   results,
   sortedResults,
   status,
   selectedBrand,
   onClearBrandFilter,
   onLoadMore,
 }: CatalogResultsGridProps) {
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
                <ItemCard e={e} variantCount={e.variantsCount} />
              </div>
            ))}
          </div>
          {status !== "Exhausted" && (
            <div className="flex justify-center mt-6">
              <button
                className="px-4 py-2 rounded-md border disabled:opacity-50"
                onClick={onLoadMore}
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
