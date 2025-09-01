import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({
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
      const res = await fetch("http://localhost:5173/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: formData.email,
          contrasena: formData.contraseña,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // guardar token en localStorage
        localStorage.setItem("token", data.token);
        setMensaje("✅ Login exitoso, redirigiendo...");
        setTimeout(() => navigate("/dashboard"), 1500); // redirigir al dashboard
      } else {
        setMensaje("❌ " + (data.error || data.message));
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setMensaje("⚠️ Error de conexión con el servidor");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-3xl grid md:grid-cols-2 w-full max-w-4xl overflow-hidden">
        
        {/* Lado izquierdo: mensaje */}
        <div className="bg-purple-600 text-white flex flex-col items-center justify-center p-10">
          <h2 className="text-3xl font-bold text-center">¡Bienvenido de nuevo! 🎉</h2>
          <p className="mt-4 text-center text-lg">
            ¿Aún no tienes cuenta?  
          </p>
          <Link
            to="/register"
            className="mt-6 px-6 py-3 bg-white text-purple-600 font-bold rounded-xl shadow hover:bg-gray-100 transition"
          >
            Crear cuenta
          </Link>
        </div>

        {/* Lado derecho: formulario */}
        <div className="p-8">
          <h1 className="text-3xl font-bold text-purple-700 text-center">
            Iniciar sesión
          </h1>
          <p className="text-gray-500 text-center mt-2">
            Ingresa a tu cuenta de Playful Learning
          </p>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
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
              Iniciar sesión
            </button>
          </form>

          {/* Mensaje de éxito o error */}
          {mensaje && (
            <p className="mt-4 text-center font-semibold text-purple-600">
              {mensaje}
            </p>
          )}

          <Link
            to="/home"
            className="block mt-6 text-purple-600 font-semibold hover:underline text-center"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}