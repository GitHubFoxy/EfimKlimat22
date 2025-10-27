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
                  {item.brand ?? ""} "{item.name}"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4 items-start">
            <div className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100">
              <div className="max-w-sm mx-auto">
                <ItemCard e={item} />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h1 className="text-2xl font-semibold mb-2">
                {item.brand ?? ""} "{item.name}" {item.variant ?? ""}
              </h1>

              <p className="text-lg font-medium mb-4 text-amber-600">
                {item.price} руб.
              </p>

              <div className="text-sm text-gray-700 whitespace-pre-line mb-4">
                {item.description ?? "Описание отсутствует"}
              </div>

              <div className="flex gap-4 items-center">
                {item.sale ? (
                  <span className="text-sm text-red-600 font-medium">
                    Скидка: {item.sale}%
                  </span>
                ) : null}
                <span className="text-sm text-gray-500">
                  В наличии: {item.quantity ?? "—"}
                </span>
              </div>

              {item.category ? (
                <p className="mt-4 text-sm text-gray-500">
                  Категория: {String(item.category)}
                </p>
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
