import { verifyAccessToken } from '../utils/jwtUtils.js';

/**
 * Middleware para verificar el token JWT en las peticiones
 * Extrae el token del header Authorization y verifica su validez
 * Si es válido, añade los datos del usuario a req.user
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Token de autenticación requerido' });
  }

  const decoded = verifyAccessToken(token);
  
  if (!decoded) {
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }

  // Añadir información del usuario al request
  req.user = decoded;
  next();
}

/**
 * Middleware para verificar roles específicos
 * Debe usarse después de authenticateToken
 * @param {string[]} allowedRoles - Array de roles permitidos
 */
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'No tienes permisos para acceder a este recurso',
        requiredRole: allowedRoles,
        currentRole: req.user.role
      });
    }

    next();
  };
}

/**
 * Middleware opcional: permite pasar sin token o con token válido
 * Útil para endpoints que funcionan diferente con/sin autenticación
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const decoded = verifyAccessToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  next();
}
