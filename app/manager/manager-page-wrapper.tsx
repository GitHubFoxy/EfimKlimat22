"use client";

import dynamic from "next/dynamic";

const ManagerPageClient = dynamic(
  () => import("./manager-page-client").then((m) => m.ManagerPageClient),
  {
    ssr: false,
  },
);

interface ManagerPageWrapperProps {
  itemsPreload: any;
  brandsPreload: any;
  categoriesPreload: any;
  initialParams: {
    tab: string;
    search: string;
    page: string | null;
  };
}

export function ManagerPageWrapper({
  itemsPreload,
  brandsPreload,
  categoriesPreload,
  initialParams,
}: ManagerPageWrapperProps) {
  return (
    <ManagerPageClient
      itemsPreload={itemsPreload}
      brandsPreload={brandsPreload}
      categoriesPreload={categoriesPreload}
      initialParams={initialParams}
    />
  );
}
