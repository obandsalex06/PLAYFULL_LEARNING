// backend/routes/authRoutes.js
import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js"; // 👈 importante el .js al final

const router = express.Router();

// 📌 Ruta de registro
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body; // 👈 incluye name aquí

    // Verificar si ya existe el usuario
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const newUser = new User({
      name, // 👈 ahora sí lo guarda
      email,
      password: hashedPassword,
      role: role || "estudiante" // 👈 default si no mandan nada
    });

    await newUser.save();

    res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
});

// 📌 Ruta de login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    // Comparar contraseñas
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    res.status(200).json({ message: "Login exitoso", user });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
});

// 👇 Exportamos como default para usar import en server.js
export default router;
