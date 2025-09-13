import "./LoginSignup.css";
import React, { useState } from "react";

import user_icon from "../Assents/person.png";
import email_icon from "../Assents/email.png";
import password_icon from "../Assents/password.png";

const LoginSignup = () => {
  const [action, setAction] = useState("Login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = () => {
    const endpoint =
      action === "Login"
        ? "http://127.0.0.1:8000/usuario/login"
        : "http://127.0.0.1:8000/usuario/register";

    const payload =
      action === "Login"
        ? { username, password }
        : { username, email, password };

    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem("token", data.token);
          alert("Autenticación exitosa");
        } else {
          alert("Error: " + JSON.stringify(data));
        }
      })
      .catch((err) => {
        console.error("Error de conexión:", err);
      });
  };
  const getProfile = () => {
    fetch("http://localhost:8000/api/profile/", {
      method: "POST",
      headers: {
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Perfil:", data);
        alert("Bienvenido, " + data.username);
      })
      .catch((err) => {
        console.error("Error al obtener perfil:", err);
      });
  };

  return (
    <div className="container">
      <div className="header">
        <div className="text">{action}</div>
        <div className="underline"></div>
      </div>
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
        {action === "Login" ? null : (
          <div className="input">
            <img src={user_icon} alt="User icon" />
            <input
              type="text"
              placeholder="Nombres"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        )}

        <div className="input">
          <img src={email_icon} alt="Email icon" />
          <input
            type="email"
            placeholder="Correo Electrónico"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input">
          <img src={password_icon} alt="Password icon" />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
      {action === "Sign Up" ? (
        <div></div>
      ) : (
        <div className="forgot-password">
          Log Password? <span>Click here!</span>
        </div>
      )}

      <div className="submit-container">
        <div className="submit" onClick={handleSubmit}>
          {action === "Login" ? "Iniciar sesión" : "Registrarse"}
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
