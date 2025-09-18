import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import db from "./config/db.js"; // Importa la conexión MySQL

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);

// Ruta de prueba para MySQL
app.get("/mysql-test", (req, res) => {
  db.query("SELECT 1 + 1 AS solution", (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error en la consulta MySQL", details: err });
    }
    res.json({ message: "Conexión MySQL exitosa", result: results[0].solution });
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
