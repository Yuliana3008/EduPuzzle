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

// OBTENER PERFIL COMPLETO DEL USUARIO
router.get('/perfil', verificarToken, async (req, res) => {
  try {
    const { usuarioId } = req;

    // Obtener datos del usuario
    const usuarioResult = await pool.query(
      `SELECT id, username, email, avatar, nivel, puntos_totales, racha_dias, 
              fecha_registro 
       FROM usuarios 
       WHERE id = $1`,
      [usuarioId]
    );

    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuario = usuarioResult.rows[0];

    // Obtener configuración del usuario
    const configResult = await pool.query(
      `SELECT sonido, musica, notificaciones, modo_oscuro, dificultad
       FROM configuracion_usuario
       WHERE usuario_id = $1`,
      [usuarioId]
    );

    let configuracion = {
      sonido: true,
      musica: true,
      notificaciones: true,
      modo_oscuro: false,
      dificultad: 'medio'
    };

    // Si existe configuración, usarla
    if (configResult.rows.length > 0) {
      configuracion = configResult.rows[0];
    } else {
      // Si no existe, crear una nueva
      await pool.query(
        `INSERT INTO configuracion_usuario (usuario_id) VALUES ($1)`,
        [usuarioId]
      );
    }

    // Obtener cantidad de insignias
    const insigniasResult = await pool.query(
      'SELECT COUNT(*) as total FROM insignias WHERE usuario_id = $1',
      [usuarioId]
    );

    res.json({
      id: usuario.id,
      username: usuario.username,
      email: usuario.email,
      avatar: usuario.avatar || '🧑‍🎓',
      nivel: usuario.nivel || 1,
      puntos: usuario.puntos_totales || 0,
      racha: usuario.racha_dias || 0,
      insignias: parseInt(insigniasResult.rows[0].total),
      fechaRegistro: usuario.fecha_registro,
      configuracion: configuracion
    });

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ACTUALIZAR PERFIL DEL USUARIO
router.put('/perfil', verificarToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { usuarioId } = req;
    const { username, avatar, configuracion } = req.body;

    await client.query('BEGIN');

    // Actualizar datos básicos del usuario
    if (username || avatar) {
      const updateFields = [];
      const updateValues = [];
      let valueIndex = 1;

      if (username) {
        updateFields.push(`username = $${valueIndex}`);
        updateValues.push(username);
        valueIndex++;
      }

      if (avatar) {
        updateFields.push(`avatar = $${valueIndex}`);
        updateValues.push(avatar);
        valueIndex++;
      }

      updateValues.push(usuarioId);

      await client.query(
        `UPDATE usuarios SET ${updateFields.join(', ')} WHERE id = $${valueIndex}`,
        updateValues
      );
    }

    // Actualizar configuración
    if (configuracion) {
      const { sonido, musica, notificaciones, modo_oscuro, dificultad } = configuracion;

      await client.query(
        `UPDATE configuracion_usuario 
         SET sonido = $1, musica = $2, notificaciones = $3, 
             modo_oscuro = $4, dificultad = $5, 
             fecha_actualizacion = CURRENT_TIMESTAMP
         WHERE usuario_id = $6`,
        [sonido, musica, notificaciones, modo_oscuro, dificultad, usuarioId]
      );
    }

    await client.query('COMMIT');

    res.json({ 
      mensaje: 'Perfil actualizado correctamente' 
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    client.release();
  }
});



// OBTENER RECOMPENSAS DEL USUARIO
router.get('/recompensas', verificarToken, async (req, res) => {
  try {
    const { usuarioId } = req;

    // 1. Obtener todas las insignias del catálogo con estado de obtención
    const insigniasResult = await pool.query(
      `SELECT 
        ci.id,
        ci.nombre,
        ci.descripcion,
        ci.emoji,
        ci.mundo,
        ci.color,
        ci.nivel_requerido,
        ci.puntos_requeridos,
        CASE WHEN ui.id IS NOT NULL THEN TRUE ELSE FALSE END as obtenido,
        ui.fecha_obtencion
       FROM catalogo_insignias ci
       LEFT JOIN usuario_insignias ui ON ci.id = ui.insignia_id AND ui.usuario_id = $1
       ORDER BY ci.mundo, ci.nivel_requerido`,
      [usuarioId]
    );

    // 2. Obtener trofeos de mundo con progreso
    const trofeosResult = await pool.query(
      `SELECT 
        tm.mundo,
        tm.completado,
        tm.fecha_completado,
        COALESCE(pm.progreso, 0) as progreso
       FROM trofeos_mundo tm
       LEFT JOIN progreso_mundos pm ON tm.usuario_id = pm.usuario_id 
         AND (
           (tm.mundo = 'Biología' AND pm.mundo_id = 1) OR
           (tm.mundo = 'Geografía' AND pm.mundo_id = 2) OR
           (tm.mundo = 'Ciencias Naturales' AND pm.mundo_id = 3)
         )
       WHERE tm.usuario_id = $1
       ORDER BY tm.mundo`,
      [usuarioId]
    );

    // Mapear emojis a cada mundo
    const mundoEmojis = {
      'Biología': '🌿',
      'Geografía': '🌍',
      'Ciencias Naturales': '🔬'
    };

    const mundoColors = {
      'Biología': 'emerald',
      'Geografía': 'blue',
      'Ciencias Naturales': 'orange'
    };

    const trofeos = trofeosResult.rows.map(t => ({
      mundo: t.mundo,
      emoji: mundoEmojis[t.mundo] || '🏆',
      color: mundoColors[t.mundo] || 'emerald',
      completado: t.completado,
      progreso: t.progreso || 0,
      fechaCompletado: t.fecha_completado
    }));

    // 3. Obtener colección especial
    const coleccionResult = await pool.query(
      `SELECT pieza_numero, obtenido, fecha_obtencion
       FROM coleccion_especial
       WHERE usuario_id = $1
       ORDER BY pieza_numero`,
      [usuarioId]
    );

    const coleccion = coleccionResult.rows.map(p => ({
      id: p.pieza_numero,
      nombre: `Pieza ${p.pieza_numero}/5`,
      emoji: '🧩',
      obtenido: p.obtenido,
      fechaObtencion: p.fecha_obtencion
    }));

    // 4. Calcular estadísticas
    const totalInsignias = insigniasResult.rows.length;
    const insigniasObtenidas = insigniasResult.rows.filter(i => i.obtenido).length;
    const piezasObtenidas = coleccion.filter(p => p.obtenido).length;

    res.json({
      insignias: insigniasResult.rows,
      trofeos: trofeos,
      coleccion: coleccion,
      estadisticas: {
        totalInsignias,
        insigniasObtenidas,
        piezasObtenidas,
        totalPiezas: 5
      }
    });

  } catch (error) {
    console.error('Error al obtener recompensas:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// OTORGAR INSIGNIA A USUARIO
router.post('/recompensas/insignia', verificarToken, async (req, res) => {
  try {
    const { usuarioId } = req;
    const { insigniaId } = req.body;

    // Verificar que la insignia existe
    const insigniaResult = await pool.query(
      'SELECT * FROM catalogo_insignias WHERE id = $1',
      [insigniaId]
    );

    if (insigniaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Insignia no encontrada' });
    }

    // Otorgar insignia (si no la tiene ya)
    await pool.query(
      `INSERT INTO usuario_insignias (usuario_id, insignia_id)
       VALUES ($1, $2)
       ON CONFLICT (usuario_id, insignia_id) DO NOTHING`,
      [usuarioId, insigniaId]
    );

    res.json({ mensaje: 'Insignia otorgada correctamente' });

  } catch (error) {
    console.error('Error al otorgar insignia:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// COMPLETAR MUNDO (Otorgar trofeo)
router.post('/recompensas/trofeo', verificarToken, async (req, res) => {
  try {
    const { usuarioId } = req;
    const { mundo } = req.body;

    await pool.query(
      `UPDATE trofeos_mundo 
       SET completado = TRUE, fecha_completado = CURRENT_TIMESTAMP
       WHERE usuario_id = $1 AND mundo = $2`,
      [usuarioId, mundo]
    );

    res.json({ mensaje: 'Trofeo otorgado correctamente' });

  } catch (error) {
    console.error('Error al otorgar trofeo:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// OBTENER PIEZA DE COLECCIÓN
router.post('/recompensas/pieza', verificarToken, async (req, res) => {
  try {
    const { usuarioId } = req;
    const { piezaNumero } = req.body;

    if (piezaNumero < 1 || piezaNumero > 5) {
      return res.status(400).json({ error: 'Número de pieza inválido' });
    }

    await pool.query(
      `UPDATE coleccion_especial 
       SET obtenido = TRUE, fecha_obtencion = CURRENT_TIMESTAMP
       WHERE usuario_id = $1 AND pieza_numero = $2`,
      [usuarioId, piezaNumero]
    );

    res.json({ mensaje: 'Pieza obtenida correctamente' });

  } catch (error) {
    console.error('Error al obtener pieza:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});
module.exports = router;