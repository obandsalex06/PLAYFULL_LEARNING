import mysql from 'mysql2';

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'playful_learning'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error conectando a MySQL:', err);
    process.exit(1);
  }
  console.log('✅ Conectado a MySQL');
});

const checkColumnQuery = "SHOW COLUMNS FROM students LIKE 'grade'";

connection.query(checkColumnQuery, (err, results) => {
  if (err) {
    console.error('❌ Error verificando columna grade:', err);
    connection.end();
    process.exit(1);
  }

  if (results.length > 0) {
    console.log('ℹ️ La columna grade ya existe. No se realizan cambios.');
    connection.end();
    return;
  }

  const alterQuery = "ALTER TABLE students ADD COLUMN grade TINYINT NULL AFTER role";
  connection.query(alterQuery, (err) => {
    if (err) {
      console.error('❌ Error agregando columna grade:', err);
      connection.end();
      process.exit(1);
    }
    console.log('✅ Columna grade agregada a students');
    connection.end();
  });
});
