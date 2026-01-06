"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Order {
  _id: string;
  name: string;
  email: string;
  status: "new" | "processing" | "completed";
  value: number;
  createdAt: string;
}

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "name",
    header: "Клиент",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusMap: { [key: string]: string } = {
        new: "Новый",
        processing: "В обработке",
        completed: "Завершен",
      };
      return (
        <span
          className={`px-2 py-0.5 rounded text-xs ${
            status === "new"
              ? "bg-gray-100 text-gray-700"
              : status === "processing"
                ? "bg-gray-200 text-gray-700"
                : "bg-gray-900 text-white"
          }`}
        >
          {statusMap[status] || status}
        </span>
      );
    },
  },
  {
    accessorKey: "value",
    header: "Сумма",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("value") as any);
      const formatted = new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Дата",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Открыть меню</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Действия</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(order._id)}
            >
              Копировать ID заказа
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Просмотр заказа</DropdownMenuItem>
            <DropdownMenuItem>Редактировать заказ</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export interface Item {
  _id: string;
  name: string;
  brand: string; // This can be brand name or ID
  quantity: number;
  price: number;
}

export const itemColumns: ColumnDef<Item>[] = [
  {
    accessorKey: "name",
    header: "Товар",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const sku = row.original as any;
      return (
        <div>
          <div className="font-medium">{name}</div>
          {sku.sku && <div className="text-xs text-gray-500">{sku.sku}</div>}
        </div>
      );
    },
  },
  {
    accessorKey: "brand",
    header: "Бренд",
    cell: ({ row }) => {
      const brand = row.getValue("brand") as string;
      return <div>{brand}</div>;
    },
  },
  {
    accessorKey: "quantity",
    header: "Количество",
  },
  {
    accessorKey: "price",
    header: "Цена",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price") as any);
      const formatted = new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: () => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Открыть меню</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Действия</DropdownMenuLabel>
            <DropdownMenuItem>Редактировать товар</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Удалить товар</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
