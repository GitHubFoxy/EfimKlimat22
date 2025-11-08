"use client";

import Header from "@/components/Header/Header";
import ItemCard from "@/components/ItemCard";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
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

export default function ItemPage() {
  const params = useParams();
  const idParam = params?.id;

  // If there's no id param, show a friendly message (shouldn't happen for valid routes).
  if (!idParam) {
    return (
      <div className="px-6 py-6 md:px-12 lg:px-28 xl:max-w-[1280px] xl:mx-auto">
        <Header />
        <div className="p-6 text-center">Invalid item id</div>
      </div>
    );
  }

  // Convex expects an `Id<"items">` type, not a plain string. Cast the route param to the Convex Id type.
  // We cast via `unknown` to satisfy TypeScript while keeping the runtime value unchanged.
  const convexId = idParam as unknown as Id<"items">;

  // Fetch the item. While loading the result is `undefined`, if not found it's `null`,
  // otherwise it's the item `Doc<"items">`.
  const item = useQuery(api.dashboard.show_item, { id: convexId }) as
    | Doc<"items">
    | null
    | undefined;

  // Fetch related items by brand and collection
  const relatedItems = useQuery(
    api.dashboard.show_items_by_brand_and_collection,
    item
      ? { itemId: convexId, brand: item.brand, collection: item.collection }
      : "skip",
  ) as Doc<"items">[] | undefined;

  return (
    <div className="px-6 py-6 md:px-12 lg:px-28 xl:max-w-[1280px] xl:mx-auto">
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
                  {item.brand ?? ""} {item.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        ) : (
          <div className="text-sm text-gray-500">Загрузка навигации...</div>
        )}
      </div>

      {/* Main content / states */}
      {item === undefined ? (
        <div className="p-8 text-center">Загрузка...</div>
      ) : item === null ? (
        <div className="p-8 text-center">Товар не найден</div>
      ) : (
        <>
          <div className="flex flex-col lg:flex-row gap-4 mt-4 items-start">
            <div className="flex flex-col gap-4 flex-1">
              <div className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100">
                <div className="max-w-sm mx-auto">
                  <ItemCard e={item} />
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
                              href={`/catalog/${relatedItem._id}`}
                              className="block min-w-[80px]"
                            >
                              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors">
                                <img
                                  src={
                                    relatedItem.imagesUrls?.[0] ||
                                    "/not-found.jpg"
                                  }
                                  alt={relatedItem.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">
                              {relatedItem.brand} {relatedItem.name}{" "}
                              {relatedItem.variant}
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
                {item.brand ?? ""} {item.name} {item.variant ?? ""}
              </h1>

              <p className="text-lg font-medium mb-2 text-amber-600">
                {item.price} руб.
              </p>

              <p className="text-sm text-gray-500 mb-4">
                В наличии: {item.quantity ?? "—"}
              </p>

              <div className="text-sm text-gray-700 whitespace-pre-line mb-4">
                {item.description ?? "Описание отсутствует"}
              </div>

              {item.sale ? (
                <span className="text-sm text-red-600 font-medium">
                  Скидка: {item.sale}%
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
