import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface SubcategorySelectProps {
  categoryId?: Id<"categorys">;
  value?: Id<"subcategorys">;
  onChange: (v?: Id<"subcategorys">) => void;
  noneLabel?: string;
  onAddNew?: () => void;
  onEdit?: (id: Id<"subcategorys">) => void;
}

export default function SubcategorySelect(props: SubcategorySelectProps) {
  const { categoryId, value, onChange, noneLabel, onAddNew, onEdit } = props;
  const res = useQuery(api.dashboard.show_subcategories_by_category, {
    parent: categoryId ?? undefined,
  });
  const subcategories = res?.subcategories ?? [];
  const selectValue = value ? String(value) : "__none__";
  return (
    <>
      <Select
        value={selectValue}
        onValueChange={(v) => {
          if (v === "__add_new__") {
            onAddNew?.();
          } else {
            onChange(
              v === "__none__" ? undefined : (v as unknown as Id<"subcategorys">)
            );
          }
        }}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">
            {noneLabel ?? "Без подкатегории"}
          </SelectItem>
          {subcategories.map((s: any) => (
            <SelectItem key={String(s._id)} value={String(s._id)}>
              {s.order}. {s.name}
            </SelectItem>
          ))}
          {onAddNew && (
            <SelectItem value="__add_new__">Добавить новую</SelectItem>
          )}
        </SelectContent>
      </Select>
      {value && onEdit && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(value)}
          title="Настройки подкатегории"
        >
          <Settings className="w-4 h-4" />
        </Button>
      )}
    </>
  );
}