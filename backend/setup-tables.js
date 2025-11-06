// Script para crear las tablas faltantes en la base de datos
import mysql from 'mysql2';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'playful_learning',
    multipleStatements: true
});

connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a MySQL:', err);
        process.exit(1);
    }
    console.log('Conexión a MySQL exitosa.');
    
    // Leer el archivo SQL
    const sqlFilePath = path.join(__dirname, 'create-missing-tables.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Ejecutar el SQL
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Error al ejecutar el script SQL:', error);
            connection.end();
            process.exit(1);
        }
        
        console.log('✅ Tablas creadas exitosamente!');
        console.log('   - feedback');
        console.log('   - academic_records');
        console.log('   - class_students');
        
        connection.end();
        process.exit(0);
    });
});
