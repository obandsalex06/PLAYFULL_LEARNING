/**
 * Utilidades para validación de datos
 * Previene errores de "cannot read map of undefined"
 */

/**
 * Asegura que un valor sea un array válido
 * @param {any} value - Valor a validar
 * @param {Array} defaultValue - Valor por defecto si no es array (default: [])
 * @returns {Array} Array validado
 */
export function ensureArray(value, defaultValue = []) {
  return Array.isArray(value) ? value : defaultValue;
}

/**
 * Valida que un valor sea un array antes de aplicar operaciones
 * @param {any} value - Valor a validar
 * @returns {boolean} true si es un array válido
 */
export function isValidArray(value) {
  return Array.isArray(value) && value.length >= 0;
}

/**
 * Normaliza una respuesta de API a array
 * @param {any} data - Datos de la API
 * @param {string} key - Key opcional si los datos están anidados
 * @returns {Array} Array normalizado
 */
export function normalizeToArray(data, key = null) {
  if (key && data && typeof data === 'object') {
    return ensureArray(data[key]);
  }
  return ensureArray(data);
}

/**
 * Valida que un objeto tenga una propiedad que sea array
 * @param {object} obj - Objeto a validar
 * @param {string} key - Nombre de la propiedad
 * @returns {boolean} true si existe y es array
 */
export function hasArrayProperty(obj, key) {
  return obj && typeof obj === 'object' && Array.isArray(obj[key]);
}
