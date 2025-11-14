/* eslint-env node */
import express from 'express';
import db from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validateNumericId, sanitizeString } from '../middleware/validationMiddleware.js';

const router = express.Router();

// GET - Obtener todos los premios (público para todos los roles)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const rewards = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM rewards ORDER BY cost ASC', (err, rows) =>
        err ? reject(err) : resolve(rows)
      );
    });

    res.json(rewards);
  } catch (error) {
    console.error('Error al obtener premios:', error);
    res.status(500).json({ message: 'Error al cargar premios', error: error.message });
  }
});

// GET - Obtener historial de canjes de un estudiante
router.get('/redeemed/:studentId', authenticateToken, validateNumericId('studentId'), async (req, res) => {
  try {
    const { studentId } = req.params;
    const userRole = req.user.role;
    const userEmail = req.user.email;

    // Verificar permisos
    if (userRole === 'estudiante') {
      const [student] = await new Promise((resolve, reject) => {
        db.query('SELECT id FROM students WHERE email = ?', [userEmail], (err, rows) =>
          err ? reject(err) : resolve(rows)
        );
      });

      if (!student || student.id !== parseInt(studentId)) {
        return res.status(403).json({ message: 'No autorizado' });
      }
    }

    const redeemed = await new Promise((resolve, reject) => {
      db.query(
        `SELECT rr.*, r.name, r.description
         FROM redeemed_rewards rr
         JOIN rewards r ON rr.reward_id = r.id
         WHERE rr.student_id = ?
         ORDER BY rr.redeemed_at DESC`,
        [studentId],
        (err, rows) => err ? reject(err) : resolve(rows)
      );
    });

    res.json(redeemed);
  } catch (error) {
    console.error('Error al obtener canjes:', error);
    res.status(500).json({ message: 'Error al cargar historial', error: error.message });
  }
});

// POST - Canjear un premio (solo estudiantes)
router.post('/redeem', authenticateToken, async (req, res) => {
  try {
    const { reward_id } = req.body;
    const userRole = req.user.role;
    const userEmail = req.user.email;

    // Solo estudiantes pueden canjear
    if (userRole !== 'estudiante') {
      return res.status(403).json({ message: 'Solo estudiantes pueden canjear premios' });
    }

    // Validar reward_id
    if (!reward_id || isNaN(reward_id)) {
      return res.status(400).json({ message: 'ID de premio inválido' });
    }

    // Obtener información del estudiante
    const [student] = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM students WHERE email = ?', [userEmail], (err, rows) =>
        err ? reject(err) : resolve(rows)
      );
    });

    if (!student) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    // Obtener información del premio
    const [reward] = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM rewards WHERE id = ?', [reward_id], (err, rows) =>
        err ? reject(err) : resolve(rows)
      );
    });

    if (!reward) {
      return res.status(404).json({ message: 'Premio no encontrado' });
    }

    // Verificar que el estudiante tenga suficientes learncoins
    if (student.coins < reward.cost) {
      return res.status(400).json({
        message: 'No tienes suficientes learncoins',
        required: reward.cost,
        current: student.coins,
        missing: reward.cost - student.coins
      });
    }

    // Iniciar transacción
    await new Promise((resolve, reject) => {
      db.beginTransaction(err => err ? reject(err) : resolve());
    });

    try {
      // Registrar canje
      await new Promise((resolve, reject) => {
        db.query(
          'INSERT INTO redeemed_rewards (student_id, reward_id, cost_at_time) VALUES (?, ?, ?)',
          [student.id, reward.id, reward.cost],
          (err) => err ? reject(err) : resolve()
        );
      });

      // Descontar learncoins
      await new Promise((resolve, reject) => {
        db.query(
          'UPDATE students SET coins = coins - ? WHERE id = ?',
          [reward.cost, student.id],
          (err) => err ? reject(err) : resolve()
        );
      });

      // Confirmar transacción
      await new Promise((resolve, reject) => {
        db.commit(err => err ? reject(err) : resolve());
      });

      const newBalance = student.coins - reward.cost;

      res.json({
        message: 'Premio canjeado con éxito',
        reward: {
          id: reward.id,
          name: reward.name,
          cost: reward.cost
        },
        previousBalance: student.coins,
        newBalance: newBalance
      });

    } catch (error) {
      // Revertir transacción
      await new Promise((resolve) => {
        db.rollback(() => resolve());
      });
      throw error;
    }

  } catch (error) {
    console.error('Error al canjear premio:', error);
    res.status(500).json({ message: 'Error al canjear premio', error: error.message });
  }
});

