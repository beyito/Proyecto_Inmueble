// src/components/Perfil/Perfil.jsx
import React, { useEffect, useState } from "react";

const Perfil = () => {
  const [data, setData] = useState(null);
  const BASE = "https://proyecto-inmueble.onrender.com/usuario";

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BASE}/profile/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.detail || JSON.stringify(json));
        setData(json);
      } catch (err) {
        console.error(err);
        alert("No se pudo cargar el perfil");
      }
    };
    load();
  }, []);

  if (!data) return <div style={{ padding: 16 }}>Cargando perfil…</div>;

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "24px auto",
        padding: 16,
        border: "1px solid #eee",
        borderRadius: 8,
      }}
    >
      <h2>Perfil</h2>
      <ul>
        <li>
          <b>Usuario:</b> {data.username}
        </li>
        <li>
          <b>Nombre:</b> {data.nombre}
        </li>
        <li>
          <b>Correo:</b> {data.correo}
        </li>
        <li>
          <b>Teléfono:</b> {data.telefono || "-"}
        </li>
        <li>
          <b>Rol (idRol):</b> {data.idRol}
        </li>
      </ul>

      {data.cliente && (
        <>
          <h3>Cliente</h3>
          <div>Ubicación: {data.cliente.ubicacion || "-"}</div>
        </>
      )}
      {data.agente && (
        <>
          <h3>Agente</h3>
          <ul>
            <li>N° licencia: {data.agente.numero_licencia}</li>
            <li>Experiencia: {data.agente.experiencia} años</li>
            <li>Puntaje: {data.agente.puntaje}</li>
          </ul>
        </>
      )}
    </div>
  );
};

export default Perfil;
