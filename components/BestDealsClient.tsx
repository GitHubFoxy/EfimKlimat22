"use client";
import { Button } from "./ui/button";
import Link from "next/link";
import { useState } from "react";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import Card from "./ItemCard";

type FilterType = "Хиты продаж" | "Новинки" | "Скидки";

export function BestDealsClient({
  preloadedHits,
  preloadedNewItems,
  preloadedSales,
}: {
  preloadedHits: Preloaded<typeof api.main.main_page_by_filter>;
  preloadedNewItems: Preloaded<typeof api.main.main_page_by_filter>;
  preloadedSales: Preloaded<typeof api.main.main_page_by_filter>;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Use preloaded data - server rendered and becomes reactive after hydration
  const hits = usePreloadedQuery(preloadedHits);
  const newItems = usePreloadedQuery(preloadedNewItems);
  const sales = usePreloadedQuery(preloadedSales);

  const data = activeIndex === 0 ? hits : activeIndex === 1 ? newItems : sales;

  return (
    <section id="best-deals">
      <div className="flex flex-col mb-32">
        <h1 className="text-[12px] md:text-3xl font-medium text-center md:mb-6 mb-2">
          Выгодные предложения
        </h1>
        <div className="mb-4 border-b-2 pb-4 border-light-gray flex relative items-center justify-center">
          <Button className="text-[12px] md:text-base hidden md:flex md:absolute right-0 bg-light-orange items-center">
            <Link href={"/catalog"}>Смотреть все</Link>
          </Button>
          <Button
            variant={"secondary"}
            className={cn(
              "text-[12px] md:text-base font-normal text-black bg-transparent",
              activeIndex == 0 && "font-[700]",
            )}
            onClick={() => setActiveIndex(0)}
          >
            Хиты продаж
          </Button>
          <Button
            variant={"secondary"}
            className={cn(
              "text-[12px] md:text-base font-normal text-black bg-transparent",
              activeIndex == 1 && "font-[700]",
            )}
            onClick={() => setActiveIndex(1)}
          >
            Новинки
          </Button>
          <Button
            variant={"secondary"}
            className={cn(
              "text-[12px] md:text-base font-normal text-black bg-transparent",
              activeIndex == 2 && "font-[700]",
            )}
            onClick={() => setActiveIndex(2)}
          >
            Скидки
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {!data && <div className="col-span-full text-center py-8">Загрузка...</div>}
           {data?.items?.map((e: any, index: number) => {
             return (
               <div
                 key={index}
                 className="flex items-center flex-col justify-center"
               >
                 <Card e={e} />
               </div>
             );
           })}
         </div>
      </div>
    </section>
  );
}
