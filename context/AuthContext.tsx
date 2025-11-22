import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthState, User, UserRole } from "../types";
import { mockDb } from "../services/mockSupabase";

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for persisted session
    const storedUser = localStorage.getItem("org_connect_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, role: UserRole, password?: string) => {
    setLoading(true);
    try {
      const loggedInUser = await mockDb.auth.signIn(email, role, password);
      setUser(loggedInUser);
      localStorage.setItem("org_connect_user", JSON.stringify(loggedInUser));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("org_connect_user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
