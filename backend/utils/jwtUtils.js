import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Claves secretas: deben definirse en variables de entorno sin valores hardcode.
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  console.warn('[jwtUtils] Faltan ACCESS_TOKEN_SECRET o REFRESH_TOKEN_SECRET en el entorno. Usa valores seguros en producción.');
}

// Duración de los tokens
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutos
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 días

/**
 * Genera un access token JWT
 * @param {Object} payload - Datos del usuario (id, email, role)
 * @returns {string} Token JWT
 */
export function generateAccessToken(payload) {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET || 'insecure-access-dev', { expiresIn: ACCESS_TOKEN_EXPIRY });
}

/**
 * Genera un refresh token JWT
 * @param {Object} payload - Datos del usuario (id, email)
 * @returns {string} Token JWT
 */
export function generateRefreshToken(payload) {
  // Solo incluimos id y email en el refresh token
  const { id, email } = payload;
  return jwt.sign({ id, email }, REFRESH_TOKEN_SECRET || 'insecure-refresh-dev', { expiresIn: REFRESH_TOKEN_EXPIRY });
}

/**
 * Verifica un access token
 * @param {string} token - Token a verificar
 * @returns {Object|null} Payload decodificado o null si es inválido
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET || 'insecure-access-dev');
  } catch {
    return null;
  }
}

/**
 * Verifica un refresh token
 * @param {string} token - Token a verificar
 * @returns {Object|null} Payload decodificado o null si es inválido
 */
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET || 'insecure-refresh-dev');
  } catch {
    return null;
  }
}

/**
 * Genera ambos tokens (access y refresh) para un usuario
 * @param {Object} user - Objeto con datos del usuario
 * @returns {Object} Objeto con accessToken y refreshToken
 */
export function generateTokens(user) {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
}
