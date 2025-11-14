import { Loader2 } from "lucide-react";

/**
 * Componente de spinner de carga reutilizable
 * @param {string} size - Tamaño: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} text - Texto opcional a mostrar
 * @param {boolean} fullScreen - Si debe ocupar toda la pantalla
 * @param {string} className - Clases CSS adicionales
 */
export default function LoadingSpinner({ 
  size = 'md', 
  text = '', 
  fullScreen = false,
  className = ''
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50'
    : 'flex items-center justify-center p-4';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 
          className={`${sizeClasses[size]} animate-spin text-blue-600`}
        />
        {text && (
          <p className="text-sm text-gray-600 font-medium">
            {text}
          </p>
        )}
      </div>
    </div>
  );
}
