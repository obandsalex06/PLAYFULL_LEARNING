import { useAuth } from "../context/AuthContext";

export default function TeacherDashboard() {
  const { user } = useAuth();

  if (!user || user.role !== "docente") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">🚫 No tienes permiso para acceder.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800">Panel de Docente</h1>
        <p className="text-gray-600 mt-2">Bienvenido, {user.name}</p>
      </header>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold">Tus clases</h2>
        <p className="mt-2 text-gray-600">Aqui puedes crear actividades, revisar evidencias y ver estadísticas.</p>
      </div>
    </div>
  );
}
