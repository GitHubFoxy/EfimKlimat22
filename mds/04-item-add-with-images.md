# Item Add with Images Implementation

## Overview
Create a dialog for adding new items with image upload support using Convex storage.

## Files to Create/Modify

### 1. `convex/manager.ts` - Add image upload mutations

```typescript
import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Generate upload URL for Convex storage
export const generate_upload_url = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Get image URL from storage ID
export const get_image_url = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});

// Update item images
export const update_item_images = mutation({
  args: {
    itemId: v.id("items"),
    imageStorageIds: v.array(v.id("_storage")),
  },
  handler: async (ctx, { itemId, imageStorageIds }) => {
    const existing = await ctx.db.get(itemId);
    if (!existing) throw new Error("Item not found");

    // Get URLs for all storage IDs
    const imagesUrl = await Promise.all(
      imageStorageIds.map(async (id) => {
        const url = await ctx.storage.getUrl(id);
        return url ?? "";
      }),
    );

    await ctx.db.patch(itemId, {
      imageStorageIds,
      imagesUrl: imagesUrl.filter(Boolean),
    });

    return itemId;
  },
});

// Create item with images
export const create_item_with_images = mutation({
  args: {
    name: v.string(),
    sku: v.string(),
    description: v.string(),
    brandId: v.id("brands"),
    categoryId: v.id("categories"),
    price: v.number(),
    quantity: v.number(),
    status: v.union(
      v.literal("active"),
      v.literal("draft"),
      v.literal("archived"),
      v.literal("preorder"),
    ),
    inStock: v.boolean(),
    imageStorageIds: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const { imageStorageIds, ...itemData } = args;

    // Generate slug from name
    const slug = itemData.name
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");

    // Get image URLs if storage IDs provided
    let imagesUrl: string[] = [];
    if (imageStorageIds && imageStorageIds.length > 0) {
      imagesUrl = await Promise.all(
        imageStorageIds.map(async (id) => {
          const url = await ctx.storage.getUrl(id);
          return url ?? "";
        }),
      );
      imagesUrl = imagesUrl.filter(Boolean);
    }

    const itemId = await ctx.db.insert("items", {
      ...itemData,
      slug,
      ordersCount: 0,
      searchText: `${itemData.name} ${itemData.sku}`.toLowerCase(),
      imageStorageIds: imageStorageIds ?? [],
      imagesUrl,
    });

    return itemId;
  },
});

// Delete item images from storage
export const delete_item_with_images = mutation({
  args: { id: v.id("items") },
  handler: async (ctx, { id }) => {
    const item = await ctx.db.get(id);
    if (!item) throw new Error("Item not found");

    // Delete images from storage
    if (item.imageStorageIds && item.imageStorageIds.length > 0) {
      await Promise.all(
        item.imageStorageIds.map(async (storageId) => {
          try {
            await ctx.storage.delete(storageId);
          } catch {
            // Ignore deletion errors
          }
        }),
      );
    }

    // Soft delete the item
    await ctx.db.patch(id, { status: "archived" });
  },
});
```

### 2. `app/manager/image-upload.tsx` - NEW FILE

```typescript
"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

interface ImageUploadProps {
  images: { url: string; storageId: Id<"_storage"> }[];
  onChange: (images: { url: string; storageId: Id<"_storage"> }[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function ImageUpload({
  images,
  onChange,
  maxImages = 10,
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const generateUploadUrl = useMutation(api.manager.generate_upload_url);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (disabled || isUploading) return;

      const imageFiles = files.filter((f) => f.type.startsWith("image/"));
      const remainingSlots = maxImages - images.length;
      const filesToUpload = imageFiles.slice(0, remainingSlots);

      if (filesToUpload.length === 0) return;

      setIsUploading(true);

      try {
        const uploaded = await Promise.all(
          filesToUpload.map(async (file) => {
            const uploadUrl = await generateUploadUrl();
            const response = await fetch(uploadUrl, {
              method: "POST",
              headers: { "Content-Type": file.type },
              body: file,
            });
            const { storageId } = await response.json();
            return {
              url: URL.createObjectURL(file),
              storageId: storageId as Id<"_storage">,
            };
          }),
        );

        onChange([...images, ...uploaded]);
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setIsUploading(false);
      }
    },
    [images, onChange, maxImages, disabled, isUploading, generateUploadUrl],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const files = Array.from(e.dataTransfer.files);
      uploadFiles(files);
    },
    [uploadFiles],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    uploadFiles(files);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const newImages = [...images];
    const [moved] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, moved);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <p className="text-sm text-gray-500">Загрузка...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <p className="text-sm text-gray-600">
              Перетащите изображения сюда или
            </p>
            <label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                disabled={disabled || images.length >= maxImages}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || images.length >= maxImages}
                asChild
              >
                <span>Выберите файлы</span>
              </Button>
            </label>
            <p className="text-xs text-gray-400">
              {images.length} / {maxImages} изображений
            </p>
          </div>
        )}
      </div>

      {/* Image preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, index) => (
            <div
              key={img.storageId}
              className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100"
            >
              <img
                src={img.url}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay with controls */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {index > 0 && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={() => moveImage(index, index - 1)}
                  >
                    ←
                  </Button>
                )}
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white hover:bg-red-500"
                  onClick={() => removeImage(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
                {index < images.length - 1 && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={() => moveImage(index, index + 1)}
                  >
                    →
                  </Button>
                )}
              </div>

              {/* Main image badge */}
              {index === 0 && (
                <span className="absolute top-1 left-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded">
                  Главное
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 3. `app/manager/item-add-dialog.tsx` - NEW FILE

```typescript
"use client";

