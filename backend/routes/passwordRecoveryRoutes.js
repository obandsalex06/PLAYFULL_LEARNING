/* eslint-env node */
import express from 'express';
import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import { sanitizeString, isValidEmail } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Almacén temporal de códigos de recuperación (en producción usar Redis)
const resetCodes = new Map();

// Generar código de 6 dígitos
function generateResetCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST - Solicitar recuperación de contraseña
router.post('/request', async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'El correo electrónico es obligatorio' });
    }

    email = sanitizeString(email).toLowerCase();

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Formato de correo electrónico inválido' });
    }

    // Buscar usuario en las tres tablas
    let userFound = false;
    let role = null;

    // Buscar en students
    const [student] = await new Promise((resolve, reject) => {
      db.query('SELECT id, email FROM students WHERE email = ?', [email], (err, rows) =>
        err ? reject(err) : resolve(rows)
      );
    });

    if (student) {
      userFound = true;
      role = 'estudiante';
    }

    // Buscar en teachers
    if (!userFound) {
      const [teacher] = await new Promise((resolve, reject) => {
        db.query('SELECT id, email FROM teachers WHERE email = ?', [email], (err, rows) =>
          err ? reject(err) : resolve(rows)
        );
      });

      if (teacher) {
        userFound = true;
        role = 'docente';
      }
    }

    // Buscar en admins
    if (!userFound) {
      const [admin] = await new Promise((resolve, reject) => {
        db.query('SELECT id, email FROM admins WHERE email = ?', [email], (err, rows) =>
          err ? reject(err) : resolve(rows)
        );
      });

      if (admin) {
        userFound = true;
        role = 'admin';
      }
    }

    // Por seguridad, siempre devolver el mismo mensaje
    // (no revelar si el correo existe o no)
    if (!userFound) {
      return res.json({
        message: 'Si el correo existe, recibirás un código de recuperación'
      });
    }

    // Generar código de recuperación
    const code = generateResetCode();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutos

    // Guardar código
    resetCodes.set(email, {
      code,
      expiresAt,
      role,
      attempts: 0
    });

    // En producción, aquí se enviaría un email
    // Por ahora, lo devolvemos en la respuesta (solo para desarrollo)
    console.log(`Código de recuperación para ${email}: ${code}`);

    res.json({
      message: 'Si el correo existe, recibirás un código de recuperación',
      // SOLO PARA DESARROLLO - Remover en producción
      dev_code: code,
      dev_expires_in_minutes: 15
    });

  } catch (error) {
    console.error('Error al solicitar recuperación:', error);
    res.status(500).json({ message: 'Error al procesar solicitud', error: error.message });
  }
});

// POST - Verificar código de recuperación
router.post('/verify-code', async (req, res) => {
  try {
    let { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Correo y código son obligatorios' });
    }

    email = sanitizeString(email).toLowerCase();
    code = sanitizeString(code);

    const resetData = resetCodes.get(email);

    if (!resetData) {
      return res.status(400).json({ message: 'Código inválido o expirado' });
    }

    // Verificar intentos
    if (resetData.attempts >= 3) {
      resetCodes.delete(email);
      return res.status(429).json({ message: 'Demasiados intentos. Solicita un nuevo código' });
    }

    // Verificar expiración
    if (Date.now() > resetData.expiresAt) {
      resetCodes.delete(email);
      return res.status(400).json({ message: 'Código expirado. Solicita uno nuevo' });
    }

    // Verificar código
    if (resetData.code !== code) {
      resetData.attempts++;
      return res.status(400).json({
        message: 'Código incorrecto',
        attemptsLeft: 3 - resetData.attempts
      });
    }

    // Código válido - generar token temporal
    const resetToken = Buffer.from(`${email}:${code}:${Date.now()}`).toString('base64');

    res.json({
      message: 'Código verificado correctamente',
      resetToken
    });

  } catch (error) {
    console.error('Error al verificar código:', error);
    res.status(500).json({ message: 'Error al verificar código', error: error.message });
  }
});

// POST - Restablecer contraseña
router.post('/reset', async (req, res) => {
  try {
    let { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    email = sanitizeString(email).toLowerCase();

    // Validar contraseña
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const resetData = resetCodes.get(email);

    if (!resetData) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }

    // Verificar expiración
    if (Date.now() > resetData.expiresAt) {
      resetCodes.delete(email);
      return res.status(400).json({ message: 'Token expirado. Inicia el proceso nuevamente' });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña según el rol
    const tableMap = {
      'estudiante': 'students',
      'docente': 'teachers',
      'admin': 'admins'
    };

    const table = tableMap[resetData.role];

    if (!table) {
      return res.status(500).json({ message: 'Error al identificar tipo de usuario' });
    }

    await new Promise((resolve, reject) => {
      db.query(
        `UPDATE ${table} SET password = ? WHERE email = ?`,
        [hashedPassword, email],
        (err) => err ? reject(err) : resolve()
      );
    });

    // Eliminar código usado
    resetCodes.delete(email);

    res.json({ message: 'Contraseña actualizada con éxito' });

  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({ message: 'Error al restablecer contraseña', error: error.message });
  }
});

// GET - Verificar estado del servicio (solo para desarrollo)
router.get('/status', (req, res) => {
  res.json({
    service: 'Password Recovery',
    active_codes: resetCodes.size,
    message: 'Servicio funcionando correctamente'
  });
});

// Limpiar códigos expirados cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of resetCodes.entries()) {
    if (now > data.expiresAt) {
      resetCodes.delete(email);
      console.log(`Código expirado eliminado para ${email}`);
    }
  }
}, 5 * 60 * 1000);

export default router;
