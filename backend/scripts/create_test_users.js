import db from '../config/db.js';
import bcrypt from 'bcryptjs';

async function run() {
  try {
    // Crear colegio de prueba si no existe
    const schoolName = 'Demo School';
    const [srows] = await new Promise((resolve, reject) => {
      db.query('SELECT id FROM schools WHERE name = ?', [schoolName], (err, results) => err ? reject(err) : resolve(results));
    });
    let schoolId;
    if (srows && srows.length > 0) {
      schoolId = srows[0].id;
      console.log('School exists id=', schoolId);
    } else {
      const res = await new Promise((resolve, reject) => {
        db.query('INSERT INTO schools (name, address) VALUES (?, ?)', [schoolName, 'Demo address'], (err, result) => err ? reject(err) : resolve(result));
      });
      schoolId = res.insertId;
      console.log('Created school id=', schoolId);
    }

    // Helpers
    const insertIfNotExists = async (table, email, valuesFn) => {
      const rows = await new Promise((resolve, reject) => {
        db.query(`SELECT * FROM ${table} WHERE email = ?`, [email], (err, results) => err ? reject(err) : resolve(results));
      });
      if (rows.length > 0) {
        console.log(`${table} ${email} already exists`);
        return rows[0];
      }
      const values = await valuesFn();
      const res = await new Promise((resolve, reject) => {
        db.query(`INSERT INTO ${table} (${Object.keys(values).join(',')}) VALUES (${Object.keys(values).map(()=>'?').join(',')})`, Object.values(values), (err, result) => err ? reject(err) : resolve(result));
      });
      console.log(`Inserted into ${table}: id=${res.insertId}`);
      // Return the inserted row
      const newRow = await new Promise((resolve, reject) => {
        db.query(`SELECT * FROM ${table} WHERE id = ?`, [res.insertId], (err, results) => err ? reject(err) : resolve(results[0]));
      });
      return newRow;
    };

    // Create admin
    await insertIfNotExists('admins', 'admin@example.com', async () => {
      const hashed = await bcrypt.hash('AdminPass123!', 10);
      return { name: 'AdminTest', email: 'admin@example.com', password: hashed, school_id: schoolId };
    });

    // Create teacher
    await insertIfNotExists('teachers', 'teacher1@example.com', async () => {
      const hashed = await bcrypt.hash('TeacherPass123!', 10);
      return { name: 'TeacherTest', email: 'teacher1@example.com', password: hashed, school_id: schoolId };
    });

    // Create student
    await insertIfNotExists('students', 'student1@example.com', async () => {
      const hashed = await bcrypt.hash('StudentPass123!', 10);
      return { name: 'StudentTest', email: 'student1@example.com', password: hashed, school_id: schoolId };
    });

    console.log('Test users created/verified.');
    process.exit(0);
  } catch (err) {
    console.error('Error creating test users', err);
    process.exit(1);
  }
}

run();
