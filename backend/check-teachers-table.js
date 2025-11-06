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

  connection.query("DESCRIBE teachers", (err, results) => {
    if (err) {
      console.error('❌ Error:', err);
      connection.end();
      process.exit(1);
    }
    
    console.log('\n📋 Estructura de la tabla teachers:');
    console.table(results);
    
    connection.end();
  });
});
