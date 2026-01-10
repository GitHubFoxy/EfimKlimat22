"use client";

import { useState } from "react";
import { DataTable } from "./data-table";
import { getOrderColumns, type ConvexOrder } from "./columns";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export function OrdersTableContent() {
  const [cursor, setCursor] = useState<string | null>(null);
  const updateStatus = useMutation(api.manager.update_order_status);

  // Fetch orders data with pagination
  const ordersData = useQuery(api.manager.list_orders, {
    paginationOpts: { numItems: 24, cursor },
  });

  const handleStatusChange = async (orderId: any, status: ConvexOrder["status"]) => {
    try {
      await updateStatus({ orderId, status });
      toast.success("Статус заказа обновлен");
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Ошибка при обновлении статуса");
    }
  };

  const orderColumns = getOrderColumns({
    onStatusChange: handleStatusChange,
  });

  if (!ordersData) {
    return (
      <div className="p-4 text-center text-gray-500">
        Загрузка заказов...
      </div>
    );
  }

  if (!ordersData.page || ordersData.page.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Заказы не найдены в базе данных
      </div>
    );
  }

  // Transform Convex order data to match ConvexOrder interface
  const transformedOrders: ConvexOrder[] = ordersData.page.map((order: any) => ({
    _id: order._id,
    publicNumber: order.publicNumber || 0,
    clientName: order.clientName || "Unknown",
    clientPhone: order.clientPhone || "Unknown",
    clientEmail: order.clientEmail,
    status: order.status || "new",
    totalAmount: order.totalAmount || 0,
    paymentStatus: order.paymentStatus || "pending",
    updatedAt: order.updatedAt || 0,
  }));

  const handleNextPage = () => {
    if (ordersData.continueCursor) {
      setCursor(ordersData.continueCursor);
      window.scrollTo(0, 0);
    }
  };

  const handlePreviousPage = () => {
    setCursor(null);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <div className="text-sm text-gray-600 mb-4">
        Показано {ordersData.page.length} заказов
      </div>
      <DataTable columns={orderColumns} data={transformedOrders} />

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousPage}
          disabled={cursor === null}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Предыдущая
        </Button>

        <span className="text-sm text-gray-600">
          {cursor ? "Страница 2+" : "Страница 1"}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={ordersData.isDone}
        >
          Следующая
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </>
  );
}
