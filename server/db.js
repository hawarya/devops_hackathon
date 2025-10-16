// db.js
const mysql = require('mysql2');
require("dotenv").config();

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.HOST,
    user: process.env.DEV,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("✅ Joined to the database");
    connection.release(); // release connection back to pool
});

process.on('exit', () => {
    pool.end();
});

module.exports = pool;
