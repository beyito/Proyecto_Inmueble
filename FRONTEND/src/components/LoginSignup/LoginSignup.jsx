// src/components/LoginSignup/LoginSignup.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginSignup.css";

/* =========================
   Pequeño set de íconos SVG
   ========================= */
const IconHouse = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5z"
      stroke="currentColor"
      strokeWidth="1.7"
    />
  </svg>
);
const IconUser = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);
const IconMail = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.7" />
    <path d="M4 8l8 6 8-6" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);
const IconPhone = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 12 19a19.5 19.5 0 0 1-7.82-7.82A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.63 2.6a2 2 0 0 1-.45 2.11L8.09 9.91A16 16 0 0 0 14.09 15l1.48-1.15a2 2 0 0 1 2.11-.45c.83.3 1.7.51 2.6.63A2 2 0 0 1 22 16.92z"
      stroke="currentColor"
      strokeWidth="1.7"
    />
  </svg>
);
const IconPin = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M12 22s7-4.35 7-11a7 7 0 0 0-14 0c0 6.65 7 11 7 11z"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);
const IconLock = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props}>
    <rect
      x="4"
      y="10"
      width="16"
      height="10"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path d="M8 10V7a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);
const IconId = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props}>
    <rect
      x="3"
      y="4"
      width="18"
      height="16"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <circle cx="9" cy="10" r="2" stroke="currentColor" strokeWidth="1.7" />
    <path d="M5 16a4 4 0 0 1 8 0" stroke="currentColor" strokeWidth="1.7" />
    <path
      d="M14 9h5M14 13h5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

/* =========================
   Componente principal
   ========================= */
