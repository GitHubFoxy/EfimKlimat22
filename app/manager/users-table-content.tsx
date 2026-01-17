"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Edit2, Trash2 } from "lucide-react";

interface UsersTableContentProps {
  searchQuery?: string;
  onEditUser?: (user: any) => void;
  onDeleteUser?: (user: any) => void;
}

export function UsersTableContent({
  searchQuery = "",
  onEditUser,
  onDeleteUser,
}: UsersTableContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showEmployees, setShowEmployees] = useState(
    (searchParams.get("role") as string) === "employees",
  );

  // URL sync utilities
  const updateParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    }
    const search = newParams.toString();
    router.replace(`/manager/users${search ? `?${search}` : ""}`, {
      scroll: false,
    });
  };

  const handleRoleToggle = (checked: boolean) => {
    updateParams({ role: checked ? "employees" : "users" });
    setShowEmployees(checked);
  };
  const users = useQuery(api.users.listAll);

  const filteredUsers = users?.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      user.name?.toLowerCase().includes(searchLower) ||
      false ||
      user.phone?.toLowerCase().includes(searchLower) ||
      false;

    if (!matchesSearch) return false;

    // Filter by role: show users by default, employees (managers/admins) if toggled
    if (showEmployees) {
      return user.role === "manager" || user.role === "admin";
    } else {
      return user.role === "user";
    }
  });

  if (!users) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filter checkbox */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="show-employees"
          checked={showEmployees}
          onCheckedChange={handleRoleToggle}
        />
        <Label htmlFor="show-employees" className="cursor-pointer">
          Show employees (managers & admins)
        </Label>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Phone</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers && filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user._id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {user.name || "-"}
                  </TableCell>
                  <TableCell>{user.phone || "-"}</TableCell>
                  <TableCell>
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                      {user.role || "user"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        user.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.status || "active"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditUser?.(user)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => onDeleteUser?.(user)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-gray-500"
                >
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
