// Configuración de conexión a MySQL para Node.js usando mysql2
import mysql from 'mysql2';

const connection = mysql.createConnection({
    host: 'localhost', // Cambia esto si tu base de datos está en otro host
    user: 'root', // Cambia por tu usuario de MySQL
    password: '', // Cambia por tu contraseña de MySQL
    database: 'playful_learning' // Cambia por el nombre de tu base de datos
});

connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a MySQL:', err);
        return;
    }
    console.log('Conexión a MySQL exitosa.');
});

export default connection;