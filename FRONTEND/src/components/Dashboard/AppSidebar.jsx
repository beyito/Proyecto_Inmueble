// src/components/Dashboard/AppSidebar.jsx
import React, { useMemo, useState } from "react";
import "./AppSidebar.css";

export default function AppSidebar({
  user,
  collapsed = false,
  palette,
  onToggle, // () => void
}) {
  const initials = useMemo(() => {
    const name = user?.nombre || user?.username || "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  const [query, setQuery] = useState("");

  const items = [
    {
      key: "roles",
      label: "Gestión de Roles y Permisos",
      icon: ShieldUsersIcon,
      href: "#/roles",
    },
    { key: "usuarios", label: "Usuarios", icon: UsersIcon, href: "#/usuarios" },
    { key: "tareas", label: "Tareas", icon: ListIcon, href: "#/tareas" },
    { key: "reportes", label: "Reportes", icon: ChartIcon, href: "#/reportes" },
  ];

  const filtered = items.filter((i) =>
    i.label.toLowerCase().includes(query.toLowerCase())
  );

  const W = collapsed ? 72 : 264;

  return (
    <aside
      className="sidebar"
      style={{
        width: W,
        background: palette.sidebarBg,
        borderRight: `1px solid ${palette.border}`,
        color: palette.sidebarText,
      }}
    >
      {/* Brand / avatar */}
      <div className="side-brand">
        <div className="side-avatar">{initials[0]}</div>
        {!collapsed && (
          <div className="side-title">
            Inmo<span className="accent">biliaria</span>
          </div>
        )}
        <button
          className="side-burger"
          aria-label="Colapsar menú"
          onClick={onToggle}
          title={collapsed ? "Expandir" : "Colapsar"}
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>

      {/* Search */}
      <div
        className="side-search"
        style={{ display: collapsed ? "none" : "flex" }}
      >
        <input
          placeholder="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="search-btn" title="Buscar">
          🔎
        </button>
      </div>

      {/* Nav */}
      <nav className="side-nav">
        {filtered.map(({ key, label, icon: Icon, href }) => (
          <a
            key={key}
            href={href}
            className="nav-item"
            title={label}
            style={{ color: palette.sidebarText }}
          >
            <span className="nav-ic">
              <Icon />
            </span>
            {!collapsed && <span className="nav-label">{label}</span>}
          </a>
        ))}
      </nav>
    </aside>
  );
}

/* --- Íconos SVG simples --- */
function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function ShieldUsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function PawsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="7" cy="8" r="2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17" cy="8" r="2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="9" cy="13" r="1.8" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="15" cy="13" r="1.8" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M8 18c2-1 6-1 8 0"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 6h12M8 12h12M8 18h12"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="4" cy="6" r="1.2" fill="currentColor" />
      <circle cx="4" cy="12" r="1.2" fill="currentColor" />
      <circle cx="4" cy="18" r="1.2" fill="currentColor" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 20V10M10 20V4M16 20v-8M22 20H2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
