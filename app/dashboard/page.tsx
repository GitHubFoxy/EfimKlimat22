"use client";

import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/dialog";

export default function Dashboard() {
  const generateUploadUrl = useMutation(api.main.generateUploadUrl);
  const addItem = useMutation(api.main.addItemsPublic);
  const deleteItem = useMutation(api.main.deleteItem);
  const items = useQuery(api.main.show_all_items);
  const categoriesRes = useQuery(api.main.show_all_categories);

  const [form, setForm] = useState({
    name: "",
    price: "",
    quantity: "1",
    description: "",
    sale: "0",
    category: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    itemId: Id<"items"> | null;
    itemName?: string;
  }>({ open: false, itemId: null, itemName: undefined });

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      let imageStorageId: Id<"_storage"> | undefined = undefined;
      if (file) {
        const url = await generateUploadUrl();
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const json = await res.json();
        imageStorageId = json.storageId as Id<"_storage">;
      }

      await addItem({
        name: form.name,
        price: Number(form.price),
        quantity: Number(form.quantity),
        description: form.description,
        sale: Number(form.sale),
        imageStorageId,
        category: form.category
          ? (form.category as Id<"categorys">)
          : undefined,
      });
      setMessage("Товар добавлен");
      setForm({
        name: "",
        price: "",
        quantity: "1",
        description: "",
        sale: "0",
        category: "",
      });
      setFile(null);
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

  return (
    <div className="px-6 py-6 md:px-12 lg:px-28 xl:max-w-[1280px] xl:mx-auto h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:justify-items-center">
        {/* Left: Form */}
        <div className="max-w-xl w-full p-6 border rounded-2xl bg-white  md:justify-self-center mx-auto">
          <h1 className="text-lg font-semibold mb-4">Добавить товар</h1>
          <form onSubmit={onSubmit} className="space-y-4">
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
              <Label htmlFor="price">Цена</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={form.price}
                onChange={onChange}
                required
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
              <Label htmlFor="sale">Скидка (%)</Label>
              <Input
                id="sale"
                name="sale"
                type="number"
                value={form.sale}
                onChange={onChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Input
                id="description"
                name="description"
                value={form.description}
                onChange={onChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Категория</Label>
              <Select
                value={form.category === "" ? "none" : form.category}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    category: value === "none" ? "" : value,
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
              <Label htmlFor="image">Изображение</Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Сохранение..." : "Добавить"}
            </Button>
            {message && <p className="text-sm text-gray-600">{message}</p>}
          </form>
        </div>

        {/* Right: Items list */}
        <div className="w-full md:justify-self-start">
          <h2 className="text-lg font-semibold mb-4">Все товары</h2>
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
                {categoriesRes?.categories?.map((c) => (
                  <SelectItem key={c._id} value={String(c._id)}>
                    {c.name}
                  </SelectItem>
                ))}
                <SelectItem value="none">Все категории</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {!items && (
            <p className="text-sm text-gray-500">Загрузка товаров...</p>
          )}
          {items &&
            (filterCategory
              ? items.items.filter((i) => String(i.category) === filterCategory)
                  .length
              : items.items.length) === 0 && (
              <p className="text-sm text-gray-500">Товары отсутствуют</p>
            )}
          {items &&
            (filterCategory
              ? items.items.filter((i) => String(i.category) === filterCategory)
                  .length > 0
              : items.items.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {(filterCategory
                  ? items.items.filter(
                      (i) => String(i.category) === filterCategory,
                    )
                  : items.items
                ).map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
                  >
                    <div className="p-4">
                      <div className="w-full h-40 bg-gray-100 rounded-2xl mb-3 flex items-center justify-center">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="max-h-32 object-contain"
                        />
                      </div>
                      <h3 className="text-sm font-medium text-gray-800 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-800">
                        {Number(item.price).toLocaleString("ru-RU")} руб.
                      </p>
                      <div className="mt-3 flex justify-between items-center">
                        <Button
                          variant="destructive"
                          onClick={() =>
                            setDeleteConfirm({
                              open: true,
                              itemId: item._id,
                              itemName: item.name,
                            })
                          }
                        >
                          Удалить
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
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
                ? `Вы уверены, что хотите удалить "${deleteConfirm.itemName}"? Это действие необратимо.`
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
