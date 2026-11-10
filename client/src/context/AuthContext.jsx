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
    let active = true;
    const token = localStorage.getItem("skillpath_token");
    if (!token) {
      setLoading(false);
    } else {
      api.get("/auth/me")
        .then(({ data }) => {
          if (data.user.email?.endsWith("@skillpath.invalid")) {
            localStorage.removeItem("skillpath_token");
            return;
          }
          if (active) setUser(data.user);
        })
        .catch((error) => {
          if (error.response?.status === 401) {
            localStorage.removeItem("skillpath_token");
          } else {
            console.error("Could not verify the current session:", error);
          }
          if (active) setUser(null);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }

    const handleUnauthorized = () => {
      localStorage.removeItem("skillpath_token");
      setUser(null);
    };

    window.addEventListener("skillpath:unauthorized", handleUnauthorized);
    return () => {
      active = false;
      window.removeEventListener("skillpath:unauthorized", handleUnauthorized);
    };
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
