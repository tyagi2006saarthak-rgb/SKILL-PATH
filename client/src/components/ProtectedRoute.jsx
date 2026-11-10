import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user, loading, startupError } = useAuth();
  if (loading) return <div className="loading-screen"><span className="spinner" /> Preparing your workspace…</div>;
  if (startupError) {
    return <div className="loading-screen"><p>{startupError}</p><button className="btn btn-primary" onClick={() => window.location.reload()}>Try again</button></div>;
  }
  return user ? <Outlet /> : <div className="loading-screen">Could not prepare your workspace. Refresh the page to try again.</div>;
}
