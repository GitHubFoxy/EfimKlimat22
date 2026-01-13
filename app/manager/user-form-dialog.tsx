"use client";

import { useState, useEffect } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Check } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any; // If provided, we are in edit mode
}

export function UserFormDialog({ isOpen, onClose, user }: UserFormDialogProps) {
  const isEdit = !!user;
  const createUser = useAction(api.users.create_user_with_role);
  const updateUser = useMutation(api.users.update_user);

  const [isLoading, setIsLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    role: "manager" as "user" | "manager" | "admin",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        role: user.role || "manager",
      });
    } else {
      setFormData({
        name: "",
        phone: "",
        role: "manager",
      });
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      if (isEdit) {
        await updateUser({
          id: user._id,
          name: formData.name,
          phone: formData.phone,
          role: formData.role,
        });
        toast.success("User updated successfully");
        onClose();
      } else {
        const result = await createUser({
          name: formData.name,
          phone: formData.phone,
          role: formData.role,
        });
        setTempPassword(result.tempPassword);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || (isEdit ? "Failed to update user" : "Failed to create user"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPassword = () => {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleClosePasswordDialog = () => {
    setTempPassword(null);
    onClose();
  };

  if (tempPassword) {
    return (
      <Dialog open={true} onOpenChange={handleClosePasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Created Successfully</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The user has been created. Share this temporary password with the user:
            </p>
            <div className="flex gap-2">
              <Input
                type="text"
                value={tempPassword}
                readOnly
                className="font-mono"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyPassword}
                className="px-3"
              >
                {isCopied ? <Check className="h-4 w-4" /> : "Copy"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              The user should change this password on first login.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleClosePasswordDialog}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit User" : "Add New User"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(val: any) => setFormData({ ...formData, role: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
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
