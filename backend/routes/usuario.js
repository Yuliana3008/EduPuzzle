const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const verificarToken = require('../middleware/auth');

// OBTENER PROGRESO DEL USUARIO
router.get('/progreso', verificarToken, async (req, res) => {
  try {
    const { usuarioId } = req;

    const usuarioResult = await pool.query(
      'SELECT nivel, puntos_totales, racha_dias FROM usuarios WHERE id = $1',
      [usuarioId]
    );

    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuario = usuarioResult.rows[0];

    const insigniasResult = await pool.query(
      'SELECT COUNT(*) as total FROM insignias WHERE usuario_id = $1',
      [usuarioId]
    );

    const trofeosResult = await pool.query(
      'SELECT COUNT(*) as total FROM trofeos WHERE usuario_id = $1',
      [usuarioId]
    );

    const mundosResult = await pool.query(
      `SELECT mundo_id as "mundoId", desbloqueado, progreso, nivel_actual as "nivelActual"
       FROM progreso_mundos 
       WHERE usuario_id = $1
       ORDER BY mundo_id`,
      [usuarioId]
    );

    let mundos = mundosResult.rows;

    if (mundos.length === 0) {
      await pool.query(
        'INSERT INTO progreso_mundos (usuario_id, mundo_id, desbloqueado, progreso, nivel_actual) VALUES ($1, 1, true, 0, 1)',
        [usuarioId]
      );
      mundos = [{ mundoId: 1, desbloqueado: true, progreso: 0, nivelActual: 1 }];
    }

    const mundosDesbloqueados = mundos.filter(m => m.desbloqueado);
    const progresoGeneral = mundosDesbloqueados.length > 0
      ? Math.round(mundosDesbloqueados.reduce((sum, m) => sum + m.progreso, 0) / mundosDesbloqueados.length)
      : 0;

    res.json({
      nivel: usuario.nivel || 1,
      puntosTotales: usuario.puntos_totales || 0,
      racha: usuario.racha_dias || 0,
      insignias: parseInt(insigniasResult.rows[0].total),
      trofeos: parseInt(trofeosResult.rows[0].total),
      progresoGeneral,
      mundos: mundos
    });

  } catch (error) {
    console.error('Error al obtener progreso:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;