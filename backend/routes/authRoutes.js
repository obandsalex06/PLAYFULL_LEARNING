import express from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import db from "../config/db.js";
import { generateTokens, verifyRefreshToken } from "../utils/jwtUtils.js";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware.js";
const router = express.Router();

// Rate limiter para login (máximo 20 intentos cada 15 minutos en desarrollo, 5 en producción)
const isDevelopment = process.env.NODE_ENV !== 'production';
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: isDevelopment ? 20 : 5, // 20 intentos en desarrollo, 5 en producción
    message: "Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.",
    standardHeaders: true, // Retorna info en headers `RateLimit-*`
    legacyHeaders: false, // Deshabilita headers `X-RateLimit-*`
});

// Endpoint: obtener todos los docentes (para admin y secretaria)
router.get("/teachers", authenticateToken, authorizeRoles('admin', 'secretaria'), (req, res) => {
    db.query("SELECT id, name, email, created_at FROM teachers", (err, results) => {
        if (err) return res.status(500).json({ message: "Error en la base de datos", error: err });
        res.json(results);
    });
});

// Endpoint: obtener todas las clases (para admin y secretaria)
router.get("/all-classes", authenticateToken, authorizeRoles('admin', 'secretaria'), (req, res) => {
    db.query(
        `SELECT c.id, c.name, c.description, c.teacher_id, c.school_id, c.created_at,
                t.name as teacher_name, s.name as school_name
         FROM classes c
         LEFT JOIN teachers t ON c.teacher_id = t.id
         LEFT JOIN schools s ON c.school_id = s.id
         ORDER BY c.created_at DESC`,
        (err, results) => {
            if (err) return res.status(500).json({ message: "Error en la base de datos", error: err });
            res.json(results);
        }
    );
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
                `SELECT s.id, s.name, s.email, cs.class_id FROM students s
                 JOIN class_students cs ON s.id = cs.student_id
                 WHERE cs.class_id IN (${placeholders})`,
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

// Endpoint: profesor asigna learncoins a estudiante de su clase
router.post("/assign-coins", async(req, res) => {
    // Solo profesores pueden asignar
    if (req.headers["x-user-role"] !== "docente") {
        return res.status(403).json({ message: "Solo los profesores pueden asignar learncoins." });
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
            return res.status(403).json({ message: "No puedes asignar learncoins a estudiantes fuera de tus clases." });
        }
        // Insertar registro en tabla coins
        db.query("INSERT INTO coins (student_id, amount, reason) VALUES (?, ?, ?)", [student_id, amount, reason || null], (err2) => {
            if (err2) return res.status(500).json({ message: "Error al asignar learncoins", error: err2 });
            // Sumar learncoins al estudiante
            db.query("UPDATE students SET coins = coins + ? WHERE id = ?", [amount, student_id], (err3) => {
                if (err3) return res.status(500).json({ message: "Error al actualizar learncoins del estudiante", error: err3 });
                res.status(200).json({ message: "Learncoins asignados correctamente" });
            });
        });
    });
});

