// routes/studentRoutes.js - Rutas para estudiantes
import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Obtener clases del estudiante
router.get('/classes/:studentId', (req, res) => {
  const { studentId } = req.params;
  const role = req.headers['x-user-role'];
  const userEmail = req.headers['x-user-email'];

  if (!['estudiante'].includes(role)) {
    return res.status(403).json({ message: 'No autorizado' });
  }

  // Verificar que el estudiante solo pueda ver sus propias clases
  pool.query('SELECT id FROM students WHERE email = ?', [userEmail], (err, students) => {
    if (err) {
      console.error('Error al verificar estudiante:', err);
      return res.status(500).json({ message: 'Error al verificar permisos' });
    }

    if (!students.length || students[0].id != studentId) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    // Obtener las clases del estudiante
    const query = `
      SELECT c.id, c.name, c.description, t.name as teacher_name, cs.assigned_at
      FROM class_students cs
      JOIN classes c ON cs.class_id = c.id
      LEFT JOIN teachers t ON c.teacher_id = t.id
      WHERE cs.student_id = ?
      ORDER BY cs.assigned_at DESC
    `;

    pool.query(query, [studentId], (err, results) => {
      if (err) {
        console.error('Error al obtener clases del estudiante:', err);
        return res.status(500).json({ message: 'Error al obtener las clases' });
      }
      res.json(results);
    });
  });
});

// Obtener evidencias del estudiante
router.get('/evidences/:studentId', (req, res) => {
  const { studentId } = req.params;
  const role = req.headers['x-user-role'];
  const userEmail = req.headers['x-user-email'];

  if (!['estudiante', 'docente'].includes(role)) {
    return res.status(403).json({ message: 'No autorizado' });
  }

  // Si es estudiante, verificar que solo vea sus propias evidencias
  if (role === 'estudiante') {
    pool.query('SELECT id FROM students WHERE email = ?', [userEmail], (err, students) => {
      if (err) {
        console.error('Error al verificar estudiante:', err);
        return res.status(500).json({ message: 'Error al verificar permisos' });
      }

      if (!students.length || students[0].id != studentId) {
        return res.status(403).json({ message: 'No autorizado' });
      }

      getEvidences();
    });
  } else {
    getEvidences();
  }

  function getEvidences() {
    const query = `
      SELECT e.id, e.description, e.file_url, e.status, e.created_at, e.updated_at,
             c.name as class_name
      FROM evidences e
      JOIN classes c ON e.class_id = c.id
      WHERE e.student_id = ?
      ORDER BY e.created_at DESC
    `;

    pool.query(query, [studentId], (err, results) => {
      if (err) {
        console.error('Error al obtener evidencias del estudiante:', err);
        return res.status(500).json({ message: 'Error al obtener las evidencias' });
      }
      res.json(results);
    });
  }
});

export default router;
