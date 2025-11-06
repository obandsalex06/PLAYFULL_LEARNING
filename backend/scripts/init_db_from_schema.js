/* eslint-env node */
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
  multipleStatements: true,
});

connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a MySQL:', err);
    process.exit(1);
  }
  console.log('Conexión a MySQL exitosa.');

  try {
    const sqlFilePath = path.join(__dirname, '..', 'config', 'schema.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    connection.query(sql, (error) => {
      if (error) {
        console.error('Error al ejecutar schema.sql:', error);
        connection.end();
        process.exit(1);
      }

      console.log('✅ Base de datos inicializada desde schema.sql');
      connection.end();
      process.exit(0);
    });
  } catch (e) {
    console.error('Error leyendo schema.sql:', e);
    connection.end();
    process.exit(1);
  }
});
