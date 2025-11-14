import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

/**
 * Componente de alerta inline para mostrar feedback de operaciones
 * @param {string} type - 'success', 'error', 'warning', 'info'
 * @param {string} message - Mensaje a mostrar
 * @param {function} onClose - Callback opcional para cerrar la alerta
 * @param {string} className - Clases CSS adicionales
 */
export default function Alert({ type = 'info', message, onClose, className = '' }) {
  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-500'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-500'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-500'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-500'
    }
  };

  const { icon: Icon, bgColor, borderColor, textColor, iconColor } = config[type] || config.info;

  if (!message) return null;

  return (
    <div 
      className={`${bgColor} ${borderColor} ${textColor} border rounded-lg p-4 flex items-start gap-3 ${className}`}
      role="alert"
    >
      <Icon className={`${iconColor} w-5 h-5 flex-shrink-0 mt-0.5`} />
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`${textColor} hover:opacity-70 transition-opacity`}
          aria-label="Cerrar alerta"
        >
          <XCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

/**
 * Componente de lista de errores de validación
 */
export function ValidationErrors({ errors = [], className = '' }) {
  if (!Array.isArray(errors) || errors.length === 0) return null;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <XCircle className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-red-800 mb-2">
            Se encontraron {errors.length} {errors.length === 1 ? 'error' : 'errores'}:
          </h4>
          <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
