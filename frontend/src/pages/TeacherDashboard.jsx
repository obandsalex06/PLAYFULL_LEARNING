
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { getTeacherClasses } from "../api";

export default function TeacherDashboard() {
  // Hooks siempre al inicio
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ student_id: '', class_id: '', file_url: '', description: '' });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);

  // Cargar clases y estudiantes del docente
  useEffect(() => {
    if (!user || user.role !== "docente") return;
    async function fetchClasses() {
      try {
        const res = await getTeacherClasses({
          "x-user-role": user.role,
          "x-user-email": user.email,
        });
        setClasses(res.data);
      } catch (err) {
        setClasses([]);
      }
    }
    fetchClasses();
  }, [user]);

  // Actualizar estudiantes al seleccionar clase
  useEffect(() => {
    if (!form.class_id) {
      setStudents([]);
      setForm(f => ({ ...f, student_id: '' }));
      return;
    }
    const clase = classes.find(c => String(c.id) === String(form.class_id));
    setStudents(clase ? clase.students : []);
    setForm(f => ({ ...f, student_id: '' }));
  }, [form.class_id, classes]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register-evidence",
        form,
        {
          headers: {
            "x-user-role": user.role,
            "x-user-email": user.email,
          },
        }
      );
      setMsg({ type: 'success', text: res.data.message });
      setForm({ student_id: '', class_id: '', file_url: '', description: '' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Error al registrar evidencia' });
    }
    setLoading(false);
  };

  // Validación de rol y renderizado condicional
  if (!user || user.role !== "docente") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">🚫 No tienes permiso para acceder.</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <section className="relative bg-gradient-to-r from-pink-400 to-purple-500 py-16 px-4 min-h-[60vh] flex flex-col items-center justify-center">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-center w-full max-w-6xl">
        <div className="mb-6 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">Panel de Docente</h1>
          <p className="text-purple-100 mt-2 text-lg">Bienvenido, {user.name}</p>
        </div>
        <button
          className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-red-600 transition"
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
        <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition border-t-4 border-yellow-400">
          <h2 className="text-2xl font-bold mb-4 text-purple-600 flex items-center gap-2">📂 Registrar evidencia/tarea</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 font-semibold">Clase</label>
              <select name="class_id" value={form.class_id} onChange={handleChange} className="border rounded px-3 py-2 w-full" required>
                <option value="">Selecciona una clase</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold">Estudiante</label>
              <select name="student_id" value={form.student_id} onChange={handleChange} className="border rounded px-3 py-2 w-full" required disabled={!form.class_id}>
                <option value="">Selecciona un estudiante</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold">URL Archivo (opcional)</label>
              <input name="file_url" value={form.file_url} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold">Descripción (opcional)</label>
              <textarea name="description" value={form.description} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow hover:bg-blue-700 transition" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar evidencia'}
            </button>
          </form>
          {msg && (
            <div className={`mt-4 p-2 rounded ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{msg.text}</div>
          )}
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition border-t-4 border-purple-400 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-4 text-purple-600 flex items-center gap-2">🎓 Tus clases</h2>
          <ul className="space-y-2">
            {classes.length === 0 && <li className="text-gray-500">No tienes clases asignadas.</li>}
            {classes.map(c => (
              <li key={c.id} className="bg-purple-50 rounded-xl px-4 py-2 font-semibold text-purple-700 shadow-sm flex items-center gap-2">
                <span>•</span> {c.name}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-gray-500">Aquí puedes crear actividades, revisar evidencias y ver estadísticas.</p>
        </div>
      </div>
    </section>
  );
}
