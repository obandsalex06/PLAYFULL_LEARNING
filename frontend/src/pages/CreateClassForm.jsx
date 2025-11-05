import React, { useState, useEffect } from "react";

export default function CreateClassForm() {
  const [teachers, setTeachers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", teacher_id: "", school_id: "" });
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/auth/teachers", { headers: { "x-user-role": "admin" } }).then(r => r.json()),
      fetch("/api/auth/schools", { headers: { "x-user-role": "admin" } }).then(r => r.json()),
    ]).then(([teachers, schools]) => {
      setTeachers(teachers);
      setSchools(schools);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setMensaje("");
    const res = await fetch("/api/auth/create-class", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-role": "admin" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setMensaje(data.message || (data.success ? "Clase creada correctamente" : "Error al crear clase"));
    if (data.success) setForm({ name: "", description: "", teacher_id: "", school_id: "" });
  };

  if (loading) return <div className="text-center py-10">Cargando datos...</div>;

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-8 max-w-lg mx-auto">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Crear nueva clase</h4>
      {mensaje && <div className="mb-2 text-green-600 font-semibold">{mensaje}</div>}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre de la clase"
          className="border rounded px-3 py-2"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
        <input
          type="text"
          placeholder="Descripción (opcional)"
          className="border rounded px-3 py-2"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        />
        <select
          className="border rounded px-3 py-2"
          value={form.teacher_id}
          onChange={e => setForm(f => ({ ...f, teacher_id: e.target.value }))}
          required
        >
          <option value="">Selecciona un docente</option>
          {teachers.map(t => (
            <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
          ))}
        </select>
        <select
          className="border rounded px-3 py-2"
          value={form.school_id}
          onChange={e => setForm(f => ({ ...f, school_id: e.target.value }))}
          required
        >
          <option value="">Selecciona un colegio</option>
          {schools.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <button type="submit" className="bg-indigo-600 text-white rounded px-4 py-2 font-semibold hover:bg-indigo-700 transition">
          Crear clase
        </button>
      </form>
    </div>
  );
}