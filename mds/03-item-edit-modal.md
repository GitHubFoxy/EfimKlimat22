# Item Edit Modal Implementation

## Overview
Create a dialog/modal for editing items directly from the items table. Uses react-hook-form with zod validation.

## Files to Create/Modify

### 1. `app/manager/item-edit-dialog.tsx` - NEW FILE

```typescript
"use client";

import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";

// Validation schema
const itemFormSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  sku: z.string().min(1, "Артикул обязателен"),
  description: z.string().min(1, "Описание обязательно"),
  brandId: z.string().min(1, "Выберите бренд"),
  categoryId: z.string().min(1, "Выберите категорию"),
  price: z.coerce.number().min(0, "Цена должна быть положительной"),
  oldPrice: z.coerce.number().min(0).optional(),
  quantity: z.coerce.number().int().min(0, "Количество должно быть >= 0"),
  status: z.enum(["active", "draft", "archived", "preorder"]),
  inStock: z.boolean(),
  discountAmount: z.coerce.number().min(0).optional(),
});

type ItemFormValues = z.infer<typeof itemFormSchema>;

interface ItemEditDialogProps {
  item: {
    _id: Id<"items">;
    name: string;
    sku: string;
    description: string;
    brandId: Id<"brands">;
    categoryId: Id<"categories">;
    price: number;
    oldPrice?: number;
    quantity: number;
    status: "active" | "draft" | "archived" | "preorder";
    inStock: boolean;
    discountAmount?: number;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ItemEditDialog({ item, open, onOpenChange }: ItemEditDialogProps) {
  const updateItem = useMutation(api.manager.update_item);
  const brands = useQuery(api.manager.list_brands_all);
  const categories = useQuery(api.manager.list_categories_all);

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      brandId: "",
      categoryId: "",
      price: 0,
      oldPrice: undefined,
      quantity: 0,
      status: "draft",
      inStock: true,
      discountAmount: undefined,
    },
  });

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        sku: item.sku,
        description: item.description,
        brandId: item.brandId,
        categoryId: item.categoryId,
        price: item.price,
        oldPrice: item.oldPrice,
        quantity: item.quantity,
        status: item.status,
        inStock: item.inStock,
        discountAmount: item.discountAmount,
      });
    }
  }, [item, form]);

  const onSubmit = async (values: ItemFormValues) => {
    if (!item) return;

    try {
      await updateItem({
        id: item._id,
        name: values.name,
        sku: values.sku,
        description: values.description,
        brandId: values.brandId as Id<"brands">,
        categoryId: values.categoryId as Id<"categories">,
        price: values.price,
        quantity: values.quantity,
        status: values.status,
        inStock: values.inStock,
      });
      toast.success("Товар обновлен");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update item:", error);
      toast.error("Ошибка при обновлении товара");
    }
  };

  const statusLabels = {
    active: "Активный",
    draft: "Черновик",
    archived: "В архиве",
    preorder: "Предзаказ",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактирование товара</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* SKU */}
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Артикул (SKU)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Brand */}
              <FormField
                control={form.control}
                name="brandId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Бренд</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите бренд" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {brands?.map((brand) => (
                          <SelectItem key={brand._id} value={brand._id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Категория</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Цена (₽)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quantity */}
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Количество</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Статус</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* In Stock Toggle */}
              <FormField
                control={form.control}
                name="inStock"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <FormLabel className="text-base">В наличии</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Description - full width */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Сохранение..." : "Сохранить"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### 2. `app/manager/items-table-content.tsx` - Add dialog state

```typescript
"use client";

import { useState } from "react";
// ... other imports
import { ItemEditDialog } from "./item-edit-dialog";

export function ItemsTableContent({
  itemsPreload,
  searchQuery = "",
}: ItemsTableContentProps) {
  // ... existing state

  // Edit dialog state
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleDeleteItem = async (id: any, name: string) => {
    if (window.confirm(`Удалить товар "${name}"?`)) {
      // Call delete mutation
      toast.success("Товар удален");
    }
  };

  const columns = getItemColumns({
    onEdit: handleEditItem,
    onDelete: handleDeleteItem,
  });

  // ... rest of component

  return (
    <>
      {/* Filters, Sort controls, DataTable, Pagination */}
      
      {/* Edit Dialog */}
      <ItemEditDialog
        item={editingItem}
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setEditingItem(null);
        }}
      />
    </>
  );
}
```

### 3. `convex/manager.ts` - Ensure update_item handles all fields

The existing `update_item` mutation should already work, but verify it includes:

```typescript
export const update_item = mutation({
  args: {
    id: v.id("items"),
    name: v.optional(v.string()),
    sku: v.optional(v.string()),
    description: v.optional(v.string()),
    brandId: v.optional(v.id("brands")),
    categoryId: v.optional(v.id("categories")),
    price: v.optional(v.number()),
    oldPrice: v.optional(v.number()),
    quantity: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("draft"),
        v.literal("archived"),
        v.literal("preorder"),
      ),
    ),
    inStock: v.optional(v.boolean()),
    discountAmount: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...args }) => {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Item not found");

    const patch: any = { ...args };
    
    // Update slug if name changed
    if (args.name) {
      patch.slug = args.name
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
    }

    // Update searchText if name or sku changed
    if (args.name || args.sku) {
      const name = args.name ?? existing.name;
      const sku = args.sku ?? existing.sku;
      patch.searchText = `${name} ${sku}`.toLowerCase();
    }

    await ctx.db.patch(id, patch);
    return id;
  },
});
```

## Dependencies

Ensure these packages are installed:
```bash
bun add react-hook-form @hookform/resolvers zod
```

Ensure shadcn/ui components exist:
```bash
bunx shadcn@latest add dialog form switch
```

## Testing Checklist

- [ ] Dialog opens when clicking "Редактировать товар" in table dropdown
- [ ] Form is pre-filled with current item values
- [ ] Validation shows errors for required fields
- [ ] Brand and category dropdowns load correctly
- [ ] Saving updates the item in database
- [ ] Toast notification shows on success/error
- [ ] Dialog closes after successful save
- [ ] Cancel button closes dialog without saving
- [ ] Table updates reactively after save (Convex reactive queries)
