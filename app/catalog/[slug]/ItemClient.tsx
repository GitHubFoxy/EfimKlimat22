"use client";

import Header from "@/components/Header/Header";
import ItemCard from "@/components/ItemCard";
import { Preloaded, usePreloadedQuery, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import FreeConsultmant from "@/components/FreeConsultmant";
import { Footer } from "@/components/Footer";
import Image from "next/image";

export function ItemClient({
  preloadedItem,
  itemSlug,
}: {
  preloadedItem: Preloaded<typeof api.catalog.show_item_by_slug>;
  itemSlug: string;
}) {
  // Use preloaded item data - server rendered and becomes reactive after hydration
  const item = usePreloadedQuery(preloadedItem);

  // Fetch related items by brand, category, and collection (client-side for reactivity)
   const relatedItems = useQuery(
     api.catalog.show_items_by_brand_and_collection,
     item && item.brandId && item.categoryId
       ? { 
           itemId: item._id, 
           brandId: item.brandId, 
           categoryId: item.categoryId,
           collection: item.collection,
         }
       : "skip",
   ) as Doc<"items">[] | undefined;

  return (
    <div className="px-6 py-6 md:px-12 lg:px-28 xl:max-w-7xl xl:mx-auto">
      <Header />

      {/* Breadcrumbs */}
      <div className="mt-4 mb-6">
        {item ? (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Главная</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/catalog">Каталог</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbPage>
                  {item.brandName ? item.brandName : ""} {item.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        ) : (
          <div className="text-sm text-gray-500">Загрузка навигации...</div>
        )}
      </div>

      {/* Main content */}
      {item === null ? (
        <div className="p-8 text-center">Товар не найден</div>
      ) : (
        <>
          <div className="flex flex-col lg:flex-row gap-4 mt-4 items-start">
            <div className="flex flex-col gap-4 flex-1">
                <div className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100">
                   <div className="max-w-sm mx-auto">
                     <ItemCard e={item} variantCount={item.variantsCount ?? (relatedItems ? relatedItems.length + 1 : undefined)} />
                   </div>
                 </div>

              {/* Related Items Section */}
              {relatedItems && relatedItems.length > 0 && (
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
                  <TooltipProvider>
                    <h2 className="text-xl font-semibold mb-4">
                      Товары из коллекции
                    </h2>
                    <div className="grid grid-cols-4 gap-3 overflow-x-auto">
                      {relatedItems.map((relatedItem) => (
                        <Tooltip key={relatedItem._id}>
                          <TooltipTrigger asChild>
                            <Link
                              href={`/catalog/${relatedItem.slug}`}
                              className="block min-w-20"
                            >
                              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors">
                                <Image
                                  src={
                                    item.imagesUrl?.[0] ||
                                    "/not-found.jpg"
                                  }
                                  alt={relatedItem.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">
                              {relatedItem.name}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </TooltipProvider>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex-1">
              <h1 className="text-2xl font-semibold mb-2">
                 {item.brandName ? item.brandName : ""} {item.name}
               </h1>

              <p className="text-lg font-medium mb-2 text-amber-600">
                {formatPrice(item.price)} руб.
              </p>

              <p className="text-sm text-gray-500 mb-4">
                В наличии: {item.quantity ?? "—"}
              </p>

              <div className="text-sm text-gray-700 whitespace-pre-line mb-4">
                {item.description ?? "Описание отсутствует"}
              </div>

              {/* Specifications Table */}
              {item.specifications && Object.keys(item.specifications).length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 border-b pb-2">
                    Характеристики
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(item.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                        <span className="text-gray-500">{key}</span>
                        <span className="font-medium text-gray-900">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {item.discountAmount ? (
                <span className="text-sm text-red-600 font-medium">
                  Скидка: {item.discountAmount}%
                </span>
              ) : null}
            </div>
          </div>

          {/* Free consultation section */}
          <div className="mt-10">
            <FreeConsultmant />
          </div>

          {/* Footer */}
          <div className="mt-12">
            <Footer />
          </div>
        </>
      )}
    </div>
  );
}
