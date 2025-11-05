import { useState, useRef } from "react";
import InputField from "../components/InputField";
import AlertMessage from "../components/AlertMessage";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { Link } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "estudiante",
    school_id: ""
  });
  const [mensaje, setMensaje] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const emailTimeout = useRef();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Validaciones de nombre, email, contraseña fuerte y confirmación
  const validate = () => {
    const newErrors = {};
  // Validación de nombre
    if (!formData.name) {
      newErrors.name = "El nombre es obligatorio.";
    }
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
    // Confirmar contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Actualiza el estado del formulario y limpia errores del campo editado
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: undefined });

    // Validar email existente al escribir
    if (name === "email") {
      if (emailTimeout.current) clearTimeout(emailTimeout.current);
      if (!value || errors.email) return;
      emailTimeout.current = setTimeout(async () => {
        try {
          const res = await fetch("http://localhost:5000/api/auth/check-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: value })
          });
          const data = await res.json();
          if (!data.available) {
            setErrors((prev) => ({ ...prev, email: data.message }));
          }
        } catch {
          // No mostrar error de red aquí
        }
      }, 600);
    }
  };

  // Envía el formulario de registro y gestiona la respuesta
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setMensaje("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMensaje("success: Usuario registrado con éxito");
        setTimeout(() => {
          setLoading(false);
          navigate("/login");
        }, 2000);
      } else {
        setMensaje("error: " + JSON.stringify(data));
        setLoading(false);
      }
    } catch {
      setMensaje("error: Error de conexión con el servidor");
      setLoading(false);
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
        <InputField
          label="Nombre completo"
          type="text"
          name="name"
          placeholder="Nombre completo"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          autoComplete="name"
        />
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
            autoComplete="new-password"
            style={{ paddingRight: "2.5rem" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-8 text-gray-500 focus:outline-none"
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
        <InputField
          label="Confirmar contraseña"
          type={showPassword ? "text" : "password"}
          name="confirmPassword"
          placeholder="Confirma tu contraseña"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <InputField
          label="ID del colegio (opcional)"
          type="number"
          name="school_id"
          placeholder="ID del colegio (opcional)"
          value={formData.school_id || ""}
          onChange={handleChange}
        />
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
            "Registrarse"
          )}
        </button>
      </form>
      {mensaje && (
        <AlertMessage type={mensaje.startsWith('success:') ? 'success' : 'error'}>
          {mensaje.replace('success:', '').replace('error:', '')}
        </AlertMessage>
      )}
      <div className="mt-6 text-center">
        {/* Opción de registro de profesor eliminada, solo el admin puede registrar profesores */}
      </div>
    </AuthLayout>
  );
}
