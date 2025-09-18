import { Link } from "react-router-dom";

export default function AdminNavbar() {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <h1 className="font-bold">Panel Admin</h1>
      <div className="flex gap-4">
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/users">Usuarios</Link>
        <Link to="/admin/settings">Configuración</Link>
      </div>
    </nav>
  );
}
