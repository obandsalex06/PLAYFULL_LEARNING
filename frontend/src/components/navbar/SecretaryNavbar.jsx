import { Link } from "react-router-dom";

export default function SecretaryNavbar() {
  return (
    <nav className="bg-blue-600 text-white shadow">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/secretary" className="font-bold text-lg">Secretaria</Link>
        <div className="flex items-center gap-4">
          <Link to="/secretary" className="hover:text-teal-200">Panel</Link>
          <Link to="/admin" className="hover:text-teal-200">Admin</Link>
          <Link to="/" className="bg-white text-blue-600 px-3 py-1 rounded">Inicio</Link>
        </div>
      </div>
    </nav>
  );
}
