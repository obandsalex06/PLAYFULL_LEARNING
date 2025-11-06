import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import academicRoutes from "./routes/academicRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";

dotenv.config();
const app = express();

// Configurar CORS según entorno (mejores prácticas)
const ENV = (globalThis && globalThis.process && globalThis.process.env) ? globalThis.process.env : {};
const allowedOrigins = (ENV.CORS_ORIGIN || "http://localhost:5173,http://localhost:5174").split(",").map(s => s.trim());
app.use(cors({
    origin: (origin, callback) => {
        // Permitir herramientas como Postman (sin origin) y orígenes listados
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Origen no permitido por CORS"));
    },
    credentials: true,
}));
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/academic", academicRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/announcements", announcementRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
    res.send("Servidor funcionando 🎉");
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));