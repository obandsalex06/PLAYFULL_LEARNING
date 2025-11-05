import express from "express";
import bcrypt from "bcrypt";
import db from "../config/db.js";
const router = express.Router();

// Endpoint: obtener todos los docentes (para admin)
router.get("/teachers", (req, res) => {
    if (req.headers["x-user-role"] !== "admin") {
        return res.status(403).json({ message: "Solo el administrador puede ver los docentes." });
    }
    db.query("SELECT id, name, email FROM teachers", (err, results) => {
        if (err) return res.status(500).json({ message: "Error en la base de datos", error: err });
        res.json(results);
    });
});
// Endpoint: crear clase (solo admin)
router.post("/create-class", async(req, res) => {
    if (req.headers["x-user-role"] !== "admin") {
        return res.status(403).json({ message: "Solo el administrador puede crear clases." });
    }
    const { name, description, teacher_id, school_id } = req.body;
    if (!name || !teacher_id || !school_id) {
        return res.status(400).json({ message: "Faltan datos obligatorios (nombre, docente, colegio)." });
    }
    db.query(
        "INSERT INTO classes (name, description, teacher_id, school_id) VALUES (?, ?, ?, ?)", [name, description || null, teacher_id, school_id],
        (err) => {
            if (err) return res.status(500).json({ message: "Error al crear la clase", error: err });
            res.status(200).json({ message: "Clase creada correctamente" });
        }
    );
});

// Endpoint: obtener clases y estudiantes del docente
router.get("/teacher-classes", async(req, res) => {
    if (req.headers["x-user-role"] !== "docente") {
        return res.status(403).json({ message: "Solo los profesores pueden ver sus clases." });
    }
    const teacherEmail = req.headers["x-user-email"];
    // Obtener id del docente
    db.query("SELECT id FROM teachers WHERE email = ?", [teacherEmail], (err, teacherRows) => {
        if (err) return res.status(500).json({ message: "Error en la base de datos", error: err });
        if (teacherRows.length === 0) return res.status(404).json({ message: "Docente no encontrado" });
        const teacherId = teacherRows[0].id;
        // Obtener clases del docente
        db.query("SELECT id, name FROM classes WHERE teacher_id = ?", [teacherId], (err2, classRows) => {
            if (err2) return res.status(500).json({ message: "Error al obtener clases", error: err2 });
            if (classRows.length === 0) return res.json([]);
            // Para cada clase, obtener estudiantes
            const classIds = classRows.map(c => c.id);
            const placeholders = classIds.map(() => '?').join(',');
            db.query(
                `SELECT s.id, s.name, s.email, sc.class_id FROM students s
                 JOIN students_classes sc ON s.id = sc.student_id
                 WHERE sc.class_id IN (${placeholders})`,
                classIds,
                (err3, studentRows) => {
                    if (err3) return res.status(500).json({ message: "Error al obtener estudiantes", error: err3 });
                    // Agrupar estudiantes por clase
                    const result = classRows.map(cls => ({
                        id: cls.id,
                        name: cls.name,
                        students: studentRows.filter(s => s.class_id === cls.id)
                    }));
                    res.json(result);
                }
            );
        });
    });
});


// Endpoint: profesor registra o valida evidencia/tarea de estudiante
router.post("/register-evidence", async(req, res) => {
    // Solo profesores pueden registrar evidencias
    if (req.headers["x-user-role"] !== "docente") {
        return res.status(403).json({ message: "Solo los profesores pueden registrar evidencias." });
    }
    const { student_id, class_id, file_url, description, status } = req.body;
    if (!student_id || !class_id) {
        return res.status(400).json({ message: "Faltan datos obligatorios (student_id, class_id)." });
    }
    // Verificar que el profesor es dueño de la clase
    const teacherEmail = req.headers["x-user-email"];
    db.query(
        "SELECT * FROM classes WHERE id = ? AND teacher_id = (SELECT id FROM teachers WHERE email = ?)", [class_id, teacherEmail],
        (err, results) => {
            if (err) return res.status(500).json({ message: "Error en la base de datos", error: err });
            if (results.length === 0) {
                return res.status(403).json({ message: "No puedes registrar evidencias para clases que no te pertenecen." });
            }
            // Insertar evidencia
            db.query(
                "INSERT INTO evidences (student_id, class_id, file_url, description, status) VALUES (?, ?, ?, ?, ?)", [student_id, class_id, file_url || null, description || null, status || 'pendiente'],
                (err2) => {
                    if (err2) return res.status(500).json({ message: "Error al registrar evidencia", error: err2 });
                    res.status(200).json({ message: "Evidencia registrada correctamente" });
                }
            );
        }
    );
});

