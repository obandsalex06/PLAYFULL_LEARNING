// Script para insertar datos de prueba (clases y evidencias)
import mysql from 'mysql2';

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'playful_learning',
    multipleStatements: true
});

connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a MySQL:', err);
        process.exit(1);
    }
    console.log('Conexión a MySQL exitosa.');
    
    // SQL para insertar datos de prueba
    const sql = `
        -- Insertar un profesor de prueba si no existe
        INSERT IGNORE INTO teachers (id, name, email, password, school_id)
        VALUES (1, 'Prof. María González', 'maria@gmail.com', 'password123', NULL);

        -- Insertar clases de prueba
        INSERT IGNORE INTO classes (id, name, description, teacher_id, school_id)
        VALUES 
        (1, 'Matemáticas', 'Curso de matemáticas nivel secundaria', 1, NULL),
        (2, 'Ciencias Naturales', 'Estudio de biología y física', 1, NULL),
        (3, 'Historia', 'Historia mundial y local', 1, NULL);

        -- Asignar el estudiante ID 16 (Rogelio) a las clases
        INSERT IGNORE INTO class_students (class_id, student_id)
        VALUES 
        (1, 16),
        (2, 16),
        (3, 16);

        -- Insertar evidencias de prueba para el estudiante
        INSERT IGNORE INTO evidences (id, student_id, class_id, file_url, description, status)
        VALUES 
        (1, 16, 1, 'https://ejemplo.com/tarea1.pdf', 'Tarea de ecuaciones cuadráticas', 'aprobado'),
        (2, 16, 2, 'https://ejemplo.com/experimento.pdf', 'Reporte de experimento de física', 'pendiente'),
        (3, 16, 1, 'https://ejemplo.com/ejercicios.pdf', 'Ejercicios de álgebra', 'aprobado'),
        (4, 16, 3, NULL, 'Ensayo sobre la Segunda Guerra Mundial', 'rechazado');
    `;
    
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Error al insertar datos de prueba:', error);
            connection.end();
            process.exit(1);
        }
        
        console.log('✅ Datos de prueba insertados exitosamente!');
        console.log('   - 3 clases creadas');
        console.log('   - Estudiante Rogelio (ID: 16) asignado a las clases');
        console.log('   - 4 evidencias de prueba creadas');
        
        connection.end();
        process.exit(0);
    });
});
