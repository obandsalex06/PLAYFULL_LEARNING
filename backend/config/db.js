// Configuración de conexión a MySQL para Node.js usando mysql2
import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

// Utiliza variables de entorno; provee valores por defecto solo para desarrollo local.
const {
    DB_HOST = 'localhost',
    DB_USER = 'root',
    DB_PASSWORD = '',
    DB_NAME = 'playful_learning'
} = process.env;

// Pool para manejar múltiples conexiones y liberarlas automáticamente.
const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verificación inicial de conexión.
pool.getConnection((err, conn) => {
    if (err) {
        console.error('Error al conectar a MySQL:', err.code || err.message);
    } else {
        console.log('Conexión a MySQL pool exitosa.');
        conn.release();
    }
});

export default pool;