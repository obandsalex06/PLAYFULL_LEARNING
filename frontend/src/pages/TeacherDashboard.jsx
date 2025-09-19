import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-800">Panel de Docente</h1>
          <p className="text-gray-600 mt-2">Bienvenido, {user.name}</p>
        </div>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700 transition"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Cerrar sesión
        </button>
      </header>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold">Tus clases</h2>
        <p className="mt-2 text-gray-600">Aqui puedes crear actividades, revisar evidencias y ver estadísticas.</p>
      </div>
    </div>
  );
}
