import db from '../config/db.js';

async function q(sql, params=[]) {
  return new Promise((resolve, reject) => db.query(sql, params, (err, res) => err ? reject(err) : resolve(res)));
}

(async function seed(){
  try {
    console.log('Seed start');
    // Crear un colegio si no existe
    const schoolName = 'Colegio Demo';
    let schools = await q('SELECT * FROM schools WHERE name = ?', [schoolName]);
    let schoolId;
    if (schools.length === 0) {
      const r = await q('INSERT INTO schools (name, address) VALUES (?, ?)', [schoolName, 'Calle Demo 123']);
      schoolId = r.insertId;
      console.log('Created school id', schoolId);
    } else {
      schoolId = schools[0].id;
      console.log('School exists id', schoolId);
    }

    // Crear docente
    const teacherEmail = 'teacher1@demo.com';
    let teachers = await q('SELECT * FROM teachers WHERE email = ?', [teacherEmail]);
    let teacherId;
    if (teachers.length === 0) {
      const hashed = '$2b$10$abcdefghijklmnopqrstuv'; // placeholder, not secure; you may reset password manually
      const r = await q('INSERT INTO teachers (name, email, password, school_id) VALUES (?, ?, ?, ?)', ['Docente Demo', teacherEmail, hashed, schoolId]);
      teacherId = r.insertId;
      console.log('Created teacher id', teacherId);
    } else {
      teacherId = teachers[0].id;
      console.log('Teacher exists id', teacherId);
    }

    // Crear estudiantes
    const studentEmails = ['student1@demo.com','student2@demo.com','student3@demo.com'];
    const studentIds = [];
    for (const email of studentEmails) {
      const rows = await q('SELECT * FROM students WHERE email = ?', [email]);
      if (rows.length === 0) {
        const hashed = '$2b$10$abcdefghijklmnopqrstuv';
        const r = await q('INSERT INTO students (name, email, password, school_id, coins) VALUES (?, ?, ?, ?, ?)', ['Alumno ' + email.split('@')[0], email, hashed, schoolId, 0]);
        studentIds.push(r.insertId);
        console.log('Created student', email, r.insertId);
      } else {
        studentIds.push(rows[0].id);
        console.log('Student exists', email, rows[0].id);
      }
    }

    // Crear clases
    const classNames = ['Matemáticas', 'Ciencias', 'Historia'];
    const classIds = [];
    for (const cname of classNames) {
      const rows = await q('SELECT * FROM classes WHERE name = ? AND teacher_id = ? AND school_id = ?', [cname, teacherId, schoolId]);
      if (rows.length === 0) {
        const r = await q('INSERT INTO classes (name, description, teacher_id, school_id) VALUES (?, ?, ?, ?)', [cname, cname + ' para nivel demo', teacherId, schoolId]);
        classIds.push(r.insertId);
        console.log('Created class', cname, r.insertId);
      } else {
        classIds.push(rows[0].id);
        console.log('Class exists', cname, rows[0].id);
      }
    }

    // Crear tabla students_classes si no existe
    const ddl = `CREATE TABLE IF NOT EXISTS students_classes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      class_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
    )`;
    await q(ddl);

    // Asignar estudiantes a clases (simple round-robin)
    for (let i=0;i<studentIds.length;i++){
      const sid = studentIds[i];
      const cid = classIds[i % classIds.length];
      const existing = await q('SELECT * FROM students_classes WHERE student_id = ? AND class_id = ?', [sid, cid]);
      if (existing.length === 0) {
        await q('INSERT INTO students_classes (student_id, class_id) VALUES (?, ?)', [sid, cid]);
        console.log('Assigned student', sid, 'to class', cid);
      } else {
        console.log('Assignment exists student', sid, 'class', cid);
      }
    }

    console.log('Seed finished');
    process.exit(0);
  } catch (err) {
    console.error('Seed error', err);
    process.exit(1);
  }
})();
