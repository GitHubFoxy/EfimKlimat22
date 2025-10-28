"use client";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function Dashboard() {
  const generateUploadUrl = useMutation(api.dashboard.generateUploadUrl);
  const addItem = useMutation(api.dashboard.addItemsPublic);
  const deleteItem = useMutation(api.dashboard.deleteItem);
  const items = useQuery(api.dashboard.show_all_items);
  const categoriesRes = useQuery(api.dashboard.show_all_categories);

  const [form, setForm] = useState({
    brand: "",
    color: "",
    name: "",
    price: "",
    quantity: "1",
    description: "",
    sale: "0",
    variant: "",
    category: "",
    subcategory: "",
  });
  const [files, setFiles] = useState<File[] | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    itemId: Id<"items"> | null;
    itemName?: string;
  }>({ open: false, itemId: null, itemName: undefined });

  useEffect(() => {
    if (message) {
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    }
  }, [message]);

  // Load subcategories for the selected category
  const subcategoriesRes = useQuery(
    api.dashboard.show_subcategories_by_category,
    form.category
      ? ({ parent: form.category as Id<"categorys"> } as any)
      : undefined,
  );

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Price formatting: keep raw digits in state, show formatted value in input
  const formatPriceDisplay = (raw: string) => {
    if (!raw) return "";
    const num = Number(raw);
    if (Number.isNaN(num)) return "";
    return num.toLocaleString("ru-RU");
  };

  const onPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // keep only digits
    const digitsOnly = input.replace(/[^\d]/g, "");
    setForm((prev) => ({ ...prev, price: digitsOnly }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      let imageStorageIds: Id<"_storage">[] | undefined = undefined;

      // Upload all selected files and collect their storage IDs
      if (files?.length) {
        const ids = await Promise.all(
          files.map(async (f) => {
            const url = await generateUploadUrl();
            const res = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": f.type },
              body: f,
            });
            const json = await res.json();
            return json.storageId as Id<"_storage">;
          }),
        );
        imageStorageIds = ids;
      }

      await addItem({
        brand: form.brand ? form.brand : undefined,
        name: form.name,
        price: Number(form.price),
        quantity: Number(form.quantity),
        description: form.description,
        sale: Number(form.sale),
        variant: form.variant ? form.variant : undefined,
        imageStorageIds: imageStorageIds,
        category: form.category
          ? (form.category as Id<"categorys">)
          : undefined,
        subcategory: form.subcategory ? form.subcategory : undefined,
      });
      setMessage("Товар добавлен");
      setForm({
        brand: form.brand,
        name: "",
        price: "",
        quantity: "1",
        description: "",
        sale: "0",
        variant: "",
        category: form.category,
        subcategory: form.subcategory,
        color: "",
      });
      setFiles(undefined);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error(err);
      setMessage("Ошибка при добавлении товара");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDrop = (files: File[]) => {
    setFiles(files);
  };

  return (
    <div className="px-6 py-6 md:px-12 lg:px-28 xl:max-w-[1280px] xl:mx-auto h-screen">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Панель управления</h1>
        <a href="/manager" className="text-sm underline">Менеджер заказов</a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:justify-items-center">
        {/* Left: Form */}
        <div className="max-w-xl w-full p-6 border rounded-2xl bg-white  md:justify-self-center mx-auto">
          <h1 className="text-lg font-semibold mb-4">Добавить товар</h1>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-4">
                <Label htmlFor="category">Категория</Label>
                <Select
                  value={form.category === "" ? "none" : form.category}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      category: value === "none" ? "" : value,
                      // Reset subcategory when category changes
                      subcategory: "",
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Без категории</SelectItem>
                    {categoriesRes?.categories?.map((c) => (
                      <SelectItem key={c._id} value={String(c._id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory">Подкатегория</Label>
                <Select
                  value={form.subcategory === "" ? "none" : form.subcategory}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      subcategory: value === "none" ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Выберите подкатегорию" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Без подкатегории</SelectItem>
                    {subcategoriesRes?.subcategories.map((sc: any) => (
                      <SelectItem key={sc._id} value={String(sc.name)}>
                        {sc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <BrandSelection
              value={form.brand}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, brand: value }))
              }
            />
            <div className="space-y-2">
              <Label htmlFor="name">Название</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={onChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="variant">Мощность</Label>
              <Input
                id="variant"
                name="variant"
                value={form.variant}
                onChange={onChange}
                placeholder="Опционально"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Количество</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={form.quantity}
                onChange={onChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Цена</Label>
              <Input
                id="price"
                name="price"
                type="text"
                inputMode="numeric"
                value={formatPriceDisplay(form.price)}
                onChange={onPriceChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sale">Цвет</Label>
              <Input
                id="color"
                name="color"
                type="text"
                value={form.color}
                onChange={onChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={onChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Изображение</Label>
              <Dropzone
                accept={{ "image/*": [] }}
                maxFiles={10}
                maxSize={1024 * 1024 * 10}
                minSize={1024}
                onDrop={handleDrop}
                onError={console.error}
                src={files}
              >
                <DropzoneEmptyState />
                <DropzoneContent />
              </Dropzone>
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Сохранение..." : "Добавить"}
            </Button>
            {message && <p className="text-sm text-gray-600">{message}</p>}
          </form>
        </div>

        {/* Right: Items list extracted into component */}
        <DashboardItemsPanel
          items={items}
          categories={categoriesRes?.categories ?? []}
          onDelete={(item) =>
            setDeleteConfirm({
              open: true,
              itemId: item._id,
              itemName: `${item.brand} ${item.name} ${item.variant} кВт`,
            })
          }
        />
      </div>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm((prev) => ({ ...prev, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить товар?</DialogTitle>
            <DialogDescription>
              {deleteConfirm.itemName
                ? `Вы уверены, что хотите удалить ${deleteConfirm.itemName}? Это действие необратимо.`
                : "Вы уверены, что хотите удалить этот товар? Это действие необратимо."}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setDeleteConfirm({
                  open: false,
                  itemId: null,
                  itemName: undefined,
                })
              }
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  if (deleteConfirm.itemId) {
                    await deleteItem({ id: deleteConfirm.itemId });
                  }
                } catch (e) {
                  console.error(e);
                } finally {
                  setDeleteConfirm({
                    open: false,
                    itemId: null,
                    itemName: undefined,
                  });
                }
              }}
            >
              Удалить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type ItemDoc = {
  _id: Id<"items">;
  _creationTime: number;
  color?: string | undefined;
  brand?: string | undefined;
  variant?: string | undefined;
  imagesUrls?: string[] | undefined;
  imageStorageIds?: Id<"_storage">[] | undefined;
  rating?: number | undefined;
  orders?: number | undefined;
  category?: Id<"categorys"> | undefined;
  sale?: number | undefined;
  subcategory?: string | undefined;
  name: string;
  price: number;
  lowerCaseName: string;
  quantity: number;
  description: string;
};

type ItemsPanelProps = {
  items:
    | {
        items: ItemDoc[];
        status: number;
      }
    | undefined;
  categories: Array<{ _id: string; name: string }>;
  onDelete: (item: ItemDoc) => void;
};

function DashboardItemsPanel({ items, categories, onDelete }: ItemsPanelProps) {
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const filtered = (items?.items ?? [])
    .filter((i) =>
      filterCategory ? String(i.category) === filterCategory : true,
    )
    .filter((i) =>
      search
        ? i.name?.toLowerCase().includes(search.trim().toLowerCase())
        : true,
    );

  return (
    <div className="w-full md:justify-self-start">
      <h2 className="text-lg font-semibold mb-4">Все товары</h2>

      {/* Search input */}
      <div className="mb-4">
        <Label htmlFor="search">Поиск по названию</Label>
        <Input
          id="search"
          placeholder="Введите название товара"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-2"
        />
      </div>

      {/* Category filter */}
      <div className="mb-4">
        <Label htmlFor="filterCategory">Фильтр по категории</Label>
        <Select
          value={filterCategory === "" ? "none" : filterCategory}
          onValueChange={(value) =>
            setFilterCategory(value === "none" ? "" : value)
          }
        >
          <SelectTrigger className="mt-2 w-full">
            <SelectValue placeholder="Все категории" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Все категории</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c._id} value={String(c._id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!items && <p className="text-sm text-gray-500">Загрузка товаров...</p>}
      {items && filtered.length === 0 && (
        <p className="text-sm text-gray-500">Товары отсутствуют</p>
      )}

      {items && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {filtered.map((item) => (
            <ItemCard key={item._id} item={item} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export const ItemCard = ({
  item,
  onDelete,
}: {
  item: ItemDoc;
  onDelete: (item: ItemDoc) => void;
}) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <div>
        <Carousel className="w-full   rounded-2xl  flex items-center justify-center">
          <CarouselContent>
            {(item.imagesUrls && item.imagesUrls.length > 0
              ? item.imagesUrls
              : ["/not-found.jpg"]
            ).map((img, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card className="border-none shadow-none">
                    <CardContent className="flex aspect-square items-center justify-center ">
                      <img
                        src={img ?? "/not-found.jpg"}
                        alt={`${item.brand} ${item.name} ${item.variant} кВт`}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="translate-x-[130px] translate-y-[110px] " />
          <CarouselNext className="-translate-x-[130px] translate-y-[110px] " />
        </Carousel>
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-800 mb-1 truncate">
            {`${item.brand} ${item.name} ${item.variant} кВт`}
          </h3>
          <p className="text-sm text-gray-800">
            {Number(item.price).toLocaleString("ru-RU")} руб.
          </p>
          <div className="mt-3 flex justify-between items-center">
            <Button variant="destructive" onClick={() => onDelete(item)}>
              Удалить
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BrandSelection = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const brands = useQuery(api.dashboard.show_all_brands);
  const addBrand = useMutation(api.dashboard.add_brand);
  const [brandSearch, setBrandSearch] = useState("");
  const [newBrandName, setNewBrandName] = useState("");

  return (
    <div className="space-y-2">
      <Label htmlFor="brand">Бренд</Label>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Выберите бренд" />
        </SelectTrigger>
        <SelectContent>
          <Input
            placeholder="Поиск бренда"
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
          />
          <div className="py-2">
            {(
              brands?.filter((b: any) =>
                b.name.toLowerCase().includes(brandSearch.trim().toLowerCase()),
              ) ?? []
            ).map((b: any) => (
              <SelectItem key={b._id} value={String(b.name)}>
                {b.name}
              </SelectItem>
            ))}
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <div className="flex justify-center">
                <Button className="" type="button">
                  Добавить бренд
                </Button>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить бренд</DialogTitle>
                <DialogDescription>
                  Введите название бренда и нажмите "Сохранить".
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="newBrandName">Название бренда</Label>
                <Input
                  id="newBrandName"
                  placeholder="Например, BAXI"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" type="button">
                  Отмена
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    addBrand({ name: newBrandName });
                    onChange(newBrandName);
                    setNewBrandName("");
                  }}
                >
                  Сохранить
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </SelectContent>
      </Select>
    </div>
  );
};
