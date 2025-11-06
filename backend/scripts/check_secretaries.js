import db from '../config/db.js';

const q = (sql, params=[]) => new Promise((resolve, reject) => db.query(sql, params, (err, results) => err ? reject(err) : resolve(results)));

(async () => {
  try {
    const rows = await q("SHOW TABLES LIKE 'secretaries'");
    console.log('RESULT:', rows);
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err);
    process.exit(1);
  }
})();
