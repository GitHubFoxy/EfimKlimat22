import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export type Section = "orders" | "consultants" | "items" | "users";

interface ManagerFiltersProps {
  section: Section;
  setSection: (section: Section) => void;
  role?: string | null;
  
  // Order/Consultant specific
  showStatusFilter?: boolean;
  statusValue?: string;
  onStatusChange?: (value: any) => void;
  statusOptions?: { value: string; label: string }[];
  
  // View Mine/All specific
  showViewFilter?: boolean;
  viewMine?: boolean;
  setViewMine?: (viewMine: boolean) => void;
  managerId?: string | null;
}

export default function ManagerFilters({
  section,
  setSection,
  role,
  showStatusFilter,
  statusValue,
  onStatusChange,
  statusOptions,
  showViewFilter,
  viewMine,
  setViewMine,
  managerId,
}: ManagerFiltersProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:flex-wrap mb-6">
      <div className="flex items-center gap-4">
        <Label className="text-sm whitespace-nowrap">Раздел:</Label>
        <Select value={section} onValueChange={(v: Section) => setSection(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="orders">Заказы</SelectItem>
            <SelectItem value="consultants">Консультации</SelectItem>
            <SelectItem value="items">Товары</SelectItem>
            {role === "admin" && (
              <SelectItem value="users">Пользователи</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {showStatusFilter && statusOptions && onStatusChange && (
        <div className="flex items-center gap-4">
          <Label className="text-sm whitespace-nowrap">Фильтр по статусу:</Label>
          <Select value={statusValue} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showViewFilter && setViewMine && (
        <div className="flex items-center gap-3">
          <span className="text-sm whitespace-nowrap">Просмотр:</span>
          <Select
            value={viewMine ? "mine" : "all"}
            onValueChange={(v: string) => {
              if (v === "mine") {
                if (!managerId) {
                  alert("Сначала выберите аккаунт менеджера");
                  setViewMine(false);
                } else {
                  setViewMine(true);
                }
              } else {
                setViewMine(false);
              }
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="mine">Мои</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}