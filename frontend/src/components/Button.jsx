import { Loader2 } from "lucide-react";

/**
 * Botón con estado de loading integrado
 * @param {boolean} loading - Si el botón está en estado de carga
 * @param {boolean} disabled - Si el botón está deshabilitado
 * @param {string} variant - 'primary', 'secondary', 'danger', 'success'
 * @param {string} size - 'sm', 'md', 'lg'
 * @param {string} loadingText - Texto a mostrar durante la carga
 * @param {function} onClick - Handler del click
 * @param {string} type - Tipo del botón ('button', 'submit', 'reset')
 * @param {node} children - Contenido del botón
 * @param {string} className - Clases CSS adicionales
 */
export default function Button({
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  loadingText = 'Cargando...',
  onClick,
  type = 'button',
  children,
  className = '',
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
