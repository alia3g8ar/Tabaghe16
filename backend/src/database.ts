import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'test_db',
    waitForConnections: true,
    connectionLimit: 10,
});
