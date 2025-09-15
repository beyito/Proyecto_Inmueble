const handleSubmit = () => {
  // Validación básica
  if (action === "Sign Up" && (!username || !email || !password)) {
    alert("Por favor, completa todos los campos para registrarte.");
    return;
  }

  if (action === "Login" && (!username || !password)) {
    alert("Por favor, ingresa tu usuario y contraseña.");
    return;
  }

  const endpoint =
    action === "Login"
      ? "https://proyecto-inmueble.onrender.com/api/login/"
      : "https://proyecto-inmueble.onrender.com/api/register/";

  const payload =
    action === "Login" ? { username, password } : { username, email, password };

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
        getProfile(); // ← puedes mostrar el perfil después
      } else {
        alert("Error: " + JSON.stringify(data));
      }
    })
    .catch((err) => {
      console.error("Error de conexión:", err);
    });
};
