import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);
let guestSessionPromise;

function createGuestSession() {
  if (!guestSessionPromise) {
    guestSessionPromise = api.post("/auth/guest")
      .then(({ data }) => data)
      .finally(() => {
        guestSessionPromise = null;
      });
  }
  return guestSessionPromise;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startupError, setStartupError] = useState("");

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      try {
        if (localStorage.getItem("skillpath_token")) {
          try {
            const { data } = await api.get("/auth/me");
            if (active) setUser(data.user);
            return;
          } catch (error) {
            if (error.response?.status !== 401) throw error;
            localStorage.removeItem("skillpath_token");
          }
        }

        const { token, user: guest } = await createGuestSession();
        localStorage.setItem("skillpath_token", token);
        if (active) setUser(guest);
      } catch (error) {
        console.error("Could not initialize a guest workspace:", error);
        if (active) setStartupError("Could not start your workspace. Check that the API server is running, then try again.");
      } finally {
        if (active) setLoading(false);
      }
    };

    const handleUnauthorized = async () => {
      localStorage.removeItem("skillpath_token");
      setUser(null);
      setLoading(true);
      try {
        const { token, user: guest } = await createGuestSession();
        localStorage.setItem("skillpath_token", token);
        setUser(guest);
        setStartupError("");
      } catch (error) {
        console.error("Could not refresh the guest workspace:", error);
        setStartupError("Could not start your workspace. Check that the API server is running, then try again.");
      } finally {
        setLoading(false);
      }
    };

    window.addEventListener("skillpath:unauthorized", handleUnauthorized);
    initialize();
    return () => {
      active = false;
      window.removeEventListener("skillpath:unauthorized", handleUnauthorized);
    };
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    startupError,
    updateUser: (updated) => setUser(updated)
  }), [user, loading, startupError]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
