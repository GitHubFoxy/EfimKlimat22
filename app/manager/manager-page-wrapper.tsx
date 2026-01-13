"use client";

import dynamic from "next/dynamic";

const ManagerPageClient = dynamic(() => import("./manager-page-client").then(m => m.ManagerPageClient), {
  ssr: false,
});

interface ManagerPageWrapperProps {
  itemsPreload: any;
  brandsPreload: any;
  categoriesPreload: any;
}

export function ManagerPageWrapper({
  itemsPreload,
  brandsPreload,
  categoriesPreload,
}: ManagerPageWrapperProps) {
  return (
    <ManagerPageClient
      itemsPreload={itemsPreload}
      brandsPreload={brandsPreload}
      categoriesPreload={categoriesPreload}
    />
  );
}
