import React, { createContext, useContext, useState, useEffect } from "react";
import { IUser, UserRole } from "../types";
import { AuthController } from "../server/controllers/authController";
import { SEED_USERS } from "../data/seedListings";

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  demoUsers: IUser[];
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalMode: "login" | "register";
  setAuthModalMode: (mode: "login" | "register") => void;
  login: (email: string) => { success: boolean; message?: string };
  register: (data: { name: string; email: string; role: UserRole; bio?: string }) => { success: boolean; message?: string };
  logout: () => void;
  switchUser: (user: IUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "airbnb_active_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to the demo guest so user can immediately experience reserving without a barrier
  const [user, setUser] = useState<IUser | null>(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(AUTH_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return SEED_USERS[3]; // Alex Morgan (Guest)
  });

  const [loading, setLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const [demoUsers, setDemoUsers] = useState<IUser[]>(() => AuthController.getDemoUsers());

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = (email: string) => {
    const res = AuthController.login(email);
    if (res.success && res.user) {
      setUser(res.user);
      setAuthModalOpen(false);
      return { success: true };
    }
    return { success: false, message: res.message };
  };

  const register = (data: { name: string; email: string; role: UserRole; bio?: string }) => {
    const res = AuthController.register(data);
    if (res.success && res.user) {
      setUser(res.user);
      setDemoUsers(AuthController.getDemoUsers());
      setAuthModalOpen(false);
      return { success: true };
    }
    return { success: false, message: res.message };
  };

  const logout = () => {
    setUser(null);
  };

  const switchUser = (selectedUser: IUser) => {
    setUser(selectedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        demoUsers,
        authModalOpen,
        setAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        login,
        register,
        logout,
        switchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
