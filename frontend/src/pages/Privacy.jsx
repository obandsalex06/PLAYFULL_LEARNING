export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-800">Política de Privacidad</h1>
      <p className="mt-4 text-gray-700">
        Cuidamos tus datos personales y solo los usamos para fines académicos dentro de Playful Learning.
        No compartimos tu información con terceros sin tu consentimiento. Puedes solicitar la eliminación
        o actualización de tus datos escribiendo a soporte.
      </p>
      <ul className="mt-6 list-disc pl-6 text-gray-700 space-y-2">
        <li>Datos recolectados: nombre, correo, rol, registro de actividades académicas.</li>
        <li>Finalidad: gestión de clases, notas, feedback y recompensas.</li>
        <li>Conservación: durante la vigencia del proyecto o hasta solicitud de eliminación.</li>
      </ul>
    </div>
  );
}
