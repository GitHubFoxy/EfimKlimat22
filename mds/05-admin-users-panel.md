# Admin Users Panel Fix & Enhancement

## Overview
Fix the AdminUsersPanel component to use proper shadcn/ui imports and add confirmation dialogs.

## Current Issues

1. Using raw Radix UI imports instead of shadcn/ui wrappers
2. No confirmation dialog for delete actions
3. No loading states
4. No error handling with toast notifications

## Files to Modify

### 1. `components/manager/AdminUsersPanel.tsx` - Complete Rewrite

```typescript
"use client";

import { useState } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Plus, Save, RotateCcw, Trash2, User, Shield, Crown } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

type UserRole = "user" | "manager" | "admin";

interface UserEdit {
  name: string;
  phone: string;
  role: UserRole;
}

const roleLabels: Record<UserRole, string> = {
  user: "Пользователь",
  manager: "Менеджер",
  admin: "Администратор",
};

const roleIcons: Record<UserRole, React.ReactNode> = {
  user: <User className="w-4 h-4" />,
  manager: <Shield className="w-4 h-4" />,
  admin: <Crown className="w-4 h-4" />,
};

const roleBadgeColors: Record<UserRole, string> = {
  user: "bg-gray-100 text-gray-700",
  manager: "bg-blue-100 text-blue-700",
  admin: "bg-purple-100 text-purple-700",
};

export default function AdminUsersPanel() {
  const createUser = useAction(api.users.create_user_with_role);
  const updateUser = useMutation(api.users.update_user);
  const deleteUser = useMutation(api.users.delete_user);

  const [roleFilter, setRoleFilter] = useState<UserRole>("manager");
  const users = useQuery(api.users.list_users_by_role, { role: roleFilter });

  // New user form state
  const [newUser, setNewUser] = useState({
    name: "",
    phone: "",
    role: "manager" as UserRole,
  });
  const [isCreating, setIsCreating] = useState(false);

  // Edit states per user
  const [edits, setEdits] = useState<Record<string, UserEdit>>({});
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{
    id: Id<"users">;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getEditUser = (user: any): UserEdit =>
    edits[String(user._id)] ?? {
      name: user.name || "",
      phone: user.phone || "",
      role: user.role || "user",
    };

  const hasChanges = (user: any): boolean => {
    const edit = edits[String(user._id)];
    if (!edit) return false;
    return (
      edit.name !== (user.name || "") ||
      edit.phone !== (user.phone || "") ||
      edit.role !== (user.role || "user")
    );
  };

  const handleCreateUser = async () => {
    if (!newUser.name.trim() || !newUser.phone.trim()) {
      toast.error("Заполните имя и телефон");
      return;
    }

    setIsCreating(true);
    try {
      const result = await createUser({
        name: newUser.name.trim(),
        phone: newUser.phone.trim(),
        role: newUser.role,
      });
      toast.success(
        `Пользователь создан. Временный пароль: ${result.tempPassword}`,
        { duration: 10000 },
      );
      setNewUser({ name: "", phone: "", role: newUser.role });
    } catch (error: any) {
      toast.error(error.message || "Ошибка при создании пользователя");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveUser = async (userId: Id<"users">) => {
    const edit = getEditUser({ _id: userId });
    
    setSavingIds((prev) => new Set(prev).add(String(userId)));
    try {
      await updateUser({
        id: userId,
        name: edit.name,
        phone: edit.phone,
        role: edit.role,
      });
      toast.success("Пользователь обновлен");
      setEdits((prev) => {
        const next = { ...prev };
        delete next[String(userId)];
        return next;
      });
    } catch (error: any) {
      toast.error(error.message || "Ошибка при обновлении");
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(String(userId));
        return next;
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await deleteUser({ id: deleteTarget.id });
      toast.success("Пользователь удален");
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error.message || "Ошибка при удалении");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetEdit = (userId: string) => {
    setEdits((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Create New User Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Создать пользователя
          </CardTitle>
          <CardDescription>
            Новому пользователю будет назначен временный пароль
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newUserName">Имя</Label>
              <Input
                id="newUserName"
                placeholder="Иван Иванов"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newUserPhone">Телефон</Label>
              <Input
                id="newUserPhone"
                placeholder="+7 999 123-45-67"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Роль</Label>
              <Select
                value={newUser.role}
                onValueChange={(v: UserRole) => setNewUser({ ...newUser, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <span className="flex items-center gap-2">
                      {roleIcons.user} Пользователь
                    </span>
                  </SelectItem>
                  <SelectItem value="manager">
                    <span className="flex items-center gap-2">
                      {roleIcons.manager} Менеджер
                    </span>
                  </SelectItem>
                  <SelectItem value="admin">
                    <span className="flex items-center gap-2">
                      {roleIcons.admin} Администратор
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleCreateUser}
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Создание...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Создать
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Пользователи</CardTitle>
              <CardDescription>
                Управление учетными записями
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-gray-500">Фильтр:</Label>
              <Select
                value={roleFilter}
                onValueChange={(v: UserRole) => setRoleFilter(v)}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Пользователи</SelectItem>
                  <SelectItem value="manager">Менеджеры</SelectItem>
                  <SelectItem value="admin">Администраторы</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!users ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Нет пользователей с ролью "{roleLabels[roleFilter]}"
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => {
                const edit = getEditUser(user);
                const isSaving = savingIds.has(String(user._id));
                const changed = hasChanges(user);

                return (
                  <div
                    key={user._id}
                    className="border rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <Badge className={roleBadgeColors[edit.role]}>
                        <span className="flex items-center gap-1">
                          {roleIcons[edit.role]}
                          {roleLabels[edit.role]}
                        </span>
                      </Badge>
                      {user.tempPassword && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                          Требуется смена пароля
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Имя</Label>
                        <Input
                          value={edit.name}
                          onChange={(e) =>
                            setEdits((prev) => ({
                              ...prev,
                              [String(user._id)]: { ...edit, name: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Телефон</Label>
                        <Input
                          value={edit.phone}
                          onChange={(e) =>
                            setEdits((prev) => ({
                              ...prev,
                              [String(user._id)]: { ...edit, phone: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Роль</Label>
                        <Select
                          value={edit.role}
                          onValueChange={(v: UserRole) =>
                            setEdits((prev) => ({
                              ...prev,
                              [String(user._id)]: { ...edit, role: v },
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Пользователь</SelectItem>
                            <SelectItem value="manager">Менеджер</SelectItem>
                            <SelectItem value="admin">Администратор</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetEdit(String(user._id))}
                        disabled={!changed || isSaving}
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Сброс
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSaveUser(user._id)}
                        disabled={!changed || isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-1" />
                        )}
                        Сохранить
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setDeleteTarget({
                            id: user._id,
                            name: user.name || "Без имени",
                          })
                        }
                        disabled={isSaving}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Удалить
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить пользователя "{deleteTarget?.name}"?
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Удаление...
                </>
              ) : (
                "Удалить"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
```

## Required shadcn/ui Components

Ensure these are installed:

```bash
bunx shadcn@latest add card alert-dialog badge
```

## Changes Summary

1. **Fixed Imports**: Changed from raw Radix imports to shadcn/ui components
2. **Added Loading States**: Spinner indicators for create, save, delete operations
3. **Added Confirmation Dialog**: AlertDialog for delete actions
4. **Better UX**:
   - Role badges with icons and colors
   - Temporary password warning badge
   - Disabled buttons during operations
   - Toast notifications for all actions
5. **Improved Layout**: Using Card components for sections

## Testing Checklist

- [ ] Create user form validates required fields
- [ ] New user creation shows temporary password in toast
- [ ] Role filter switches between user types
- [ ] Editing user shows changed state on Save button
- [ ] Reset button clears pending changes
- [ ] Save button updates user and shows toast
- [ ] Delete button opens confirmation dialog
- [ ] Cancel in dialog closes without deleting
- [ ] Confirm in dialog deletes user
- [ ] Loading spinners appear during async operations
- [ ] Error toasts appear on failures
- [ ] Users list updates reactively after changes
