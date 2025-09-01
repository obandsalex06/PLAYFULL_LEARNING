import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    contraseña: "",
  });

  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:4000/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: "", // si no lo pides, mándalo vacío
          correo: formData.email,
          contrasena: formData.contraseña,
          telefono: "", // opcional
          id_rol: 3, // estudiante
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje("✅ Usuario registrado con éxito");
        setTimeout(() => navigate("/Login"), 2000); // redirige al login
      } else {
        setMensaje("❌ " + (data.error || data.message));
      }
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setMensaje("⚠️ Error de conexión con el servidor");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-3xl grid md:grid-cols-2 w-full max-w-4xl overflow-hidden">

        {/* Lado izquierdo: mensaje */}
        <div className="bg-purple-600 text-white flex flex-col items-center justify-center p-10">
          <h2 className="text-3xl font-bold text-center">¡Únete a Playful Learning 🚀!</h2>
          <p className="mt-4 text-center text-lg">
            ¿Ya tienes cuenta?
          </p>
          <Link
            to="/login"
            className="mt-6 px-6 py-3 bg-white text-purple-600 font-bold rounded-xl shadow hover:bg-gray-100 transition"
          >
            Inicia sesión
          </Link>
        </div>

        {/* Lado derecho: formulario */}
        <div className="p-8">
          <h1 className="text-3xl font-bold text-purple-700 text-center">
            Crear cuenta
          </h1>
          <p className="text-gray-500 text-center mt-2">
            Regístrate y empieza tu aventura de aprendizaje ✨
          </p>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre completo"
              value={formData.nombre}
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
              name="contraseña"
              placeholder="Contraseña"
              value={formData.contraseña}
              onChange={handleChange}
              required
              className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              type="submit"
              className="mt-4 px-6 py-3 bg-purple-600 text-white font-bold rounded-xl shadow hover:bg-purple-700 transition"
            >
              Registrarse
            </button>
          </form>

          {/* Mensaje de éxito o error */}
          {mensaje && (
            <p className="mt-4 text-center font-semibold text-purple-600">
              {mensaje}
            </p>
          )}

          <Link
            to="/Home"
            className="block mt-6 text-purple-600 font-semibold hover:underline text-center"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}