// POST - Crear premio (solo admin)
router.post('/', authenticateToken, async (req, res) => {
  try {
    let { name, description, cost } = req.body;
    const userRole = req.user.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Solo administradores pueden crear premios' });
    }

    // Validar datos
    if (!name || !cost) {
      return res.status(400).json({ message: 'Nombre y costo son obligatorios' });
    }

    if (isNaN(cost) || cost < 0) {
      return res.status(400).json({ message: 'El costo debe ser un número positivo' });
    }

    // Sanitizar
    name = sanitizeString(name);
    description = sanitizeString(description);

    const result = await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO rewards (name, description, cost) VALUES (?, ?, ?)',
        [name, description || null, cost],
        (err, result) => err ? reject(err) : resolve(result)
      );
    });

    res.status(201).json({
      message: 'Premio creado con éxito',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error al crear premio:', error);
    res.status(500).json({ message: 'Error al crear premio', error: error.message });
  }
});

// PUT - Actualizar premio (solo admin)
router.put('/:id', authenticateToken, validateNumericId('id'), async (req, res) => {
  try {
    const { id } = req.params;
    let { name, description, cost } = req.body;
    const userRole = req.user.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Solo administradores pueden editar premios' });
    }

    // Validar que el premio existe
    const [reward] = await new Promise((resolve, reject) => {
      db.query('SELECT id FROM rewards WHERE id = ?', [id], (err, rows) =>
        err ? reject(err) : resolve(rows)
      );
    });

    if (!reward) {
      return res.status(404).json({ message: 'Premio no encontrado' });
    }

    // Validar datos
    if (cost !== undefined && (isNaN(cost) || cost < 0)) {
      return res.status(400).json({ message: 'El costo debe ser un número positivo' });
    }

    // Sanitizar
    if (name) name = sanitizeString(name);
    if (description) description = sanitizeString(description);

    await new Promise((resolve, reject) => {
      db.query(
        'UPDATE rewards SET name = COALESCE(?, name), description = COALESCE(?, description), cost = COALESCE(?, cost) WHERE id = ?',
        [name, description, cost, id],
        (err) => err ? reject(err) : resolve()
      );
    });

    res.json({ message: 'Premio actualizado con éxito' });
  } catch (error) {
    console.error('Error al actualizar premio:', error);
    res.status(500).json({ message: 'Error al actualizar premio', error: error.message });
  }
});

// DELETE - Eliminar premio (solo admin)
router.delete('/:id', authenticateToken, validateNumericId('id'), async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Solo administradores pueden eliminar premios' });
    }

    // Verificar que el premio existe
    const [reward] = await new Promise((resolve, reject) => {
      db.query('SELECT id FROM rewards WHERE id = ?', [id], (err, rows) =>
        err ? reject(err) : resolve(rows)
      );
    });

    if (!reward) {
      return res.status(404).json({ message: 'Premio no encontrado' });
    }

    // Verificar si hay canjes de este premio
    const [canjes] = await new Promise((resolve, reject) => {
      db.query('SELECT COUNT(*) as count FROM redeemed_rewards WHERE reward_id = ?', [id], (err, rows) =>
        err ? reject(err) : resolve(rows)
      );
    });

    if (canjes.count > 0) {
      return res.status(400).json({
        message: 'No se puede eliminar un premio que ya ha sido canjeado',
        redeemed_count: canjes.count
      });
    }

    await new Promise((resolve, reject) => {
      db.query('DELETE FROM rewards WHERE id = ?', [id], (err) =>
        err ? reject(err) : resolve()
      );
    });

    res.json({ message: 'Premio eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar premio:', error);
    res.status(500).json({ message: 'Error al eliminar premio', error: error.message });
  }
});

export default router;
