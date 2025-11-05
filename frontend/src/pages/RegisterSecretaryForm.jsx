import { useState } from "react";

export default function RegisterSecretaryForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", school_id: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validate = () => {
    if (!form.name || !form.email || !form.password) return "Todos los campos son obligatorios";
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(form.email)) return "Email inválido";
    if (form.password.length < 8) return "Contraseña mínima 8 caracteres";
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
    const v = validate();
    if (v) return setError(v);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register-secretary", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-role": "admin" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, school_id: form.school_id || null })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al registrar secretaria");
      setSuccess(data.message);
      setForm({ name: "", email: "", password: "", school_id: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} autoComplete="off">
      <input type="text" name="name" placeholder="Nombre" className="border rounded px-3 py-2" value={form.name} onChange={handleChange} required />
      <input type="email" name="email" placeholder="Correo electrónico" className="border rounded px-3 py-2" value={form.email} onChange={handleChange} required />
      <div className="relative">
        <input type={showPassword ? "text" : "password"} name="password" placeholder="Contraseña" className="border rounded px-3 py-2 w-full" value={form.password} onChange={handleChange} required minLength={8} style={{ paddingRight: "2.5rem" }} />
        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none" tabIndex={-1} onClick={() => setShowPassword(p => !p)} aria-label="Mostrar contraseña">
          {showPassword ? '🙈' : '👁️'}
        </button>
      </div>
      <input type="text" name="school_id" placeholder="ID del colegio (opcional)" className="border rounded px-3 py-2" value={form.school_id} onChange={handleChange} />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}
      <button type="submit" className="bg-indigo-600 text-white rounded px-4 py-2 font-semibold hover:bg-indigo-700 transition" disabled={loading}>{loading ? 'Registrando...' : 'Registrar secretaria'}</button>
    </form>
  );
}
