export default function Footer() {
  return (
    <footer className="mt-20 bg-gradient-to-r from-blue-700 to-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
        {/* Branding */}
        <div>
          <h3 className="font-extrabold text-xl mb-2">Playful Learning</h3>
          <p className="text-sm text-blue-100/80">Aprende jugando — Conecta estudiantes, docentes y recompensas.</p>
        </div>

        {/* Enlaces rápidos */}
        <div>
          <h3 className="font-semibold text-lg mb-2">Enlaces</h3>
          <ul className="space-y-2">
            <li><a href="#features" className="hover:text-teal-200 transition">Funciones</a></li>
            <li><a href="#testimonials" className="hover:text-teal-200 transition">Testimonios</a></li>
            <li><a href="#contact" className="hover:text-teal-200 transition">Contacto</a></li>
            <li><a href="/privacy" className="hover:text-teal-200 transition">Política de Privacidad</a></li>
            <li><a href="/terms" className="hover:text-teal-200 transition">Términos y Condiciones</a></li>
          </ul>
        </div>

        {/* Contacto y social */}
        <div>
          <h3 className="font-semibold text-lg mb-2">Contacto</h3>
          <p className="text-sm">soporte@playfullearning.com</p>
          <p className="text-sm">+57 313 325 2622</p>
          <div className="flex gap-3 mt-4">
            <a href="#" className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-md">🐦</a>
            <a href="#" className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-md">📘</a>
            <a href="#" className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-md">📸</a>
          </div>
        </div>
      </div>

      <div className="border-t border-blue-500/40 text-center py-4 text-sm bg-blue-800/40">
        © {new Date().getFullYear()} Playful Learning. Todos los derechos reservados.
      </div>
    </footer>
  );
}