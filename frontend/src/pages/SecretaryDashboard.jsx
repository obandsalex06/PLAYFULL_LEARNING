import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function SecretaryDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== "secretaria") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">🚫 No tienes permiso para acceder.</p>
      </div>
    );
  }

  return (
    <section className="p-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-700">Panel de Secretaria</h1>
          <p className="text-sm text-gray-500">Bienvenida, {user.name}</p>
        </div>
        <div>
          <button onClick={() => { logout(); navigate('/login'); }} className="px-4 py-2 bg-red-500 text-white rounded">Cerrar sesión</button>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="font-semibold text-lg text-blue-600">Tareas recientes</h2>
          <p className="text-sm text-gray-500 mt-2">Aquí podrás ver y gestionar solicitudes, comunicaciones y datos administrativos.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="font-semibold text-lg text-blue-600">Accesos rápidos</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            <li>• Gestión de estudiantes</li>
            <li>• Comunicados</li>
            <li>• Reportes</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
