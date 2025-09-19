import { useState } from "react";
import InputField from "../components/InputField";
import AlertMessage from "../components/AlertMessage";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "./AuthLayout";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [mensaje, setMensaje] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Validaciones de email y contraseña fuerte
  const validate = () => {
    const newErrors = {};
  // Validación de email
    if (!formData.email) {
      newErrors.email = "El correo es obligatorio.";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      newErrors.email = "Correo electrónico inválido.";
    }
  // Contraseña: mínimo 8 caracteres, mayúscula, minúscula y número
    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria.";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
      newErrors.password = "Mínimo 8 caracteres, mayúscula, minúscula y número.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Actualiza el estado del formulario y limpia errores del campo editado
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  // Envía el formulario de login y gestiona la respuesta
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setMensaje("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        login(data.user);
        setMensaje("success: Login exitoso, redirigiendo...");
        setTimeout(() => {
          setLoading(false);
          if (data.user.role === "estudiante") navigate("/student-dashboard");
          else if (data.user.role === "docente") navigate("/teacher-dashboard");
          else if (data.user.role === "admin") navigate("/admin");
          else navigate("/home");
        }, 1000);
      } else {
        setMensaje("error: " + (data.error || data.message));
        setLoading(false);
      }
    } catch {
      setMensaje("error: Error de conexión con el servidor");
      setLoading(false);
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
        <InputField
          label="Correo electrónico"
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
        />
        <div className="relative">
          <InputField
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="current-password"
            style={{ paddingRight: "2.5rem", paddingTop: "0.75rem", paddingBottom: "0.75rem" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none"
            tabIndex={-1}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.875-4.575A9.956 9.956 0 0122 9c0 5.523-4.477 10-10 10a9.956 9.956 0 01-4.575-1.125M3 3l18 18" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm7-2c0 5.523-4.477 10-10 10S2 15.523 2 10 6.477 0 12 0s10 4.477 10 10z" /></svg>
            )}
          </button>
        </div>
        <button
          type="submit"
          className="mt-4 px-6 py-3 bg-purple-600 text-white font-bold rounded-xl shadow hover:bg-purple-700 transition flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
              Cargando...
            </span>
          ) : (
            "Iniciar sesión"
          )}
        </button>
      </form>
      {mensaje && (
        <AlertMessage type={mensaje.startsWith('success:') ? 'success' : 'error'}>
          {mensaje.replace('success:', '').replace('error:', '')}
        </AlertMessage>
      )}
    </AuthLayout>
  );
}
