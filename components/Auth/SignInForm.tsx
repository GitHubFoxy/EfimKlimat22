"use client";

import { useAuthActions, useAuthToken } from "@convex-dev/auth/react";
import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { api } from "@/convex/_generated/api";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const token = useAuthToken();
  const isAuthenticated = token !== null;
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const currentUser = useQuery(api.users.getCurrentUser);
  const changePassword = useMutation(api.users.changePassword);

  if (isAuthenticated && currentUser !== undefined) {
    if (currentUser?.tempPassword) {
      if (!showPasswordChange) {
        setShowPasswordChange(true);
      }
    } else {
      router.push("/manager");
      return null;
    }
  }

  if (showPasswordChange) {
    return (
      <ChangePasswordForm
        onSubmit={async (newPassword) => {
          await changePassword({ newPassword });
        }}
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn("password", {
        phone,
        password,
        flow: "signIn",
      });
    } catch {
      setError("Неверный телефон или пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Вход</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+7 (999) 999-99-99"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Вход..." : "Войти"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
