import db from '../config/db.js';
import bcrypt from 'bcryptjs';

async function q(sql, params = []) {
  return new Promise((resolve, reject) => db.query(sql, params, (err, res) => err ? reject(err) : resolve(res)));
}

(async function seed() {
  try {
    console.log('Seed start');
    // Asegurar columnas esperadas en students y tabla announcements
    try {
      await q("ALTER TABLE students ADD COLUMN IF NOT EXISTS first_name VARCHAR(255)");
    } catch (e) { /* ignore */ }
    try {
      await q("ALTER TABLE students ADD COLUMN IF NOT EXISTS last_name VARCHAR(255)");
    } catch (e) { /* ignore */ }
    try {
      await q("ALTER TABLE students ADD COLUMN IF NOT EXISTS role VARCHAR(50)");
    } catch (e) { /* ignore */ }
    try {
      await q("ALTER TABLE students ADD COLUMN IF NOT EXISTS grade INT");
    } catch (e) { /* ignore */ }
    try {
      await q(`CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        priority ENUM('normal','high','urgent') DEFAULT 'normal',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES secretaries(id)
      )`);
    } catch (e) { /* ignore */ }
    // ===== 1) SCHOOLS: crear 10 =====
    const schoolIds = [];
    for (let i = 1; i <= 10; i++) {
      const sname = `Colegio ${i}`;
      const rows = await q('SELECT id FROM schools WHERE name = ?', [sname]);
      if (rows.length === 0) {
        const r = await q('INSERT INTO schools (name, address) VALUES (?, ?)', [sname, `Calle ${i} #123`]);
        schoolIds.push(r.insertId);
        console.log('Created school', sname, r.insertId);
      } else {
        schoolIds.push(rows[0].id);
        console.log('School exists', sname, rows[0].id);
      }
    }
    // Usar el primer colegio como default cuando haga falta
    const schoolId = schoolIds[0];

    // Crear/actualizar ADMIN solicitado: Alex Obando
    const adminName = 'Alex Obando';
    const adminEmail = 'lobandoalex@gmail.com';
  // Debe cumplir: >=8, mayúscula, número, caracter especial
  const adminPlain = 'DuvertyNoob45!';
    const adminHash = await bcrypt.hash(adminPlain, 10);
    const admins = await q('SELECT * FROM admins WHERE email = ?', [adminEmail]);
    if (admins.length === 0) {
      await q('INSERT INTO admins (name, email, password, school_id) VALUES (?, ?, ?, ?)', [adminName, adminEmail, adminHash, schoolId]);
      console.log('Created admin', adminEmail);
    } else {
      await q('UPDATE admins SET name = ?, password = ?, school_id = ? WHERE email = ?', [adminName, adminHash, schoolId, adminEmail]);
      console.log('Updated admin', adminEmail);
    }

    // ===== 2) ADMINS: crear 10 admins demo =====
    for (let i = 1; i <= 10; i++) {
      const email = `admin${i}@demo.com`;
      const name = `Admin ${i}`;
  // >=8, incluye mayúscula, número y caracter especial
  const hash = await bcrypt.hash(`Admin${i}Pass!1`, 10);
      const sid = schoolIds[(i - 1) % schoolIds.length];
      const exists = await q('SELECT id FROM admins WHERE email = ?', [email]);
      if (exists.length === 0) {
        await q('INSERT INTO admins (name, email, password, school_id) VALUES (?, ?, ?, ?)', [name, email, hash, sid]);
        console.log('Inserted admin', email);
      } else {
        await q('UPDATE admins SET name = ?, password = ?, school_id = ? WHERE email = ?', [name, hash, sid, email]);
        console.log('Updated admin', email);
      }
    }

    // Crear docente
    // ===== 3) TEACHERS: crear 10 =====
    const teacherIds = [];
    for (let i = 1; i <= 10; i++) {
      const email = `teacher${i}@demo.com`;
      const name = `Docente ${i}`;
  const hash = await bcrypt.hash(`Teacher${i}Pass!1`, 10);
      const sid = schoolIds[(i - 1) % schoolIds.length];
      const rows = await q('SELECT id FROM teachers WHERE email = ?', [email]);
      if (rows.length === 0) {
        const r = await q('INSERT INTO teachers (name, email, password, school_id) VALUES (?, ?, ?, ?)', [name, email, hash, sid]);
        teacherIds.push(r.insertId);
        console.log('Inserted teacher', email, r.insertId);
      } else {
        teacherIds.push(rows[0].id);
        await q('UPDATE teachers SET name = ?, password = ?, school_id = ? WHERE email = ?', [name, hash, sid, email]);
        console.log('Updated teacher', email, rows[0].id);
      }
    }

    // Crear estudiantes
    // ===== 4) STUDENTS: crear 10 =====
    const studentIds = [];
    for (let i = 1; i <= 10; i++) {
      const email = `student${i}@demo.com`;
      const name = `Estudiante ${i}`;
  const hash = await bcrypt.hash(`Student${i}Pass!1`, 10);
      const sid = schoolIds[(i - 1) % schoolIds.length];
      const rows = await q('SELECT id FROM students WHERE email = ?', [email]);
      if (rows.length === 0) {
        const r = await q('INSERT INTO students (name, email, password, school_id, coins) VALUES (?, ?, ?, ?, ?)', [name, email, hash, sid, i * 10]);
        studentIds.push(r.insertId);
        console.log('Inserted student', email, r.insertId);
      } else {
        studentIds.push(rows[0].id);
        await q('UPDATE students SET name = ?, password = ?, school_id = ?, coins = ? WHERE email = ?', [name, hash, sid, i * 10, email]);
        console.log('Updated student', email, rows[0].id);
      }
    }

    // ===== 5) SECRETARIES: crear 10 =====
    for (let i = 1; i <= 10; i++) {
      const email = `secretary${i}@demo.com`;
      const name = `Secretaria ${i}`;
  const hash = await bcrypt.hash(`Secretary${i}Pass!1`, 10);
      const sid = schoolIds[(i - 1) % schoolIds.length];
      const rows = await q('SELECT id FROM secretaries WHERE email = ?', [email]);
      if (rows.length === 0) {
        await q('INSERT INTO secretaries (name, email, password, school_id) VALUES (?, ?, ?, ?)', [name, email, hash, sid]);
        console.log('Inserted secretary', email);
      } else {
        await q('UPDATE secretaries SET name = ?, password = ?, school_id = ? WHERE email = ?', [name, hash, sid, email]);
        console.log('Updated secretary', email);
      }
    }

    // Crear clases
    // ===== 6) CLASSES: crear 10 (asignadas a cada teacher) =====
    const classIds = [];
    for (let i = 1; i <= 10; i++) {
      const cname = `Clase ${i}`;
      const tid = teacherIds[(i - 1) % teacherIds.length];
      const sid = schoolIds[(i - 1) % schoolIds.length];
      const rows = await q('SELECT id FROM classes WHERE name = ? AND teacher_id = ? AND school_id = ?', [cname, tid, sid]);
      if (rows.length === 0) {
        const r = await q('INSERT INTO classes (name, description, teacher_id, school_id) VALUES (?, ?, ?, ?)', [cname, `${cname} descripción`, tid, sid]);
        classIds.push(r.insertId);
        console.log('Inserted class', cname, r.insertId);
      } else {
        classIds.push(rows[0].id);
        console.log('Class exists', cname, rows[0].id);
      }
    }

    // Unificar: usar solo class_students (ya definida en schema.sql). Migrar si existe students_classes.
    const legacyExists = await q("SHOW TABLES LIKE 'students_classes'");
    if (legacyExists.length) {
      console.log('Migrating data from students_classes to class_students (if any)');
      const legacyRows = await q('SELECT student_id, class_id FROM students_classes');
      for (const row of legacyRows) {
        try {
          await q('INSERT IGNORE INTO class_students (class_id, student_id) VALUES (?, ?)', [row.class_id, row.student_id]);
        } catch (e) {
          console.warn('Insert IGNORE failed for', row, e.message);
        }
      }
    }
    // Asignar estudiantes a clases (uno a uno) directamente en class_students
    for (let i = 0; i < studentIds.length; i++) {
      const sidStudent = studentIds[i];
      const cidClass = classIds[i % classIds.length];
      const exists = await q('SELECT id FROM class_students WHERE student_id = ? AND class_id = ?', [sidStudent, cidClass]);
      if (exists.length === 0) {
        await q('INSERT INTO class_students (class_id, student_id) VALUES (?, ?)', [cidClass, sidStudent]);
        console.log('Assigned student', sidStudent, 'to class', cidClass);
      } else {
        console.log('Assignment exists student', sidStudent, 'class', cidClass);
      }
    }

    // ===== 7) REWARDS: crear 10 =====
    for (let i = 1; i <= 10; i++) {
      const rname = `Premio ${i}`;
      const rows = await q('SELECT id FROM rewards WHERE name = ?', [rname]);
      if (rows.length === 0) {
        await q('INSERT INTO rewards (name, description, cost) VALUES (?, ?, ?)', [rname, `Descripción ${i}`, i * 10]);
        console.log('Inserted reward', rname);
      } else {
        console.log('Reward exists', rname);
      }
    }

    console.log('Seed finished');
    process.exit(0);
  } catch (err) {
    console.error('Seed error', err);
    process.exit(1);
  }
})();
