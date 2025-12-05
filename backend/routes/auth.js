const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// REGISTRO
router.post('/registro', async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const existingUser = await client.query(
      'SELECT id FROM usuarios WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'El usuario o email ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await client.query(
      'INSERT INTO usuarios (username, email, password, nivel, puntos_totales, racha_dias) VALUES ($1, $2, $3, 1, 0, 0) RETURNING id',
      [username, email, hashedPassword]
    );

    const userId = result.rows[0].id;

    await client.query(
      'INSERT INTO progreso_mundos (usuario_id, mundo_id, desbloqueado, progreso, nivel_actual) VALUES ($1, 1, true, 0, 1)',
      [userId]
    );

    await client.query('COMMIT');

    res.status(201).json({ 
      mensaje: 'Usuario registrado exitosamente',
      userId: userId 
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    client.release();
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE username = $1',
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const user = result.rows[0];
    
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const token = jwt.sign(
      { 
        usuarioId: user.id, 
        username: user.username 
      },
      process.env.JWT_SECRET || 'mi-clave-secreta-123',
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      username: user.username,
      mensaje: 'Login exitoso'
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;