// Endpoint: profesor asigna braincoins a estudiante de su clase
router.post("/assign-coins", async(req, res) => {
    // Solo profesores pueden asignar
    if (req.headers["x-user-role"] !== "docente") {
        return res.status(403).json({ message: "Solo los profesores pueden asignar braincoins." });
    }
    const { student_id, class_id, amount, reason } = req.body;
    if (!student_id || !class_id || !amount) {
        return res.status(400).json({ message: "Faltan datos obligatorios." });
    }
    // Verificar que el profesor es dueño de la clase
    const teacherEmail = req.headers["x-user-email"];
    db.query("SELECT * FROM classes WHERE id = ? AND teacher_id = (SELECT id FROM teachers WHERE email = ?)", [class_id, teacherEmail], (err, results) => {
        if (err) return res.status(500).json({ message: "Error en la base de datos", error: err });
        if (results.length === 0) {
            return res.status(403).json({ message: "No puedes asignar braincoins a estudiantes fuera de tus clases." });
        }
        // Insertar registro en tabla coins
        db.query("INSERT INTO coins (student_id, amount, reason) VALUES (?, ?, ?)", [student_id, amount, reason || null], (err2) => {
            if (err2) return res.status(500).json({ message: "Error al asignar braincoins", error: err2 });
            // Sumar braincoins al estudiante
            db.query("UPDATE students SET coins = coins + ? WHERE id = ?", [amount, student_id], (err3) => {
                if (err3) return res.status(500).json({ message: "Error al actualizar braincoins del estudiante", error: err3 });
                res.status(200).json({ message: "Braincoins asignados correctamente" });
            });
        });
    });
});
// ...existing code...





// Endpoint: profesor asigna braincoins a estudiante de su clase
router.post("/assign-coins", async(req, res) => {
    // Solo profesores pueden asignar
    if (req.headers["x-user-role"] !== "docente") {
        return res.status(403).json({ message: "Solo los profesores pueden asignar braincoins." });
    }
    const { student_id, class_id, amount, reason } = req.body;
    if (!student_id || !class_id || !amount) {
        return res.status(400).json({ message: "Faltan datos obligatorios." });
    }
    // Verificar que el profesor es dueño de la clase
    const teacherEmail = req.headers["x-user-email"];
    db.query("SELECT * FROM classes WHERE id = ? AND teacher_id = (SELECT id FROM teachers WHERE email = ?)", [class_id, teacherEmail], (err, results) => {
        if (err) return res.status(500).json({ message: "Error en la base de datos", error: err });
        if (results.length === 0) {
            return res.status(403).json({ message: "No puedes asignar braincoins a estudiantes fuera de tus clases." });
        }
        // Insertar registro en tabla coins
        db.query("INSERT INTO coins (student_id, amount, reason) VALUES (?, ?, ?)", [student_id, amount, reason || null], (err2) => {
            if (err2) return res.status(500).json({ message: "Error al asignar braincoins", error: err2 });
            // Sumar braincoins al estudiante
            db.query("UPDATE students SET coins = coins + ? WHERE id = ?", [amount, student_id], (err3) => {
                if (err3) return res.status(500).json({ message: "Error al actualizar braincoins del estudiante", error: err3 });
                res.status(200).json({ message: "Braincoins asignados correctamente" });
            });
        });
    });
});
// ...existing code...

