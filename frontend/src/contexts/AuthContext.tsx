"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { AuthUser } from "@/utils/types/login";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    user: AuthUser,
    accessToken: string,
    refreshToken: string,
  ) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        const storedUser = localStorage.getItem("user");
        const accessToken = localStorage.getItem("accessToken");

        if (storedUser && accessToken) {
          setUser(JSON.parse(storedUser));
        }
      } catch {
        localStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    setUser(null);
  }, []);

  // When the API layer detects an expired/invalid session (failed token
  // refresh), it dispatches this event so we clean up the in-memory state.
  useEffect(() => {
    const handleSessionExpired = () => {
      logout();
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, [logout]);

  const login = (
    authenticatedUser: AuthUser,
    accessToken: string,
    refreshToken: string,
  ) => {
    localStorage.setItem("token", accessToken);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("role", authenticatedUser.role);
    localStorage.setItem("user", JSON.stringify(authenticatedUser));

    setUser(authenticatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