// Endpoint: asignar estudiante a clase (teacher/admin/secretary)
router.post('/assign-student', async (req, res) => {
    try {
        const role = req.headers['x-user-role'];
        const userEmail = req.headers['x-user-email'];
        const { student_email, student_id, class_id } = req.body;

        if (!student_email && !student_id) return res.status(400).json({ message: 'Se requiere student_email o student_id' });
        if (!class_id) return res.status(400).json({ message: 'Se requiere class_id' });

        // Si el rol es docente, verificar que la clase pertenece al docente
        if (role === 'docente') {
            const [cls] = await new Promise((resolve, reject) => {
                db.query('SELECT * FROM classes WHERE id = ? AND teacher_id = (SELECT id FROM teachers WHERE email = ?)', [class_id, userEmail], (err, rows) => err ? reject(err) : resolve(rows));
            });
            if (!cls) return res.status(403).json({ message: 'No puedes asignar estudiantes a clases que no te pertenecen.' });
        } else if (role !== 'admin' && role !== 'secretaria') {
            return res.status(403).json({ message: 'No tienes permiso para asignar estudiantes a clases.' });
        }

        // Obtener student_id si se pasó email
        let finalStudentId = student_id;
        if (!finalStudentId) {
            const [stu] = await new Promise((resolve, reject) => {
                db.query('SELECT id FROM students WHERE email = ?', [student_email], (err, rows) => err ? reject(err) : resolve(rows));
            });
            if (!stu) return res.status(404).json({ message: 'Estudiante no encontrado' });
            finalStudentId = stu.id;
        }

        // Asegurar que la clase existe
        const [classRow] = await new Promise((resolve, reject) => {
            db.query('SELECT id FROM classes WHERE id = ?', [class_id], (err, rows) => err ? reject(err) : resolve(rows));
        });
        if (!classRow) return res.status(404).json({ message: 'Clase no encontrada' });

        // Crear tabla students_classes si no existe (ddl seguro)
        const ddl = `CREATE TABLE IF NOT EXISTS students_classes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          student_id INT NOT NULL,
          class_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
          FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
        )`;
        await new Promise((resolve, reject) => db.query(ddl, (err) => err ? reject(err) : resolve()));

        // Verificar si ya está asignado
        const existing = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM students_classes WHERE student_id = ? AND class_id = ?', [finalStudentId, class_id], (err, rows) => err ? reject(err) : resolve(rows));
        });
        if (existing.length > 0) return res.status(200).json({ message: 'Estudiante ya asignado a la clase' });

        // Insertar asignación
        await new Promise((resolve, reject) => {
            db.query('INSERT INTO students_classes (student_id, class_id) VALUES (?, ?)', [finalStudentId, class_id], (err) => err ? reject(err) : resolve());
        });

        res.json({ message: 'Estudiante asignado a la clase correctamente' });
    } catch (error) {
        console.error('assign-student error', error);
        res.status(500).json({ message: 'Error al asignar estudiante', error: error.message });
    }
});

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
    // Permitir a estudiantes y admin ver los premios
    if (req.headers["x-user-role"] !== "admin" && req.headers["x-user-role"] !== "estudiante") {
        return res.status(403).json({ message: "Solo estudiantes y administradores pueden ver premios." });
    }
    db.query("SELECT * FROM rewards", (err, results) => {
        if (err) return res.status(500).json({ message: "Error en la base de datos", error: err });
        // Asegurar que siempre devolvemos un array vacío si no hay resultados
        res.json(results || []);
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

// Canjear premio (estudiantes)
router.post("/redeem-reward", async (req, res) => {
    if (req.headers["x-user-role"] !== "estudiante") {
        return res.status(403).json({ message: "Solo los estudiantes pueden canjear premios." });
    }

    const { reward_id } = req.body;
    const studentEmail = req.headers["x-user-email"];

    try {
        // Obtener información del premio y del estudiante
        const [reward] = await new Promise((resolve, reject) => {
            db.query("SELECT * FROM rewards WHERE id = ?", [reward_id], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });

        const [student] = await new Promise((resolve, reject) => {
            db.query("SELECT * FROM students WHERE email = ?", [studentEmail], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });

        if (!reward) {
            return res.status(404).json({ message: "Premio no encontrado" });
        }

        if (!student) {
            return res.status(404).json({ message: "Estudiante no encontrado" });
        }

        if (student.coins < reward.cost) {
            return res.status(400).json({ message: "No tienes suficientes learncoins para este premio" });
        }

        // Iniciar transacción
        await new Promise((resolve, reject) => {
            db.beginTransaction(err => {
                if (err) reject(err);
                resolve();
            });
        });

        try {
            // Registrar canje de premio
            await new Promise((resolve, reject) => {
                db.query(
                    "INSERT INTO redeemed_rewards (student_id, reward_id, cost_at_time) VALUES (?, ?, ?)",
                    [student.id, reward.id, reward.cost],
                    (err) => {
                        if (err) reject(err);
                        resolve();
                    }
                );
            });

            // Actualizar learncoins del estudiante
            await new Promise((resolve, reject) => {
                db.query(
                    "UPDATE students SET coins = coins - ? WHERE id = ?",
                    [reward.cost, student.id],
                    (err) => {
                        if (err) reject(err);
                        resolve();
                    }
                );
            });

            // Confirmar transacción
            await new Promise((resolve, reject) => {
                db.commit(err => {
                    if (err) reject(err);
                    resolve();
                });
            });

            res.json({ 
                message: "Premio canjeado con éxito",
                newBalance: student.coins - reward.cost
            });

        } catch (error) {
            // Revertir transacción en caso de error
            await new Promise((resolve) => {
                db.rollback(() => resolve());
            });
            throw error;
        }
    } catch (error) {
        res.status(500).json({ message: "Error al canjear el premio", error: error.message });
    }
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
        // Normalizar school_id
        const sid = Number(school_id);
        const finalSchoolId = Number.isInteger(sid) && sid > 0 ? sid : null;

        const [existing] = await new Promise((resolve, reject) => {
            db.query("SELECT * FROM teachers WHERE email = ?", [email], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
        if (existing) {
            return res.status(400).json({ message: "El profesor ya existe" });
        }

        // Si se indicó colegio, comprobar que exista
        if (finalSchoolId !== null) {
            const schoolExists = await new Promise((resolve, reject) => {
                db.query("SELECT id FROM schools WHERE id = ?", [finalSchoolId], (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows.length > 0);
                });
            });
            if (!schoolExists) return res.status(400).json({ message: "Colegio no encontrado" });
        }

        // Encriptar contraseña e insertar
        const hashedPassword = await bcrypt.hash(password, 10);
        await new Promise((resolve, reject) => {
            db.query(
                "INSERT INTO teachers (name, email, password, school_id) VALUES (?, ?, ?, ?)",
                [name, email, hashedPassword, finalSchoolId],
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
            // Normalizar school_id
            const sid = Number(school_id);
            const finalSchoolId = Number.isInteger(sid) && sid > 0 ? sid : null;

            const [existing] = await new Promise((resolve, reject) => {
                db.query("SELECT * FROM secretaries WHERE email = ?", [email], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });
            if (existing) {
                return res.status(400).json({ message: "La secretaria ya existe" });
            }

            // Si se indicó colegio, comprobar que exista
            if (finalSchoolId !== null) {
                const schoolExists = await new Promise((resolve, reject) => {
                    db.query("SELECT id FROM schools WHERE id = ?", [finalSchoolId], (err, rows) => {
                        if (err) return reject(err);
                        resolve(rows.length > 0);
                    });
                });
                if (!schoolExists) return res.status(400).json({ message: "Colegio no encontrado" });
            }

            // Encriptar contraseña e insertar
            const hashedPassword = await bcrypt.hash(password, 10);
            await new Promise((resolve, reject) => {
                db.query(
                    "INSERT INTO secretaries (name, email, password, school_id) VALUES (?, ?, ?, ?)",
                    [name, email, hashedPassword, finalSchoolId],
                    (err, result) => {
                        if (err) return reject(err);
                        resolve(result);
                    }
                );
            });
            res.status(201).json({ message: "Secretaria registrada con éxito" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error en el servidor", error: error.message });
        }
    });
// backend/routes/authRoutes.js


// 📌 Ruta de registro
router.post("/register", async (req, res) => {
    try {
        // Solo la secretaria (o admin si se desea) puede registrar estudiantes
        const roleHeader = req.headers["x-user-role"];
        const userEmail = req.headers["x-user-email"]; // para inferir school_id de la secretaria

        if (roleHeader !== "secretaria") {
            return res.status(403).json({ message: "Solo la secretaria puede registrar estudiantes" });
        }

    const { name, first_name, last_name, email, password, grade, school_id } = req.body;

        // Validar datos mínimos
        if ((!name && !(first_name && last_name)) || !email || !password) {
            return res.status(400).json({ message: "Faltan campos obligatorios (nombres, apellidos, email, password)" });
        }

        // Derivar nombre completo si se pasaron nombres separados
        const fullName = name || `${first_name} ${last_name}`.trim();

        // Validar grade 1..11 si viene
        let finalGrade = null;
        if (grade !== undefined && grade !== null && grade !== "") {
            const g = Number(grade);
            if (!Number.isInteger(g) || g < 1 || g > 11) {
                return res.status(400).json({ message: "El curso (grade) debe ser un número entre 1 y 11" });
            }
            finalGrade = g;
        }

        // Normalizar school_id: si no viene, intentar tomarlo de la secretaria
        let finalSchoolId = null;
        if (school_id) {
            const sid = Number(school_id);
            finalSchoolId = Number.isInteger(sid) && sid > 0 ? sid : null;
        } else {
            // Buscar school_id de la secretaria por email
            const getSec = (sql, p) => new Promise((resolve, reject) => db.query(sql, p, (e, r) => e ? reject(e) : resolve(r)));
            const secRows = await getSec("SELECT school_id FROM secretaries WHERE email = ?", [userEmail]);
            if (secRows.length > 0) finalSchoolId = secRows[0].school_id || null;
        }

        // Verificar si ya existe el usuario
        db.query("SELECT * FROM students WHERE email = ?", [email], async (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Error en la base de datos", error: err });
            }
            if (results.length > 0) {
                return res.status(400).json({ message: "El usuario ya existe" });
            }

            // Si se proporcionó school_id, validar que el colegio exista
            if (finalSchoolId !== null) {
                db.query("SELECT id FROM schools WHERE id = ?", [finalSchoolId], async (err2, rows2) => {
                    if (err2) return res.status(500).json({ message: "Error en la base de datos", error: err2 });
                    if (rows2.length === 0) return res.status(400).json({ message: "Colegio no encontrado" });

                    // Encriptar contraseña e insertar estudiante
                    const hashedPassword = await bcrypt.hash(password, 10);
                    db.query(
                        "INSERT INTO students (name, first_name, last_name, email, password, role, grade, school_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        [fullName, first_name || null, last_name || null, email, hashedPassword, "estudiante", finalGrade, finalSchoolId],
                        (err3) => {
                            if (err3) return res.status(500).json({ message: "Error al registrar usuario", error: err3 });
                            res.status(201).json({ message: "Estudiante registrado con éxito" });
                        }
                    );
                });
            } else {
                // Insertar sin school_id
                const hashedPassword = await bcrypt.hash(password, 10);
                db.query(
                    "INSERT INTO students (name, first_name, last_name, email, password, role, grade, school_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    [fullName, first_name || null, last_name || null, email, hashedPassword, "estudiante", finalGrade, null],
                    (err3) => {
                        if (err3) return res.status(500).json({ message: "Error al registrar usuario", error: err3 });
                        res.status(201).json({ message: "Estudiante registrado con éxito" });
                    }
                );
            }
        });
    } catch (error) {
        console.error('/register error', error);
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
});

// 📌 Ruta de login
router.post("/login", loginLimiter, async (req, res) => {
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
            
            // Generar tokens JWT
            const tokens = generateTokens(user);
            
            return res.status(200).json({ 
                message: "Login exitoso", 
                user,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            });
        }

        // Teachers
        rows = await q("SELECT * FROM teachers WHERE email = ?", [email]);
        if (rows.length > 0) {
            const user = rows[0];
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ message: "Credenciales inválidas" });
            delete user.password;
            user.role = "docente";
            
            // Generar tokens JWT
            const tokens = generateTokens(user);
            
            return res.status(200).json({ 
                message: "Login exitoso", 
                user,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            });
        }

        // Secretaries
        rows = await q("SELECT * FROM secretaries WHERE email = ?", [email]);
        if (rows.length > 0) {
            const user = rows[0];
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ message: "Credenciales inválidas" });
            delete user.password;
            user.role = "secretaria";
            
            // Generar tokens JWT
            const tokens = generateTokens(user);
            
            return res.status(200).json({ 
                message: "Login exitoso", 
                user,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            });
        }

        // Students
        rows = await q("SELECT * FROM students WHERE email = ?", [email]);
        if (rows.length > 0) {
            const user = rows[0];
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ message: "Credenciales inválidas" });
            delete user.password;
            user.role = "estudiante";
            
            // Generar tokens JWT
            const tokens = generateTokens(user);
            
            return res.status(200).json({ 
                message: "Login exitoso", 
                user,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            });
        }

        return res.status(400).json({ message: "Credenciales inválidas" });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
});

// Endpoint: obtener todos los estudiantes (para docentes)
router.get("/all-students", authenticateToken, authorizeRoles('docente', 'admin', 'secretaria'), (req, res) => {
    const userEmail = req.user.email; // Ahora viene del token JWT
    const userRole = req.user.role;
    const { grade, page, limit } = req.query;

    // Paginación opcional
    const pageNum = page ? parseInt(page, 10) : null;
    const limitNum = limit ? parseInt(limit, 10) : null;
    const offset = (pageNum && limitNum) ? (pageNum - 1) * limitNum : null;

    // Si es secretaria, limitar a su colegio
    const getQuery = (schoolIdFilter) => {
        const base = `SELECT st.id, st.name, st.first_name, st.last_name, st.email, st.coins, st.grade, st.school_id, sc.name as school_name, st.created_at
                      FROM students st
                      LEFT JOIN schools sc ON st.school_id = sc.id`;
        const where = [];
        const params = [];
        if (schoolIdFilter) { where.push('st.school_id = ?'); params.push(schoolIdFilter); }
        if (grade) { where.push('st.grade = ?'); params.push(Number(grade)); }
        const clause = where.length ? ` WHERE ${where.join(' AND ')}` : '';
        const order = ' ORDER BY st.name ASC';
        const pagination = (limitNum && offset !== null) ? ` LIMIT ? OFFSET ?` : '';
        return { sql: base + clause + order + pagination, params, limitNum, offset };
    };

    if (userRole === 'secretaria') {
        db.query('SELECT school_id FROM secretaries WHERE email = ?', [userEmail], (err, rows) => {
            if (err) return res.status(500).json({ message: 'Error en la base de datos' });
            const schoolId = rows.length ? rows[0].school_id : null;
            const { sql, params, limitNum, offset } = getQuery(schoolId);
            const finalParams = [...params];
            if (limitNum && offset !== null) {
                finalParams.push(limitNum, offset);
            }
            db.query(sql, finalParams, (err2, results) => {
                if (err2) return res.status(500).json({ message: 'Error al obtener estudiantes' });
                res.json(results);
            });
        });
    } else {
        const { sql, params, limitNum, offset } = getQuery(null);
        const finalParams = [...params];
        if (limitNum && offset !== null) {
            finalParams.push(limitNum, offset);
        }
        db.query(sql, finalParams, (err2, results) => {
            if (err2) return res.status(500).json({ message: 'Error al obtener estudiantes' });
            res.json(results);
        });
    }
});

// Endpoint: asignar estudiante a clase (para docentes)
router.post("/assign-student", (req, res) => {
    const role = req.headers["x-user-role"];
    const teacherEmail = req.headers["x-user-email"];
    
    if (role !== "docente") {
        return res.status(403).json({ message: "Solo los docentes pueden asignar estudiantes" });
    }

    const { student_id, class_id } = req.body;

    if (!student_id || !class_id) {
        return res.status(400).json({ message: "Faltan datos: student_id y class_id" });
    }

    // Verificar que la clase pertenece al docente
    db.query(
        `SELECT c.id FROM classes c 
         JOIN teachers t ON c.teacher_id = t.id 
         WHERE c.id = ? AND t.email = ?`,
        [class_id, teacherEmail],
        (err, classRows) => {
            if (err) {
                console.error('Error al verificar clase:', err);
                return res.status(500).json({ message: "Error al verificar la clase" });
            }

            if (classRows.length === 0) {
                return res.status(403).json({ message: "Esta clase no te pertenece" });
            }

            // Asignar estudiante a clase
            db.query(
                "INSERT INTO class_students (class_id, student_id) VALUES (?, ?)",
                [class_id, student_id],
                (err2) => {
                    if (err2) {
                        if (err2.code === 'ER_DUP_ENTRY') {
                            return res.status(400).json({ message: "El estudiante ya está asignado a esta clase" });
                        }
                        console.error('Error al asignar estudiante:', err2);
                        return res.status(500).json({ message: "Error al asignar estudiante" });
                    }

                    res.status(200).json({ message: "Estudiante asignado exitosamente" });
                }
            );
        }
    );
});

// Endpoint: registrar consentimiento de términos/políticas
router.post("/consent", (req, res) => {
    const { user_email, user_role, consent_type } = req.body;
    
    if (!user_email || !user_role || !consent_type) {
        return res.status(400).json({ message: "Faltan datos: user_email, user_role, consent_type" });
    }

    // Validar consent_type
    const validTypes = ['terms', 'privacy', 'both'];
    if (!validTypes.includes(consent_type)) {
        return res.status(400).json({ message: "consent_type debe ser: terms, privacy o both" });
    }

    // Validar user_role
    const validRoles = ['admin', 'docente', 'secretaria', 'estudiante'];
    if (!validRoles.includes(user_role)) {
        return res.status(400).json({ message: "user_role inválido" });
    }

    // Obtener IP y User-Agent
    const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    const user_agent = req.headers['user-agent'] || null;

    const query = `INSERT INTO consents (user_email, user_role, consent_type, ip_address, user_agent) 
                   VALUES (?, ?, ?, ?, ?)`;
    
    db.query(query, [user_email, user_role, consent_type, ip_address, user_agent], (err, result) => {
        if (err) {
            console.error('Error al registrar consentimiento:', err);
            return res.status(500).json({ message: "Error al registrar consentimiento" });
        }
        res.status(201).json({ 
            message: "Consentimiento registrado exitosamente",
            consent_id: result.insertId 
        });
    });
});

// Endpoint: Refresh token - genera nuevo access token usando refresh token
router.post("/refresh-token", (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token requerido" });
    }

    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
        return res.status(403).json({ message: "Refresh token inválido o expirado" });
    }

    // Buscar el usuario en la base de datos para obtener datos actualizados
    const { email, id } = decoded;
    
    const tables = [
        { table: 'admins', role: 'admin' },
        { table: 'teachers', role: 'docente' },
        { table: 'secretaries', role: 'secretaria' },
        { table: 'students', role: 'estudiante' }
    ];

    let userFound = false;

    const checkUser = (index) => {
        if (index >= tables.length) {
            if (!userFound) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }
            return;
        }

        const { table, role } = tables[index];
        db.query(
            `SELECT id, name, email FROM ${table} WHERE id = ? AND email = ?`,
            [id, email],
            (err, rows) => {
                if (err) {
                    return res.status(500).json({ message: "Error en la base de datos" });
                }

                if (rows.length > 0) {
                    userFound = true;
                    const user = rows[0];
                    user.role = role;

                    // Generar nuevo access token
                    const tokens = generateTokens(user);

                    return res.status(200).json({
                        accessToken: tokens.accessToken,
                        refreshToken: tokens.refreshToken, // Opcionalmente rotar el refresh token
                        user
                    });
                }

                checkUser(index + 1);
            }
        );
    };

    checkUser(0);
});

// Endpoint: Logout - invalida el token (en frontend se elimina del localStorage)
router.post("/logout", authenticateToken, (req, res) => {
    // En una implementación más robusta, aquí guardaríamos el token en una blacklist
    // Por ahora, el logout se maneja principalmente en el frontend eliminando los tokens
    
    res.status(200).json({ 
        message: "Logout exitoso",
        info: "Token invalidado en el cliente"
    });
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

// Obtener clases según rol
router.get('/classes', async (req, res) => {
    try {
        const role = req.headers['x-user-role'];
        const userEmail = req.headers['x-user-email'];

        if (role === 'admin') {
            const rows = await new Promise((resolve, reject) => db.query('SELECT id, name, teacher_id, school_id FROM classes', (err, results) => err ? reject(err) : resolve(results)));
            return res.json(rows || []);
        }

        if (role === 'docente') {
            const rows = await new Promise((resolve, reject) => db.query('SELECT id, name, teacher_id, school_id FROM classes WHERE teacher_id = (SELECT id FROM teachers WHERE email = ?)', [userEmail], (err, results) => err ? reject(err) : resolve(results)));
            return res.json(rows || []);
        }

        if (role === 'secretaria') {
            // obtener school_id de la secretaria
            const [sec] = await new Promise((resolve, reject) => db.query('SELECT school_id FROM secretaries WHERE email = ?', [userEmail], (err, rows) => err ? reject(err) : resolve(rows)));
            if (!sec) return res.status(404).json({ message: 'Secretaria no encontrada' });
            const rows = await new Promise((resolve, reject) => db.query('SELECT id, name, teacher_id, school_id FROM classes WHERE school_id = ?', [sec.school_id], (err, results) => err ? reject(err) : resolve(results)));
            return res.json(rows || []);
        }

        return res.status(403).json({ message: 'No tienes permiso para ver clases' });
    } catch (error) {
        console.error('GET /classes error', error);
        res.status(500).json({ message: 'Error al obtener clases', error: error.message });
    }
});

// Obtener estudiantes de una clase
router.get('/classes/:id/students', async (req, res) => {
    try {
        const role = req.headers['x-user-role'];
        const userEmail = req.headers['x-user-email'];
        const classId = req.params.id;

        // Verificar existencia de clase
        const [cls] = await new Promise((resolve, reject) => db.query('SELECT * FROM classes WHERE id = ?', [classId], (err, rows) => err ? reject(err) : resolve(rows)));
        if (!cls) return res.status(404).json({ message: 'Clase no encontrada' });

        if (role === 'docente') {
            // verificar que la clase pertenece al docente
            const rows = await new Promise((resolve, reject) => db.query('SELECT * FROM classes WHERE id = ? AND teacher_id = (SELECT id FROM teachers WHERE email = ?)', [classId, userEmail], (err, results) => err ? reject(err) : resolve(results)));
            if (!rows || rows.length === 0) return res.status(403).json({ message: 'No puedes ver estudiantes de esta clase' });
        }

        if (role === 'secretaria') {
            // verificar que secretaria pertenece al mismo colegio
            const [sec] = await new Promise((resolve, reject) => db.query('SELECT school_id FROM secretaries WHERE email = ?', [userEmail], (err, rows) => err ? reject(err) : resolve(rows)));
            if (!sec) return res.status(404).json({ message: 'Secretaria no encontrada' });
            if (sec.school_id !== cls.school_id) return res.status(403).json({ message: 'No puedes ver estudiantes de esta clase' });
        }

        // Obtener estudiantes unidos por students_classes
        const students = await new Promise((resolve, reject) => db.query(
            `SELECT s.id, s.name, s.email, s.coins, sc.created_at
             FROM students s
             JOIN students_classes sc ON s.id = sc.student_id
             WHERE sc.class_id = ?`,
            [classId], (err, results) => err ? reject(err) : resolve(results)));

        res.json(students || []);
    } catch (error) {
        console.error('GET /classes/:id/students error', error);
        res.status(500).json({ message: 'Error al obtener estudiantes', error: error.message });
    }
});