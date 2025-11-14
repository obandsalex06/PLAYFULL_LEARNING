/* eslint-env node */
import express from 'express';
import db from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validateNumericId, sanitizeString } from '../middleware/validationMiddleware.js';

const router = express.Router();

// GET - Obtener evidencias de un estudiante
router.get('/student/:studentId', authenticateToken, validateNumericId('studentId'), async (req, res) => {
  try {
    const { studentId } = req.params;
    const userRole = req.user.role;
    const userEmail = req.user.email;

    // Verificar permisos
    if (userRole === 'estudiante') {
      // El estudiante solo puede ver sus propias evidencias
      const [student] = await new Promise((resolve, reject) => {
        db.query('SELECT id FROM students WHERE email = ?', [userEmail], (err, rows) => 
          err ? reject(err) : resolve(rows)
        );
      });
      
      if (!student || student.id !== parseInt(studentId)) {
        return res.status(403).json({ message: 'No autorizado' });
      }
    }

    // Obtener evidencias con información de clase
    const evidences = await new Promise((resolve, reject) => {
      db.query(
        `SELECT e.*, c.name as class_name, t.name as teacher_name
         FROM evidences e
         LEFT JOIN classes c ON e.class_id = c.id
         LEFT JOIN teachers t ON c.teacher_id = t.id
         WHERE e.student_id = ?
         ORDER BY e.created_at DESC`,
        [studentId],
        (err, rows) => err ? reject(err) : resolve(rows)
      );
    });

    res.json(evidences);
  } catch (error) {
    console.error('Error al obtener evidencias:', error);
    res.status(500).json({ message: 'Error al cargar evidencias', error: error.message });
  }
});

// GET - Obtener evidencias de una clase (para profesores)
router.get('/class/:classId', authenticateToken, validateNumericId('classId'), async (req, res) => {
  try {
    const { classId } = req.params;
    const userRole = req.user.role;
    const userEmail = req.user.email;

    // Solo profesores pueden ver evidencias de una clase
    if (userRole !== 'docente') {
      return res.status(403).json({ message: 'Solo profesores pueden ver evidencias de la clase' });
    }

    // Verificar que el profesor es dueño de la clase
    const [classInfo] = await new Promise((resolve, reject) => {
      db.query(
        `SELECT c.id FROM classes c
         JOIN teachers t ON c.teacher_id = t.id
         WHERE c.id = ? AND t.email = ?`,
        [classId, userEmail],
        (err, rows) => err ? reject(err) : resolve(rows)
      );
    });

    if (!classInfo) {
      return res.status(403).json({ message: 'No tienes permiso para ver evidencias de esta clase' });
    }

    // Obtener evidencias de la clase
    const evidences = await new Promise((resolve, reject) => {
      db.query(
        `SELECT e.*, s.name as student_name, s.email as student_email
         FROM evidences e
         JOIN students s ON e.student_id = s.id
         WHERE e.class_id = ?
         ORDER BY e.created_at DESC`,
        [classId],
        (err, rows) => err ? reject(err) : resolve(rows)
      );
    });

    res.json(evidences);
  } catch (error) {
    console.error('Error al obtener evidencias de clase:', error);
    res.status(500).json({ message: 'Error al cargar evidencias', error: error.message });
  }
});

// POST - Crear nueva evidencia (estudiantes suben sus tareas)
router.post('/', authenticateToken, async (req, res) => {
  try {
    let { student_id, class_id, file_url, description } = req.body;
    const userRole = req.user.role;
    const userEmail = req.user.email;

    // Sanitizar descripción
    description = sanitizeString(description);

    // Validar datos requeridos
    if (!student_id || !class_id) {
      return res.status(400).json({ message: 'Faltan datos obligatorios (student_id, class_id)' });
    }

    // Verificar que el estudiante existe
    const [student] = await new Promise((resolve, reject) => {
      db.query('SELECT id, email FROM students WHERE id = ?', [student_id], (err, rows) =>
        err ? reject(err) : resolve(rows)
      );
    });

    if (!student) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    // Si es estudiante, solo puede subir sus propias evidencias
    if (userRole === 'estudiante' && student.email !== userEmail) {
      return res.status(403).json({ message: 'Solo puedes subir tus propias evidencias' });
    }

    // Verificar que la clase existe
    const [classInfo] = await new Promise((resolve, reject) => {
      db.query('SELECT id FROM classes WHERE id = ?', [class_id], (err, rows) =>
        err ? reject(err) : resolve(rows)
      );
    });

    if (!classInfo) {
      return res.status(404).json({ message: 'Clase no encontrada' });
    }

    // Insertar evidencia
    const result = await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO evidences (student_id, class_id, file_url, description, status) VALUES (?, ?, ?, ?, ?)',
        [student_id, class_id, file_url || null, description || null, 'pendiente'],
        (err, result) => err ? reject(err) : resolve(result)
      );
    });

    res.status(201).json({
      message: 'Evidencia registrada con éxito',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error al crear evidencia:', error);
    res.status(500).json({ message: 'Error al registrar evidencia', error: error.message });
  }
});

