import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png.png";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Nuevo Navbar */}
      <Navbar /> 
      {/* Contenido principal */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-blue-700 to-blue-500 text-white py-20 px-6 text-center">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Playful Learning Logo" className="w-32 h-32 object-contain animate-bounce" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold">
            Aprende de manera divertida 🚀
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto text-blue-100/90">
            Descubre Playful Learning: la plataforma donde estudiantes y profesores
            crecen juntos mientras se divierten aprendiendo.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/login"
              className="px-8 py-3 bg-white text-blue-700 font-bold rounded-xl shadow-lg hover:scale-105 transition-transform"
            >
              Comenzar ahora
            </Link>
            <a href="#features" className="px-8 py-3 border border-white text-white rounded-xl hover:bg-white hover:text-blue-700 transition">
              Conocer más
            </a>
          </div>
        </section>
        

        {/* Features Section */}
        <section className="mt-16 max-w-6xl mx-auto grid gap-8 md:grid-cols-3 px-6">
          <div className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-2xl transition">
            <h3 className="text-xl font-semibold text-blue-700">🎓 Clases Interactivas</h3>
            <p className="mt-2 text-gray-600">
              Accede a clases dinámicas y participativas que motivan a los estudiantes a aprender.
            </p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-2xl transition">
            <h3 className="text-xl font-semibold text-blue-700">📂 Tareas y Proyectos</h3>
            <p className="mt-2 text-gray-600">
              Sube tus evidencias de manera fácil y organiza tus entregas sin complicaciones.
            </p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-2xl transition">
            <h3 className="text-xl font-semibold text-blue-700">🏆 Learncoins</h3>
            <p className="mt-2 text-gray-600">
              Gana recompensas y desbloquea premios mientras completas tus actividades.
            </p>
          </div>
        </section>

        {/* Testimonials Section */}
  <section className="mt-20 py-16 bg-blue-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-blue-800">Lo que dicen nuestros usuarios</h2>
            <p className="mt-3 text-gray-600">Historias reales de aprendizaje y diversión.</p>

            <div className="mt-10 grid gap-8 md:grid-cols-2">
              <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
                <p className="text-gray-700">
                  "Mis estudiantes están más motivados que nunca. Playful Learning ha revolucionado mis clases."
                </p>
                <span className="block mt-4 font-semibold text-blue-700">— Profesora Ana</span>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
                <p className="text-gray-700">
                  "Pude completar todas mis tareas a tiempo y ganar learncoins, ¡aprendiendo y divirtiéndome!"
                </p>
                <span className="block mt-4 font-semibold text-blue-700">— Estudiante Juan</span>
              </div>
            </div>
          </div>
        </section>

        {/* Contact / Call to Action */}
  <section className="mt-20 relative bg-gradient-to-r from-blue-700 to-blue-500 text-white py-16 text-center rounded-3xl mx-6 md:mx-auto max-w-4xl shadow-xl">
          <h2 className="text-3xl font-bold">Empieza tu viaje educativo hoy</h2>
          <p className="mt-3 text-lg text-blue-200">
            Regístrate gratis y forma parte de nuestra comunidad de aprendizaje.
          </p>
          <br />
          <Link
            to="/login"
            className="mt-6 px-8 py-3 bg-yellow-400 text-blue-800 font-bold rounded-xl shadow hover:bg-yellow-300 transition"
          >
            Iniciar sesión
          </Link>
        </section>
      </main>

      {/* Nuevo Footer */}
      <Footer />
    </div>
  );
}