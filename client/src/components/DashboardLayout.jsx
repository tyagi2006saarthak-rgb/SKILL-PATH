import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Activity, BookOpen, BriefcaseBusiness, ChartNoAxesCombined, ChevronLeft, ChevronRight, LayoutDashboard, LogOut, Menu, Moon, Sun, UserRound, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/skills", label: "My skills", icon: Activity },
  { to: "/careers", label: "Career paths", icon: BriefcaseBusiness },
  { to: "/roadmap", label: "My roadmap", icon: BookOpen },
  { to: "/progress", label: "My progress", icon: ChartNoAxesCombined },
  { to: "/profile", label: "My profile", icon: UserRound }
];
const titles = { "/": ["Overview", "Your progress, at a glance"], "/skills": ["My skills", "Build a clear picture of what you know"], "/careers": ["Career paths", "Find the direction that feels right"], "/roadmap": ["My roadmap", "Small steps add up to big progress"], "/progress": ["My progress", "Celebrate what you’ve learned along the way"], "/profile": ["My profile", "Your details and career goal"] };

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("skillpath_theme") === "dark");
  const [title, subtitle] = titles[location.pathname] || titles["/"];
  const toggleTheme = () => {
    const value = !dark;
    setDark(value);
    localStorage.setItem("skillpath_theme", value ? "dark" : "light");
  };
  const signOut = () => {
    logout();
    navigate("/login");
  };
  return (
    <div className={`app-shell ${dark ? "theme-dark" : ""} ${collapsed ? "sidebar-collapsed" : ""}`}>
      {mobileOpen && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="brand"><div className="brand-mark">s</div><span className="brand-name">skill<span>path</span></span><button className="icon-btn mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={18}/></button></div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav">
          {links.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setMobileOpen(false)} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}><Icon size={18}/><span>{label}</span></NavLink>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip"><div className="tip-icon"><Activity size={17}/></div><strong>Keep the momentum</strong><p>A little progress each day adds up to big results.</p><NavLink to="/roadmap">View my roadmap <ChevronRight size={14}/></NavLink></div>
          <div className="user-mini"><div className="avatar">{user?.name?.slice(0,1).toUpperCase() || "S"}</div><div className="user-mini-copy"><strong>{user?.name || "Student"}</strong><span>Personal workspace</span></div><button className="icon-btn logout-btn" onClick={signOut} title="Sign out" aria-label="Sign out"><LogOut size={17}/></button></div>
        </div>
        <button className="collapse-btn" aria-label="Collapse sidebar" onClick={() => setCollapsed((v) => !v)}>{collapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}</button>
      </aside>
      <main className="main-panel">
        <header className="topbar"><button className="icon-btn mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={20}/></button><div className="breadcrumbs">Workspace <span>/</span> <strong>{title}</strong></div><div className="topbar-actions"><span className="today-label">{new Intl.DateTimeFormat("en", { weekday: "long", month: "short", day: "numeric" }).format(new Date())}</span><button className="icon-btn theme-toggle" onClick={toggleTheme} title={`Switch to ${dark ? "light" : "dark"} mode`} aria-label="Toggle theme">{dark ? <Sun size={18}/> : <Moon size={18}/>}</button><div className="avatar top-avatar">{user?.name?.slice(0,1).toUpperCase() || "S"}</div></div></header>
        <section className="page-content"><div className="page-heading"><div><h1>{title}</h1><p>{subtitle}</p></div></div><Outlet/></section>
      </main>
    </div>
  );
}
