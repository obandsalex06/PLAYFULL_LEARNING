import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // 👈 importa contexto
import AuthLayout from "./AuthLayout";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); // 👈 usar login del contexto

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        login(data.user); // 👈 guarda en contexto y localStorage
        setMensaje("✅ Login exitoso, redirigiendo...");

        setTimeout(() => {
          if (data.user.role === "estudiante") navigate("/student-dashboard");
          else if (data.user.role === "docente") navigate("/teacher-dashboard");
          else if (data.user.role === "admin") navigate("/admin");
          else navigate("/home");
        }, 1000);
      } else {
        setMensaje("❌ " + (data.error || data.message));
      }
    } catch {
      setMensaje("⚠️ Error de conexión con el servidor");
    }
  };

  return (
    <AuthLayout
      tituloIzq="¡Bienvenido de nuevo! 🎉"
      subtituloIzq="¿Aún no tienes cuenta?"
      linkIzq="/register"
      textoLinkIzq="Crear cuenta"
      tituloDer="Iniciar sesión"
      subtituloDer="Ingresa a tu cuenta de Playful Learning"
      linkAbajo="/home"
      textoLinkAbajo="Volver al inicio"
    >
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
          className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
          className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <button
          type="submit"
          className="mt-4 px-6 py-3 bg-purple-600 text-white font-bold rounded-xl shadow hover:bg-purple-700 transition"
        >
          Iniciar sesión
        </button>
      </form>
      {mensaje && (
        <p className="mt-4 text-center font-semibold text-purple-600">{mensaje}</p>
      )}
    </AuthLayout>
  );
}
