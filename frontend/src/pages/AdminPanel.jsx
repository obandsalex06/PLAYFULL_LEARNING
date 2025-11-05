
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, School, Gift, LogOut, Menu, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import RegisterTeacherForm from "./RegisterTeacherForm";
import RegisterSecretaryForm from "./RegisterSecretaryForm";
import CreateClassForm from "./CreateClassForm";


// Dashboard de últimos registros
function AdminDashboard() {
  const [latestUsers, setLatestUsers] = useState([]);
  const [latestSchools, setLatestSchools] = useState([]);
  const [latestTeachers, setLatestTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/auth/latest-users", { headers: { "x-user-role": "admin" } }).then(r => r.json()),
      fetch("/api/auth/latest-schools", { headers: { "x-user-role": "admin" } }).then(r => r.json()),
      fetch("/api/auth/latest-teachers", { headers: { "x-user-role": "admin" } }).then(r => r.json()),
    ]).then(([users, schools, teachers]) => {
      setLatestUsers(users);
      setLatestSchools(schools);
      setLatestTeachers(teachers);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center py-10">Cargando dashboard...</div>;

  return (
    <section className="relative bg-gradient-to-r from-pink-400 to-purple-500 py-16 px-4 min-h-[60vh] flex flex-col items-center justify-center">
      <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-10 drop-shadow-lg text-center">
        Dashboard de Administración
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {/* Últimos usuarios */}
        <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition border-t-4 border-yellow-400">
          <h4 className="text-2xl font-bold mb-4 text-purple-600 flex items-center gap-2">🎓 Últimos estudiantes</h4>
          <table className="w-full text-left text-base">
            <thead>
              <tr className="text-slate-600 border-b">
                <th className="py-2">Nombre</th>
                <th className="py-2">Email</th>
                <th className="py-2">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {latestUsers.map(u => (
                <tr key={u.id} className="border-b hover:bg-purple-50">
                  <td className="py-2 font-semibold">{u.name}</td>
                  <td className="py-2">{u.email}</td>
                  <td className="py-2">{u.created_at?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Últimos colegios */}
        <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition border-t-4 border-pink-400">
          <h4 className="text-2xl font-bold mb-4 text-purple-600 flex items-center gap-2">🏫 Últimos colegios</h4>
          <table className="w-full text-left text-base">
            <thead>
              <tr className="text-slate-600 border-b">
                <th className="py-2">Nombre</th>
                <th className="py-2">Dirección</th>
                <th className="py-2">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {latestSchools.map(s => (
                <tr key={s.id} className="border-b hover:bg-pink-50">
                  <td className="py-2 font-semibold">{s.name}</td>
                  <td className="py-2">{s.address || "-"}</td>
                  <td className="py-2">{s.created_at?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Últimos profesores */}
        <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition border-t-4 border-purple-400">
          <h4 className="text-2xl font-bold mb-4 text-purple-600 flex items-center gap-2">👩‍🏫 Últimos profesores</h4>
          <table className="w-full text-left text-base">
            <thead>
              <tr className="text-slate-600 border-b">
                <th className="py-2">Nombre</th>
                <th className="py-2">Email</th>
                <th className="py-2">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {latestTeachers.map(t => (
                <tr key={t.id} className="border-b hover:bg-purple-50">
                  <td className="py-2 font-semibold">{t.name}</td>
                  <td className="py-2">{t.email}</td>
                  <td className="py-2">{t.created_at?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
// Componente para gestionar premios
function RewardsAdmin() {
  const [rewards, setRewards] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", cost: "" });
  const [editId, setEditId] = useState(null);
  const [mensaje, setMensaje] = useState("");
  // const { user } = useAuth(); (no usado en este componente)

  // Cargar premios
  useEffect(() => {
    fetch("/api/auth/rewards", { headers: { "x-user-role": "admin" } })
      .then(res => res.json())
      .then(setRewards);
  }, [mensaje]);

  // Crear o editar premio
  const handleSubmit = async e => {
    e.preventDefault();
    setMensaje("");
    const method = editId ? "PUT" : "POST";
    const url = editId ? `/api/auth/rewards/${editId}` : "/api/auth/rewards";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", "x-user-role": "admin" },
      body: JSON.stringify({ ...form, cost: Number(form.cost) })
    });
    const data = await res.json();
    setMensaje(data.message);
    setForm({ name: "", description: "", cost: "" });
    setEditId(null);
  };

  // Eliminar premio
  const handleDelete = async id => {
    if (!window.confirm("¿Eliminar premio?")) return;
    const res = await fetch(`/api/auth/rewards/${id}`, {
      method: "DELETE",
      headers: { "x-user-role": "admin" }
// ...existing code...
    });
    const data = await res.json();
    setMensaje(data.message);
  };

  // Cargar datos en formulario para editar
  const handleEdit = reward => {
    setForm({ name: reward.name, description: reward.description || "", cost: reward.cost });
    setEditId(reward.id);
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-8">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Gestionar premios</h4>
      {mensaje && <div className="mb-2 text-green-600 font-semibold">{mensaje}</div>}
      <form className="flex gap-4 mb-6 flex-wrap" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre del premio"
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
        <input
          type="number"
          placeholder="Costo (braincoins)"
          className="border rounded px-3 py-2"
          value={form.cost}
          min={1}
          onChange={e => setForm(f => ({ ...f, cost: e.target.value }))}
          required
        />
        <button type="submit" className="bg-indigo-600 text-white rounded px-4 py-2 font-semibold hover:bg-indigo-700 transition">
          {editId ? "Actualizar" : "Agregar"}
        </button>
        {editId && (
          <button type="button" className="bg-gray-300 text-gray-700 rounded px-4 py-2 font-semibold ml-2" onClick={() => { setEditId(null); setForm({ name: "", description: "", cost: "" }); }}>
            Cancelar
          </button>
        )}
      </form>
      <table className="w-full text-left">
        <thead>
          <tr className="text-slate-600 border-b">
            <th className="py-2">Nombre</th>
            <th className="py-2">Descripción</th>
            <th className="py-2">Costo</th>
            <th className="py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rewards.map(reward => (
            <tr key={reward.id} className="border-b hover:bg-slate-50">
              <td className="py-3 font-medium">{reward.name}</td>
              <td className="py-3">{reward.description || "-"}</td>
              <td className="py-3">{reward.cost}</td>
              <td className="py-3 flex gap-2">
                <button className="text-indigo-600 font-semibold hover:underline" onClick={() => handleEdit(reward)}>Editar</button>
                <button className="text-red-600 font-semibold hover:underline" onClick={() => handleDelete(reward.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
// Componente para gestionar colegios
function SchoolsAdmin() {
  const [schools, setSchools] = useState([]);
  const [form, setForm] = useState({ name: "", address: "" });
  const [editId, setEditId] = useState(null);
  const [mensaje, setMensaje] = useState("");
  // const { user } = useAuth(); (no usado en este componente)

  // Cargar colegios
  useEffect(() => {
    fetch("/api/auth/schools", { headers: { "x-user-role": "admin" } })
      .then(res => res.json())
      .then(setSchools);
  }, [mensaje]);

  // Crear o editar colegio
  const handleSubmit = async e => {
    e.preventDefault();
    setMensaje("");
    const method = editId ? "PUT" : "POST";
    const url = editId ? `/api/auth/schools/${editId}` : "/api/auth/schools";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", "x-user-role": "admin" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setMensaje(data.message);
    setForm({ name: "", address: "" });
    setEditId(null);
  };

  // Eliminar colegio
  const handleDelete = async id => {
    if (!window.confirm("¿Eliminar colegio?")) return;
    const res = await fetch(`/api/auth/schools/${id}`, {
      method: "DELETE",
      headers: { "x-user-role": "admin" }
    });
    const data = await res.json();
    setMensaje(data.message);
  };

  // Cargar datos en formulario para editar
  const handleEdit = school => {
    setForm({ name: school.name, address: school.address || "" });
    setEditId(school.id);
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-8">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Gestionar colegios</h4>
      {mensaje && <div className="mb-2 text-green-600 font-semibold">{mensaje}</div>}
      <form className="flex gap-4 mb-6 flex-wrap" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre del colegio"
          className="border rounded px-3 py-2"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
        <input
          type="text"
          placeholder="Dirección (opcional)"
          className="border rounded px-3 py-2"
          value={form.address}
          onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
        />
        <button type="submit" className="bg-indigo-600 text-white rounded px-4 py-2 font-semibold hover:bg-indigo-700 transition">
          {editId ? "Actualizar" : "Agregar"}
        </button>
        {editId && (
          <button type="button" className="bg-gray-300 text-gray-700 rounded px-4 py-2 font-semibold ml-2" onClick={() => { setEditId(null); setForm({ name: "", address: "" }); }}>
            Cancelar
          </button>
        )}
      </form>
      <table className="w-full text-left">
        <thead>
          <tr className="text-slate-600 border-b">
            <th className="py-2">Nombre</th>
            <th className="py-2">Dirección</th>
            <th className="py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {schools.map(school => (
            <tr key={school.id} className="border-b hover:bg-slate-50">
              <td className="py-3 font-medium">{school.name}</td>
              <td className="py-3">{school.address || "-"}</td>
              <td className="py-3 flex gap-2">
                <button className="text-indigo-600 font-semibold hover:underline" onClick={() => handleEdit(school)}>Editar</button>
                <button className="text-red-600 font-semibold hover:underline" onClick={() => handleDelete(school.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const NAV = [
  { to: "/admin/users", label: "Usuarios", Icon: Users },
  { to: "/admin/schools", label: "Colegios", Icon: School },
  { to: "/admin/rewards", label: "Premios", Icon: Gift },
  { to: "#register-teacher", label: "Registrar profesor", Icon: UserPlus },
  { to: "#register-secretary", label: "Registrar secretaria", Icon: UserPlus },
  { to: "create-class", label: "Crear clase", Icon: School },
];

export default function AdminPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState("dashboard");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  if (!user || user.role !== "admin") return null;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-64"} md:translate-x-0`}
      >
        <div className="h-full bg-gradient-to-b from-purple-600 via-indigo-600 to-sky-600 text-white shadow-lg p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center font-extrabold">
              PL
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight">
                Playful <span className="font-medium">Admin</span>
              </h1>
              <p className="text-xs opacity-80">Panel de control</p>
            </div>
          </div>

          <nav className="flex-1 flex flex-col gap-2">
            {NAV.map(({ to, label, Icon }) => (
              <button
                key={to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition w-full text-left ${selectedSection === to ? "bg-white/10" : ""}`}
                onClick={() => setSelectedSection(to)}
              >
                <Icon size={18} />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-4">
            <button
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-600/90 transition"
              onClick={() => { logout(); navigate("/login"); }}
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0 md:ml-64"
        }`}
      >
        <header className="flex items-center justify-between bg-white/80 backdrop-blur px-6 py-4 shadow sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 rounded-md bg-white/60"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={20} />
            </button>
            <h2 className="text-xl font-semibold">
              Panel de Administración
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600">{user?.name || "Admin"}</div>
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "Admin")}&background=8a2be2&color=fff`}
              alt="avatar admin"
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
            />
          </div>
        </header>

        <main className="p-6 max-w-6xl mx-auto w-full">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">
            Bienvenido, <span className="text-purple-600">{user?.name || "Administrador"}</span> 👋
          </h3>

          {/* Sección dinámica */}
          {selectedSection === "#register-teacher" ? (
            <div className="bg-white rounded-xl shadow p-6 mb-8 max-w-lg mx-auto">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Registrar nuevo profesor
              </h4>
              <RegisterTeacherForm />
            </div>
          ) : selectedSection === "#register-secretary" ? (
            <div className="bg-white rounded-xl shadow p-6 mb-8 max-w-lg mx-auto">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Registrar nueva secretaria</h4>
              <RegisterSecretaryForm />
            </div>
          ) : selectedSection === "/admin/schools" ? (
            <SchoolsAdmin />
          ) : selectedSection === "/admin/rewards" ? (
            <RewardsAdmin />
          ) : selectedSection === "create-class" ? (
            <CreateClassForm />
          ) : (
            <AdminDashboard />
          )}
        </main>
      </div>
    </div>
  );
}