import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Endpoint para guardar retroalimentación
router.post('/', async (req, res) => {
  const { student_id, class_id, feedback_text } = req.body;
  const teacher_email = req.headers['x-user-email'];
  const role = req.headers['x-user-role'];

  if (role !== 'docente') {
    return res.status(403).json({ message: 'No autorizado' });
  }

  try {
    // Verificar que el docente pertenece a la clase
    pool.query(
      'SELECT id FROM teachers WHERE email = ? AND id IN (SELECT teacher_id FROM classes WHERE id = ?)',
      [teacher_email, class_id],
      (err, results) => {
        if (err) {
          console.error('Error al verificar permisos:', err);
          return res.status(500).json({ message: 'Error al verificar permisos' });
        }

        if (!results.length) {
          return res.status(403).json({ message: 'No tienes permiso para dar retroalimentación en esta clase' });
        }

        // Insertar la retroalimentación (usar 'message' no 'feedback_text')
        pool.query(
          'INSERT INTO feedback (student_id, class_id, teacher_email, message, created_at) VALUES (?, ?, ?, ?, NOW())',
          [student_id, class_id, teacher_email, feedback_text],
          (err) => {
            if (err) {
              console.error('Error al insertar retroalimentación:', err);
              return res.status(500).json({ message: 'Error al guardar la retroalimentación' });
            }
            res.json({ message: 'Retroalimentación guardada con éxito' });
          }
        );
      }
    );
  } catch (error) {
    console.error('Error al guardar retroalimentación:', error);
    res.status(500).json({ message: 'Error al guardar la retroalimentación' });
  }
});

// Endpoint para obtener retroalimentación de un estudiante
router.get('/student/:studentId', (req, res) => {
  const { studentId } = req.params;
  const role = req.headers['x-user-role'];
  const userEmail = req.headers['x-user-email'];

  if (!['docente', 'estudiante'].includes(role)) {
    return res.status(403).json({ message: 'No autorizado' });
  }

  // Estudiantes solo pueden ver su propia retroalimentación
  if (role === 'estudiante') {
    pool.query('SELECT id FROM students WHERE email = ?', [userEmail], (err, studentRows) => {
      if (err) {
        console.error('Error al verificar estudiante:', err);
        return res.status(500).json({ message: 'Error al verificar permisos' });
      }
      
      if (!studentRows.length || studentRows[0].id != studentId) {
        return res.status(403).json({ message: 'No autorizado' });
      }
      
      // Si está autorizado, obtener la retroalimentación
      getFeedback();
    });
  } else {
    // Para docentes, obtener directamente
    getFeedback();
  }

  function getFeedback() {
    pool.query(
      `SELECT f.*, c.name as class_name, t.name as teacher_name 
       FROM feedback f 
       JOIN classes c ON f.class_id = c.id 
       JOIN teachers t ON t.email = f.teacher_email
       WHERE f.student_id = ?
       ORDER BY f.created_at DESC`,
      [studentId],
      (err, rows) => {
        if (err) {
          console.error('Error al obtener retroalimentación:', err);
          return res.status(500).json({ message: 'Error al obtener la retroalimentación' });
        }
        res.json(rows);
      }
    );
  }
});

export default router;