const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",          // cambia esto
  host: "localhost",
  database: "EduPuzzle", // cambia esto
  password: "machuelos",    // cambia esto
  port: 5432,
});

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Error conectando a PostgreSQL:", err.message);
  } else {
    console.log("Conexión exitosa a PostgreSQL:", res.rows);
  }
  pool.end();
});
