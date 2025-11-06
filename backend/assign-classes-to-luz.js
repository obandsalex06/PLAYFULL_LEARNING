// Script para asignar clases al profesor Luz
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
    
    console.log('Asignando clases al profesor Luz (ID: 10)...\n');
    
    // Asignar las clases 1, 2, 3 al profesor con ID 10
    const sql = `
        UPDATE classes 
        SET teacher_id = 10
        WHERE id IN (1, 2, 3)
    `;

    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Error al asignar clases:', error);
            connection.end();
            process.exit(1);
        }

        console.log('✅ Clases asignadas exitosamente!');
        console.log('   Clases actualizadas:', results.affectedRows);
        console.log('');
        console.log('El profesor Luz (luz@gmail.com) ahora tiene acceso a:');
        console.log('   - Clase ID 1: Matematicas');
        console.log('   - Clase ID 2: Quimica');
        console.log('   - Clase ID 3: Historia');

        connection.end();
        process.exit(0);
    });
});
