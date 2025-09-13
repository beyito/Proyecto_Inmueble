// src/components/Dashboard/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppSidebar from "./AppSidebar";

const BASE = "http://127.0.0.1:8000/usuario";

export default function Dashboard() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);

  // ---- Tema (persistente)
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
  };

  // ---- Sidebar
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 72 : 264;

  // ---- Paleta
  const palette = useMemo(() => {
    if (theme === "dark") {
      return {
        bodyBg: "#0f172a",
        text: "#e5e7eb",
        sidebarBg: "#1f2937",
        sidebarText: "#e5e7eb",
        border: "#1f2937",
        cardBg: "#111827",
        dimText: "#94a3b8",
      };
    }
    return {
      bodyBg: "#f8fafc",
      text: "#0f172a",
      sidebarBg: "#1f2937", // sidebar se mantiene oscuro como tu modelo
      sidebarText: "#e5e7eb",
      border: "#e5e7eb",
      cardBg: "#ffffff",
      dimText: "#6b7280",
    };
  }, [theme]);

  // Fondo body
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = palette.bodyBg;
    return () => {
      document.body.style.background = prev;
    };
  }, [palette.bodyBg]);

  // ---- Sesión
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BASE}/profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({}),
        });
        const data = await res.json();
        if (!res.ok) {
          console.error("PROFILE ERROR", res.status, data);
          throw new Error(data.detail || `HTTP ${res.status}`);
        }
        setMe(data);
      } catch (e) {
        alert("Sesión inválida o expirada");
        logout();
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* SIDEBAR FIJO */}
      <AppSidebar
        user={me}
        collapsed={collapsed}
        palette={palette}
        onToggle={() => setCollapsed((v) => !v)}
      />

      {/* CONTENIDO (con margen según sidebar) */}
      <div
        style={{
          minHeight: "100vh",
          color: palette.text,
          marginLeft: sidebarWidth,
          transition: "margin .2s ease",
        }}
      >
        {/* Encabezado simple del contenido */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "14px 20px",
            borderBottom: `1px solid ${palette.border}`,
          }}
        >
          <div style={{ fontWeight: 800 }}>
            Bienvenido{me?.nombre ? `, ${me.nombre}` : ""} 👋
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={toggleTheme}
              style={{
                background: theme === "dark" ? "#4f46e5" : "#111827",
                color: "#fff",
                border: "none",
                borderRadius: 999,
                padding: "8px 12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {theme === "dark" ? "☀️ Claro" : "🌙 Oscuro"}
            </button>
            <button
              onClick={logout}
              style={{
                background: "#ef4444",
                color: "#fff",
                border: "none",
                borderRadius: 999,
                padding: "8px 12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Área de tarjetas / contenido */}
        <div style={{ padding: 20 }}>
          <p style={{ color: palette.dimText, marginTop: 4 }}>
            Panel principal con accesos rápidos.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
              marginTop: 16,
            }}
          >
            <Card title="Estado de cuenta" value="—" palette={palette} />
            <Card title="Reservas activas" value="—" palette={palette} />
            <Card title="Notificaciones" value="—" palette={palette} />
          </div>
        </div>
      </div>
    </>
  );
}

function Card({ title, value, palette }) {
  return (
    <div
      style={{
        background: palette.cardBg,
        border: `1px solid ${palette.border}`,
        borderRadius: 12,
        padding: 16,
      }}
    >
      <div style={{ color: palette.dimText, fontSize: 13 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>{value}</div>
    </div>
  );
}
