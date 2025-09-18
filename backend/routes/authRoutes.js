// 📌 Ruta de registro de profesores
router.post("/register-teacher", async (req, res) => {
    try {
        const { name, email, password, school_id } = req.body;

        // Verificar si ya existe el profesor
        db.query(
            "SELECT * FROM teachers WHERE email = ?",
            [email],
            async (err, results) => {
                if (err) {
                    return res.status(500).json({ message: "Error en la base de datos", error: err });
                }
                if (results.length > 0) {
                    return res.status(400).json({ message: "El profesor ya existe" });
                }

                // Encriptar contraseña
                const hashedPassword = await bcrypt.hash(password, 10);

                // Insertar nuevo profesor
                db.query(
                    "INSERT INTO teachers (name, email, password, school_id) VALUES (?, ?, ?, ?)",
                    [name, email, hashedPassword, school_id || null],
                    (err, result) => {
                        if (err) {
                            return res.status(500).json({ message: "Error al registrar profesor", error: err });
                        }
                        res.status(201).json({ message: "Profesor registrado con éxito" });
                    }
                );
            }
        );
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
});
// backend/routes/authRoutes.js
import express from "express";
import bcrypt from "bcrypt";
import db from "../config/db.js";

const router = express.Router();

// 📌 Ruta de registro
router.post("/register", async(req, res) => {
    try {
        const { name, email, password, role, school_id } = req.body;

        // Verificar si ya existe el usuario
        db.query(
            "SELECT * FROM students WHERE email = ?", [email],
            async(err, results) => {
                if (err) {
                    return res.status(500).json({ message: "Error en la base de datos", error: err });
                }
                if (results.length > 0) {
                    return res.status(400).json({ message: "El usuario ya existe" });
                }

                // Encriptar contraseña
                const hashedPassword = await bcrypt.hash(password, 10);

                // Insertar nuevo estudiante
                db.query(
                    "INSERT INTO students (name, email, password, role, school_id) VALUES (?, ?, ?, ?, ?)", [name, email, hashedPassword, role || "estudiante", school_id || null],
                    (err, result) => {
                        if (err) {
                            return res.status(500).json({ message: "Error al registrar usuario", error: err });
                        }
                        res.status(201).json({ message: "Usuario registrado con éxito" });
                    }
                );
            }
        );
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
});

// 📌 Ruta de login
router.post("/login", async(req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario en MySQL
        db.query(
            "SELECT * FROM students WHERE email = ?", [email],
            async(err, results) => {
                if (err) {
                    return res.status(500).json({ message: "Error en la base de datos", error: err });
                }
                if (results.length === 0) {
                    return res.status(400).json({ message: "Credenciales inválidas" });
                }

                const user = results[0];
                // Comparar contraseñas
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return res.status(400).json({ message: "Credenciales inválidas" });
                }

                // No enviar la contraseña al frontend
                delete user.password;
                res.status(200).json({ message: "Login exitoso", user });
            }
        );
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
});

// 👇 Exportamos como default para usar import en server.js
export default router;