// PUT - Actualizar estado de evidencia (aprobar/rechazar - solo profesores)
router.put('/:id/status', authenticateToken, validateNumericId('id'), async (req, res) => {
  try {
    const { id } = req.params;
    let { status, feedback } = req.body;
    const userRole = req.user.role;
    const userEmail = req.user.email;

    // Solo profesores pueden cambiar el estado
    if (userRole !== 'docente') {
      return res.status(403).json({ message: 'Solo profesores pueden cambiar el estado de evidencias' });
    }

    // Validar estado
    const validStatuses = ['pendiente', 'aprobado', 'rechazado'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Estado inválido. Valores permitidos: pendiente, aprobado, rechazado' });
    }

    // Sanitizar feedback
    feedback = sanitizeString(feedback);

    // Obtener información de la evidencia
    const [evidence] = await new Promise((resolve, reject) => {
      db.query(
        `SELECT e.*, c.teacher_id
         FROM evidences e
         JOIN classes c ON e.class_id = c.id
         WHERE e.id = ?`,
        [id],
        (err, rows) => err ? reject(err) : resolve(rows)
      );
    });

    if (!evidence) {
      return res.status(404).json({ message: 'Evidencia no encontrada' });
    }

    // Verificar que el profesor es dueño de la clase
    const [teacher] = await new Promise((resolve, reject) => {
      db.query('SELECT id FROM teachers WHERE email = ?', [userEmail], (err, rows) =>
        err ? reject(err) : resolve(rows)
      );
    });

    if (!teacher || teacher.id !== evidence.teacher_id) {
      return res.status(403).json({ message: 'No tienes permiso para modificar esta evidencia' });
    }

    // Actualizar estado
    await new Promise((resolve, reject) => {
      db.query(
        'UPDATE evidences SET status = ?, description = COALESCE(?, description) WHERE id = ?',
        [status, feedback, id],
        (err) => err ? reject(err) : resolve()
      );
    });

    res.json({ message: `Evidencia ${status} con éxito` });
  } catch (error) {
    console.error('Error al actualizar evidencia:', error);
    res.status(500).json({ message: 'Error al actualizar evidencia', error: error.message });
  }
});

// DELETE - Eliminar evidencia
router.delete('/:id', authenticateToken, validateNumericId('id'), async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;
    const userEmail = req.user.email;

    // Obtener información de la evidencia
    const [evidence] = await new Promise((resolve, reject) => {
      db.query(
        `SELECT e.*, s.email as student_email, c.teacher_id
         FROM evidences e
         JOIN students s ON e.student_id = s.id
         JOIN classes c ON e.class_id = c.id
         WHERE e.id = ?`,
        [id],
        (err, rows) => err ? reject(err) : resolve(rows)
      );
    });

    if (!evidence) {
      return res.status(404).json({ message: 'Evidencia no encontrada' });
    }

    // Estudiantes solo pueden eliminar sus propias evidencias pendientes
    if (userRole === 'estudiante') {
      if (evidence.student_email !== userEmail) {
        return res.status(403).json({ message: 'No puedes eliminar evidencias de otros estudiantes' });
      }
      if (evidence.status !== 'pendiente') {
        return res.status(403).json({ message: 'Solo puedes eliminar evidencias pendientes' });
      }
    }

    // Profesores pueden eliminar evidencias de su clase
    if (userRole === 'docente') {
      const [teacher] = await new Promise((resolve, reject) => {
        db.query('SELECT id FROM teachers WHERE email = ?', [userEmail], (err, rows) =>
          err ? reject(err) : resolve(rows)
        );
      });

      if (!teacher || teacher.id !== evidence.teacher_id) {
        return res.status(403).json({ message: 'No tienes permiso para eliminar esta evidencia' });
      }
    }

    // Eliminar evidencia
    await new Promise((resolve, reject) => {
      db.query('DELETE FROM evidences WHERE id = ?', [id], (err) =>
        err ? reject(err) : resolve()
      );
    });

    res.json({ message: 'Evidencia eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar evidencia:', error);
    res.status(500).json({ message: 'Error al eliminar evidencia', error: error.message });
  }
});

export default router;
