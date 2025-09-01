import { useState } from "react";
import { Link } from "react-router-dom";
import { Users, School, Gift, LogOut, Menu } from "lucide-react"; // 👈 Iconos bonitos

export default function AdminPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform 
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-64"} 
        md:translate-x-0`}
      >
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-purple-700">Admin Panel</h1>
        </div>
        <nav className="p-4 flex flex-col gap-4">
          <Link
            to="/admin/users"
            className="flex items-center gap-3 text-gray-700 hover:text-purple-600 transition"
          >
            <Users size={20} /> Usuarios
          </Link>
          <Link
            to="/admin/schools"
            className="flex items-center gap-3 text-gray-700 hover:text-purple-600 transition"
          >
            <School size={20} /> Colegios
          </Link>
          <Link
            to="/admin/rewards"
            className="flex items-center gap-3 text-gray-700 hover:text-purple-600 transition"
          >
            <Gift size={20} /> Premios
          </Link>
          <button className="flex items-center gap-3 text-gray-700 hover:text-red-600 transition">
            <LogOut size={20} /> Cerrar sesión
          </button>
        </nav>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Topbar */}
        <header className="flex items-center justify-between bg-white shadow px-6 py-4">
          <button
            className="md:hidden text-gray-700"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={24} />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">
            Panel de Administración
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-gray-600">Admin</span>
            <img
              src="https://ui-avatars.com/api/?name=Admin"
              alt="avatar"
              className="w-10 h-10 rounded-full border"
            />
          </div>
        </header>

        {/* Dashboard content */}
        <main className="p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            Bienvenido, Administrador 👋
          </h3>

          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow p-6 flex flex-col">
              <h4 className="text-gray-500">Usuarios registrados</h4>
              <p className="text-3xl font-bold text-purple-700">1,245</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col">
              <h4 className="text-gray-500">Colegios</h4>
              <p className="text-3xl font-bold text-purple-700">56</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col">
              <h4 className="text-gray-500">Premios entregados</h4>
              <p className="text-3xl font-bold text-purple-700">320</p>
            </div>
          </div>

          {/* Tabla de ejemplo */}
          <div className="bg-white rounded-xl shadow p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Últimos usuarios registrados
            </h4>
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600 border-b">
                  <th className="py-2">Nombre</th>
                  <th className="py-2">Correo</th>
                  <th className="py-2">Rol</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Juan Pérez</td>
                  <td className="py-2">juan@example.com</td>
                  <td className="py-2">Estudiante</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Ana López</td>
                  <td className="py-2">ana@example.com</td>
                  <td className="py-2">Docente</td>
                </tr>
                <tr>
                  <td className="py-2">Carlos Gómez</td>
                  <td className="py-2">carlos@example.com</td>
                  <td className="py-2">Administrador</td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}