"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DeleteOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: Id<"orders"> | null;
  orderNumber: string | number;
}

export function DeleteOrderDialog({
  isOpen,
  onClose,
  orderId,
  orderNumber,
}: DeleteOrderDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const deleteOrder = useMutation(api.manager.delete_order);

  const handleDelete = async () => {
    if (!orderId) return;

    setIsLoading(true);
    try {
      await deleteOrder({ id: orderId });
      toast.success("Заказ полностью удален");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Ошибка при удалении заказа");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Подтвердить удаление</DialogTitle>
          <DialogDescription>
            Вы уверены, что хотите полностью удалить заказ №{orderNumber}? Это
            действие необратимо и удалит все данные заказа.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Удаление..." : "Удалить полностью"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
