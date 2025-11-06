// Script para crear un profesor de prueba
import mysql from 'mysql2';
import bcrypt from 'bcryptjs';

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'playful_learning'
});

connection.connect(async (err) => {
    if (err) {
        console.error('Error al conectar a MySQL:', err);
        process.exit(1);
    }
    console.log('Conexión a MySQL exitosa.');
    
    try {
        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash('profesor123', 10);
        
        // Insertar profesor de prueba
        const sql = `
            INSERT INTO teachers (name, email, password, school_id)
            VALUES ('Prof. Carlos Martínez', 'profesor@gmail.com', ?, NULL)
            ON DUPLICATE KEY UPDATE name = 'Prof. Carlos Martínez'
        `;
        
        connection.query(sql, [hashedPassword], (error) => {
            if (error) {
                console.error('Error al crear profesor:', error);
                connection.end();
                process.exit(1);
            }
            
            console.log('✅ Profesor de prueba creado exitosamente!');
            console.log('   Email: profesor@gmail.com');
            console.log('   Contraseña: profesor123');
            console.log('');
            console.log('Ahora puedes iniciar sesión como profesor y:');
            console.log('   - Ver todos los estudiantes registrados');
            console.log('   - Asignar estudiantes a tus clases');
            console.log('   - Asignar Learncoins a estudiantes');
            console.log('   - Registrar evidencias y calificaciones');
            console.log('   - Dar retroalimentación personalizada');
            
            connection.end();
            process.exit(0);
        });
    } catch (error) {
        console.error('Error:', error);
        connection.end();
        process.exit(1);
    }
});
