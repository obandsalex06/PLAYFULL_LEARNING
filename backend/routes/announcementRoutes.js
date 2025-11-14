import express from "express";
import db from "../config/db.js";
import { sanitizeString } from "../middleware/validationMiddleware.js";

const router = express.Router();

// GET - Obtener todos los comunicados
router.get("/announcements", (req, res) => {
  const query = `
    SELECT 
      a.*,
      s.name as creator_name
    FROM announcements a
    LEFT JOIN secretaries s ON a.created_by = s.id
    ORDER BY a.created_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error obteniendo comunicados:", err);
      return res.status(500).json({ error: "Error obteniendo comunicados" });
    }
    console.log("✅ Comunicados obtenidos:", results.length);
    res.json(results);
  });
});

// POST - Crear un nuevo comunicado
router.post("/announcements", (req, res) => {
  let { title, message, priority = "normal" } = req.body;
  const userEmail = req.headers["x-user-email"];
  
  // Sanitizar inputs para prevenir XSS
  title = sanitizeString(title);
  message = sanitizeString(message);
  priority = sanitizeString(priority);
  
  if (!title || !message) {
    return res.status(400).json({ error: "Título y mensaje son requeridos" });
  }

  if (title.length < 3 || title.length > 200) {
    return res.status(400).json({ error: "El título debe tener entre 3 y 200 caracteres" });
  }

  if (message.length < 10 || message.length > 1000) {
    return res.status(400).json({ error: "El mensaje debe tener entre 10 y 1000 caracteres" });
  }

  // Primero obtener el ID de la secretaria por su email
  const getSecretaryQuery = "SELECT id FROM secretaries WHERE email = ?";
  
  db.query(getSecretaryQuery, [userEmail], (err, secretaryResults) => {
    if (err) {
      console.error("❌ Error buscando secretaria:", err);
      return res.status(500).json({ error: "Error buscando usuario" });
    }

    const secretaryId = secretaryResults.length > 0 ? secretaryResults[0].id : null;

    const insertQuery = `
      INSERT INTO announcements (title, message, priority, created_by)
      VALUES (?, ?, ?, ?)
    `;

    db.query(insertQuery, [title, message, priority, secretaryId], (err, result) => {
      if (err) {
        console.error("❌ Error creando comunicado:", err);
        return res.status(500).json({ error: "Error creando comunicado" });
      }

      console.log("✅ Comunicado creado con ID:", result.insertId);
      
      // Devolver el comunicado creado
      const getNewQuery = "SELECT * FROM announcements WHERE id = ?";
      db.query(getNewQuery, [result.insertId], (err, newResults) => {
        if (err) {
          return res.status(201).json({ 
            id: result.insertId, 
            title, 
            message, 
            priority,
            created_at: new Date() 
          });
        }
        res.status(201).json(newResults[0]);
      });
    });
  });
});

// DELETE - Eliminar un comunicado
router.delete("/announcements/:id", (req, res) => {
  const { id } = req.params;
  const userRole = req.headers["x-user-role"];

  // Solo secretarias y admins pueden eliminar
  if (userRole !== "secretaria" && userRole !== "admin") {
    return res.status(403).json({ error: "No tienes permiso para eliminar comunicados" });
  }

  const deleteQuery = "DELETE FROM announcements WHERE id = ?";

  db.query(deleteQuery, [id], (err, result) => {
    if (err) {
      console.error("❌ Error eliminando comunicado:", err);
      return res.status(500).json({ error: "Error eliminando comunicado" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Comunicado no encontrado" });
    }

    console.log("✅ Comunicado eliminado:", id);
    res.json({ message: "Comunicado eliminado exitosamente" });
  });
});

// PUT - Actualizar un comunicado
router.put("/announcements/:id", (req, res) => {
  const { id } = req.params;
  const { title, message, priority } = req.body;
  const userRole = req.headers["x-user-role"];

  if (userRole !== "secretaria" && userRole !== "admin") {
    return res.status(403).json({ error: "No tienes permiso para editar comunicados" });
  }

  if (!title || !message) {
    return res.status(400).json({ error: "Título y mensaje son requeridos" });
  }

  const updateQuery = `
    UPDATE announcements 
    SET title = ?, message = ?, priority = ?
    WHERE id = ?
  `;

  db.query(updateQuery, [title, message, priority, id], (err, result) => {
    if (err) {
      console.error("❌ Error actualizando comunicado:", err);
      return res.status(500).json({ error: "Error actualizando comunicado" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Comunicado no encontrado" });
    }

    console.log("✅ Comunicado actualizado:", id);
    
    // Devolver el comunicado actualizado
    const getUpdatedQuery = "SELECT * FROM announcements WHERE id = ?";
    db.query(getUpdatedQuery, [id], (err, updatedResults) => {
      if (err) {
        return res.json({ message: "Comunicado actualizado exitosamente" });
      }
      res.json(updatedResults[0]);
    });
  });
});

export default router;
