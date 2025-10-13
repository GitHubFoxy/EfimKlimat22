"use client";
import { Button } from "./ui/button";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import Card from "./ItemCard";

type FilterType = "Хиты продаж" | "Новинки" | "Скидки";
const filters = [
  "Хиты продаж",
  "Новинки",
  "Скидки",
] as const satisfies FilterType[];

function BestDealsContent({
  dataByFilter,
}: {
  dataByFilter: Record<FilterType, { items: any[] } | undefined>;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeFilter = filters[activeIndex];
  const data = dataByFilter[activeFilter];

  return (
    <section id="best-deals">
      <div className="flex flex-col mb-32">
        <h1 className="text-[12px] md:text-3xl font-[500] text-center md:mb-6 mb-2">
          Выгодные предложения
        </h1>
        <div className="mb-4 border-b-2 pb-4 border-light-gray flex relative items-center justify-center">
          <Button className="text-[12px] md:text-base hidden md:flex md:absolute right-0 bg-light-orange items-center">
            <Link href={"/catalog"}>Смотреть все</Link>
          </Button>
          <Button
            variant={"secondary"}
            className={cn(
              "text-[12px] md:text-base font-[400] text-black bg-transparent",
              activeIndex == 0 && "font-[700]",
            )}
            onClick={() => setActiveIndex(0)}
          >
            Хиты продаж
          </Button>
          <Button
            variant={"secondary"}
            className={cn(
              "text-[12px] md:text-base font-[400] text-black bg-transparent",
              activeIndex == 1 && "font-[700]",
            )}
            onClick={() => setActiveIndex(1)}
          >
            Новинки
          </Button>
          <Button
            variant={"secondary"}
            className={cn(
              "text-[12px] md:text-base font-[400] text-black bg-transparent",
              activeIndex == 2 && "font-[700]",
            )}
            onClick={() => setActiveIndex(2)}
          >
            Скидки
          </Button>
        </div>
        <div className="flex gap-6 flex-col md:flex-row">
          {!data && <div className="w-full text-center py-8">Загрузка...</div>}
          {data?.items?.map((e: any, index: number) => {
            return (
              <div
                key={index}
                className="  flex items-center flex-col justify-center w-full "
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

export default function BestDeals() {
  // Parent container: fetch all filters concurrently once
  const hits = useQuery(api.main.main_page_by_filter, {
    filter: "Хиты продаж",
  });
  const novinki = useQuery(api.main.main_page_by_filter, { filter: "Новинки" });
  const skidki = useQuery(api.main.main_page_by_filter, { filter: "Скидки" });

  if (!hits) {
    return (
      <section id="best-deals">
        <div className="flex flex-col mb-32">
          <h1 className="text-[12px] md:text-3xl font-[500] text-center md:mb-6 mb-2">
            Выгодные предложения
          </h1>
          <div className="w-full text-center py-8">Загрузка...</div>
        </div>
      </section>
    );
  }

  const dataByFilter: Record<FilterType, { items: any[] } | undefined> = {
    "Хиты продаж": hits,
    Новинки: novinki,
    Скидки: skidki,
  };

  return <BestDealsContent dataByFilter={dataByFilter} />;
}
