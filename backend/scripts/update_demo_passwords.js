// Script para actualizar las contraseñas de usuarios demo
import bcrypt from 'bcryptjs';
import connection from '../config/db.js';

const users = [
    { table: 'admins', email: 'admin1@demo.com', password: 'Admin@2024!' },
    { table: 'teachers', email: 'teacher1@demo.com', password: 'Teacher@2024!' },
    { table: 'students', email: 'student1@demo.com', password: 'Student@2024!' },
    { table: 'secretaries', email: 'secretary1@demo.com', password: 'Secretary@2024!' }
];

async function updatePasswords() {
    console.log('🔄 Actualizando contraseñas de usuarios demo...\n');

    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        connection.query(
            `UPDATE ${user.table} SET password = ? WHERE email = ?`,
            [hashedPassword, user.email],
            (err, results) => {
                if (err) {
                    console.error(`❌ Error actualizando ${user.email}:`, err);
                } else {
                    console.log(`✅ ${user.table.toUpperCase().slice(0, -1)}: ${user.email} | Contraseña: ${user.password}`);
                }
            }
        );
    }

    setTimeout(() => {
        console.log('\n✅ Contraseñas actualizadas correctamente!');
        console.log('\n📋 CREDENCIALES DE ACCESO:');
        console.log('━'.repeat(60));
        console.log('👤 ADMIN:      admin1@demo.com      | Admin@2024!');
        console.log('👨‍🏫 DOCENTE:    teacher1@demo.com    | Teacher@2024!');
        console.log('👨‍🎓 ESTUDIANTE: student1@demo.com    | Student@2024!');
        console.log('📋 SECRETARIA:  secretary1@demo.com  | Secretary@2024!');
        console.log('━'.repeat(60));
        connection.end();
        process.exit(0);
    }, 1000);
}

updatePasswords();
