import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function SecretaryNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <nav className="bg-blue-600 text-white shadow">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/secretary" className="font-bold text-lg">Secretaria</Link>
        <div className="flex items-center gap-6">
          {user && (
            <span className="text-white/90 text-sm">
              {user.name || user.email} <span className="opacity-80">({user.role})</span>
            </span>
          )}
          <NavLink to="/secretary" className={({ isActive }) => isActive ? "underline" : "hover:text-teal-200"}>Panel</NavLink>
          <NavLink to="/admin" className={({ isActive }) => isActive ? "underline" : "hover:text-teal-200"}>Admin</NavLink>
          <Link to="/" className="bg-white text-blue-600 px-3 py-1 rounded">Inicio</Link>
          <button
            className="bg-transparent text-white font-semibold hover:underline"
            onClick={() => { logout(); navigate('/login'); }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  );
}
