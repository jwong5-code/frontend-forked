// src/database.js
require("dotenv").config();
const { createPool, createConnection } = require("mysql2");

const pool = createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Jw7789975088",
  database: process.env.DB_NAME || "patients_storage"
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database.");
  if (connection) connection.release();
});

module.exports = pool;
