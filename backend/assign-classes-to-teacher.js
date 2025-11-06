// Script para asignar las clases existentes al profesor
import mysql from 'mysql2';

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'playful_learning'
});

connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a MySQL:', err);
        process.exit(1);
    }
    console.log('Conexión a MySQL exitosa.');
    
    // Primero obtener el ID del profesor
    connection.query(
        "SELECT id FROM teachers WHERE email = 'profesor@gmail.com'",
        (err, teachers) => {
            if (err) {
                console.error('Error al buscar profesor:', err);
                connection.end();
                process.exit(1);
            }

            if (teachers.length === 0) {
                console.error('No se encontró el profesor con email profesor@gmail.com');
                connection.end();
                process.exit(1);
            }

            const teacherId = teachers[0].id;
            console.log('Profesor encontrado con ID:', teacherId);

            // Actualizar las clases existentes para que pertenezcan al profesor
            const sql = `
                UPDATE classes 
                SET teacher_id = ?
                WHERE id IN (1, 2, 3)
            `;

            connection.query(sql, [teacherId], (error, results) => {
                if (error) {
                    console.error('Error al asignar clases:', error);
                    connection.end();
                    process.exit(1);
                }

                console.log('✅ Clases asignadas exitosamente al profesor!');
                console.log('   Clases actualizadas:', results.affectedRows);
                console.log('');
                console.log('El profesor ahora tiene acceso a:');
                console.log('   - Matemáticas');
                console.log('   - Ciencias Naturales');
                console.log('   - Historia');

                connection.end();
                process.exit(0);
            });
        }
    );
});
