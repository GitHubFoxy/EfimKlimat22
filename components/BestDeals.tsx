import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { BestDealsClient } from "./BestDealsClient";

export default async function BestDeals() {
  // Preload all three filters on the server for better SEO and initial load
  const [preloadedHits, preloadedNewItems, preloadedSales] = await Promise.all([
    preloadQuery(api.main.main_page_by_filter, { filter: "Хиты продаж" }),
    preloadQuery(api.main.main_page_by_filter, { filter: "Новинки" }),
    preloadQuery(api.main.main_page_by_filter, { filter: "Скидки" }),
  ]);

  return (
    <BestDealsClient
      preloadedHits={preloadedHits}
      preloadedNewItems={preloadedNewItems}
      preloadedSales={preloadedSales}
    />
  );
}
