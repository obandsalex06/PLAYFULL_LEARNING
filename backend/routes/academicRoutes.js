/* eslint-env node */
import express from 'express';
import pool from '../config/db.js';

// Evitar usar 'process' directo para que el linter no marque no-undef
const isProduction = !!(globalThis && globalThis.process && globalThis.process.env && globalThis.process.env.NODE_ENV === 'production');

const router = express.Router();

// Endpoint para registrar nota y observación
router.post('/records', (req, res) => {
  const { student_id, class_id, grade, observations, evaluation_type, evaluation_date } = req.body;
  const teacher_email = req.headers['x-user-email'];
  const role = req.headers['x-user-role'];

  if (!isProduction) {
    console.log('📝 Recibiendo solicitud de registro académico:', { 
      student_id, 
      class_id, 
      grade, 
      evaluation_type, 
      evaluation_date,
      teacher_email 
    });
  }

  if (role !== 'docente') {
    return res.status(403).json({ message: 'No autorizado' });
  }

  // Validaciones iniciales
  if (!student_id || !class_id || !grade) {
    return res.status(400).json({ message: 'Faltan campos requeridos: student_id, class_id, grade' });
  }

  // Validar la nota
  const numericGrade = parseFloat(grade);
  if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
    return res.status(400).json({ message: 'La nota debe ser un número entre 0 y 100' });
  }

  // Verificar que el docente pertenece a la clase
  pool.query(
    'SELECT id FROM teachers WHERE email = ? AND id IN (SELECT teacher_id FROM classes WHERE id = ?)',
    [teacher_email, class_id],
    (err, results) => {
      if (err) {
        console.error('❌ Error al verificar permisos:', err);
        return res.status(500).json({ message: 'Error al verificar permisos' });
      }

      if (!results.length) {
  if (!isProduction) {
          console.log('⚠️ Docente sin permisos para la clase:', { teacher_email, class_id });
        }
        return res.status(403).json({ message: 'No tienes permiso para registrar notas en esta clase' });
      }

  if (!isProduction) {
        console.log('✅ Docente verificado, insertando registro...');
      }

      // Insertar el registro académico (usar 'observation' no 'observations')
      pool.query(
        'INSERT INTO academic_records (student_id, class_id, teacher_email, grade, evaluation_type, observation, evaluation_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [student_id, class_id, teacher_email, numericGrade, evaluation_type || 'examen', observations || '', evaluation_date || new Date().toISOString().split('T')[0]],
        (err) => {
          if (err) {
            console.error('❌ Error al insertar registro:', err);
            return res.status(500).json({ message: 'Error al guardar el registro académico', error: err.message });
          }
          if (!isProduction) {
            console.log('✅ Registro académico guardado exitosamente');
          }
          res.json({ message: 'Registro académico guardado con éxito' });
        }
      );
    }
  );
});

// Endpoint para obtener notas de un estudiante
router.get('/records/student/:studentId', async (req, res) => {
  const { studentId } = req.params;
  const role = req.headers['x-user-role'];
  const userEmail = req.headers['x-user-email'];

  if (!['docente', 'estudiante'].includes(role)) {
    return res.status(403).json({ message: 'No autorizado' });
  }

  try {
    if (role === 'estudiante') {
      // Estudiantes solo pueden ver sus propias notas
      pool.query('SELECT id FROM students WHERE email = ?', [userEmail], (err, students) => {
        if (err) {
          console.error('Error al verificar estudiante:', err);
          return res.status(500).json({ message: 'Error al verificar permisos' });
        }

        if (!students.length || students[0].id != studentId) {
          return res.status(403).json({ message: 'No autorizado' });
        }

        // Si está autorizado, obtener los registros
        getRecords();
      });
    } else {
      // Para docentes, obtener directamente los registros
      getRecords();
    }

    function getRecords() {
      pool.query(
        `SELECT ar.*, c.name as class_name, t.name as teacher_name 
         FROM academic_records ar 
         JOIN classes c ON ar.class_id = c.id 
         JOIN teachers t ON t.email = ar.teacher_email
         WHERE ar.student_id = ?
         ORDER BY ar.evaluation_date DESC`,
        [studentId],
        (err, results) => {
          if (err) {
            console.error('Error al obtener registros:', err);
            return res.status(500).json({ message: 'Error al obtener los registros académicos' });
          }
          res.json(results);
        }
      );
    }
  } catch (error) {
    console.error('Error al obtener registros académicos:', error);
    res.status(500).json({ message: 'Error al obtener los registros académicos' });
  }
});

// Endpoint para obtener notas por clase
router.get('/records/class/:classId', async (req, res) => {
  const { classId } = req.params;
  const role = req.headers['x-user-role'];
  const teacher_email = req.headers['x-user-email'];

  if (role !== 'docente') {
    return res.status(403).json({ message: 'No autorizado' });
  }

  try {
    // Verificar que el docente pertenece a la clase
    pool.query(
      'SELECT id FROM teachers WHERE email = ? AND id IN (SELECT teacher_id FROM classes WHERE id = ?)',
      [teacher_email, classId],
      (err, teachers) => {
        if (err) {
          console.error('Error al verificar permisos:', err);
          return res.status(500).json({ message: 'Error al verificar permisos' });
        }

        if (!teachers.length) {
          return res.status(403).json({ message: 'No tienes permiso para ver notas de esta clase' });
        }

        pool.query(
          `SELECT ar.*, s.name as student_name, s.email as student_email
           FROM academic_records ar 
           JOIN students s ON ar.student_id = s.id
           WHERE ar.class_id = ?
           ORDER BY ar.evaluation_date DESC, s.name ASC`,
          [classId],
          (err, results) => {
            if (err) {
              console.error('Error al obtener registros:', err);
              return res.status(500).json({ message: 'Error al obtener los registros académicos' });
            }
            res.json(results);
          }
        );
      }
    );
  } catch (error) {
    console.error('Error al obtener registros académicos:', error);
    res.status(500).json({ message: 'Error al obtener los registros académicos' });
  }
});

export default router;