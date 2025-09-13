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
  const [showModal, setShowModal] = useState(false);


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
        <button
            className="side-avatar"
            onClick={() => setShowModal(true)}
            title="Ver perfil"
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: 40,
              height: 40,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {initials[0]}
          </button>

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
              {showModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
              zIndex: 9999,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                background: palette.cardBg,
                color: palette.text,
                padding: 24,
                borderRadius: 12,
                width: 360,
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              }}
            >
              <h2 style={{ marginTop: 0 }}>Mi perfil</h2>
              <p><strong>Nombre:</strong> {user?.nombre}</p>
              <p><strong>Correo:</strong> {user?.correo}</p>
              <p><strong>Teléfono:</strong> {user?.telefono}</p>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: "#e5e7eb",
                    color: "#111827",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 16px",
                    cursor: "pointer",
                    fontWeight: 600,
                    marginRight: 8,
                  }}
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    window.location.href = "/usuario/editar"; // redirige
                  }}
                  style={{
                    background: "#4f46e5",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 16px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Editar perfil
                </button>
              </div>
            </div>
          </div>
        )}

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
