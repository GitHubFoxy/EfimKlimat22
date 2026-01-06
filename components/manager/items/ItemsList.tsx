import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EmptyState from "@/components/ui/EmptyState";
import ImageField from "@/components/manager/ImageField";
import SubcategorySelect from "./SubcategorySelect";
import type { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { toast } from "sonner";

interface ItemEdit {
  name: string;
  brand: string;
  price: number;
  quantity: number;
  description: string;
  variant: string;
  collection: string;
  sale: number;
  category?: Id<"categories">;
  subcategory?: Id<"categories">;
}

interface ItemsListProps {
  items: any[] | undefined;
  categories: any[] | undefined;
  itemSearch: string;
  showOnlyIncomplete: boolean;
  onAddItem: () => void;
  onClearSearch: () => void;
  updateItem: (args: any) => Promise<any>;
  deleteItemWithImages: (args: { id: Id<"items"> }) => Promise<any>;
  updateItemImages: (args: {
    itemId: Id<"items">;
    imageStorageIds: Id<"_storage">[];
  }) => Promise<any>;
  generateUploadUrl: () => Promise<string>;
}

export default function ItemsList({
  items,
  categories,
  itemSearch,
  showOnlyIncomplete,
  onAddItem,
  onClearSearch,
  updateItem,
  deleteItemWithImages,
  updateItemImages,
  generateUploadUrl,
}: ItemsListProps) {
  const [itemEdits, setItemEdits] = useState<Record<string, ItemEdit>>({});
  const [imagesDraft, setImagesDraft] = useState<
    Record<string, { url: string; storageId: Id<"_storage"> }[]>
  >({});

  const getEdit = (it: any): ItemEdit => {
    const existing = itemEdits[String(it._id)];
    return (
      existing ?? {
        name: it.name,
        brand: it.brand ?? "",
        price: it.price,
        quantity: it.quantity,
        description: it.description,
        variant: it.variant ?? "",
        collection: it.collection ?? "",
        sale: it.sale ?? 0,
        category: it.category ?? undefined,
        subcategory: it.subcategory ?? undefined,
      }
    );
  };

  const hasChanges = (it: any, ed: ItemEdit) => {
    return (
      ed.name !== it.name ||
      (ed.brand || undefined) !== (it.brand ?? undefined) ||
      ed.price !== it.price ||
      ed.quantity !== it.quantity ||
      ed.description !== it.description ||
      (ed.variant || undefined) !== (it.variant ?? undefined) ||
      (ed.collection || undefined) !== (it.collection ?? undefined) ||
      (ed.sale || undefined) !== (it.sale ?? undefined) ||
      (ed.category || undefined) !== (it.category ?? undefined) ||
      (ed.subcategory || undefined) !== (it.subcategory ?? undefined)
    );
  };

  const computePatch = (it: any, ed: ItemEdit) => {
    const patch: any = {};
    if (ed.name !== it.name) patch.name = ed.name;
    if (ed.brand !== (it.brand ?? "")) patch.brand = ed.brand;
    if (ed.price !== it.price) patch.price = ed.price;
    if (ed.quantity !== it.quantity) patch.quantity = ed.quantity;
    if (ed.description !== it.description) patch.description = ed.description;
    if (ed.variant !== (it.variant ?? "")) patch.variant = ed.variant;
    if (ed.collection !== (it.collection ?? ""))
      patch.collection = ed.collection;
    if (ed.sale !== (it.sale ?? 0)) patch.sale = ed.sale;
    if ((ed.category || undefined) !== (it.category ?? undefined))
      patch.category = ed.category ?? undefined;
    if ((ed.subcategory || undefined) !== (it.subcategory ?? undefined))
      patch.subcategory = ed.subcategory ?? undefined;
    return patch;
  };

  const formatVariant = (value: string): string => {
    if (!value) return value;
    const trimmed = value.trim();
    if (trimmed && !trimmed.includes("кВт")) {
      return trimmed + " кВт";
    }
    return trimmed;
  };

  const getImagesFor = (
    it: any
  ): { url: string; storageId: Id<"_storage"> }[] => {
    const key = String(it._id);
    const draft = imagesDraft[key];
    if (draft) return draft;
    const urls: string[] = (it.imagesUrls ?? []) as string[];
    const sids: Id<"_storage">[] = (it.imageStorageIds ??
      []) as Id<"_storage">[];
    const len = Math.min(urls.length, sids.length);
    const zipped: { url: string; storageId: Id<"_storage"> }[] = [];
    for (let i = 0; i < len; i++) {
      zipped.push({ url: urls[i], storageId: sids[i] });
    }
    return zipped;
  };

  const hasImagesChanges = (it: any): boolean => {
    const key = String(it._id);
    const draft = imagesDraft[key];
    if (!draft) return false;
    const existingIds: string[] = (
      (it.imageStorageIds ?? []) as Id<"_storage">[]
    ).map((x) => x.toString());
    const nextIds: string[] = draft.map((x) => x.storageId.toString());
    if (existingIds.length !== nextIds.length) return true;
    for (let i = 0; i < existingIds.length; i++) {
      if (existingIds[i] !== nextIds[i]) return true;
    }
    return false;
  };

  const all = items ?? [];
  const q = itemSearch.trim();
  const isIncomplete = (it: any) => {
    return (
      !it.name ||
      it.name.trim() === "" ||
      !it.description ||
      it.description.trim() === "" ||
      it.price === undefined ||
      it.price === null ||
      it.price <= 0 ||
      it.quantity === undefined ||
      it.quantity === null ||
      it.quantity < 0 ||
      !it.variant ||
      it.variant.trim() === ""
    );
  };

  const filtered = all.filter((it) => {
    if (showOnlyIncomplete) {
      if (!isIncomplete(it)) {
        return false;
      }
    }
    return true;
  });

  if (all.length === 0 && !q) {
    return (
      <EmptyState
        title="Товаров нет"
        description="Добавьте первый товар, чтобы начать управление каталогом."
        primaryAction={{
          label: "Добавить товар",
          onClick: onAddItem,
        }}
      />
    );
  }
  if (filtered.length === 0 && (q || showOnlyIncomplete)) {
    return (
      <EmptyState
        title="Ничего не найдено"
        description="Измените условия поиска или сбросьте фильтры."
        primaryAction={{
          label: "Добавить товар",
          onClick: onAddItem,
        }}
        secondaryActions={[
          {
            label: "Очистить поиск",
            onClick: onClearSearch,
          },
        ]}
      />
    );
  }

  return (
    <div className="space-y-3 mt-4">
      {filtered.map((it) => (
        <div key={it._id} className="border rounded p-3 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Название</Label>
              <Input
                value={getEdit(it).name}
                onChange={(e) =>
                  setItemEdits((prev) => ({
                    ...prev,
                    [String(it._id)]: {
                      ...getEdit(it),
                      name: e.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Бренд</Label>
              <Input
                value={getEdit(it).brand}
                onChange={(e) =>
                  setItemEdits((prev) => ({
                    ...prev,
                    [String(it._id)]: {
                      ...getEdit(it),
                      brand: e.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Категория</Label>
              <Select
                value={
                  getEdit(it).category
                    ? String(getEdit(it).category)
                    : "__none__"
                }
                onValueChange={(v: string) =>
                  setItemEdits((prev) => ({
                    ...prev,
                    [String(it._id)]: {
                      ...getEdit(it),
                      category:
                        v === "__none__"
                          ? undefined
                          : (v as unknown as Id<"categories">),
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Без категории</SelectItem>
                  {Array.isArray(categories) &&
                    categories.map((c: any) => (
                      <SelectItem key={String(c._id)} value={String(c._id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Подкатегория</Label>
              <SubcategorySelect
                categoryId={getEdit(it).category}
                value={getEdit(it).subcategory}
                onChange={(next) =>
                  setItemEdits((prev) => ({
                    ...prev,
                    [String(it._id)]: {
                      ...getEdit(it),
                      subcategory: next,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Цена</Label>
              <Input
                type="number"
                value={getEdit(it).price}
                onChange={(e) =>
                  setItemEdits((prev) => ({
                    ...prev,
                    [String(it._id)]: {
                      ...getEdit(it),
                      price: Number(e.target.value),
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Количество</Label>
              <Input
                type="number"
                value={getEdit(it).quantity}
                onChange={(e) =>
                  setItemEdits((prev) => ({
                    ...prev,
                    [String(it._id)]: {
                      ...getEdit(it),
                      quantity: Number(e.target.value),
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Описание</Label>
              <Textarea
                value={getEdit(it).description}
                onChange={(e) =>
                  setItemEdits((prev) => ({
                    ...prev,
                    [String(it._id)]: {
                      ...getEdit(it),
                      description: e.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Мощность</Label>
              <Input
                value={getEdit(it).variant}
                onChange={(e) =>
                  setItemEdits((prev) => ({
                    ...prev,
                    [String(it._id)]: {
                      ...getEdit(it),
                      variant: formatVariant(e.target.value),
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Коллекция</Label>
              <Input
                placeholder="Похожие товары должны иметь одинаковую коллекцию"
                value={getEdit(it).collection}
                onChange={(e) =>
                  setItemEdits((prev) => ({
                    ...prev,
                    [String(it._id)]: {
                      ...getEdit(it),
                      collection: e.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Скидка %</Label>
              <Input
                type="number"
                value={getEdit(it).sale}
                onChange={(e) =>
                  setItemEdits((prev) => ({
                    ...prev,
                    [String(it._id)]: {
                      ...getEdit(it),
                      sale: Number(e.target.value),
                    },
                  }))
                }
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <ImageField
                itemName={getEdit(it).name}
                images={getImagesFor(it)}
                max={15}
                onDropFilesAction={async (fs) => {
                  const current = getImagesFor(it);
                  const remaining = 15 - current.length;
                  const files = fs
                    .filter((f) => f.type.startsWith("image/"))
                    .slice(0, Math.max(0, remaining));
                  if (!files.length) return;
                  const uploaded = await Promise.all(
                    files.map(async (f) => {
                      const url = await generateUploadUrl();
                      const res = await fetch(url, {
                        method: "POST",
                        headers: { "Content-Type": f.type },
                        body: f,
                      });
                      const json = await res.json();
                      const storageId = json.storageId as Id<"_storage">;
                      return { storageId, url: URL.createObjectURL(f) };
                    })
                  );
                  setImagesDraft((prev) => ({
                    ...prev,
                    [String(it._id)]: [...current, ...uploaded],
                  }));
                }}
                onChangeAction={(next) =>
                  setImagesDraft((prev) => ({
                    ...prev,
                    [String(it._id)]: next as {
                      url: string;
                      storageId: Id<"_storage">;
                    }[],
                  }))
                }
              />
              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  disabled={!hasImagesChanges(it)}
                  onClick={async () => {
                    const next = getImagesFor(it);
                    const ids = next
                      .map((x) => x.storageId)
                      .filter(Boolean) as Id<"_storage">[];
                    await updateItemImages({
                      itemId: it._id,
                      imageStorageIds: ids,
                    });
                    next.forEach((img) => {
                      if (img.url?.startsWith("blob:")) {
                        try {
                          URL.revokeObjectURL(img.url);
                        } catch {}
                      }
                    });
                    setImagesDraft((prev) => {
                      const nextDraft = { ...prev };
                      delete nextDraft[String(it._id)];
                      return nextDraft;
                    });
                    toast.success("Изображения обновлены");
                  }}
                >
                  Сохранить изображения
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              disabled={!hasChanges(it, getEdit(it))}
              onClick={async () => {
                const patch = computePatch(it, getEdit(it));
                if (Object.keys(patch).length === 0) return;
                const args: any = { itemId: it._id, ...patch };
                await updateItem(args);
                setItemEdits((prev) => {
                  const next = { ...prev };
                  delete next[String(it._id)];
                  return next;
                });
                toast.success("Товар обновлен");
              }}
            >
              Сохранить
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setItemEdits((prev) => {
                  const next = { ...prev };
                  delete next[String(it._id)];
                  return next;
                })
              }
            >
              Сброс
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                const ok = window.confirm(
                  "Удалить товар? Это действие нельзя отменить."
                );
                if (ok) {
                  deleteItemWithImages({ id: it._id });
                  toast.success("Товар удален");
                }
              }}
            >
              Удалить
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}