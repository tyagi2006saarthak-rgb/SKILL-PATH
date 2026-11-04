import { useEffect } from "react";
import { Check, CircleAlert, X } from "lucide-react";

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(onClose, 3800);
    return () => clearTimeout(timer);
  }, [toast, onClose]);
  if (!toast) return null;
  const Icon = toast.type === "error" ? CircleAlert : Check;
  return <div className={`toast toast-${toast.type || "success"}`}><Icon size={18}/><span>{toast.message}</span><button className="icon-btn" onClick={onClose} aria-label="Dismiss"><X size={15}/></button></div>;
}
