import { useState } from "react";
// ...existing code...

export default function RegisterTeacherForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", school_id: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validate = () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) return "Todos los campos son obligatorios";
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(form.email)) return "Email inválido";
    const strongPassword = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}:;<>.,]).{8,}$/;
    if (!strongPassword.test(form.password)) return "Contraseña débil (mínimo 8 caracteres, mayúscula, minúscula, número y símbolo)";
    if (form.password !== form.confirmPassword) return "Las contraseñas no coinciden";
    return null;
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register-teacher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "admin"
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          school_id: form.school_id || null
        })
      });
      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          data = await res.json();
        } catch {
          data = null;
        }
      } else {
        data = null;
      }
      if (!data) {
        throw new Error("Error inesperado: el servidor no respondió correctamente.");
      }
      if (!res.ok) throw new Error(data.message || "Error al registrar profesor");
      setSuccess(data.message);
      setForm({ name: "", email: "", password: "", confirmPassword: "", school_id: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} autoComplete="off">
      <input
        type="text"
        name="name"
        placeholder="Nombre"
        className="border rounded px-3 py-2"
        value={form.name}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Correo electrónico"
        className="border rounded px-3 py-2"
        value={form.email}
        onChange={handleChange}
        required
      />
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Contraseña"
          className="border rounded px-3 py-2 w-full"
          value={form.password}
          onChange={handleChange}
          required
          minLength={8}
          style={{ paddingRight: "2.5rem" }}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none"
          tabIndex={-1}
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.875-4.575A9.956 9.956 0 0122 9c0 5.523-4.477 10-10 10a9.956 9.956 0 01-4.575-1.125M3 3l18 18" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm7-2c0 5.523-4.477 10-10 10S2 15.523 2 10 6.477 0 12 0s10 4.477 10 10z" /></svg>
          )}
        </button>
      </div>
      <div className="relative">
        <input
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          placeholder="Confirmar contraseña"
          className="border rounded px-3 py-2 w-full"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          minLength={8}
          style={{ paddingRight: "2.5rem" }}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none"
          tabIndex={-1}
          aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          onClick={() => setShowConfirmPassword((prev) => !prev)}
        >
          {showConfirmPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.875-4.575A9.956 9.956 0 0122 9c0 5.523-4.477 10-10 10a9.956 9.956 0 01-4.575-1.125M3 3l18 18" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm7-2c0 5.523-4.477 10-10 10S2 15.523 2 10 6.477 0 12 0s10 4.477 10 10z" /></svg>
          )}
        </button>
      </div>
      <input
        type="text"
        name="school_id"
        placeholder="ID del colegio (opcional)"
        className="border rounded px-3 py-2"
        value={form.school_id}
        onChange={handleChange}
      />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}
      <button
        type="submit"
        className="bg-indigo-600 text-white rounded px-4 py-2 font-semibold hover:bg-indigo-700 transition flex items-center justify-center"
        disabled={loading}
      >
        {loading ? "Registrando..." : "Registrar profesor"}
      </button>
    </form>
  );
}
