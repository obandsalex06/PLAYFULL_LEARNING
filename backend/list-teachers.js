// Script para ver todos los profesores
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
    
    console.log('👨‍🏫 Profesores registrados:\n');
    
    connection.query(
        'SELECT id, name, email FROM teachers ORDER BY id',
        (err, results) => {
            if (err) {
                console.error('Error:', err);
                connection.end();
                process.exit(1);
            }

            console.log('Total:', results.length);
            console.log('─'.repeat(80));
            
            results.forEach(t => {
                console.log(`ID: ${t.id}`);
                console.log(`Nombre: ${t.name}`);
                console.log(`Email: ${t.email}`);
                console.log('─'.repeat(80));
            });

            connection.end();
            process.exit(0);
        }
    );
});
