// src/components/LoginSignup/LoginSignup.jsx
import "./LoginSignup.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import user_icon from "../Assents/person.png";
import email_icon from "../Assents/email.png";
import password_icon from "../Assents/password.png";

const LoginSignup = () => {
  const navigate = useNavigate();

  const [action, setAction] = useState("Login"); // "Login" | "Sign Up"
  const [tipo, setTipo] = useState("cliente"); // "cliente" | "agente"

  // Login
  const [identifier, setIdentifier] = useState(""); // usuario o correo
  const [password, setPassword] = useState("");

  // Registro
  const [username, setUsername] = useState("");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [numeroLicencia, setNumeroLicencia] = useState("");
  const [experiencia, setExperiencia] = useState("");

  // Ajusta a tus IDs reales en /admin/rol/
  const ID_ROL_CLIENTE = 2;
  const ID_ROL_AGENTE = 3;

  const BASE = "http://127.0.0.1:8000/usuario";

  const handleSubmit = async () => {
    try {
      if (action === "Login") {
        const payload = { username: identifier, password };
        const res = await fetch(`${BASE}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !(data.token || data.key)) {
          throw new Error(data.detail || JSON.stringify(data));
        }
        localStorage.setItem("token", data.token || data.key);
        navigate("/dashboard");
        return;
      }

      // SIGN UP
      if (tipo === "cliente") {
        const payload = {
          username,
          nombre,
          correo,
          telefono,
          password,
          idRol: ID_ROL_CLIENTE,
          ubicacion: ubicacion || undefined,
        };
        const res = await fetch(`${BASE}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || JSON.stringify(data));
        alert("Cliente registrado. Ahora puedes iniciar sesión.");
        setAction("Login");
        setIdentifier(username || correo);
      } else {
        const payload = {
          username,
          nombre,
          correo,
          telefono,
          password,
          idRol: ID_ROL_AGENTE,
          numero_licencia: numeroLicencia || undefined,
          experiencia: experiencia ? Number(experiencia) : undefined,
        };
        const res = await fetch(`${BASE}/registerAgente`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || JSON.stringify(data));
        alert("Agente registrado. Ahora puedes iniciar sesión.");
        setAction("Login");
        setIdentifier(username || correo);
      }
    } catch (err) {
      console.error("Auth error:", err);
      alert(`Error: ${err.message || err}`);
    }
  };

  const onRecover = () => {
    alert("Función de recuperación de contraseña por implementar.");
  };

  return (
    <div className="container">
      <div className="header">
        <div className="text">{action}</div>
        <div className="underline"></div>
      </div>

      {/* Selector Login / Sign Up */}
      <div className="mode-selector">
        <div
          className={action === "Login" ? "mode-button active" : "mode-button"}
          onClick={() => setAction("Login")}
        >
          Login
        </div>
        <div
          className={
            action === "Sign Up" ? "mode-button active" : "mode-button"
          }
          onClick={() => setAction("Sign Up")}
        >
          Sign Up
        </div>
      </div>

      <div className="inputs">
        {action === "Login" ? (
          <>
            <div className="input">
              <img src={email_icon} alt="identifier" />
              <input
                type="text"
                placeholder="Usuario o correo"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            <div className="input">
              <img src={password_icon} alt="Password" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </>
        ) : (
          <>
            <div className="input">
              <img src={user_icon} alt="username" />
              <input
                type="text"
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="input">
              <img src={user_icon} alt="nombre" />
              <input
                type="text"
                placeholder="Nombre completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="input">
              <img src={email_icon} alt="correo" />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
            </div>

            <div className="input">
              <img src={user_icon} alt="telefono" />
              <input
                type="text"
                placeholder="Teléfono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>

            {tipo === "cliente" && (
              <div className="input">
                <img src={user_icon} alt="ubicacion" />
                <input
                  type="text"
                  placeholder="Ubicación (opcional)"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                />
              </div>
            )}

            {tipo === "agente" && (
              <>
                <div className="input">
                  <img src={user_icon} alt="licencia" />
                  <input
                    type="text"
                    placeholder="Número de licencia"
                    value={numeroLicencia}
                    onChange={(e) => setNumeroLicencia(e.target.value)}
                  />
                </div>

                <div className="input">
                  <img src={user_icon} alt="experiencia" />
                  <input
                    type="number"
                    min="0"
                    placeholder="Años de experiencia"
                    value={experiencia}
                    onChange={(e) => setExperiencia(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="input">
              <img src={password_icon} alt="Password" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      {/* Link SOBRE el botón (cliente/agente) */}
      {action === "Sign Up" && (
        <div className="switch-over-button">
          {tipo === "cliente" ? (
            <>
              ¿Eres agente?{" "}
              <span
                className="bottom-link__cta"
                onClick={() => setTipo("agente")}
              >
                Regístrate aquí
              </span>
            </>
          ) : (
            <>
              ¿Eres cliente?{" "}
              <span
                className="bottom-link__cta"
                onClick={() => setTipo("cliente")}
              >
                Regístrate aquí
              </span>
            </>
          )}
        </div>
      )}

      <div className="submit-container">
        <div className="submit" onClick={handleSubmit}>
          {action === "Login" ? "Iniciar sesión" : "Registrarse"}
        </div>
      </div>

      {action === "Login" && (
        <div className="bottom-link">
          ¿Olvidaste tu contraseña?{" "}
          <span className="bottom-link__cta" onClick={onRecover}>
            Recupérala
          </span>
        </div>
      )}
    </div>
  );
};

export default LoginSignup;
