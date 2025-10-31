"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Icon } from "@/lib/consts";
import { useRole } from "@/hooks/useRole";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export default function ManagerHeader({ onLogout, onAddItem }: { onLogout: () => void; onAddItem?: () => void }) {
  const { managerId } = useRole();
  const managerDoc = useQuery(
    api.users.get_user_by_id,
    managerId ? ({ id: managerId as Id<"users"> } as const) : "skip",
  );

  return (
    <div className="flex items-center justify-between border-b pb-3">
      <div className="flex items-center gap-3">
        <Image src={Icon} alt="Логотип" width={80} height={36} />
        <div className="text-sm">
          <div className="font-semibold">Менеджер</div>
          <div className="text-muted-foreground">
            {managerDoc
              ? `${managerDoc.name} (${managerDoc.phone})`
              : "не выбран"}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onAddItem}>
          Добавить товар
        </Button>
        <Button variant="outline" onClick={onLogout}>
          Выйти
        </Button>
      </div>
    </div>
  );
}