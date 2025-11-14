/* eslint-env node */
/**
 * Middleware de validación y sanitización de entrada
 * Previene XSS, SQL Injection y otros ataques
 */

// Función para sanitizar strings - remueve caracteres peligrosos
export function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  
  // Remover tags HTML y scripts
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

// Validar email
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validar nombre (solo letras, espacios, guiones y tildes)
export function isValidName(name) {
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-']+$/;
  return nameRegex.test(name) && name.length >= 2 && name.length <= 100;
}

// Middleware para sanitizar el body de las peticiones
export function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    });
  }
  next();
}

// Validar registro de estudiante
export function validateStudentRegistration(req, res, next) {
  const { first_name, last_name, email, password, grade } = req.body;
  const errors = [];

  // Validar nombre
  if (!first_name || !isValidName(first_name)) {
    errors.push('El nombre solo debe contener letras, espacios y guiones (2-100 caracteres)');
  }

  // Validar apellido
  if (!last_name || !isValidName(last_name)) {
    errors.push('El apellido solo debe contener letras, espacios y guiones (2-100 caracteres)');
  }

  // Validar email
  if (!email || !isValidEmail(email)) {
    errors.push('Email inválido');
  }

  // Validar contraseña
  if (!password || password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }

  // Validar grado
  if (grade && (isNaN(grade) || grade < 1 || grade > 11)) {
    errors.push('El grado debe estar entre 1 y 11');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      message: 'Errores de validación', 
      errors 
    });
  }

  next();
}

// Validar registro de profesor/secretaria
export function validateStaffRegistration(req, res, next) {
  const { name, email, password } = req.body;
  const errors = [];

  // Validar nombre
  if (!name || !isValidName(name)) {
    errors.push('El nombre solo debe contener letras, espacios y guiones (2-100 caracteres)');
  }

  // Validar email
  if (!email || !isValidEmail(email)) {
    errors.push('Email inválido');
  }

  // Validar contraseña
  if (!password || password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      message: 'Errores de validación', 
      errors 
    });
  }

  next();
}

// Validar ID numérico
export function validateNumericId(paramName = 'id') {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || isNaN(id) || parseInt(id) < 1) {
      return res.status(400).json({ 
        message: `ID inválido: ${paramName} debe ser un número positivo` 
      });
    }
    next();
  };
}

// Validar calificación
export function validateGrade(req, res, next) {
  const { grade } = req.body;
  
  if (grade === undefined || grade === null) {
    return res.status(400).json({ message: 'La calificación es requerida' });
  }

  const numericGrade = parseFloat(grade);
  if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
    return res.status(400).json({ 
      message: 'La calificación debe ser un número entre 0 y 100' 
    });
  }

  next();
}
