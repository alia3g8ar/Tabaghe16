import { pool } from './database';

const testDB = async () => {
    try {
        await pool.query('SELECT 1');
        console.log('✅ MySQL Connected');
        process.exit(0);
    } catch (err) {
        console.error('❌ DB Error:', err);
        process.exit(1);
    }
};

void testDB();
