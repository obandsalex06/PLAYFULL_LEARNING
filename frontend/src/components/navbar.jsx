import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="backdrop-blur-sm bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
            </svg>
          </div>
          <div className="text-lg font-extrabold text-white">Playful Learning</div>
        </Link>

        {/* Menu */}
        <div className="hidden md:flex gap-6 items-center">
          <Link to="/#testimonials" className="text-white hover:text-teal-200 font-medium transition">
            Testimonios
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg shadow hover:scale-105 transition-transform"
          >
            Iniciar sesión
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
        >
          {menuOpen ? "✖" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-3 bg-gradient-to-b from-blue-600 to-teal-500 shadow-md">
          <Link to="/#testimonials" className="text-white hover:text-teal-200 font-medium transition">
            Testimonios
          </Link>
          <Link
            to="/login"
            className="mt-2 px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg shadow"
          >
            Iniciar sesión
          </Link>
        </div>
      )}
    </nav>
  );
}
