/* eslint-env node */
import db from '../config/db.js';

const sql = `
CREATE TABLE IF NOT EXISTS secretaries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  school_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

db.query(sql, (err, _result) => {
  if (err) {
    console.error('Error creando tabla secretaries:', err);
    process.exit(1);
  }
  console.log('Tabla secretaries creada o ya existente.');
  process.exit(0);
});