export default function LoginSignup() {
  const navigate = useNavigate();

  // Modo
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [tipo, setTipo] = useState("cliente"); // 'cliente' | 'agente'

  // Login
  const [identifier, setIdentifier] = useState(""); // usuario o correo
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  // Signup
  const [username, setUsername] = useState("");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [numeroLicencia, setNumeroLicencia] = useState("");
  const [experiencia, setExperiencia] = useState("");

  // UI
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Paleta sencilla (oscuro/claro según prefers-color-scheme)
  const palette = {
    bg: "#f5f6f7",
    text: "#1a1a1a",
    panel: "#ffffff",
    border: "#d4d4d8",
    dim: "#71717a",
    brand: "#111827",
    brand2: "#374151",
    danger: "#dc2626",
    success: "#16a34a",
  };
  const onRecover = () => {
    navigate("/recuperar-contraseña");
  };

  const BASE = "http://127.0.0.1:8000/usuario"; // recuerda los slashes al final en fetch

  // Helper para POST con manejo de JSON/HTML
  async function postJSON(url, body) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const ct = res.headers.get("content-type") || "";
    const raw = await res.text();
    let data = null;
    if (ct.includes("application/json")) {
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error("Respuesta no válida del servidor.");
      }
    } else {
      // HTML o texto → construir error legible
      throw new Error(
        `Servidor devolvió ${res.status} (${ct}). ${raw.slice(0, 140)}`
      );
    }
    return { res, data };
  }

  async function handleSubmit() {
    try {
      setLoading(true);
      setMsg("");

      if (mode === "login") {
        // LOGIN
        if (!identifier.trim() || !password.trim()) {
          setMsg("Completa usuario/correo y contraseña.");
          return;
        }

        const payload = {
          username: identifier.trim(),
          password: password.trim(),
        };
        const { res, data } = await postJSON(`${BASE}/login/`, payload);

        if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);

        const token = data?.values?.token || data?.key;
        if (!token) throw new Error("Token ausente en la respuesta.");

        // Guarda token y navega
        localStorage.setItem("token", token);
        localStorage.setItem(
          "usuario",
          JSON.stringify(data?.values?.usuario || {})
        );
        setMsg("¡Bienvenido! Redirigiendo…");
        navigate("/dashboard", { replace: true });
        return;
      }

      // SIGNUP
      if (
        !username.trim() ||
        !nombre.trim() ||
        !correo.trim() ||
        !password.trim()
      ) {
        setMsg("Completa al menos usuario, nombre, correo y contraseña.");
        return;
      }

      if (tipo === "cliente") {
        const payload = {
          username: username.trim(),
          nombre: nombre.trim(),
          correo: correo.trim(),
          telefono: telefono.trim() || undefined,
          password: password.trim(),
          ubicacion: ubicacion.trim() || undefined, // backend crea Cliente si viene
        };
        const { res, data } = await postJSON(
          `${BASE}/registerCliente/`,
          payload
        );
        if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
        setMsg("Cliente registrado. Ahora puedes iniciar sesión.");
        // precargar identifier para login
        setMode("login");
        setIdentifier(username || correo);
        return;
      } else {
        const payload = {
          username: username.trim(),
          nombre: nombre.trim(),
          correo: correo.trim(),
          telefono: telefono.trim() || undefined,
          password: password.trim(),
          numero_licencia: numeroLicencia.trim() || undefined,
          experiencia: experiencia ? Number(experiencia) : undefined,
        };
        const { res, data } = await postJSON(
          `${BASE}/registerAgente/`,
          payload
        );
        if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
        setMsg("Agente registrado. Ahora puedes iniciar sesión.");
        setMode("login");
        setIdentifier(username || correo);
        return;
      }
    } catch (err) {
      console.error("Auth error:", err);
      setMsg(err.message || "Ocurrió un error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${palette.bg}, ${palette.panel})`,
        color: palette.text,
        display: "grid",
        placeItems: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 880,
          height: "100%", // 👈 importante para evitar scroll y cortes
          background: palette.panel,
          border: `1px solid ${palette.border}`,
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,.25)",
          overflow: "hidden",
          display: "flex",
          flexDirection: window.innerWidth < 700 ? "column" : "row",
        }}
      >
        {/* Lado izquierdo: marca/hero */}
        <div
          style={{
            background: `linear-gradient(135deg, ${palette.brand}, ${palette.brand2})`,
            color: "#fff",
            padding: 28,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <IconHouse />
            <div style={{ fontWeight: 900, fontSize: 22 }}>
              Inmobiliaria<span style={{ opacity: 0.9 }}> Pro</span>
            </div>
          </div>
          <div style={{ opacity: 0.95, lineHeight: 1.5 }}>
            Gestión ágil de clientes, agentes y propiedades. Accede con tu
            cuenta o crea una nueva en segundos.
          </div>
          <div style={{ fontSize: 12, opacity: 0.9 }}>
            Soporte a clientes y agentes • Autenticación por token • Panel
            moderno
          </div>
        </div>

        {/* Lado derecho: formulario */}
        <div style={{ padding: 28 }}>
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 16,
              borderBottom: `1px solid ${palette.border}`,
            }}
          >
            <button
              onClick={() => setMode("login")}
              style={{
                border: "none",
                background: "transparent",
                color: mode === "login" ? palette.brand : palette.dim,
                fontWeight: 800,
                padding: "8px 12px",
                cursor: "pointer",
                borderBottom:
                  mode === "login"
                    ? `2px solid ${palette.brand}`
                    : "2px solid transparent",
              }}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => setMode("signup")}
              style={{
                border: "none",
                background: "transparent",
                color: mode === "signup" ? palette.brand : palette.dim,
                fontWeight: 800,
                padding: "8px 12px",
                cursor: "pointer",
                borderBottom:
                  mode === "signup"
                    ? `2px solid ${palette.brand}`
                    : "2px solid transparent",
              }}
            >
              Registrarse
            </button>
          </div>

          {/* Form */}
          <div style={{ display: "grid", gap: 12 }}>
            {mode === "login" ? (
              <>
                <Field
                  icon={<IconUser />}
                  placeholder="Usuario o correo"
                  value={identifier}
                  onChange={setIdentifier}
                />
                <Field
                  icon={<IconLock />}
                  placeholder="Contraseña"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={setPassword}
                  right={
                    <button
                      type="button"
                      onClick={() => setShowPwd((v) => !v)}
                      style={ghostBtnStyle}
                      title={showPwd ? "Ocultar" : "Mostrar"}
                    >
                      {showPwd ? "🙈" : "👁️"}
                    </button>
                  }
                />
              </>
            ) : (
              <>
                {/* Selector de tipo */}
                <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <Chip
                    active={tipo === "cliente"}
                    onClick={() => setTipo("cliente")}
                    label="Cliente"
                  />
                  <Chip
                    active={tipo === "agente"}
                    onClick={() => setTipo("agente")}
                    label="Agente"
                  />
                </div>

                <Field
                  icon={<IconId />}
                  placeholder="Usuario"
                  value={username}
                  onChange={setUsername}
                />
                <Field
                  icon={<IconUser />}
                  placeholder="Nombre completo"
                  value={nombre}
                  onChange={setNombre}
                />
                <Field
                  icon={<IconMail />}
                  placeholder="Correo electrónico"
                  type="email"
                  value={correo}
                  onChange={setCorreo}
                />
                <Field
                  icon={<IconPhone />}
                  placeholder="Teléfono (opcional)"
                  value={telefono}
                  onChange={setTelefono}
                />
                {tipo === "cliente" && (
                  <Field
                    icon={<IconPin />}
                    placeholder="Ubicación (opcional)"
                    value={ubicacion}
                    onChange={setUbicacion}
                  />
                )}
                {tipo === "agente" && (
                  <>
                    <Field
                      icon={<IconId />}
                      placeholder="Número de licencia"
                      value={numeroLicencia}
                      onChange={setNumeroLicencia}
                    />
                    <Field
                      icon={<IconId />}
                      placeholder="Años de experiencia"
                      type="number"
                      value={experiencia}
                      onChange={setExperiencia}
                    />
                  </>
                )}
                <Field
                  icon={<IconLock />}
                  placeholder="Contraseña"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={setPassword}
                  right={
                    <button
                      type="button"
                      onClick={() => setShowPwd((v) => !v)}
                      style={ghostBtnStyle}
                    >
                      {showPwd ? "🙈" : "👁️"}
                    </button>
                  }
                />
              </>
            )}

            {/* Mensaje */}
            {msg && (
              <div
                style={{
                  fontSize: 13,
                  color:
                    msg.toLowerCase().includes("error") ||
                    msg.toLowerCase().includes("http")
                      ? palette.danger
                      : palette.dim,
                  background: "rgba(0,0,0,0.03)",
                  border: `1px solid ${palette.border}`,
                  borderRadius: 10,
                  padding: "10px 12px",
                }}
              >
                {msg}
              </div>
            )}

            {/* Botón principal */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                background: `linear-gradient(135deg, ${palette.brand}, ${palette.brand2})`,
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "12px 16px",
                fontWeight: 800,
                cursor: "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? "Procesando…"
                : mode === "login"
                ? "Entrar"
                : "Crear cuenta"}
            </button>

            {/* Ayuda extra */}
            {mode === "login" && (
              <div style={{ fontSize: 13, color: palette.dim }}>
                ¿Olvidaste tu contraseña?{" "}
                <span
                  style={{ color: palette.brand, cursor: "pointer" }}
                  onClick={onRecover}
                >
                  Recupérala
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Subcomponentes UI
   ========================= */
function Field({ icon, placeholder, value, onChange, type = "text", right }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "28px 1fr auto",
        alignItems: "center",
        gap: 10,
        background: "rgba(0,0,0,0.03)",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 12,
        padding: "10px 12px",
      }}
    >
      <span style={{ color: "currentColor", opacity: 0.8 }}>{icon}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        style={{
          border: "none",
          outline: "none",
          background: "transparent",
          color: "inherit",
          fontSize: 14,
        }}
      />
      {right || null}
    </div>
  );
}

function Chip({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: `1px solid ${active ? "transparent" : "rgba(0,0,0,0.15)"}`,
        background: active ? "rgba(79,70,229,0.12)" : "transparent",
        color: active ? "#4f46e5" : "inherit",
        borderRadius: 999,
        padding: "6px 12px",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

const ghostBtnStyle = {
  border: "none",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
  padding: 4,
  borderRadius: 8,
};
