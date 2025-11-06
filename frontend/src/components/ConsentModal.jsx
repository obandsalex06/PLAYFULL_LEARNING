import { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

/**
 * Modal para registrar consentimiento de términos y políticas
 * Se muestra después de un login exitoso para usuarios nuevos
 */
export default function ConsentModal({ isOpen, onClose, userEmail, userRole }) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!acceptedTerms || !acceptedPrivacy) {
      setError('Debes aceptar ambos documentos para continuar');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.post('/api/auth/consent', {
        user_email: userEmail,
        user_role: userRole,
        consent_type: 'both'
      });
      
      onClose(true); // Cierra y notifica éxito
    } catch (err) {
      console.error('Error al registrar consentimiento:', err);
      setError('Error al registrar el consentimiento. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Términos y Condiciones
          </h2>
          
          <div className="space-y-4 mb-6">
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-2">Antes de continuar</h3>
              <p className="text-sm text-gray-600">
                Para usar nuestra plataforma, debes aceptar nuestros términos de servicio
                y política de privacidad.
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">
                  He leído y acepto los{' '}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Términos y Condiciones
                  </a>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedPrivacy}
                  onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">
                  He leído y acepto la{' '}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Política de Privacidad
                  </a>
                </span>
              </label>
            </div>

            {error && (
              <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => onClose(false)}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !acceptedTerms || !acceptedPrivacy}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Aceptar y Continuar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

ConsentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userEmail: PropTypes.string.isRequired,
  userRole: PropTypes.string.isRequired
};
