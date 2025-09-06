import React, { useEffect, useState } from "react";

const Perfil = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/profile/", {
      method: "POST",
      headers: {
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch((err) => console.error("Error:", err));
  }, []);

  if (!profile) return <p>Cargando perfil...</p>;

  return (
    <div>
      <h2>Bienvenido, {profile.username}</h2>
      <p>Email: {profile.email}</p>
    </div>
  );
};

export default Perfil;
