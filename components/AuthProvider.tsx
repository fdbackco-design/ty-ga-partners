"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  findUser,
  hashPassword,
  loadSession,
  loadUsers,
  saveSession,
  saveUsers,
  toProfile,
  validateName,
  validatePassword,
  validatePhone,
  validateRrnBackFirst,
  validateRrnFront,
  validateUsername,
  type StoredUser,
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

type AuthResult = { ok: true } | { ok: false; error: string };

type AuthContextValue = {
  user: UserProfile | null;
  ready: boolean;
  signup: (input: SignupInput) => Promise<AuthResult>;
  login: (username: string, password: string) => Promise<AuthResult>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const username = loadSession();
    if (username) {
      const stored = findUser(username);
      setUser(stored ? toProfile(stored) : null);
      if (!stored) saveSession(null);
    }
    setReady(true);
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
    if (findUser(input.username)) {
      return { ok: false, error: "이미 사용 중인 아이디입니다." };
    }

    const next: StoredUser = {
      username: input.username.trim(),
      passwordHash: await hashPassword(input.password),
      name: input.name.trim(),
      phone: input.phone.replace(/\D/g, ""),
      rrnFront: input.rrnFront,
      rrnBackFirst: input.rrnBackFirst,
    };
    saveUsers([...loadUsers(), next]);
    saveSession(next.username);
    setUser(toProfile(next));
    return { ok: true };
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<AuthResult> => {
    const stored = findUser(username);
    if (!stored) return { ok: false, error: "아이디 또는 비밀번호가 올바르지 않습니다." };
    const passwordHash = await hashPassword(password);
    if (stored.passwordHash !== passwordHash) {
      return { ok: false, error: "아이디 또는 비밀번호가 올바르지 않습니다." };
    }
    saveSession(stored.username);
    setUser(toProfile(stored));
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    saveSession(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, signup, login, logout }),
    [user, ready, signup, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