// Endpoints para obtener últimos registros (solo admin)
// Últimos estudiantes
router.get("/latest-users", (req, res) => {
    if (req.headers["x-user-role"] !== "admin") {
        return res.status(403).json({ message: "Solo el administrador puede ver usuarios." });
    }
    db.query("SELECT id, name, email, created_at FROM students ORDER BY created_at DESC LIMIT 5", (err, results) => {
        if (err) return res.status(500).json({ message: "Error en la base de datos", error: err });
        res.json(results);
    });
});

// Últimos colegios
router.get("/latest-schools", (req, res) => {
    if (req.headers["x-user-role"] !== "admin") {
        return res.status(403).json({ message: "Solo el administrador puede ver colegios." });
    }
    db.query("SELECT id, name, address, created_at FROM schools ORDER BY created_at DESC LIMIT 5", (err, results) => {
        if (err) return res.status(500).json({ message: "Error en la base de datos", error: err });
        res.json(results);
    });
});

// Últimos profesores
router.get("/latest-teachers", (req, res) => {
    if (req.headers["x-user-role"] !== "admin") {
        return res.status(403).json({ message: "Solo el administrador puede ver profesores." });
    }
    db.query("SELECT id, name, email, created_at FROM teachers ORDER BY created_at DESC LIMIT 5", (err, results) => {
        if (err) return res.status(500).json({ message: "Error en la base de datos", error: err });
        res.json(results);
    });
});

// CRUD de premios (rewards) solo para admin
// Listar premios
router.get("/rewards", (req, res) => {
    if (req.headers["x-user-role"] !== "admin") {
        return res.status(403).json({ message: "Solo el administrador puede ver premios." });
    }
    db.query("SELECT * FROM rewards", (err, results) => {
        if (err) return res.status(500).json({ message: "Error en la base de datos", error: err });
        res.json(results);
    });
});

// Crear premio
router.post("/rewards", (req, res) => {
    if (req.headers["x-user-role"] !== "admin") {
        return res.status(403).json({ message: "Solo el administrador puede crear premios." });
    }
    const { name, description, cost } = req.body;
    if (!name || !cost) return res.status(400).json({ message: "El nombre y el costo son obligatorios." });
    db.query("INSERT INTO rewards (name, description, cost) VALUES (?, ?, ?)", [name, description || null, cost], (err, result) => {
        if (err) return res.status(500).json({ message: "Error al crear premio", error: err });
        res.status(201).json({ message: "Premio creado con éxito", id: result.insertId });
    });
});

// Editar premio
router.put("/rewards/:id", (req, res) => {
    if (req.headers["x-user-role"] !== "admin") {
        return res.status(403).json({ message: "Solo el administrador puede editar premios." });
    }
    const { id } = req.params;
    const { name, description, cost } = req.body;
    db.query("UPDATE rewards SET name = ?, description = ?, cost = ? WHERE id = ?", [name, description, cost, id], (err) => {
        if (err) return res.status(500).json({ message: "Error al editar premio", error: err });
        res.json({ message: "Premio actualizado" });
    });
});

