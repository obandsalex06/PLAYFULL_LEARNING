export default function Footer() {
  return (
    <footer className="bg-purple-700 text-white mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
        {/* Sección de contacto */}
        <div>
          <h3 className="font-bold text-lg mb-2">Contáctanos</h3>
          <p>Email: soporte@playfullearning.com</p>
          <p>Tel: +57 313 325 2622</p>
        </div>

        {/* Sección enlaces */}
        <div>
          <h3 className="font-bold text-lg mb-2">Enlaces útiles</h3>
          <ul className="space-y-2">
            <li><a href="#features" className="hover:underline">Funciones</a></li>
            <li><a href="#testimonials" className="hover:underline">Testimonios</a></li>
            <li><a href="#contact" className="hover:underline">Contacto</a></li>
          </ul>
        </div>

        {/* Sección social */}
        <div>
          <h3 className="font-bold text-lg mb-2">Síguenos</h3>
          <div className="flex gap-4 mt-2">
            <a href="#" className="hover:text-yellow-400 transition">🐦 Twitter</a>
            <a href="#" className="hover:text-yellow-400 transition">📘 Facebook</a>
            <a href="#" className="hover:text-yellow-400 transition">📸 Instagram</a>
          </div>
        </div>
      </div>

      <div className="border-t border-purple-600 text-center py-4 text-sm">
        © 2025 Playful Learning. Todos los derechos reservados.
      </div>
    </footer>
  );
}