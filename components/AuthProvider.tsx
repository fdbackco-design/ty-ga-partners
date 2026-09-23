"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  validateName,
  validatePassword,
  validatePhone,
  validateRrnBackFirst,
  validateRrnFront,
  validateUsername,
  type UserProfile,
} from "@/lib/auth";

type SignupInput = {
  username: string;
  password: string;
  passwordConfirm: string;
  name: string;
  phone: string;
  rrnFront: string;
  rrnBackFirst: string;
};

type AuthResult = { ok: true; admin?: boolean } | { ok: false; error: string };

type AuthContextValue = {
  user: UserProfile | null;
  ready: boolean;
  isAdmin: boolean;
  signup: (input: SignupInput) => Promise<AuthResult>;
  login: (username: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  refreshMember: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/me", { cache: "no-store" });
        const data = (await res.json()) as { admin?: boolean; username?: string };
        if (!cancelled && data.admin && data.username) {
          setIsAdmin(true);
          setUser({
            username: data.username,
            name: "관리자",
            phone: "",
            rrnFront: "",
            rrnBackFirst: "",
          });
          setReady(true);
          return;
        }
      } catch {
        // continue with member session
      }
      try {
        const res = await fetch("/api/member/me", { cache: "no-store" });
        const data = (await res.json()) as { user?: UserProfile | null };
        if (!cancelled && data.user) {
          setIsAdmin(false);
          setUser(data.user);
          setReady(true);
          return;
        }
      } catch {
        // not signed in
      }
      if (cancelled) return;
      setIsAdmin(false);
      setUser(null);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signup = useCallback(async (input: SignupInput): Promise<AuthResult> => {
    const usernameError = validateUsername(input.username);
    if (usernameError) return { ok: false, error: usernameError };
    const passwordError = validatePassword(input.password);
    if (passwordError) return { ok: false, error: passwordError };
    if (input.password !== input.passwordConfirm) {
      return { ok: false, error: "비밀번호가 일치하지 않습니다." };
    }
    const nameError = validateName(input.name);
    if (nameError) return { ok: false, error: nameError };
    const phoneError = validatePhone(input.phone);
    if (phoneError) return { ok: false, error: phoneError };
    const rrnFrontError = validateRrnFront(input.rrnFront);
    if (rrnFrontError) return { ok: false, error: rrnFrontError };
    const rrnBackError = validateRrnBackFirst(input.rrnBackFirst);
    if (rrnBackError) return { ok: false, error: rrnBackError };

    const res = await fetch("/api/member/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = (await res.json()) as { error?: string; user?: UserProfile };
    if (!res.ok || !data.user) {
      return { ok: false, error: data.error || "회원가입에 실패했습니다." };
    }
    setIsAdmin(false);
    setUser(data.user);
    return { ok: true };
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<AuthResult> => {
    try {
      const adminRes = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (adminRes.ok) {
        const data = (await adminRes.json()) as { username?: string };
        const adminName = data.username || username.trim();
        setIsAdmin(true);
        setUser({
          username: adminName,
          name: "관리자",
          phone: "",
          rrnFront: "",
          rrnBackFirst: "",
        });
        return { ok: true, admin: true };
      }
    } catch {
      // continue with member login
    }

    const res = await fetch("/api/member/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = (await res.json()) as { error?: string; user?: UserProfile };
    if (!res.ok || !data.user) {
      return { ok: false, error: data.error || "아이디 또는 비밀번호가 올바르지 않습니다." };
    }
    setIsAdmin(false);
    setUser(data.user);
    return { ok: true, admin: false };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAdmin(false);
    void fetch("/api/admin/logout", { method: "POST" });
    void fetch("/api/member/session", { method: "DELETE" });
  }, []);

  const refreshMember = useCallback(async () => {
    const res = await fetch("/api/member/me", { cache: "no-store" });
    const data = (await res.json()) as { user?: UserProfile | null };
    if (data.user) setUser(data.user);
  }, []);

  const value = useMemo(
    () => ({ user, ready, isAdmin, signup, login, logout, refreshMember }),
    [user, ready, isAdmin, signup, login, logout, refreshMember],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
