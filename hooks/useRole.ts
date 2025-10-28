"use client";

import { useEffect, useState } from "react";

export type Role = "user" | "manager" | "admin";

export function useRole() {
  const [role, setRole] = useState<Role>(() => {
    if (typeof window === "undefined") return "user";
    const stored = window.localStorage.getItem("role") as Role | null;
    if (stored) return stored;
    return process.env.NODE_ENV === "development" ? "manager" : "user";
  });

  const [managerId, setManagerId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("managerId");
  });

  useEffect(() => {
    try {
      window.localStorage.setItem("role", role);
    } catch {}
  }, [role]);

  useEffect(() => {
    try {
      if (managerId) window.localStorage.setItem("managerId", managerId);
    } catch {}
  }, [managerId]);

  return { role, setRole, managerId, setManagerId } as const;
}