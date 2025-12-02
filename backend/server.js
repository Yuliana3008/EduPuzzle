const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // Importado para tokens de sesión

const app = express();
// Configuración de CORS para permitir la comunicación con el frontend (ej. puerto 5173)
app.use(cors({
    origin: 'http://localhost:5173' // Ajusta esto si tu frontend de Vite usa otro puerto
}));
app.use(express.json());

// Clave Secreta para firmar los Tokens JWT
// ¡IMPORTANTE! Cambia esto por una cadena larga y compleja y guárdala de forma segura.
const JWT_SECRET = 'TU_CLAVE_SECRETA_SUPER_SEGURA_2024_EDUPUZZLE'; 

// Conexión a PostgreSQL (tus credenciales)
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "EduPuzzle",
  password: "machuelos",
  port: 5432,
});

// --- RUTA DE REGISTRO (/register) ---
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ msg: "Todos los campos son obligatorios" });
  }

  try {
    // Verificar si el usuario ya existe
    const existingUser = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
        return res.status(409).json({ msg: "Este correo electrónico ya está registrado." });
    }

    // Hashear contraseña (encriptación de 10 rondas)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario en la BD
    // NOTA: Asume que tu tabla 'usuarios' tiene las columnas 'username', 'email', y 'password'
    await pool.query(
      "INSERT INTO usuarios (username, email, password) VALUES ($1, $2, $3)",
      [username, email, hashedPassword]
    );

    res.json({ msg: "Usuario registrado correctamente" });
  } catch (err) {
    // Log el error completo del sistema para depuración
    console.error("Error en el registro (BD/Sistema):", err.message);
    res.status(500).json({ msg: "Error al registrar usuario" });
  }
});

// --- RUTA DE INICIO DE SESIÓN (/api/login) ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Correo electrónico y contraseña son requeridos.' });
  }

  try {
    // 1. Buscar usuario por email.
    // CORRECCIÓN: Cambiado 'user_id' a 'id' para que coincida con tu esquema de BD.
    const result = await pool.query('SELECT id, email, password, username FROM usuarios WHERE email = $1', [email]);
    
    const user = result.rows[0];

    if (!user) {
      // 2. Usuario no encontrado
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // 3. Verificar la contraseña ingresada contra el hash guardado en la BD
    const isPasswordValid = await bcrypt.compare(password, user.password); // Compara el texto plano con el hash

    if (!isPasswordValid) {
      // 4. Contraseña incorrecta
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // 5. Si es válido: Crear un token de sesión (JWT)
    // Se usa user.id (de la BD) para el campo userId del token.
    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' } // El token expira en 1 hora
    );

    // 6. Respuesta exitosa
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token, // Envía el token al frontend para mantener la sesión
      username: user.username,
    });

  } catch (err) {
    // Log el error completo del sistema para depuración
    console.error('Error en el inicio de sesión (BD/Sistema):', err.message);
    // Cambiamos el mensaje para que el usuario sepa que es un problema interno
    res.status(500).json({ message: 'Error interno del servidor. Por favor, revisa la consola del backend.' });
  }
});

// Iniciar servidor
const PORT = 3001; // Tu puerto actual
app.listen(PORT, () => {
  console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});