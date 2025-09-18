import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "estudiante",
  });
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMensaje("✅ Usuario registrado con éxito");
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
      tituloIzq="¡Únete a Playful Learning 🚀!"
      subtituloIzq="¿Ya tienes cuenta?"
      linkIzq="/login"
      textoLinkIzq="Inicia sesión"
      tituloDer="Crear cuenta"
      subtituloDer="Regístrate y empieza tu aventura de aprendizaje ✨"
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
          className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
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
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="estudiante">Estudiante</option>
          <option value="docente">Docente</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          className="mt-4 px-6 py-3 bg-purple-600 text-white font-bold rounded-xl shadow hover:bg-purple-700 transition"
        >
          Registrarse
        </button>
      </form>
      {mensaje && (
        <p className="mt-4 text-center font-semibold text-purple-600">{mensaje}</p>
      )}
    </AuthLayout>
  );
}
