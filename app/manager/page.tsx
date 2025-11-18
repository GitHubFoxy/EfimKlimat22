"use client";

import { usePaginatedQuery, useMutation, useQuery } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRole } from "@/hooks/useRole";
import ManagerHeader from "@/components/manager/ManagerHeader";
import ImageField from "@/components/manager/ImageField";
import EmptyState from "@/components/ui/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type Status = "pending" | "processing" | "done";
const ORDER_STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "pending", label: "Ожидает" },
  { value: "processing", label: "В процессе" },
  { value: "done", label: "Готово" },
];
type ConsultantStatus = "new" | "processing" | "done";
const CONSULTANT_STATUS_OPTIONS: { value: ConsultantStatus; label: string }[] =
  [
    { value: "new", label: "Ожидает" },
    { value: "processing", label: "В процессе" },
    { value: "done", label: "Готово" },
  ];

export default function ManagerPage() {
  const router = useRouter();
  const { role, setRole, managerId, setManagerId } = useRole();

  // Auth verification: verify the stored managerId exists and has correct role
  const verifiedUser = useQuery(
    api.users.get_user_by_id,
    managerId ? { id: managerId as Id<"users"> } : "skip",
  );

  // Auth guard: verify user exists and has manager/admin role
  useEffect(() => {
    const token =
      typeof window !== "undefined" && localStorage.getItem("userToken");
    const storedManagerId =
      typeof window !== "undefined" && localStorage.getItem("managerId");

    if (!token || !storedManagerId) {
      // Clear any stale data
      if (typeof window !== "undefined") {
        localStorage.removeItem("userToken");
        localStorage.removeItem("managerId");
        localStorage.removeItem("role");
      }
      router.replace("/auth");
      return;
    }
  }, [router]);

  // Verify user with backend
  useEffect(() => {
    if (verifiedUser === null) {
      // User not found - redirect to auth and clear storage
      if (typeof window !== "undefined") {
        localStorage.removeItem("userToken");
        localStorage.removeItem("managerId");
        localStorage.removeItem("role");
      }
      router.replace("/auth");
    } else if (
      verifiedUser &&
      verifiedUser.role !== "manager" &&
      verifiedUser.role !== "admin"
    ) {
      // User found but wrong role - redirect to auth
      if (typeof window !== "undefined") {
        localStorage.removeItem("userToken");
        localStorage.removeItem("managerId");
        localStorage.removeItem("role");
      }
      router.replace("/auth");
    }
  }, [verifiedUser, router]);
  const [status, setStatus] = useState<Status>("pending");
  const [viewMine, setViewMine] = useState(false);
  const [section, setSection] = useState<
    "orders" | "consultants" | "items" | "users"
  >("orders");
  const {
    results,
    loadMore,
    status: loadStatus,
  } = usePaginatedQuery(
    api.manager.list_orders_by_status,
    { status },
    { initialNumItems: 10 },
  );
  const {
    results: myResults,
    loadMore: loadMoreMine,
    status: loadStatusMine,
  } = usePaginatedQuery(
    api.manager.list_my_orders_by_status,
    managerId
      ? ({ managerId: managerId as Id<"users">, status } as const)
      : "skip",
    { initialNumItems: 10 },
  );
  const updateStatus = useMutation(api.manager.update_order_status);
  const claim = useMutation(api.manager.claim_order);
  const unclaim = useMutation(api.manager.unclaim_order);
  // Consultants data & actions
  const [cStatus, setCStatus] = useState<ConsultantStatus>("new");
  const {
    results: consultantsAll,
    loadMore: loadMoreConsultantsAll,
    status: loadStatusConsultantsAll,
  } = usePaginatedQuery(
    api.consultants.list_consultants_by_status,
    { status: cStatus },
    { initialNumItems: 10 },
  );
  const {
    results: consultantsMine,
    loadMore: loadMoreConsultantsMine,
    status: loadStatusConsultantsMine,
  } = usePaginatedQuery(
    api.consultants.list_my_consultants_by_status,
    managerId
      ? ({ managerId: managerId as Id<"users">, status: cStatus } as const)
      : "skip",
    { initialNumItems: 10 },
  );
  const updateConsultantStatus = useMutation(
    api.consultants.update_consultant_status,
  );
  const claimConsultant = useMutation(api.consultants.claim_consultant);
  const unclaimConsultant = useMutation(api.consultants.unclaim_consultant);

  // Items admin
  // Filters for items section (must be declared before query usage)
  const [itemCategoryFilter, setItemCategoryFilter] = useState<
    Id<"categorys"> | undefined
  >(undefined);
  const [itemSubcategoryFilter, setItemSubcategoryFilter] = useState<
    Id<"subcategorys"> | undefined
  >(undefined);
  const {
    results: items,
    loadMore: loadMoreItems,
    status: loadStatusItems,
  } = usePaginatedQuery(
    api.admin_items.list_items_paginated,
    { category: itemCategoryFilter, subcategory: itemSubcategoryFilter },
    { initialNumItems: 10 },
  );
  // Use dashboard image-aware mutations for create & delete
  const generateUploadUrl = useMutation(api.dashboard.generateUploadUrl);
  const addItemWithImages = useMutation(api.dashboard.addItemsPublic);
  const deleteItemWithImages = useMutation(api.dashboard.deleteItem);
  const updateItemImages = useMutation(api.dashboard.update_item_images);
  const createItem = useMutation(api.admin_items.create_item); // kept for updates without images (legacy)
  const updateItem = useMutation(api.admin_items.update_item);
  // const deleteItem = useMutation(api.admin_items.delete_item);

  // Mutations for creating categories and subcategories
  const createCategory = useMutation(api.dashboard.create_category);
  const createSubcategory = useMutation(api.dashboard.create_subcategory);
  const [newItem, setNewItem] = useState({
    name: "",
    brand: "",
    price: 0,
    quantity: 0,
    description: "",
    variant: "0",
    collection: "",
    sale: 0,
  });
  // New images state for create flow: ordered array of { url (object URL), storageId }
  const [newImages, setNewImages] = useState<
    { url: string; storageId: Id<"_storage"> }[]
  >([]);
  // Add Item dialog state and helpers
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);

  // Category/Subcategory creation dialog states
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [showAddSubcategoryDialog, setShowAddSubcategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const defaultNewItem = {
    name: "",
    brand: "",
    price: 0,
    quantity: 0,
    description: "",
    variant: "default",
    collection: "",
    sale: 0,
  };
  const isAddItemFormDirty = () => {
    const ni = newItem;
    return (
      ni.name !== "" ||
      ni.brand !== "" ||
      ni.price !== 0 ||
      ni.quantity !== 0 ||
      ni.description !== "" ||
      (ni.variant && ni.variant !== "default") ||
      ni.collection !== "" ||
      (typeof ni.sale === "number" && ni.sale !== 0) ||
      newImages.length > 0
    );
  };
  // Deep-link: auto-open dialog when visiting /manager#add-item
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#add-item") {
      setShowAddItemDialog(true);
    }
  }, []);

  // Unified create handler used by both "Подтвердить" and "Сохранить" buttons
  const handleCreateItem = async () => {
    const imageStorageIds = newImages.length
      ? (newImages.map((x) => x.storageId) as Id<"_storage">[])
      : undefined;
    await addItemWithImages({
      name: newItem.name,
      brand: newItem.brand || undefined,
      price: newItem.price,
      quantity: newItem.quantity,
      description: newItem.description,
      variant: newItem.variant || "default",
      collection: newItem.collection || undefined,
      sale: newItem.sale || undefined,
      imageStorageIds,
    });
    // Reset form
    setNewItem(defaultNewItem);
    // Revoke object URLs to avoid memory leaks
    newImages.forEach((img) => {
      try {
        URL.revokeObjectURL(img.url);
      } catch { }
    });
    setNewImages([]);
    setShowAddItemDialog(false);
    toast.success("Товар создан");
  };

  // Handler for creating new category
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Введите название категории");
      return;
    }
    try {
      await createCategory({ name: newCategoryName.trim() });
      toast.success("Категория создана");
      setNewCategoryName("");
      setShowAddCategoryDialog(false);
    } catch (error) {
      toast.error("Ошибка при создании категории");
      console.error(error);
    }
  };

  // Handler for creating new subcategory
  const handleCreateSubcategory = async () => {
    if (!itemCategoryFilter) {
      toast.error("Сначала выберите категорию");
      return;
    }
    if (!newSubcategoryName.trim()) {
      toast.error("Введите название подкатегории");
      return;
    }
    try {
      await createSubcategory({
        name: newSubcategoryName.trim(),
        parent: itemCategoryFilter,
      });
      toast.success("Подкатегория создана");
      setNewSubcategoryName("");
      setShowAddSubcategoryDialog(false);
    } catch (error) {
      toast.error("Ошибка при создании подкатегории");
      console.error(error);
    }
  };

  // Per-item images draft for edits: keyed by item id
  const [imagesDraft, setImagesDraft] = useState<
    Record<string, { url: string; storageId: Id<"_storage"> }[]>
  >({});
  // Items UI helpers: client-side search and controlled edits with Save
  const [itemSearch, setItemSearch] = useState("");
  const [showOnlyIncomplete, setShowOnlyIncomplete] = useState(false);
  type ItemEdit = {
    name: string;
    brand: string;
    price: number;
    quantity: number;
    description: string;
    variant: string;
    collection: string;
    sale: number;
    category?: Id<"categorys">;
    subcategory?: Id<"subcategorys">;
  };
  const [itemEdits, setItemEdits] = useState<Record<string, ItemEdit>>({});
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
    if (ed.collection !== (it.collection ?? "")) patch.collection = ed.collection;
    if (ed.sale !== (it.sale ?? 0)) patch.sale = ed.sale;
    if ((ed.category || undefined) !== (it.category ?? undefined))
      patch.category = ed.category ?? undefined;
    if ((ed.subcategory || undefined) !== (it.subcategory ?? undefined))
      patch.subcategory = ed.subcategory ?? undefined;
    return patch;
  };

  // Subcategory selector bound to selected category
  function SubcategorySelect(props: {
    categoryId?: Id<"categorys">;
    value?: Id<"subcategorys">;
    onChange: (v?: Id<"subcategorys">) => void;
    noneLabel?: string;
    onAddNew?: () => void;
  }) {
    const { categoryId, value, onChange, noneLabel, onAddNew } = props;
    const res = useQuery(api.dashboard.show_subcategories_by_category, {
      parent: categoryId ?? undefined,
    });
    const subcategories = res?.subcategories ?? [];
    const selectValue = value ? String(value) : "__none__";
    return (
      <Select
        value={selectValue}
        onValueChange={(v) => {
          if (v === "__add_new__") {
            onAddNew?.();
          } else {
            onChange(
              v === "__none__" ? undefined : (v as unknown as Id<"subcategorys">),
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
              {s.name}
            </SelectItem>
          ))}
          <SelectItem value="__add_new__">Добавить новую</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  const formatVariant = (value: string): string => {
    if (!value) return value;
    const trimmed = value.trim();
    if (trimmed && !trimmed.includes("кВт")) {
      return trimmed + " кВт";
    }
    return trimmed;
  };

  // Helpers for image edits
  const getImagesFor = (
    it: any,
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

  // Categories lookup for display
  const categories = useQuery(api.catalog.catalog_list_all_categories);
  const getCategoryName = (catId: Id<"categorys"> | undefined): string => {
    if (!catId || !categories) return "";
    const found = categories.find((c: any) => String(c._id) === String(catId));
    return found?.name ?? "";
  };

  // Show loading while verifying authentication
  if (!verifiedUser && managerId) {
    return (
      <div className="container mx-auto max-w-2xl p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Проверка авторизации...</h1>
        <p className="text-sm text-muted-foreground">Пожалуйста, подождите.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 space-y-6">
      <ManagerHeader
        onLogout={() => {
          if (typeof window !== "undefined") {
            localStorage.removeItem("userToken");
            localStorage.removeItem("managerId");
            localStorage.removeItem("role");
          }
          router.replace("/auth");
        }}
        onAddItem={() => setShowAddItemDialog(true)}
      />
      <div className="flex items-center gap-4">
        <label className="text-sm">Раздел:</label>
        <Select value={section} onValueChange={(v: any) => setSection(v)}>
          <SelectTrigger>
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

      {section === "orders" && (
        <>
          {/* Empty state for orders when list is empty */}
          <div className="flex items-center gap-4">
            <label className="text-sm">Фильтр по статусу:</label>
            <Select value={status} onValueChange={(v: Status) => setStatus(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm">Просмотр:</span>
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
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="mine">Мои</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {(() => {
              const ordersToShow =
                viewMine && myResults && managerId ? myResults : results;
              if ((ordersToShow?.length ?? 0) === 0) {
                return (
                  <EmptyState
                    title="Заказов нет"
                    description="Нет заказов для текущего фильтра. Измените статус или проверьте позже."
                    secondaryActions={[
                      {
                        label: "Изменить статус",
                        onClick: () => setStatus("pending"),
                      },
                    ]}
                  />
                );
              }
              return ordersToShow!.map((o) => (
                <div
                  key={o._id}
                  className="border rounded p-3 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">
                      Заказ ID: <span className="font-mono">{o._id}</span>
                    </div>
                    <div className="text-sm">
                      Пользователь:{" "}
                      <span className="font-mono">{String(o.userId)}</span>
                    </div>
                    <div className="text-sm">Товаров: {o.itemId.length}</div>
                    <div className="text-sm">Сумма: {o.total} ₽</div>
                    <div className="text-xs text-muted-foreground">
                      Обновлено:{" "}
                      {o.updatedAt
                        ? new Date(o.updatedAt).toLocaleString()
                        : "—"}
                    </div>
                    <div className="text-xs">
                      Назначен:{" "}
                      {o.assignedManager ? String(o.assignedManager) : "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={o.status as Status}
                      onValueChange={async (v: Status) =>
                        updateStatus({ orderId: o._id, status: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={() =>
                        updateStatus({ orderId: o._id, status: "processing" })
                      }
                    >
                      Начать
                    </Button>
                    <Button
                      onClick={() =>
                        updateStatus({ orderId: o._id, status: "done" })
                      }
                    >
                      Готово
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={!managerId}
                      onClick={() =>
                        managerId &&
                        claim({
                          orderId: o._id,
                          managerId: managerId as Id<"users">,
                        })
                      }
                    >
                      Взять
                    </Button>
                    {(role === "admin" ||
                      (managerId &&
                        o.assignedManager &&
                        String(o.assignedManager) === managerId)) && (
                        <Button
                          variant="destructive"
                          onClick={() => unclaim({ orderId: o._id })}
                        >
                          Снять
                        </Button>
                      )}
                  </div>
                </div>
              ));
            })()}
          </div>

          <div className="flex justify-center gap-3">
            <Button
              variant="ghost"
              disabled={loadStatus !== "CanLoadMore"}
              onClick={() => loadMore(10)}
            >
              Загрузить ещё (Все)
            </Button>
            <Button
              variant="ghost"
              disabled={loadStatusMine !== "CanLoadMore"}
              onClick={() => loadMoreMine(10)}
            >
              Загрузить ещё (Мои)
            </Button>
          </div>
        </>
      )}

      {section === "consultants" && (
        <>
          {/* Empty state for consultants when list is empty */}
          <div className="flex items-center gap-4">
            <label className="text-sm">Фильтр по статусу:</label>
            <Select
              value={cStatus}
              onValueChange={(v: ConsultantStatus) => setCStatus(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONSULTANT_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm">Просмотр:</span>
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
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="mine">Мои</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            {(() => {
              const list =
                viewMine && consultantsMine && managerId
                  ? consultantsMine
                  : consultantsAll;
              if ((list?.length ?? 0) === 0) {
                return (
                  <EmptyState
                    title="Запросов на консультацию нет"
                    description="Нет консультаций для текущего фильтра. Измените статус или проверьте позже."
                    secondaryActions={[
                      {
                        label: "Изменить статус",
                        onClick: () => setCStatus("new"),
                      },
                    ]}
                  />
                );
              }
              return list!.map((c) => (
                <div
                  key={c._id}
                  className="border rounded p-3 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="text-sm">Имя: {c.name}</div>
                    <div className="text-sm">Телефон: {c.phone}</div>
                    {c.message && (
                      <div className="text-sm">Сообщение: {c.message}</div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Обновлено:{" "}
                      {c.updatedAt
                        ? new Date(c.updatedAt).toLocaleString()
                        : "—"}
                    </div>
                    <div className="text-xs">
                      Назначен:{" "}
                      {c.assignedManager ? String(c.assignedManager) : "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={c.status as ConsultantStatus}
                      onValueChange={(v: ConsultantStatus) =>
                        updateConsultantStatus({
                          consultantId: c._id,
                          status: v,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONSULTANT_STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={() =>
                        updateConsultantStatus({
                          consultantId: c._id,
                          status: "processing",
                        })
                      }
                    >
                      Начать
                    </Button>
                    <Button
                      onClick={() =>
                        updateConsultantStatus({
                          consultantId: c._id,
                          status: "done",
                        })
                      }
                    >
                      Готово
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={!managerId}
                      onClick={() =>
                        managerId &&
                        claimConsultant({
                          consultantId: c._id,
                          managerId: managerId as Id<"users">,
                        })
                      }
                    >
                      Взять
                    </Button>
                    {(role === "admin" ||
                      (managerId &&
                        c.assignedManager &&
                        String(c.assignedManager) === managerId)) && (
                        <Button
                          variant="destructive"
                          onClick={() =>
                            unclaimConsultant({ consultantId: c._id })
                          }
                        >
                          Снять
                        </Button>
                      )}
                  </div>
                </div>
              ));
            })()}
          </div>
          <div className="flex justify-center gap-3">
            <Button
              variant="ghost"
              disabled={loadStatusConsultantsAll !== "CanLoadMore"}
              onClick={() => loadMoreConsultantsAll(10)}
            >
              Загрузить ещё (Все)
            </Button>
            <Button
              variant="ghost"
              disabled={loadStatusConsultantsMine !== "CanLoadMore"}
              onClick={() => loadMoreConsultantsMine(10)}
            >
              Загрузить ещё (Мои)
            </Button>
          </div>
        </>
      )}

      {section === "items" && (
        <>
          {/* Add Item Dialog */}
          <Dialog
            open={showAddItemDialog}
            onOpenChange={(next) => {
              if (!next) {
                if (isAddItemFormDirty()) {
                  const ok = window.confirm(
                    "Закрыть без сохранения? Изменения будут потеряны.",
                  );
                  if (!ok) return;
                }
                setShowAddItemDialog(false);
              } else {
                setShowAddItemDialog(true);
              }
            }}
          >
            <DialogContent className="sm:max-w-2xl w-full sm:w-auto max-h-[85vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Добавить товар</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="name">Название</Label>
                  <Input
                    id="name"
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem({ ...newItem, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="brand">Бренд</Label>
                  <Input
                    id="brand"
                    value={newItem.brand}
                    onChange={(e) =>
                      setNewItem({ ...newItem, brand: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="price">Цена</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newItem.price}
                    onChange={(e) =>
                      setNewItem({ ...newItem, price: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="quantity">Количество</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        quantity: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="variant">Мощность</Label>
                  <Input
                    id="variant"
                    value={newItem.variant}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        variant: formatVariant(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="collection">Коллекция</Label>
                  <Input
                    id="collection"
                    placeholder="Похожие товары должны иметь одинаковую коллекцию"
                    value={newItem.collection}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        collection: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sale">Скидка %</Label>
                  <Input
                    id="sale"
                    type="number"
                    value={newItem.sale}
                    onChange={(e) =>
                      setNewItem({ ...newItem, sale: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={newItem.description}
                    onChange={(e) =>
                      setNewItem({ ...newItem, description: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <ImageField
                    itemName={newItem.name || "Товар"}
                    images={newImages}
                    max={15}
                    onDropFilesAction={async (fs) => {
                      // Enforce max 15 images; only accept up to remaining slots
                      const remaining = 15 - newImages.length;
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
                          // Use object URL for immediate preview; Convex will generate public URLs after create
                          const objUrl = URL.createObjectURL(f);
                          return { storageId, url: objUrl };
                        }),
                      );
                      setNewImages((prev) => [...prev, ...uploaded]);
                    }}
                    onChangeAction={(next) =>
                      setNewImages(
                        next as { url: string; storageId: Id<"_storage"> }[],
                      )
                    }
                  />
                </div>
                <div className="md:col-span-2 sticky bottom-0 w-full bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80 border-t pt-3 pb-3 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (isAddItemFormDirty()) {
                        const ok = window.confirm(
                          "Очистить форму? Изменения будут потеряны.",
                        );
                        if (!ok) return;
                      }
                      setNewItem(defaultNewItem);
                      newImages.forEach((img) => {
                        try {
                          URL.revokeObjectURL(img.url);
                        } catch { }
                      });
                      setNewImages([]);
                    }}
                  >
                    Отмена
                  </Button>
                  <Button onClick={handleCreateItem}>Сохранить</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {/* Inline Add Item form is now moved to a dialog; keep anchor hidden to preserve hash deep-link compatibility */}
          <div id="add-item" className="hidden border rounded p-3 space-y-3">
            <h2 className="text-lg font-semibold">Добавить товар</h2>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="brand">Бренд</Label>
                <Input
                  id="brand"
                  value={newItem.brand}
                  onChange={(e) =>
                    setNewItem({ ...newItem, brand: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="price">Цена</Label>
                <Input
                  id="price"
                  type="number"
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem({ ...newItem, price: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="quantity">Количество</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) =>
                    setNewItem({ ...newItem, quantity: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="variant">Мощность</Label>
                <Input
                  id="variant"
                  value={newItem.variant}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      variant: formatVariant(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="collection-bulk">Коллекция</Label>
                <Input
                  id="collection-bulk"
                  placeholder="Похожие товары должны иметь одинаковую коллекцию"
                  value={newItem.collection}
                  onChange={(e) =>
                    setNewItem({ ...newItem, collection: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sale">Скидка %</Label>
                <Input
                  id="sale"
                  type="number"
                  value={newItem.sale}
                  onChange={(e) =>
                    setNewItem({ ...newItem, sale: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <ImageField
                  itemName={newItem.name || "Товар"}
                  images={newImages}
                  max={15}
                  onDropFilesAction={async (fs) => {
                    // Enforce max 15 images; only accept up to remaining slots
                    const remaining = 15 - newImages.length;
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
                        // Use object URL for immediate preview; Convex will generate public URLs after create
                        const objUrl = URL.createObjectURL(f);
                        return { storageId, url: objUrl };
                      }),
                    );
                    setNewImages((prev) => [...prev, ...uploaded]);
                  }}
                  onChangeAction={(next) =>
                    setNewImages(
                      next as { url: string; storageId: Id<"_storage"> }[],
                    )
                  }
                />
              </div>
              <div>
                <Button
                  onClick={async () => {
                    // Create item with selected image storage ids (preserving order)
                    const imageStorageIds = newImages.length
                      ? (newImages.map((x) => x.storageId) as Id<"_storage">[])
                      : undefined;
                    await addItemWithImages({
                      name: newItem.name,
                      brand: newItem.brand || undefined,
                      price: newItem.price,
                      quantity: newItem.quantity,
                      description: newItem.description,
                      variant: newItem.variant || "0",
                      sale: newItem.sale || undefined,
                      imageStorageIds,
                    });
                    // Reset form
                    setNewItem({
                      name: "",
                      brand: "",
                      price: 0,
                      quantity: 0,
                      description: "",
                      variant: "0",
                      collection: "",
                      sale: 0,
                    });
                    // Revoke object URLs to avoid memory leaks
                    newImages.forEach((img) => {
                      try {
                        URL.revokeObjectURL(img.url);
                      } catch { }
                    });
                    setNewImages([]);
                  }}
                >
                  Создать
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <Label htmlFor="item-search">Поиск товаров</Label>
            <Input
              id="item-search"
              placeholder="Поиск по названию, бренду, мощности"
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 mt-2">
            <Switch
              id="filter-incomplete"
              checked={showOnlyIncomplete}
              onCheckedChange={setShowOnlyIncomplete}
            />
            <Label htmlFor="filter-incomplete">Не законченные</Label>
          </div>

          {/* Filters: Category & Subcategory */}
          <div className="flex items-center gap-3 mt-2">
            <Label>Категория</Label>
            <Select
              value={
                itemCategoryFilter ? String(itemCategoryFilter) : "__all__"
              }
              onValueChange={(v: string) => {
                if (v === "__all__") {
                  setItemCategoryFilter(undefined);
                  setItemSubcategoryFilter(undefined);
                } else if (v === "__add_new__") {
                  setShowAddCategoryDialog(true);
                } else {
                  // When category changes, reset subcategory filter
                  setItemCategoryFilter(v as unknown as Id<"categorys">);
                  setItemSubcategoryFilter(undefined);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Все категории</SelectItem>
                {Array.isArray(categories) &&
                  categories.map((c: any) => (
                    <SelectItem key={String(c._id)} value={String(c._id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                <SelectItem value="__add_new__">Добавить новую</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <Label>Подкатегория</Label>
            <div className="min-w-60">
              <SubcategorySelect
                categoryId={itemCategoryFilter}
                value={itemSubcategoryFilter}
                onChange={(next) => setItemSubcategoryFilter(next)}
                noneLabel="Все подкатегории"
                onAddNew={() => setShowAddSubcategoryDialog(true)}
              />
            </div>
          </div>

          <div className="space-y-3 mt-4">
            {(() => {
              const all = items ?? [];
              const q = itemSearch.trim().toLowerCase();
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
                // Filter by search query
                if (q) {
                  if (
                    !it.name.toLowerCase().includes(q) &&
                    !(it.brand ? it.brand.toLowerCase().includes(q) : false) &&
                    !(it.variant ? it.variant.toLowerCase().includes(q) : false)
                  ) {
                    return false;
                  }
                }
                // Filter by "incomplete" switch
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
                      onClick: () => setShowAddItemDialog(true),
                    }}
                  />
                );
              }
              if (filtered.length === 0 && q) {
                return (
                  <EmptyState
                    title="Ничего не найдено"
                    description="Измените условия поиска или сбросьте фильтры."
                    primaryAction={{
                      label: "Добавить товар",
                      onClick: () => setShowAddItemDialog(true),
                    }}
                    secondaryActions={[
                      {
                        label: "Очистить поиск",
                        onClick: () => setItemSearch(""),
                      },
                    ]}
                  />
                );
              }

              return filtered.map((it) => (
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
                    {/* Editable category and subcategory */}
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
                                  : (v as unknown as Id<"categorys">),
                            },
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">
                            Без категории
                          </SelectItem>
                          {Array.isArray(categories) &&
                            categories.map((c: any) => (
                              <SelectItem
                                key={String(c._id)}
                                value={String(c._id)}
                              >
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
                    {/* Images field for existing item: reorder, remove, add */}
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
                              const storageId =
                                json.storageId as Id<"_storage">;
                              return { storageId, url: URL.createObjectURL(f) };
                            }),
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
                            // Revoke any object URLs and clear local draft to rely on server values
                            next.forEach((img) => {
                              // Only revoke blob: URLs we created
                              if (img.url?.startsWith("blob:")) {
                                try {
                                  URL.revokeObjectURL(img.url);
                                } catch { }
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
                        // clear local edits to rely on fresh server state
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
                          "Удалить товар? Это действие нельзя отменить.",
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
              ));
            })()}
          </div>
          <div className="flex justify-center">
            <Button
              variant="ghost"
              disabled={loadStatusItems !== "CanLoadMore"}
              onClick={() => loadMoreItems(10)}
            >
              Загрузить ещё товары
            </Button>
          </div>
        </>
      )}

      {section === "users" && role === "admin" && (
        <>
          <div className="border rounded p-3 space-y-3">
            <h2 className="text-lg font-semibold">Пользователи</h2>
            {/* Create user */}
            <AdminUsersPanel />
          </div>
        </>
      )}

      {/* Dialog for adding new category */}
      <Dialog open={showAddCategoryDialog} onOpenChange={setShowAddCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить категорию</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Название категории</Label>
              <Input
                id="category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Введите название"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateCategory();
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddCategoryDialog(false);
                  setNewCategoryName("");
                }}
              >
                Отмена
              </Button>
              <Button onClick={handleCreateCategory}>
                Сохранить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog for adding new subcategory */}
      <Dialog open={showAddSubcategoryDialog} onOpenChange={setShowAddSubcategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить подкатегорию</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!itemCategoryFilter && (
              <p className="text-sm text-red-500">
                Сначала выберите категорию
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="subcategory-name">Название подкатегории</Label>
              <Input
                id="subcategory-name"
                value={newSubcategoryName}
                onChange={(e) => setNewSubcategoryName(e.target.value)}
                placeholder="Введите название"
                disabled={!itemCategoryFilter}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateSubcategory();
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddSubcategoryDialog(false);
                  setNewSubcategoryName("");
                }}
              >
                Отмена
              </Button>
              <Button
                onClick={handleCreateSubcategory}
                disabled={!itemCategoryFilter}
              >
                Сохранить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminUsersPanel() {
  const createUser = useMutation(api.users.create_user_with_role);
  const updateUser = useMutation(api.users.update_user);
  const deleteUser = useMutation(api.users.delete_user);
  const [roleFilter, setRoleFilter] = useState<"user" | "manager" | "admin">(
    "manager",
  );
  const users = useQuery(api.users.list_users_by_role, { role: roleFilter });

  const [newUser, setNewUser] = useState({
    name: "",
    phone: "",
    role: "manager" as "user" | "manager" | "admin",
  });
  const [edits, setEdits] = useState<
    Record<
      string,
      { name: string; phone: string; role: "user" | "manager" | "admin" }
    >
  >({});

  const getEditUser = (u: any) =>
    edits[String(u._id)] ?? { name: u.name, phone: u.phone, role: u.role };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label htmlFor="newUserName">Имя</Label>
          <Input
            id="newUserName"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="newUserPhone">Телефон</Label>
          <Input
            id="newUserPhone"
            value={newUser.phone}
            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label>Роль</Label>
          <Select
            value={newUser.role}
            onValueChange={(v: any) => setNewUser({ ...newUser, role: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">user</SelectItem>
              <SelectItem value="manager">manager</SelectItem>
              <SelectItem value="admin">admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Button
          onClick={async () => {
            await createUser({
              name: newUser.name,
              phone: newUser.phone,
              role: newUser.role,
            });
            setNewUser({ name: "", phone: "", role: newUser.role });
          }}
        >
          Создать пользователя
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Label>Фильтр по роли:</Label>
        <Select value={roleFilter} onValueChange={(v: any) => setRoleFilter(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">user</SelectItem>
            <SelectItem value="manager">manager</SelectItem>
            <SelectItem value="admin">admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3 mt-3">
        {users?.map((u) => (
          <div key={u._id} className="border rounded p-3 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Имя</Label>
                <Input
                  value={getEditUser(u).name}
                  onChange={(e) =>
                    setEdits((prev) => ({
                      ...prev,
                      [String(u._id)]: {
                        ...getEditUser(u),
                        name: e.target.value,
                      },
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Телефон</Label>
                <Input
                  value={getEditUser(u).phone}
                  onChange={(e) =>
                    setEdits((prev) => ({
                      ...prev,
                      [String(u._id)]: {
                        ...getEditUser(u),
                        phone: e.target.value,
                      },
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Роль</Label>
                <Select
                  value={getEditUser(u).role}
                  onValueChange={(v: any) =>
                    setEdits((prev) => ({
                      ...prev,
                      [String(u._id)]: { ...getEditUser(u), role: v },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">user</SelectItem>
                    <SelectItem value="manager">manager</SelectItem>
                    <SelectItem value="admin">admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={async () => {
                  const ed = getEditUser(u);
                  await updateUser({
                    id: u._id,
                    name: ed.name,
                    phone: ed.phone,
                    role: ed.role,
                  });
                  setEdits((prev) => {
                    const next = { ...prev };
                    delete next[String(u._id)];
                    return next;
                  });
                }}
              >
                Сохранить
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setEdits((prev) => {
                    const next = { ...prev };
                    delete next[String(u._id)];
                    return next;
                  })
                }
              >
                Сброс
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteUser({ id: u._id })}
              >
                Удалить
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
