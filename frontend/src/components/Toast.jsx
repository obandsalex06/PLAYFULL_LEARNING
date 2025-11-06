import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * Toast notification component
 * @param {Object} props
 * @param {Object} props.message - Message object with type and text
 * @param {Function} props.onClose - Function to close the toast
 * @param {number} props.duration - Auto-dismiss duration in milliseconds (default: 5000)
 */
export default function Toast({ message, onClose, duration = 5000 }) {
  useEffect(() => {
    if (message && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [message, onClose, duration]);

  if (!message) return null;

  const types = {
    success: {
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-800',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      icon: <AlertCircle className="w-5 h-5 text-red-600" />,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-800',
      icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-800',
      icon: <Info className="w-5 h-5 text-blue-600" />,
    },
  };

  const style = types[message.type] || types.info;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div
        className={`${style.bg} ${style.text} border-2 rounded-lg shadow-lg p-4 pr-12 max-w-md flex items-start gap-3`}
        role="alert"
      >
        <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
        <div className="flex-1">
          <p className="font-medium">{message.text}</p>
        </div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
          aria-label="Cerrar notificación"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

Toast.propTypes = {
  message: PropTypes.shape({
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired,
    text: PropTypes.string.isRequired,
  }),
  onClose: PropTypes.func.isRequired,
  duration: PropTypes.number,
};