// Eliminar premio
router.delete("/rewards/:id", (req, res) => {
    if (req.headers["x-user-role"] !== "admin") {
        return res.status(403).json({ message: "Solo el administrador puede eliminar premios." });
    }
    const { id } = req.params;
    db.query("DELETE FROM rewards WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ message: "Error al eliminar premio", error: err });
        res.json({ message: "Premio eliminado" });
    });
});
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
    // 📌 Ruta de registro de secretarias (solo admin)
    router.post("/register-secretary", async (req, res) => {
        const isAdmin = req.headers["x-user-role"] === "admin";
        if (!isAdmin) return res.status(403).json({ message: "Solo el administrador puede registrar secretarias." });
        try {
            const { name, email, password, school_id } = req.body;
            // Verificar si ya existe la secretaria
            const [existing] = await new Promise((resolve, reject) => {
                db.query("SELECT * FROM secretaries WHERE email = ?", [email], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });
            if (existing) {
                return res.status(400).json({ message: "La secretaria ya existe" });
            }
            // Encriptar contraseña
            const hashedPassword = await bcrypt.hash(password, 10);
            // Insertar nueva secretaria
            await new Promise((resolve, reject) => {
                db.query(
                    "INSERT INTO secretaries (name, email, password, school_id) VALUES (?, ?, ?, ?)",
                    [name, email, hashedPassword, school_id || null],
                    (err, result) => {
                        if (err) return reject(err);
                        resolve(result);
                    }
                );
            });
            res.status(201).json({ message: "Secretaria registrada con éxito" });
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
                    (err) => {
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
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const q = (sql, params) => new Promise((resolve, reject) => db.query(sql, params, (err, results) => err ? reject(err) : resolve(results)));

        // Admins
        let rows = await q("SELECT * FROM admins WHERE email = ?", [email]);
        if (rows.length > 0) {
            const user = rows[0];
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ message: "Credenciales inválidas" });
            delete user.password;
            user.role = "admin";
            return res.status(200).json({ message: "Login exitoso", user });
        }

        // Teachers
        rows = await q("SELECT * FROM teachers WHERE email = ?", [email]);
        if (rows.length > 0) {
            const user = rows[0];
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ message: "Credenciales inválidas" });
            delete user.password;
            user.role = "docente";
            return res.status(200).json({ message: "Login exitoso", user });
        }

        // Secretaries
        rows = await q("SELECT * FROM secretaries WHERE email = ?", [email]);
        if (rows.length > 0) {
            const user = rows[0];
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ message: "Credenciales inválidas" });
            delete user.password;
            user.role = "secretaria";
            return res.status(200).json({ message: "Login exitoso", user });
        }

        // Students
        rows = await q("SELECT * FROM students WHERE email = ?", [email]);
        if (rows.length > 0) {
            const user = rows[0];
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ message: "Credenciales inválidas" });
            delete user.password;
            user.role = "estudiante";
            return res.status(200).json({ message: "Login exitoso", user });
        }

        return res.status(400).json({ message: "Credenciales inválidas" });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
});

// 👇 Exportamos como default para usar import en server.js
export default router;

// CRUD de colegios (schools) solo para admin
// Listar colegios
router.get("/schools", (req, res) => {
    // Solo admin puede acceder
    if (req.headers["x-user-role"] !== "admin") {
        return res.status(403).json({ message: "Solo el administrador puede ver colegios." });
    }
    db.query("SELECT * FROM schools", (err, results) => {
        if (err) return res.status(500).json({ message: "Error en la base de datos", error: err });
        res.json(results);
    });
});

// Crear colegio
router.post("/schools", (req, res) => {
    if (req.headers["x-user-role"] !== "admin") {
        return res.status(403).json({ message: "Solo el administrador puede crear colegios." });
    }
    const { name, address } = req.body;
    if (!name) return res.status(400).json({ message: "El nombre es obligatorio." });
    db.query("INSERT INTO schools (name, address) VALUES (?, ?)", [name, address || null], (err, result) => {
        if (err) return res.status(500).json({ message: "Error al crear colegio", error: err });
        res.status(201).json({ message: "Colegio creado con éxito", id: result.insertId });
    });
});

// Editar colegio
router.put("/schools/:id", (req, res) => {
    if (req.headers["x-user-role"] !== "admin") {
        return res.status(403).json({ message: "Solo el administrador puede editar colegios." });
    }
    const { id } = req.params;
    const { name, address } = req.body;
    db.query("UPDATE schools SET name = ?, address = ? WHERE id = ?", [name, address, id], (err) => {
        if (err) return res.status(500).json({ message: "Error al editar colegio", error: err });
        res.json({ message: "Colegio actualizado" });
    });
});

// Eliminar colegio
router.delete("/schools/:id", (req, res) => {
    if (req.headers["x-user-role"] !== "admin") {
        return res.status(403).json({ message: "Solo el administrador puede eliminar colegios." });
    }
    const { id } = req.params;
    db.query("DELETE FROM schools WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ message: "Error al eliminar colegio", error: err });
        res.json({ message: "Colegio eliminado" });
    });
});