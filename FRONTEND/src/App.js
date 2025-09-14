// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginSignup from "./components/LoginSignup/LoginSignup";
import Dashboard from "./components/Dashboard/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import RecuperarContrasena from "./components/RecuperarContraseña/RecuperarContraseña";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginSignup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/recuperar-contraseña" element={<RecuperarContrasena />} />
        <Route path="*" element={<div style={{ padding: 24 }}>404</div>} />
      </Routes>
    </BrowserRouter>
  );
}
