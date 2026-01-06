"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";

interface ItemFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item?: any; // If provided, we are in edit mode
}

export function ItemFormDialog({ isOpen, onClose, item }: ItemFormDialogProps) {
  const isEdit = !!item;
  const createItem = useMutation(api.manager.create_item);
  const updateItem = useMutation(api.manager.update_item);
  const brands = useQuery(api.manager.list_brands_all);
  const categories = useQuery(api.manager.list_categories_all);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    brandId: "" as Id<"brands"> | "",
    categoryId: "" as Id<"categories"> | "",
    price: 0,
    quantity: 0,
    status: "active" as "active" | "draft" | "archived" | "preorder",
    inStock: true,
  });

  // Control whether the description textarea is expanded (full editor) or collapsed (preview)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        sku: item.sku || "",
        description: item.description || "",
        brandId: item.brandId || "",
        categoryId: item.categoryId || "",
        price: item.price || 0,
        quantity: item.quantity || 0,
        status: item.status || "active",
        inStock: item.inStock !== undefined ? item.inStock : true,
      });
      // start with collapsed description to save space
      setIsDescriptionExpanded(false);
    } else {
      setFormData({
        name: "",
        sku: "",
        description: "",
        brandId: "",
        categoryId: "",
        price: 0,
        quantity: 0,
        status: "active",
        inStock: true,
      });
      setIsDescriptionExpanded(false);
    }
  }, [item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brandId || !formData.categoryId) {
      toast.error("Please select a brand and category");
      return;
    }

    setIsLoading(true);
    try {
      if (isEdit) {
        await updateItem({
          id: item._id,
          ...formData,
          brandId: formData.brandId as Id<"brands">,
          categoryId: formData.categoryId as Id<"categories">,
        });
        toast.success("Item updated successfully");
      } else {
        await createItem({
          ...formData,
          brandId: formData.brandId as Id<"brands">,
          categoryId: formData.categoryId as Id<"categories">,
        });
        toast.success("Item created successfully");
      }
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(isEdit ? "Failed to update item" : "Failed to create item");
    } finally {
      setIsLoading(false);
    }
  };

  const truncate = (text: string, max = 200) => {
    if (!text) return "";
    return text.length > max ? text.slice(0, max) + "..." : text;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Item" : "Add New Item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val: any) => setFormData({ ...formData, status: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="preorder">Pre-order</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Select
                value={formData.brandId}
                onValueChange={(val: any) => setFormData({ ...formData, brandId: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands?.map((brand) => (
                    <SelectItem key={brand._id} value={brand._id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(val: any) => setFormData({ ...formData, categoryId: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          {/* Description: collapsed preview + expand to full editor */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>

            {isDescriptionExpanded ? (
              <div>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[140px]"
                />
                <div className="flex justify-end mt-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsDescriptionExpanded(false)}>
                    Collapse
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="rounded-md border bg-muted/5 p-3 min-h-[56px] text-sm text-gray-700">
                  {formData.description ? (
                    <div className="whitespace-pre-wrap">{truncate(formData.description, 250)}</div>
                  ) : (
                    <span className="text-gray-400">No description</span>
                  )}
                </div>
                <div className="flex justify-end mt-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsDescriptionExpanded(true)}>
                    {formData.description ? "Edit description" : "Add description"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