import { useState } from "react";
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
import { ImageUpload } from "./image-upload";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";

const itemFormSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  sku: z.string().min(1, "Артикул обязателен"),
  description: z.string().min(1, "Описание обязательно"),
  brandId: z.string().min(1, "Выберите бренд"),
  categoryId: z.string().min(1, "Выберите категорию"),
  price: z.coerce.number().min(0, "Цена должна быть положительной"),
  quantity: z.coerce.number().int().min(0, "Количество должно быть >= 0"),
  status: z.enum(["active", "draft", "preorder"]),
  inStock: z.boolean(),
});

type ItemFormValues = z.infer<typeof itemFormSchema>;

interface ItemAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ItemAddDialog({ open, onOpenChange }: ItemAddDialogProps) {
  const createItem = useMutation(api.manager.create_item_with_images);
  const brands = useQuery(api.manager.list_brands_all);
  const categories = useQuery(api.manager.list_categories_all);

  const [images, setImages] = useState<{ url: string; storageId: Id<"_storage"> }[]>([]);

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      brandId: "",
      categoryId: "",
      price: 0,
      quantity: 0,
      status: "draft",
      inStock: true,
    },
  });

  const onSubmit = async (values: ItemFormValues) => {
    try {
      await createItem({
        name: values.name,
        sku: values.sku,
        description: values.description,
        brandId: values.brandId as Id<"brands">,
        categoryId: values.categoryId as Id<"categories">,
        price: values.price,
        quantity: values.quantity,
        status: values.status,
        inStock: values.inStock,
        imageStorageIds: images.map((img) => img.storageId),
      });

      toast.success("Товар создан");
      form.reset();
      setImages([]);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create item:", error);
      toast.error("Ошибка при создании товара");
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
      setImages([]);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить товар</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-2">
              <FormLabel>Изображения</FormLabel>
              <ImageUpload
                images={images}
                onChange={setImages}
                maxImages={10}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название *</FormLabel>
                    <FormControl>
                      <Input placeholder="Газовый котел Bosch..." {...field} />
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
                    <FormLabel>Артикул (SKU) *</FormLabel>
                    <FormControl>
                      <Input placeholder="BOSCH-123" {...field} />
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
                    <FormLabel>Бренд *</FormLabel>
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
                    <FormLabel>Категория *</FormLabel>
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
                    <FormLabel>Цена (₽) *</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
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
                    <FormLabel>Количество *</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
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
                        <SelectItem value="draft">Черновик</SelectItem>
                        <SelectItem value="active">Активный</SelectItem>
                        <SelectItem value="preorder">Предзаказ</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* In Stock */}
              <FormField
                control={form.control}
                name="inStock"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <FormLabel>В наличии</FormLabel>
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

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание *</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Подробное описание товара..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Создание..." : "Создать товар"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### 4. `app/manager/page.tsx` - Add "Add Item" button

```typescript
// In the items section of the manager page
import { ItemAddDialog } from "./item-add-dialog";

// Add state
const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

// Add button in header
<div className="flex justify-between items-center mb-4">
  <h2 className="text-xl font-semibold">Товары</h2>
  <Button onClick={() => setIsAddDialogOpen(true)}>
    <Plus className="w-4 h-4 mr-2" />
    Добавить товар
  </Button>
</div>

// Add dialog
<ItemAddDialog
  open={isAddDialogOpen}
  onOpenChange={setIsAddDialogOpen}
/>
```

## Testing Checklist

- [ ] "Add Item" button opens dialog
- [ ] Form validation works for required fields
- [ ] Image drag-and-drop works
- [ ] Image file picker works
- [ ] Images can be reordered
- [ ] Images can be removed
- [ ] First image is marked as "main"
- [ ] Max images limit is enforced (10)
- [ ] Item creates successfully with images
- [ ] Item creates successfully without images
- [ ] Toast notifications appear
- [ ] Dialog closes and resets after creation
- [ ] New item appears in table immediately (Convex reactivity)

## Notes

- Images are uploaded to Convex storage before form submission
- Blob URLs are used for preview, actual URLs are fetched on save
- Consider adding image compression before upload for large files
- The `imageStorageIds` array maintains image order
