"use client";

import { usePaginatedQuery, useMutation, useQuery } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { useRole } from "@/hooks/useRole";

type Status = "pending" | "processing" | "done";
const STATUSES: Status[] = ["pending", "processing", "done"];
type ConsultantStatus = "new" | "processing" | "done";
const CONSULTANT_STATUSES: ConsultantStatus[] = ["new", "processing", "done"];

export default function ManagerPage() {
  const router = useRouter();
  const { role, setRole, managerId, setManagerId } = useRole();
  // Auth guard: require localStorage "userToken"; otherwise redirect to /auth
  useEffect(() => {
    const token = typeof window !== "undefined" && localStorage.getItem("userToken");
    if (!token) {
      router.replace("/auth");
    }
  }, [router]);
  const [status, setStatus] = useState<Status>("pending");
  const [viewMine, setViewMine] = useState(false);
  const [section, setSection] = useState<"orders" | "consultants" | "items">("orders");
  const { results, loadMore, status: loadStatus } = usePaginatedQuery(
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
  const managers = useQuery(api.users.list_users_by_role, { role: "manager" });
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
    managerId ? ({ managerId: managerId as Id<"users">, status: cStatus } as const) : "skip",
    { initialNumItems: 10 },
  );
  const updateConsultantStatus = useMutation(api.consultants.update_consultant_status);
  const claimConsultant = useMutation(api.consultants.claim_consultant);
  const unclaimConsultant = useMutation(api.consultants.unclaim_consultant);

  // Items admin
  const {
    results: items,
    loadMore: loadMoreItems,
    status: loadStatusItems,
  } = usePaginatedQuery(api.admin_items.list_items_paginated, {}, { initialNumItems: 10 });
  const createItem = useMutation(api.admin_items.create_item);
  const updateItem = useMutation(api.admin_items.update_item);
  const deleteItem = useMutation(api.admin_items.delete_item);
  const [newItem, setNewItem] = useState({ name: "", brand: "", price: 0, quantity: 0, description: "", variant: "default", sale: 0 });
  // Items UI helpers: client-side search and controlled edits with Save
  const [itemSearch, setItemSearch] = useState("");
  type ItemEdit = {
    name: string;
    brand: string;
    price: number;
    quantity: number;
    description: string;
    variant: string;
    sale: number;
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
        sale: it.sale ?? 0,
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
      (ed.sale || undefined) !== (it.sale ?? undefined)
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
    if (ed.sale !== (it.sale ?? 0)) patch.sale = ed.sale;
    return patch;
  };

  if (role !== "manager" && role !== "admin") {
    return (
      <div className="container mx-auto max-w-2xl p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Manager Access</h1>
        <p className="text-sm text-muted-foreground">
          For development, choose a role to access the Manager UI.
        </p>
        <div className="flex items-center gap-4">
          <label className="text-sm">Current role:</label>
          <Select value={role} onValueChange={(v: any) => setRole(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["user", "manager", "admin"].map((r) => (
                <SelectItem key={r} value={r as any}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground">
          Note: This is a dev-only gate using localStorage. Proper auth to be
          added later.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Manager Orders</h1>
        <Button
          variant="outline"
          onClick={() => {
            if (typeof window !== "undefined") {
              localStorage.removeItem("userToken");
              localStorage.removeItem("managerId");
              localStorage.removeItem("role");
            }
            router.replace("/auth");
          }}
        >
          Выйти
        </Button>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>Role:</span>
        <Select value={role} onValueChange={(v: any) => setRole(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["user", "manager", "admin"].map((r) => (
              <SelectItem key={r} value={r as any}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-4">
        <label className="text-sm">My manager account:</label>
        <Select
          value={managerId ?? "none"}
          onValueChange={(v: string) => setManagerId(v === "none" ? null : v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Not selected</SelectItem>
            {managers?.map((m) => (
              <SelectItem key={m._id} value={String(m._id)}>
                {m.name} ({m.phone})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-4">
        <label className="text-sm">Section:</label>
        <Select value={section} onValueChange={(v: any) => setSection(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="orders">Orders</SelectItem>
            <SelectItem value="consultants">Consultants</SelectItem>
            <SelectItem value="items">Items</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {section === "orders" && (
        <>
          <div className="flex items-center gap-4">
            <label className="text-sm">Filter by status:</label>
            <Select value={status} onValueChange={(v: Status) => setStatus(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm">View:</span>
            <Select
              value={viewMine ? "mine" : "all"}
              onValueChange={(v: string) => {
                if (v === "mine") {
                  if (!managerId) {
                    alert("Select your manager account first");
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
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="mine">Mine</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {(viewMine && myResults && managerId ? myResults : results)?.map((o) => (
              <div key={o._id} className="border rounded p-3 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Order ID: <span className="font-mono">{o._id}</span></div>
                  <div className="text-sm">User: <span className="font-mono">{String(o.userId)}</span></div>
                  <div className="text-sm">Items: {o.itemId.length}</div>
                  <div className="text-sm">Total: {o.total} ₽</div>
                  <div className="text-xs text-muted-foreground">Updated: {o.updatedAt ? new Date(o.updatedAt).toLocaleString() : "—"}</div>
                  <div className="text-xs">Assigned: {o.assignedManager ? String(o.assignedManager) : "—"}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={o.status as Status} onValueChange={async (v: Status) => updateStatus({ orderId: o._id, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => updateStatus({ orderId: o._id, status: "processing" })}>Start</Button>
                  <Button onClick={() => updateStatus({ orderId: o._id, status: "done" })}>Done</Button>
                  <Button variant="secondary" disabled={!managerId} onClick={() => managerId && claim({ orderId: o._id, managerId: managerId as Id<"users"> })}>Claim</Button>
                  {(role === "admin" || (managerId && o.assignedManager && String(o.assignedManager) === managerId)) && (
                    <Button variant="destructive" onClick={() => unclaim({ orderId: o._id })}>Unclaim</Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-3">
            <Button variant="ghost" disabled={loadStatus !== "CanLoadMore"} onClick={() => loadMore(10)}>Load more (All)</Button>
            <Button variant="ghost" disabled={loadStatusMine !== "CanLoadMore"} onClick={() => loadMoreMine(10)}>Load more (Mine)</Button>
          </div>
        </>
      )}

      {section === "consultants" && (
        <>
          <div className="flex items-center gap-4">
            <label className="text-sm">Filter by status:</label>
            <Select value={cStatus} onValueChange={(v: ConsultantStatus) => setCStatus(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONSULTANT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm">View:</span>
            <Select
              value={viewMine ? "mine" : "all"}
              onValueChange={(v: string) => {
                if (v === "mine") {
                  if (!managerId) {
                    alert("Select your manager account first");
                    setViewMine(false);
                  } else {
                    setViewMine(true);
                  }
                } else {
                  setViewMine(false);
                }
              }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="mine">Mine</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            {(viewMine && consultantsMine && managerId ? consultantsMine : consultantsAll)?.map((c) => (
              <div key={c._id} className="border rounded p-3 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm">Name: {c.name}</div>
                  <div className="text-sm">Phone: {c.phone}</div>
                  {c.message && <div className="text-sm">Msg: {c.message}</div>}
                  <div className="text-xs text-muted-foreground">Updated: {c.updatedAt ? new Date(c.updatedAt).toLocaleString() : "—"}</div>
                  <div className="text-xs">Assigned: {c.assignedManager ? String(c.assignedManager) : "—"}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={c.status as ConsultantStatus} onValueChange={(v: ConsultantStatus) => updateConsultantStatus({ consultantId: c._id, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CONSULTANT_STATUSES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => updateConsultantStatus({ consultantId: c._id, status: "processing" })}>Start</Button>
                  <Button onClick={() => updateConsultantStatus({ consultantId: c._id, status: "done" })}>Done</Button>
                  <Button variant="secondary" disabled={!managerId} onClick={() => managerId && claimConsultant({ consultantId: c._id, managerId: managerId as Id<"users"> })}>Claim</Button>
                  {(role === "admin" || (managerId && c.assignedManager && String(c.assignedManager) === managerId)) && (
                    <Button variant="destructive" onClick={() => unclaimConsultant({ consultantId: c._id })}>Unclaim</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-3">
            <Button variant="ghost" disabled={loadStatusConsultantsAll !== "CanLoadMore"} onClick={() => loadMoreConsultantsAll(10)}>Load more (All)</Button>
            <Button variant="ghost" disabled={loadStatusConsultantsMine !== "CanLoadMore"} onClick={() => loadMoreConsultantsMine(10)}>Load more (Mine)</Button>
          </div>
        </>
      )}

      {section === "items" && (
        <>
          <div className="border rounded p-3 space-y-3">
            <h2 className="text-lg font-semibold">Add new item</h2>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" value={newItem.brand} onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="price">Price</Label>
                <Input id="price" type="number" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" type="number" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="variant">Variant</Label>
                <Input id="variant" value={newItem.variant} onChange={(e) => setNewItem({ ...newItem, variant: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sale">Sale %</Label>
                <Input id="sale" type="number" value={newItem.sale} onChange={(e) => setNewItem({ ...newItem, sale: Number(e.target.value) })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
              </div>
              <div>
                <Button onClick={async () => {
                  await createItem({
                    name: newItem.name,
                    brand: newItem.brand || undefined,
                    price: newItem.price,
                    quantity: newItem.quantity,
                    description: newItem.description,
                    variant: newItem.variant || "default",
                    sale: newItem.sale || undefined,
                  });
                  setNewItem({ name: "", brand: "", price: 0, quantity: 0, description: "", variant: "default", sale: 0 });
                }}>Create</Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <Label htmlFor="item-search">Search items</Label>
            <Input id="item-search" placeholder="Search by name, brand, variant" value={itemSearch} onChange={(e) => setItemSearch(e.target.value)} />
          </div>

          <div className="space-y-3 mt-4">
            {items
              ?.filter((it) => {
                const q = itemSearch.trim().toLowerCase();
                if (!q) return true;
                return (
                  it.name.toLowerCase().includes(q) ||
                  (it.brand ? it.brand.toLowerCase().includes(q) : false) ||
                  (it.variant ? it.variant.toLowerCase().includes(q) : false)
                );
              })
              .map((it) => (
              <div key={it._id} className="border rounded p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{getEdit(it).name}</div>
                  <div className="text-sm text-muted-foreground">{getEdit(it).price} ₽</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Name</Label>
                    <Input value={getEdit(it).name} onChange={(e) => setItemEdits((prev) => ({ ...prev, [String(it._id)]: { ...getEdit(it), name: e.target.value } }))} />
                  </div>
                  <div className="space-y-1">
                    <Label>Brand</Label>
                    <Input value={getEdit(it).brand} onChange={(e) => setItemEdits((prev) => ({ ...prev, [String(it._id)]: { ...getEdit(it), brand: e.target.value } }))} />
                  </div>
                  <div className="space-y-1">
                    <Label>Price</Label>
                    <Input type="number" value={getEdit(it).price} onChange={(e) => setItemEdits((prev) => ({ ...prev, [String(it._id)]: { ...getEdit(it), price: Number(e.target.value) } }))} />
                  </div>
                  <div className="space-y-1">
                    <Label>Quantity</Label>
                    <Input type="number" value={getEdit(it).quantity} onChange={(e) => setItemEdits((prev) => ({ ...prev, [String(it._id)]: { ...getEdit(it), quantity: Number(e.target.value) } }))} />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label>Description</Label>
                    <Textarea value={getEdit(it).description} onChange={(e) => setItemEdits((prev) => ({ ...prev, [String(it._id)]: { ...getEdit(it), description: e.target.value } }))} />
                  </div>
                  <div className="space-y-1">
                    <Label>Variant</Label>
                    <Input value={getEdit(it).variant} onChange={(e) => setItemEdits((prev) => ({ ...prev, [String(it._id)]: { ...getEdit(it), variant: e.target.value } }))} />
                  </div>
                  <div className="space-y-1">
                    <Label>Sale %</Label>
                    <Input type="number" value={getEdit(it).sale} onChange={(e) => setItemEdits((prev) => ({ ...prev, [String(it._id)]: { ...getEdit(it), sale: Number(e.target.value) } }))} />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    disabled={!hasChanges(it, getEdit(it))}
                    onClick={async () => {
                      const patch = computePatch(it, getEdit(it));
                      if (Object.keys(patch).length === 0) return;
                      await updateItem({ itemId: it._id, ...patch });
                      // clear local edits to rely on fresh server state
                      setItemEdits((prev) => {
                        const next = { ...prev };
                        delete next[String(it._id)];
                        return next;
                      });
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setItemEdits((prev) => {
                      const next = { ...prev };
                      delete next[String(it._id)];
                      return next;
                    })}
                  >
                    Reset
                  </Button>
                  <Button variant="destructive" onClick={() => deleteItem({ itemId: it._id })}>Delete</Button>
                </div>
              </div>
              ))}
          </div>
          <div className="flex justify-center">
            <Button variant="ghost" disabled={loadStatusItems !== "CanLoadMore"} onClick={() => loadMoreItems(10)}>Load more items</Button>
          </div>
        </>
      )}

    </div>
  );
}