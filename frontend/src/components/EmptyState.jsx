/**
 * Componente de estado vacío cuando no hay datos para mostrar
 * @param {string} icon - Emoji o icono a mostrar
 * @param {string} title - Título del mensaje
 * @param {string} description - Descripción del estado vacío
 * @param {node} action - Botón o acción opcional
 * @param {string} className - Clases CSS adicionales
 */
export default function EmptyState({ 
  icon = "📭", 
  title = "No hay datos", 
  description = "Aún no hay información para mostrar aquí.",
  action = null,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md">
        {description}
      </p>
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}
