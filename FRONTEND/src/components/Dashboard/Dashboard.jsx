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
      sidebarBg: "#1f2937",
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

  // helpers fetch con token
  async function api(method, url, body) {
    const token = localStorage.getItem("token");
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    if (!res.ok) {
      const msg = data?.detail || data?.message || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return data;
  }
  const apiGet = (path) => api("GET", `${BASE}${path}`);
  const apiPost = (path, body) => api("POST", `${BASE}${path}`, body);
  const apiPatch = (path, body) => api("PATCH", `${BASE}${path}`, body);
  const apiDelete = (path) => api("DELETE", `${BASE}${path}`);

  // Cargar perfil
  useEffect(() => {
    const load = async () => {
      try {
        await new Promise((r) => setTimeout(r));
        const data = await apiGet("/profile/");
        setMe(data);
      } catch (e) {
        alert("Sesión inválida o expirada");
        logout();
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- navegación por hash (#/roles, #/usuarios)
  const [section, setSection] = useState(() =>
    parseSection(window.location.hash)
  );
  useEffect(() => {
    const onHash = () => setSection(parseSection(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  function parseSection(h) {
    const s = (h || "").replace(/^#\/?/, "");
    return s || ""; // "", "roles", "usuarios"
  }

  return (
    <>
      {/* SIDEBAR FIJO */}
      <AppSidebar
        user={me}
        collapsed={collapsed}
        palette={palette}
        onToggle={() => setCollapsed((v) => !v)}
      />

      {/* CONTENIDO */}
      <div
        style={{
          minHeight: "100vh",
          color: palette.text,
          marginLeft: sidebarWidth,
          transition: "margin .2s ease",
        }}
      >
        {/* Header */}
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
            {me?.rolNombre ? ` — ${me.rolNombre}` : ""}
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

        {/* Área de contenido */}
        <div style={{ padding: 20 }}>
          {!me ? (
            <div style={{ color: palette.dimText }}>Cargando…</div>
          ) : section === "roles" ? (
            <RolesPanel
              me={me}
              palette={palette}
              apiGet={apiGet}
              apiPost={apiPost}
              apiPatch={apiPatch}
              apiDelete={apiDelete}
            />
          ) : section === "usuarios" ? (
            <UsersPanel
              me={me}
              palette={palette}
              apiGet={apiGet}
              apiPatch={apiPatch}
            />
          ) : (
            <HomeCards palette={palette} />
          )}
        </div>
      </div>
    </>
  );
}

/* =========================
   PANELES
   ========================= */

function RolesPanel({ me, palette, apiGet, apiPost, apiPatch, apiDelete }) {
  // 👇 Hooks SIEMPRE arriba
  const isAdmin = me?.rolNombre === "Administrador";
  const [roles, setRoles] = useState([]);
  const [nuevo, setNuevo] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  async function load() {
    try {
      setLoading(true);
      const data = await apiGet("/roles");
      setRoles(Array.isArray(data) ? data : []);
      setMsg("");
    } catch (e) {
      setMsg(e.message || "Error al cargar roles");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAdmin) return; // no ejecutes si no es admin
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <ForbiddenBlock
        palette={palette}
        text="Solo Administrador puede gestionar roles."
      />
    );
  }

  async function onCreate(e) {
    e.preventDefault();
    if (!nuevo.trim()) return;
    try {
      await apiPost("/roles", { nombre: nuevo.trim() });
      setNuevo("");
      load();
    } catch (e) {
      alert(e.message || "Error al crear rol");
    }
  }

  async function onRename(r) {
    const nombre = window.prompt("Nuevo nombre para el rol:", r.nombre);
    if (!nombre || nombre.trim() === r.nombre) return;
    try {
      await apiPatch(`/roles/${r.idRol}`, { nombre: nombre.trim() });
      load();
    } catch (e) {
      alert(e.message || "Error al renombrar");
    }
  }

  async function onDelete(r) {
    if (r.nombre === "Administrador") {
      alert("No puedes borrar el rol 'Administrador'.");
      return;
    }
    if (!window.confirm(`¿Eliminar rol "${r.nombre}"?`)) return;
    try {
      await apiDelete(`/roles/${r.idRol}`);
      load();
    } catch (e) {
      alert(e.message || "No se pudo eliminar (¿rol en uso?)");
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 12 }}>Gestión de Roles</h2>

      <form
        onSubmit={onCreate}
        style={{ display: "flex", gap: 8, marginBottom: 16 }}
      >
        <input
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          placeholder="Nombre del rol"
          style={{
            padding: 8,
            borderRadius: 8,
            border: `1px solid ${palette.border}`,
            background: "transparent",
            color: palette.text,
          }}
        />
        <button
          type="submit"
          style={{
            background: "#4f46e5",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 14px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Crear
        </button>
      </form>

      {loading ? (
        <div style={{ color: palette.dimText }}>Cargando roles…</div>
      ) : msg ? (
        <div style={{ color: "#ef4444" }}>{msg}</div>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: `1px solid ${palette.border}`,
          }}
        >
          <thead>
            <tr style={{ background: palette.cardBg }}>
              <th style={thStyle(palette)}>ID</th>
              <th style={thStyle(palette)}>Nombre</th>
              <th style={thStyle(palette)}></th>
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr
                key={r.idRol}
                style={{ borderTop: `1px solid ${palette.border}` }}
              >
                <td style={tdStyle(palette)}>{r.idRol}</td>
                <td style={tdStyle(palette)}>{r.nombre}</td>
                <td style={{ ...tdStyle(palette), textAlign: "right" }}>
                  <button
                    onClick={() => onRename(r)}
                    style={btnGhost("#4f46e5")}
                  >
                    Renombrar
                  </button>
                  <button
                    onClick={() => onDelete(r)}
                    style={btnGhost("#ef4444")}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function UsersPanel({ me, palette, apiGet, apiPatch }) {
  // 👇 Hooks SIEMPRE arriba
  const isAdmin = me?.rolNombre === "Administrador";
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // edición por fila
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nombre: "", correo: "", telefono: "" });

  async function load() {
    try {
      setLoading(true);
      const rolesData = await apiGet("/roles");
      setRoles(Array.isArray(rolesData) ? rolesData : []);

      let listResp = null;
      try {
        listResp = await apiGet("/mostrarUsuarios");
      } catch {
        try {
          listResp = await apiGet("/mostrarUsuarios/");
        } catch {
          listResp = await apiGet("/usuarios");
        }
      }

      const list = Array.isArray(listResp?.values)
        ? listResp.values
        : Array.isArray(listResp)
        ? listResp
        : [];

      setUsers(list);
      setMsg("");
    } catch (e) {
      const m = String(e.message || "");
      if (m.includes("404"))
        setMsg("HTTP 404 — Ruta no encontrada. Revisa las URLs en backend.");
      else if (m.includes("403"))
        setMsg("403 — No tienes permisos para ver esto.");
      else setMsg(m || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAdmin) return; // no ejecutes si no es admin
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <ForbiddenBlock
        palette={palette}
        text="Solo Administrador puede gestionar usuarios."
      />
    );
  }

  async function changeRole(userId, idRol) {
    try {
      await apiPatch(`/usuarios/${userId}/set-rol`, { idRol: Number(idRol) });
      load();
    } catch (e) {
      alert(
        e.message ||
          "No se pudo cambiar el rol (¿tratas de degradar al único admin?)"
      );
    }
  }

  function startEdit(u) {
    setEditId(u.id);
    setForm({
      nombre: u.nombre || "",
      correo: u.correo || "",
      telefono: u.telefono || "",
    });
  }

  function cancelEdit() {
    setEditId(null);
    setForm({ nombre: "", correo: "", telefono: "" });
  }

  async function saveEdit(userId) {
    try {
      await apiPatch(`/usuarios/${userId}/update-basic`, {
        nombre: form.nombre?.trim(),
        correo: form.correo?.trim(),
        telefono: form.telefono?.trim(),
      });
      cancelEdit();
      load();
    } catch (e) {
      alert(e.message || "No se pudo guardar");
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 12 }}>Usuarios</h2>

      {loading ? (
        <div style={{ color: palette.dimText }}>Cargando usuarios…</div>
      ) : msg ? (
        <div style={{ color: "#ef4444" }}>{msg}</div>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: `1px solid ${palette.border}`,
          }}
        >
          <thead>
            <tr style={{ background: palette.cardBg }}>
              <th style={thStyle(palette)}>ID</th>
              <th style={thStyle(palette)}>Usuario</th>
              <th style={thStyle(palette)}>Nombre</th>
              <th style={thStyle(palette)}>Correo</th>
              <th style={thStyle(palette)}>Teléfono</th>
              <th style={thStyle(palette)}>Rol actual</th>
              <th style={thStyle(palette)}>Cambiar rol</th>
              <th style={thStyle(palette)}></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isEditing = editId === u.id;
              return (
                <tr
                  key={u.id}
                  style={{ borderTop: `1px solid ${palette.border}` }}
                >
                  <td style={tdStyle(palette)}>{u.id}</td>
                  <td style={tdStyle(palette)}>{u.username}</td>

                  {/* NOMBRE */}
                  <td style={tdStyle(palette)}>
                    {isEditing ? (
                      <input
                        value={form.nombre}
                        onChange={(e) =>
                          setForm({ ...form, nombre: e.target.value })
                        }
                        style={{
                          width: "100%",
                          padding: 6,
                          borderRadius: 6,
                          border: `1px solid ${palette.border}`,
                          background: "transparent",
                          color: palette.text,
                        }}
                      />
                    ) : (
                      u.nombre
                    )}
                  </td>

                  {/* CORREO */}
                  <td style={tdStyle(palette)}>
                    {isEditing ? (
                      <input
                        value={form.correo}
                        onChange={(e) =>
                          setForm({ ...form, correo: e.target.value })
                        }
                        type="email"
                        style={{
                          width: "100%",
                          padding: 6,
                          borderRadius: 6,
                          border: `1px solid ${palette.border}`,
                          background: "transparent",
                          color: palette.text,
                        }}
                      />
                    ) : (
                      u.correo
                    )}
                  </td>

                  {/* TELÉFONO */}
                  <td style={tdStyle(palette)}>
                    {isEditing ? (
                      <input
                        value={form.telefono}
                        onChange={(e) =>
                          setForm({ ...form, telefono: e.target.value })
                        }
                        style={{
                          width: "100%",
                          padding: 6,
                          borderRadius: 6,
                          border: `1px solid ${palette.border}`,
                          background: "transparent",
                          color: palette.text,
                        }}
                      />
                    ) : (
                      u.telefono || "—"
                    )}
                  </td>

                  <td style={tdStyle(palette)}>{u.rolNombre || "—"}</td>
                  <td style={tdStyle(palette)}>
                    <select
                      defaultValue={u.idRol}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                      style={{
                        padding: 6,
                        borderRadius: 6,
                        background: "transparent",
                        color: palette.text,
                      }}
                      disabled={isEditing}
                    >
                      {roles.map((r) => (
                        <option
                          key={r.idRol}
                          value={r.idRol}
                          style={{ color: "#111827" }}
                        >
                          {r.nombre}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td
                    style={{
                      ...tdStyle(palette),
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {!isEditing ? (
                      <button
                        onClick={() => startEdit(u)}
                        style={btnGhost("#4f46e5")}
                      >
                        Editar
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => saveEdit(u.id)}
                          style={btnGhost("#10b981")}
                        >
                          Guardar
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={btnGhost("#ef4444")}
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* =========================
   Home por defecto
   ========================= */
function HomeCards({ palette }) {
  return (
    <>
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
    </>
  );
}

/* =========================
   Utilidades UI
   ========================= */
function ForbiddenBlock({ palette, text }) {
  return (
    <div
      style={{
        border: `1px solid ${palette.border}`,
        background: palette.cardBg,
        borderRadius: 12,
        padding: 16,
        color: palette.dimText,
      }}
    >
      <strong>403</strong> — {text}
    </div>
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

const thStyle = (palette) => ({
  textAlign: "left",
  padding: "10px 12px",
  borderBottom: `1px solid ${palette.border}`,
  color: palette.dimText,
  fontWeight: 700,
  fontSize: 13,
});
const tdStyle = (palette) => ({
  padding: "10px 12px",
  verticalAlign: "top",
});

/* Botón ghost para acciones pequeñas */
const btnGhost = (color) => ({
  background: "transparent",
  color,
  border: `1px solid ${color}`,
  padding: "6px 10px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
  marginLeft: 8,
});
