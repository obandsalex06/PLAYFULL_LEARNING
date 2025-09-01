import { useState } from "react";
import { Link } from "react-router-dom"; // 👈 Importa Link

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold text-purple-700">Playful Learning</div>

        {/* Menu */}
        <div className="hidden md:flex gap-6 items-center">
          <a href="#features" className="text-gray-700 hover:text-purple-600 transition">
            Funciones
          </a>
          <a href="#testimonials" className="text-gray-700 hover:text-purple-600 transition">
            Testimonios
          </a>
          <a href="/admin" className="text-gray-700 hover:text-purple-600 transition">
            Administrador
          </a>

          {/* 👇 Aquí reemplazamos el botón por un Link */}
          <Link
            to="/login"
            className="px-5 py-2 bg-purple-600 text-white rounded-xl shadow hover:bg-purple-700 transition"
          >
            Iniciar sesión
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✖" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-4 bg-white shadow-md">
          <a href="#features" className="text-gray-700 hover:text-purple-600 transition">
            Funciones
          </a>
          <a href="#testimonials" className="text-gray-700 hover:text-purple-600 transition">
            Testimonios
          </a>
          <a href="#contact" className="text-gray-700 hover:text-purple-600 transition">
            Contacto
          </a>

          {/* También aquí 👇 */}
          <Link
            to="/login"
            className="px-5 py-2 bg-purple-600 text-white rounded-xl shadow hover:bg-purple-700 transition"
          >
            Iniciar sesión
          </Link>
        </div>
      )}
    </nav>
  );
}