// Script para verificar las clases
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
    
    console.log('📊 Verificando clases en la base de datos...\n');
    
    connection.query(
        `SELECT c.id, c.name, c.teacher_id, t.name as teacher_name, t.email as teacher_email
         FROM classes c 
         LEFT JOIN teachers t ON c.teacher_id = t.id`,
        (err, results) => {
            if (err) {
                console.error('Error:', err);
                connection.end();
                process.exit(1);
            }

            console.log('Clases encontradas:', results.length);
            console.log('─'.repeat(80));
            
            results.forEach(c => {
                console.log(`ID: ${c.id}`);
                console.log(`Nombre: ${c.name}`);
                console.log(`Teacher ID: ${c.teacher_id || 'Sin asignar'}`);
                console.log(`Teacher: ${c.teacher_name || 'Sin asignar'}`);
                console.log(`Email: ${c.teacher_email || 'N/A'}`);
                console.log('─'.repeat(80));
            });

            connection.end();
            process.exit(0);
        }
    );
});
