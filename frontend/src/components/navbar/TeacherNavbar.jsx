import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function TeacherNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <nav className="bg-green-600 text-white p-4 flex justify-between">
      <h1 className="font-bold">Profesor</h1>
      <div className="flex gap-6 items-center">
        {user && (
          <span className="text-white/90 text-sm">
            {user.name || user.email} <span className="opacity-80">({user.role})</span>
          </span>
        )}
        <button
          className="bg-transparent text-white font-semibold hover:underline"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Cerrar sesión
        </button>
        <NavLink to="/teacher/classes" className={({ isActive }) => isActive ? "underline" : undefined}>Clases</NavLink>
        <NavLink to="/teacher/profile" className={({ isActive }) => isActive ? "underline" : undefined}>Perfil</NavLink>
      </div>
    </nav>
  );
}
