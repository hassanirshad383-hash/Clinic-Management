import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, setUnauthorizedHandler, type SafeAdminUser } from "./api";

interface AuthContextValue {
  admin: SafeAdminUser | null;
  status: "checking" | "authenticated" | "anonymous";
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<SafeAdminUser | null>(null);
  const [status, setStatus] = useState<"checking" | "authenticated" | "anonymous">("checking");

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAdmin(null);
      setStatus("anonymous");
    });
  }, []);

  // On first load there's no access token in memory yet (a hard refresh
  // clears it, since it's intentionally never persisted to storage) — but
  // the httpOnly refresh cookie may still be valid, so try a silent refresh
  // before deciding the visitor is logged out.
  useEffect(() => {
    (async () => {
      try {
        const me = await api.getMe();
        setAdmin({ ...me, isActive: true, lastLoginAt: null });
        setStatus("authenticated");
      } catch {
        setStatus("anonymous");
      }
    })();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      admin,
      status,
      async login(email, password) {
        const loggedInAdmin = await api.login(email, password);
        setAdmin(loggedInAdmin);
        setStatus("authenticated");
      },
      async logout() {
        await api.logout().catch(() => {});
        setAdmin(null);
        setStatus("anonymous");
      },
    }),
    [admin, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
