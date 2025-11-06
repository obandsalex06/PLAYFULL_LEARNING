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

const ensureColumn = (table, column, def) => new Promise((resolve, reject) => {
  connection.query(`SHOW COLUMNS FROM ${table} LIKE ?`, [column], (err, results) => {
    if (err) return reject(err);
    if (results.length > 0) return resolve(false);
    connection.query(`ALTER TABLE ${table} ADD COLUMN ${def}`, (err2) => err2 ? reject(err2) : resolve(true));
  });
});

(async () => {
  try {
    const addedFirst = await ensureColumn('students', 'first_name', "first_name VARCHAR(100) NULL AFTER name");
    const addedLast = await ensureColumn('students', 'last_name', "last_name VARCHAR(100) NULL AFTER first_name");

    if (addedFirst || addedLast) {
      console.log('✅ Columnas first_name/last_name agregadas');
      // Backfill básico: separar por primer espacio
      const [rows] = await connection.promise().query('SELECT id, name FROM students');
      for (const row of rows) {
        if (!row.name) continue;
        const parts = row.name.trim().split(/\s+/);
        const first = parts.shift() || null;
        const last = parts.length > 0 ? parts.join(' ') : null;
        await connection.promise().query('UPDATE students SET first_name = ?, last_name = ? WHERE id = ?', [first, last, row.id]);
      }
      console.log('🔁 Backfill de nombres completado');
    } else {
      console.log('ℹ️ Columnas ya existían; sin cambios.');
    }
  } catch (e) {
    console.error('❌ Error en migración:', e);
  } finally {
    connection.end();
    console.log('🔌 Conexión cerrada');
  }
})();
