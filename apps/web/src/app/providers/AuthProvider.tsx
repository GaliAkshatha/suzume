import { createContext, ReactNode, useContext, useEffect, useState, useCallback } from "react";
import { AuthUser } from "@suzume/shared-types";
import { LoginInput, RegisterInput } from "@suzume/validation";
import { authApi } from "../../services/api/authApi";
import { setUnauthorizedHandler } from "../../services/api/client";

interface AuthContextValue {
  user: AuthUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  login: (input: LoginInput) => Promise<boolean>;
  register: (input: RegisterInput) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");

  const handleUnauthorized = useCallback(() => {
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(handleUnauthorized);
  }, [handleUnauthorized]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const refreshedUser = await authApi.refresh();
        if (!cancelled) {
          setUser(refreshedUser);
          setStatus("authenticated");
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setStatus("unauthenticated");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (input: LoginInput) => {
    const { user: loggedInUser, needsPreparationSetup } = await authApi.login(input);
    setUser(loggedInUser);
    setStatus("authenticated");
    return needsPreparationSetup;
  };

  const register = async (input: RegisterInput) => {
    const { user: registeredUser, needsPreparationSetup } = await authApi.register(input);
    setUser(registeredUser);
    setStatus("authenticated");
    return needsPreparationSetup;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setStatus("unauthenticated");
  };

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
