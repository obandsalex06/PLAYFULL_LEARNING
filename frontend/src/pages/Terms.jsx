export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-800">Términos y Condiciones</h1>
      <p className="mt-4 text-gray-700">
        Al usar Playful Learning aceptas utilizar la plataforma con fines académicos, respetando
        los datos de otros usuarios y las políticas institucionales. Las cuentas de docentes,
        secretaría y admin son administradas por la institución.
      </p>
      <ul className="mt-6 list-disc pl-6 text-gray-700 space-y-2">
        <li>Prohibido compartir credenciales o usar datos de terceros sin autorización.</li>
        <li>Las acciones realizadas pueden ser registradas para auditoría académica.</li>
        <li>Nos reservamos el derecho de suspender cuentas por uso indebido.</li>
      </ul>
    </div>
  );
}
