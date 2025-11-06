import { NavLink } from "react-router-dom";

export default function PublicNavbar() {
  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
  <h1 className="text-blue-800 font-bold"></h1>
      <div className="flex gap-4">
        <NavLink to="/home" className={({ isActive }) => (isActive ? "text-blue-800 font-semibold underline" : "text-blue-800 font-semibold hover:underline")}>Inicio</NavLink>
        <NavLink to="/login" className={({ isActive }) => (isActive ? "text-blue-800 font-semibold underline" : "text-blue-800 font-semibold hover:underline")}>Ingresar</NavLink>
      </div>
    </nav>
  );
}
