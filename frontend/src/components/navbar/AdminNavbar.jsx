import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 className="font-bold">Panel Admin</h1>
      <div className="flex gap-6 items-center">
        {user && (
          <span className="text-white/90 text-sm">
            {user.name || user.email} <span className="opacity-80">({user.role})</span>
          </span>
        )}
  <NavLink to="/admin" className={({ isActive }) => isActive ? "underline" : undefined}>Dashboard</NavLink>
  <NavLink to="/admin/users" className={({ isActive }) => isActive ? "underline" : undefined}>Usuarios</NavLink>
  <NavLink to="/admin/settings" className={({ isActive }) => isActive ? "underline" : undefined}>Configuración</NavLink>
        <button
          className="bg-transparent text-white font-semibold hover:underline"
          onClick={() => { logout(); navigate('/login'); }}
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
