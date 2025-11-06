import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";

export default function RegisterTeacher() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    school_id: ""
  });
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/register-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje("✅ Profesor registrado con éxito");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMensaje("❌ " + (data.error || data.message));
      }
    } catch {
      setMensaje("⚠️ Error de conexión con el servidor");
    }
  };

  return (
    <AuthLayout
      tituloIzq="¡Únete como Profesor!"
      subtituloIzq="¿Ya tienes cuenta?"
      linkIzq="/login"
      textoLinkIzq="Inicia sesión"
      tituloDer="Registro de Profesor"
      subtituloDer="Registra tu cuenta de docente"
      linkAbajo="/home"
      textoLinkAbajo="Ir al inicio"
    >
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <input
          type="text"
          name="name"
          placeholder="Nombre completo"
          value={formData.name}
          onChange={handleChange}
          required
          className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
          className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
          className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="number"
          name="school_id"
          placeholder="ID del colegio (opcional)"
          value={formData.school_id}
          onChange={handleChange}
          className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="mt-4 px-6 py-3 relative bg-gradient-to-r from-blue-700 to-blue-500 text-white font-bold rounded-xl shadow hover:opacity-95 transition"
        >
          Registrarse como Profesor
        </button>
      </form>
      {mensaje && (
  <p className="mt-4 text-center font-semibold text-blue-700">{mensaje}</p>
      )}
    </AuthLayout>
  );
}
