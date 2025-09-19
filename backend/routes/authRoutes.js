import express from "express";
import bcrypt from "bcrypt";
import db from "../config/db.js";
const router = express.Router();
// 📌 Ruta para verificar si el email ya está registrado
router.post("/check-email", (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ available: false, message: "Email requerido" });
    db.query(
        "SELECT * FROM students WHERE email = ?", [email],
        (err, results) => {
            if (err) return res.status(500).json({ available: false, message: "Error en la base de datos" });
            if (results.length > 0) {
                return res.json({ available: false, message: "El email ya está registrado" });
            } else {
                return res.json({ available: true, message: "Email disponible" });
            }
        }
    );
});

// 📌 Ruta de registro de administradores
router.post("/register-admin", (req, res) => {
    return res.status(403).json({ message: "Registro de administradores no permitido." });
});

// 📌 Ruta de registro de profesores
router.post("/register-teacher", async(req, res) => {
    const isAdmin = req.headers["x-user-role"] === "admin";
    if (!isAdmin) {
        return res.status(403).json({ message: "Solo el administrador puede registrar profesores." });
    }
    try {
        const { name, email, password, school_id } = req.body;
        // Verificar si ya existe el profesor
        const [existing] = await new Promise((resolve, reject) => {
            db.query("SELECT * FROM teachers WHERE email = ?", [email], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
        if (existing) {
            return res.status(400).json({ message: "El profesor ya existe" });
        }
        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        // Insertar nuevo profesor
        await new Promise((resolve, reject) => {
            db.query(
                "INSERT INTO teachers (name, email, password, school_id) VALUES (?, ?, ?, ?)", [name, email, hashedPassword, school_id || null],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });
        res.status(201).json({ message: "Profesor registrado con éxito" });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
});
// backend/routes/authRoutes.js


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
        // Buscar primero en admins
        db.query(
            "SELECT * FROM admins WHERE email = ?", [email],
            async(err, results) => {
                if (err) {
                    return res.status(500).json({ message: "Error en la base de datos", error: err });
                }
                if (results.length > 0) {
                    const user = results[0];
                    const isMatch = await bcrypt.compare(password, user.password);
                    if (!isMatch) {
                        return res.status(400).json({ message: "Credenciales inválidas" });
                    }
                    delete user.password;
                    user.role = "admin";
                    return res.status(200).json({ message: "Login exitoso", user });
                }
                // Si no es admin, buscar en teachers
                db.query(
                    "SELECT * FROM teachers WHERE email = ?", [email],
                    async(errT, resultsT) => {
                        if (errT) {
                            return res.status(500).json({ message: "Error en la base de datos", error: errT });
                        }
                        if (resultsT.length > 0) {
                            const user = resultsT[0];
                            const isMatch = await bcrypt.compare(password, user.password);
                            if (!isMatch) {
                                return res.status(400).json({ message: "Credenciales inválidas" });
                            }
                            delete user.password;
                            user.role = "docente";
                            return res.status(200).json({ message: "Login exitoso", user });
                        }
                        // Si no es admin ni docente, buscar en students
                        db.query(
                            "SELECT * FROM students WHERE email = ?", [email],
                            async(err2, results2) => {
                                if (err2) {
                                    return res.status(500).json({ message: "Error en la base de datos", error: err2 });
                                }
                                if (results2.length === 0) {
                                    return res.status(400).json({ message: "Credenciales inválidas" });
                                }
                                const user = results2[0];
                                const isMatch = await bcrypt.compare(password, user.password);
                                if (!isMatch) {
                                    return res.status(400).json({ message: "Credenciales inválidas" });
                                }
                                delete user.password;
                                user.role = "estudiante";
                                return res.status(200).json({ message: "Login exitoso", user });
                            }
                        );
                    }
                );
            }
        );
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
});

// 👇 Exportamos como default para usar import en server.js
export default router;