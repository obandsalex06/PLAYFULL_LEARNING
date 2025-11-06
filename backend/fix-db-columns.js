import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'playful_learning'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error conectando a MySQL:', err);
    process.exit(1);
  }
  console.log('✅ Conectado a MySQL');

  // Primero verificar si existe la columna evaluation_type
  connection.query(
    "SHOW COLUMNS FROM academic_records LIKE 'evaluation_type'",
    (err, results) => {
      if (err) {
        console.error('❌ Error verificando columnas:', err);
        connection.end();
        process.exit(1);
      }

      if (results.length === 0) {
        // La columna no existe, agregarla
        console.log('📝 Agregando columna evaluation_type a academic_records...');
        connection.query(
          "ALTER TABLE academic_records ADD COLUMN evaluation_type VARCHAR(50) DEFAULT 'examen' AFTER grade",
          (err) => {
            if (err) {
              console.error('❌ Error agregando evaluation_type:', err);
            } else {
              console.log('✅ Columna evaluation_type agregada exitosamente');
            }
            connection.end();
          }
        );
      } else {
        console.log('✅ La columna evaluation_type ya existe');
        connection.end();
      }
    }
  );
});
