"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AuthRegisterPage() {
  const router = useRouter();
  const register = useMutation(api.auth.register_manager);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(password ? { name, phone, password } : { name, phone });
      // After register, redirect to login
      router.replace("/auth");
    } catch (err: any) {
      setError(err?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white">
      <div className="w-full max-w-sm p-6">
        <div className="flex flex-col items-center mb-6">
          <Image src="/logo.webp" alt="Logo" width={120} height={120} priority />
          <h1 className="mt-2 text-xl font-semibold">Регистрация менеджера</h1>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Имя</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Иван Иванов"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7XXXXXXXXXX"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль (необязательно)</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Придумайте пароль"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Button variant="link" type="button" onClick={() => router.push("/auth")}>Назад ко входу</Button>
          <Button
            variant="link"
            type="button"
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
      </div>
    </div>
  );
}