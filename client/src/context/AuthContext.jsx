import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const logout = () => {
    localStorage.removeItem("skillpath_token");
    setUser(null);
  };
  useEffect(() => {
    const token = localStorage.getItem("skillpath_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api.get("/auth/me")
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem("skillpath_token"))
      .finally(() => setLoading(false));
    const handleUnauthorized = () => setUser(null);
    window.addEventListener("skillpath:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("skillpath:unauthorized", handleUnauthorized);
  }, []);
  const value = useMemo(() => ({
    user,
    loading,
    logout,
    authenticate: (data) => {
      localStorage.setItem("skillpath_token", data.token);
      setUser(data.user);
    },
    updateUser: (updated) => setUser(updated)
  }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
