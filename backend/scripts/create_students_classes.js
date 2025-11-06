import db from '../config/db.js';

const ddl = `CREATE TABLE IF NOT EXISTS students_classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  class_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
)`;

db.query(ddl, (err) => {
  if (err) {
    console.error('ERR_CREATE_TABLE', err);
    process.exit(1);
  }
  console.log('students_classes table ensured');
  // Insert a relation between student 13 and class 5 (update IDs if necessary)
  db.query('INSERT INTO students_classes (student_id, class_id) VALUES (?, ?)', [13, 5], (err2, r) => {
    if (err2) {
      console.error('ERR_INSERT_REL', err2);
      process.exit(1);
    }
    console.log('Inserted relation id=' + r.insertId);
    process.exit(0);
  });
});
