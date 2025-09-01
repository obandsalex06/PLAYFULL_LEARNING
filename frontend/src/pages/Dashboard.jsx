export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Bienvenido, aquí verás tus clases, evidencias y Braincoins.
        </p>
      </header>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Clases */}
        <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-gray-700">Clases</h2>
          <p className="mt-2 text-gray-500">Revisa tus próximas clases y horarios.</p>
          <span className="mt-4 block text-3xl font-bold text-indigo-600">8</span>
        </div>

        {/* Evidencias */}
        <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-gray-700">Evidencias</h2>
          <p className="mt-2 text-gray-500">Verifica tus tareas y trabajos pendientes.</p>
          <span className="mt-4 block text-3xl font-bold text-indigo-600">5</span>
        </div>

        {/* Braincoins */}
        <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-gray-700">Braincoins</h2>
          <p className="mt-2 text-gray-500">Moneda que acumulas por buen rendimiento.</p>
          <span className="mt-4 block text-3xl font-bold text-indigo-600">120</span>
        </div>
      </div>

      {/* Sección adicional, ejemplo: últimas actividades */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Últimas actividades</h2>
        <ul className="bg-white shadow-md rounded-xl divide-y divide-gray-200">
          <li className="p-4 hover:bg-gray-50 transition-colors">Entregaste "Tarea de matemáticas" - 20/08/2025</li>
          <li className="p-4 hover:bg-gray-50 transition-colors">Recibiste 10 Braincoins por asistencia</li>
          <li className="p-4 hover:bg-gray-50 transition-colors">Nueva clase: Historia - 25/08/2025</li>
        </ul>
      </section>
    </div>
  );
}