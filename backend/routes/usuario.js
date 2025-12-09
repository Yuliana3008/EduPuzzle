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

// OBTENER ESTADÍSTICAS DEL USUARIO
router.get('/estadisticas', verificarToken, async (req, res) => {
  try {
    const { usuarioId } = req;

    // 1. Obtener datos básicos del usuario
    const usuarioResult = await pool.query(
      `SELECT nivel, puntos_totales, racha_dias, fecha_registro
       FROM usuarios 
       WHERE id = $1`,
      [usuarioId]
    );

    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuario = usuarioResult.rows[0];

    // 2. Calcular niveles completados
    const nivelesResult = await pool.query(
      `SELECT COUNT(DISTINCT nivel_numero) as completados
       FROM historial_niveles
       WHERE usuario_id = $1`,
      [usuarioId]
    );

    const nivelesCompletados = parseInt(nivelesResult.rows[0].completados) || 0;

    // 3. Calcular tiempo total de estudio
    const tiempoResult = await pool.query(
      `SELECT COALESCE(SUM(tiempo_segundos), 0) as tiempo_total,
              COALESCE(AVG(tiempo_segundos), 0) as tiempo_promedio
       FROM historial_niveles
       WHERE usuario_id = $1`,
      [usuarioId]
    );

    const tiempoTotal = parseInt(tiempoResult.rows[0].tiempo_total) || 0;
    const tiempoPromedio = Math.round(tiempoResult.rows[0].tiempo_promedio) || 0;

    // 4. Calcular mejor racha (simulado por ahora)
    const mejorRacha = Math.max(usuario.racha_dias, 12); // Placeholder

    // 5. Obtener cantidad de insignias
    const insigniasResult = await pool.query(
      'SELECT COUNT(*) as total FROM usuario_insignias WHERE usuario_id = $1',
      [usuarioId]
    );

    const insignias = parseInt(insigniasResult.rows[0].total) || 0;

    // 6. Obtener progreso por mundo
    const progresoResult = await pool.query(
      `SELECT 
        pm.mundo_id,
        CASE 
          WHEN pm.mundo_id = 1 THEN 'Biología'
          WHEN pm.mundo_id = 2 THEN 'Geografía'
          WHEN pm.mundo_id = 3 THEN 'Ciencias Naturales'
        END as mundo,
        CASE 
          WHEN pm.mundo_id = 1 THEN 'emerald'
          WHEN pm.mundo_id = 2 THEN 'blue'
          WHEN pm.mundo_id = 3 THEN 'orange'
        END as color,
        pm.progreso,
        COUNT(DISTINCT hn.nivel_numero) as completados,
        5 as total
       FROM progreso_mundos pm
       LEFT JOIN historial_niveles hn ON pm.usuario_id = hn.usuario_id 
         AND pm.mundo_id = hn.mundo_id
       WHERE pm.usuario_id = $1
       GROUP BY pm.mundo_id, pm.progreso
       ORDER BY pm.mundo_id`,
      [usuarioId]
    );

    const progresoMundos = progresoResult.rows.map(p => ({
      mundo: p.mundo,
      color: p.color,
      completados: parseInt(p.completados),
      total: p.total,
      porcentaje: p.progreso || 0
    }));

    // 7. Obtener historial reciente de niveles
    const historialResult = await pool.query(
      `SELECT 
        hn.nivel_nombre as nivel,
        hn.tiempo_segundos,
        hn.movimientos,
        hn.estrellas,
        hn.fecha_completado,
        CASE 
          WHEN hn.mundo_id = 1 THEN 'emerald'
          WHEN hn.mundo_id = 2 THEN 'blue'
          WHEN hn.mundo_id = 3 THEN 'orange'
        END as mundo_color
       FROM historial_niveles hn
       WHERE hn.usuario_id = $1
       ORDER BY hn.fecha_completado DESC
       LIMIT 10`,
      [usuarioId]
    );

    const historial = historialResult.rows.map(h => {
      const mins = Math.floor(h.tiempo_segundos / 60);
      const secs = h.tiempo_segundos % 60;
      return {
        nivel: h.nivel,
        mundoColor: h.mundo_color,
        tiempo: `${mins}:${secs.toString().padStart(2, '0')}`,
        movimientos: h.movimientos,
        estrellas: h.estrellas,
        fecha: h.fecha_completado
      };
    });

    // 8. Encontrar mundo favorito (más jugado)
    const mundoFavoritoResult = await pool.query(
      `SELECT 
        CASE 
          WHEN mundo_id = 1 THEN 'Biología'
          WHEN mundo_id = 2 THEN 'Geografía'
          WHEN mundo_id = 3 THEN 'Ciencias Naturales'
        END as mundo,
        COUNT(*) as veces
       FROM historial_niveles
       WHERE usuario_id = $1
       GROUP BY mundo_id
       ORDER BY veces DESC
       LIMIT 1`,
      [usuarioId]
    );

    const mundoFavorito = mundoFavoritoResult.rows[0]?.mundo || 'Biología';

    res.json({
      estadisticas: {
        nivelesCompletados,
        nivelesTotal: 12,
        tiempoTotal,
        promedioTiempo: tiempoPromedio,
        puntajeTotal: usuario.puntos_totales || 0,
        racha: usuario.racha_dias || 0,
        mejorRacha,
        insignias,
        mundoFavorito
      },
      historialNiveles: historial,
      progresoMundos
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// REGISTRAR NIVEL COMPLETADO
router.post('/estadisticas/nivel', verificarToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { usuarioId } = req;
    const { mundoId, nivelNumero, nivelNombre, tiempoSegundos, movimientos, estrellas, puntosGanados } = req.body;

    await client.query('BEGIN');

    // 1. Registrar en historial
    await client.query(
      `INSERT INTO historial_niveles 
       (usuario_id, mundo_id, nivel_numero, nivel_nombre, tiempo_segundos, movimientos, estrellas)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [usuarioId, mundoId, nivelNumero, nivelNombre, tiempoSegundos, movimientos, estrellas]
    );

    // 2. Actualizar puntos del usuario
    if (puntosGanados) {
      await client.query(
        `UPDATE usuarios 
         SET puntos_totales = puntos_totales + $1
         WHERE id = $2`,
        [puntosGanados, usuarioId]
      );
    }

    // 3. Verificar si ganó insignia (ejemplo: 50 puntos = primera insignia)
    const puntosResult = await client.query(
      'SELECT puntos_totales FROM usuarios WHERE id = $1',
      [usuarioId]
    );
    
    const puntosActuales = puntosResult.rows[0].puntos_totales;

    // Otorgar insignia si alcanzó 50 puntos y es del mundo correcto
    if (puntosActuales >= 50 && mundoId === 1) {
      await client.query(
        `INSERT INTO usuario_insignias (usuario_id, insignia_id)
         VALUES ($1, 1)
         ON CONFLICT (usuario_id, insignia_id) DO NOTHING`,
        [usuarioId]
      );
    }

    await client.query('COMMIT');

    res.json({ 
      mensaje: 'Nivel completado registrado',
      insigniaDesbloqueada: puntosActuales >= 50 && mundoId === 1
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al registrar nivel:', error);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    client.release();
  }
});

// OBTENER NIVELES DE UN MUNDO
router.get('/mundos/:mundoId/niveles', verificarToken, async (req, res) => {
  try {
    const { usuarioId } = req;
    const { mundoId } = req.params;

    // 1. Obtener información del mundo
    const mundoInfo = {
      1: { nombre: 'Biología', emoji: '🌿', color: 'emerald', descripcion: 'Explora el fascinante mundo de los seres vivos' },
      2: { nombre: 'Geografía', emoji: '🌍', color: 'blue', descripcion: 'Descubre los secretos de nuestro planeta' },
      3: { nombre: 'Ciencias Naturales', emoji: '🔬', color: 'orange', descripcion: 'Experimenta con física y química' }
    };

    const mundo = mundoInfo[mundoId];
    if (!mundo) {
      return res.status(404).json({ error: 'Mundo no encontrado' });
    }

    // 2. Obtener todos los niveles del mundo con el progreso del usuario
    const nivelesResult = await pool.query(
      `SELECT 
        cn.id,
        cn.numero_nivel as numero,
        cn.nombre,
        cn.descripcion,
        cn.puntos_recompensa as puntos,
        COALESCE(un.completado, FALSE) as completado,
        COALESCE(un.estrellas, 0) as estrellas,
        COALESCE(un.desbloqueado, FALSE) as desbloqueado,
        COALESCE(un.puntos_ganados, 0) as puntos_ganados
       FROM catalogo_niveles cn
       LEFT JOIN usuario_niveles un ON cn.id = un.nivel_id AND un.usuario_id = $1
       WHERE cn.mundo_id = $2
       ORDER BY cn.orden`,
      [usuarioId, mundoId]
    );

    // 3. Calcular estadísticas del mundo
    const niveles = nivelesResult.rows;
    const totalNiveles = niveles.length;
    const nivelesCompletados = niveles.filter(n => n.completado).length;
    const progreso = Math.round((nivelesCompletados / totalNiveles) * 100);

    res.json({
      mundo: {
        id: parseInt(mundoId),
        nombre: mundo.nombre,
        emoji: mundo.emoji,
        color: mundo.color,
        descripcion: mundo.descripcion,
        progreso,
        nivelesCompletados,
        totalNiveles
      },
      niveles: niveles.map(n => ({
        id: n.numero,
        nivelDbId: n.id,
        nombre: n.nombre,
        descripcion: n.descripcion,
        completado: n.completado,
        estrellas: n.estrellas,
        desbloqueado: n.desbloqueado,
        puntos: n.puntos_ganados || n.puntos
      }))
    });

  } catch (error) {
    console.error('Error al obtener niveles:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// COMPLETAR UN NIVEL
router.post('/mundos/:mundoId/niveles/:nivelId/completar', verificarToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { usuarioId } = req;
    const { mundoId, nivelId } = req.params;
    const { estrellas, tiempoSegundos, movimientos } = req.body;

    await client.query('BEGIN');

    // 1. Obtener información del nivel
    const nivelResult = await client.query(
      `SELECT id, puntos_recompensa, numero_nivel 
       FROM catalogo_niveles 
       WHERE mundo_id = $1 AND numero_nivel = $2`,
      [mundoId, nivelId]
    );

    if (nivelResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Nivel no encontrado' });
    }

    const nivel = nivelResult.rows[0];
    const puntosGanados = nivel.puntos_recompensa;

    // 2. Actualizar o insertar progreso del nivel
    await client.query(
      `INSERT INTO usuario_niveles (usuario_id, nivel_id, completado, estrellas, desbloqueado, puntos_ganados, fecha_completado)
       VALUES ($1, $2, TRUE, $3, TRUE, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (usuario_id, nivel_id) 
       DO UPDATE SET 
         completado = TRUE,
         estrellas = GREATEST(usuario_niveles.estrellas, $3),
         puntos_ganados = $4,
         fecha_completado = CURRENT_TIMESTAMP`,
      [usuarioId, nivel.id, estrellas, puntosGanados]
    );

    // 3. Registrar en historial
    const nombreNivel = nivelResult.rows[0].nombre || `Nivel ${nivelId}`;
    await client.query(
      `INSERT INTO historial_niveles 
       (usuario_id, mundo_id, nivel_numero, nivel_nombre, tiempo_segundos, movimientos, estrellas)
       VALUES ($1, $2, $3, (SELECT nombre FROM catalogo_niveles WHERE id = $4), $5, $6, $7)`,
      [usuarioId, mundoId, nivelId, nivel.id, tiempoSegundos, movimientos, estrellas]
    );

    // 4. Actualizar puntos del usuario
    await client.query(
      `UPDATE usuarios 
       SET puntos_totales = puntos_totales + $1
       WHERE id = $2`,
      [puntosGanados, usuarioId]
    );

    // 5. Desbloquear siguiente nivel
    const siguienteNivelResult = await client.query(
      `SELECT id FROM catalogo_niveles 
       WHERE mundo_id = $1 AND numero_nivel = $2`,
      [mundoId, parseInt(nivelId) + 1]
    );

    if (siguienteNivelResult.rows.length > 0) {
      const siguienteNivelId = siguienteNivelResult.rows[0].id;
      await client.query(
        `INSERT INTO usuario_niveles (usuario_id, nivel_id, desbloqueado)
         VALUES ($1, $2, TRUE)
         ON CONFLICT (usuario_id, nivel_id) 
         DO UPDATE SET desbloqueado = TRUE`,
        [usuarioId, siguienteNivelId]
      );
    }

    // 6. Verificar si completó el mundo (todos los niveles)
    const completadosResult = await client.query(
      `SELECT COUNT(*) as total_completados
       FROM usuario_niveles un
       JOIN catalogo_niveles cn ON un.nivel_id = cn.id
       WHERE un.usuario_id = $1 AND cn.mundo_id = $2 AND un.completado = TRUE`,
      [usuarioId, mundoId]
    );

    const totalNivelesResult = await client.query(
      `SELECT COUNT(*) as total FROM catalogo_niveles WHERE mundo_id = $1`,
      [mundoId]
    );

    const completados = parseInt(completadosResult.rows[0].total_completados);
    const total = parseInt(totalNivelesResult.rows[0].total);
    const mundoCompletado = completados === total;

    // 7. Si completó el mundo, otorgar trofeo
    if (mundoCompletado) {
      const mundoNombres = {
        1: 'Biología',
        2: 'Geografía',
        3: 'Ciencias Naturales'
      };

      await client.query(
        `UPDATE trofeos_mundo 
         SET completado = TRUE, fecha_completado = CURRENT_TIMESTAMP
         WHERE usuario_id = $1 AND mundo = $2`,
        [usuarioId, mundoNombres[mundoId]]
      );
    }

    // 8. Verificar si ganó insignia (ejemplo: primera insignia al completar primer nivel)
    if (parseInt(nivelId) === 1) {
      await client.query(
        `INSERT INTO usuario_insignias (usuario_id, insignia_id)
         SELECT $1, id FROM catalogo_insignias 
         WHERE mundo = (SELECT 
           CASE 
             WHEN $2 = 1 THEN 'Biología'
             WHEN $2 = 2 THEN 'Geografía'
             WHEN $2 = 3 THEN 'Ciencias Naturales'
           END)
         AND nivel_requerido = 1
         ON CONFLICT (usuario_id, insignia_id) DO NOTHING`,
        [usuarioId, mundoId]
      );
    }

    await client.query('COMMIT');

    res.json({
      mensaje: 'Nivel completado',
      puntosGanados,
      siguienteNivelDesbloqueado: siguienteNivelResult.rows.length > 0,
      mundoCompletado,
      insigniaDesbloqueada: parseInt(nivelId) === 1
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al completar nivel:', error);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    client.release();
  }
});


//
router.get('/mundos/:mundoId/niveles/:nivelId/datos', verificarToken, async (req, res) => {
  try {
    const { usuarioId } = req;
    const { mundoId, nivelId } = req.params;

    // 1. Obtener información del nivel
    const nivelResult = await pool.query(
      `SELECT 
        cn.id,
        cn.numero_nivel,
        cn.nombre,
        cn.descripcion,
        cn.imagen_url,
        cn.filas,
        cn.columnas,
        cn.puntos_recompensa,
        COALESCE(un.completado, FALSE) as completado,
        COALESCE(un.estrellas, 0) as estrellas,
        COALESCE(un.mejor_tiempo, 0) as mejor_tiempo,
        COALESCE(un.menor_movimientos, 0) as menor_movimientos
       FROM catalogo_niveles cn
       LEFT JOIN usuario_niveles un ON cn.id = un.nivel_id AND un.usuario_id = $1
       WHERE cn.mundo_id = $2 AND cn.numero_nivel = $3`,
      [usuarioId, mundoId, nivelId]
    );

    if (nivelResult.rows.length === 0) {
      return res.status(404).json({ error: 'Nivel no encontrado' });
    }

    const nivel = nivelResult.rows[0];

    // 2. Obtener preguntas del nivel
    const preguntasResult = await pool.query(
      `SELECT 
        id,
        orden,
        pregunta,
        opcion_1,
        opcion_2,
        opcion_3,
        opcion_4,
        respuesta_correcta,
        explicacion
       FROM nivel_preguntas
       WHERE nivel_id = $1
       ORDER BY orden`,
      [nivel.id]
    );

    // Formatear preguntas al formato esperado por el frontend
    const preguntas = preguntasResult.rows.map(p => ({
      id: p.id,
      pregunta: p.pregunta,
      opciones: [p.opcion_1, p.opcion_2, p.opcion_3, p.opcion_4],
      correcta: p.respuesta_correcta,
      explicacion: p.explicacion
    }));

    // 3. Determinar la recompensa según el mundo
    const recompensas = {
      1: { tipo: 'insignia', nombre: 'Explorador Celular', emoji: '🔬', puntos: 50 },
      2: { tipo: 'insignia', nombre: 'Explorador Mundial', emoji: '🗺️', puntos: 40 },
      3: { tipo: 'insignia', nombre: 'Científico Junior', emoji: '⚗️', puntos: 45 }
    };

    const recompensa = {
      ...recompensas[mundoId],
      descripcion: `¡Has dominado ${nivel.nombre}!`
    };

    res.json({
      nivel: {
        id: nivel.numero_nivel,
        nombre: nivel.nombre,
        descripcion: nivel.descripcion,
        imagen: nivel.imagen_url,
        filas: nivel.filas,
        columnas: nivel.columnas,
        completado: nivel.completado,
        estrellas: nivel.estrellas,
        mejorTiempo: nivel.mejor_tiempo,
        menorMovimientos: nivel.menor_movimientos
      },
      preguntas,
      recompensa
    });

  } catch (error) {
    console.error('Error al obtener datos del nivel:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// COMPLETAR NIVEL CON ROMPECABEZAS Y PREGUNTAS
router.post('/mundos/:mundoId/niveles/:nivelId/completar', verificarToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { usuarioId } = req;
    const { mundoId, nivelId } = req.params;
    const { 
      tiempoSegundos, 
      movimientos, 
      preguntasCorrectas, 
      totalPreguntas 
    } = req.body;

    await client.query('BEGIN');

    // 1. Obtener información del nivel
    const nivelResult = await client.query(
      `SELECT id, nombre, puntos_recompensa 
       FROM catalogo_niveles 
       WHERE mundo_id = $1 AND numero_nivel = $2`,
      [mundoId, nivelId]
    );

    if (nivelResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Nivel no encontrado' });
    }

    const nivel = nivelResult.rows[0];

    // 2. Calcular estrellas (basado en preguntas correctas)
    let estrellas = 0;
    if (preguntasCorrectas === totalPreguntas) {
      estrellas = 3;
    } else if (preguntasCorrectas >= totalPreguntas * 0.66) {
      estrellas = 2;
    } else if (preguntasCorrectas >= totalPreguntas * 0.33) {
      estrellas = 1;
    }

    // 3. Verificar si es un nuevo récord personal
    const progresoActualResult = await client.query(
      `SELECT mejor_tiempo, menor_movimientos, puntos_ganados, completado
       FROM usuario_niveles
       WHERE usuario_id = $1 AND nivel_id = $2`,
      [usuarioId, nivel.id]
    );

    let esNuevoRecordTiempo = true;
    let esNuevoRecordMovimientos = true;
    let puntosAdicionales = 0;

    if (progresoActualResult.rows.length > 0) {
      const anterior = progresoActualResult.rows[0];
      esNuevoRecordTiempo = anterior.mejor_tiempo === null || tiempoSegundos < anterior.mejor_tiempo;
      esNuevoRecordMovimientos = anterior.menor_movimientos === null || movimientos < anterior.menor_movimientos;
      
      // Si ya había completado, dar puntos reducidos (25%)
      if (anterior.completado) {
        puntosAdicionales = Math.floor(nivel.puntos_recompensa * 0.25);
      } else {
        puntosAdicionales = nivel.puntos_recompensa;
      }
    } else {
      puntosAdicionales = nivel.puntos_recompensa;
    }

    // 4. Actualizar o insertar progreso del nivel
    await client.query(
      `INSERT INTO usuario_niveles 
       (usuario_id, nivel_id, completado, estrellas, mejor_tiempo, menor_movimientos, 
        puntos_ganados, desbloqueado, fecha_completado, fecha_actualizacion)
       VALUES ($1, $2, TRUE, $3, $4, $5, $6, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (usuario_id, nivel_id) 
       DO UPDATE SET 
         completado = TRUE,
         estrellas = GREATEST(usuario_niveles.estrellas, $3),
         mejor_tiempo = CASE 
           WHEN usuario_niveles.mejor_tiempo IS NULL OR $4 < usuario_niveles.mejor_tiempo 
           THEN $4 ELSE usuario_niveles.mejor_tiempo 
         END,
         menor_movimientos = CASE 
           WHEN usuario_niveles.menor_movimientos IS NULL OR $5 < usuario_niveles.menor_movimientos 
           THEN $5 ELSE usuario_niveles.menor_movimientos 
         END,
         puntos_ganados = usuario_niveles.puntos_ganados + $6,
         fecha_completado = CURRENT_TIMESTAMP,
         fecha_actualizacion = CURRENT_TIMESTAMP`,
      [usuarioId, nivel.id, estrellas, tiempoSegundos, movimientos, puntosAdicionales]
    );

    // 5. Registrar en historial
    await client.query(
      `INSERT INTO historial_niveles 
       (usuario_id, mundo_id, nivel_numero, nivel_nombre, tiempo_segundos, movimientos, estrellas)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [usuarioId, mundoId, nivelId, nivel.nombre, tiempoSegundos, movimientos, estrellas]
    );

    // 6. Actualizar puntos del usuario
    await client.query(
      `UPDATE usuarios 
       SET puntos_totales = puntos_totales + $1
       WHERE id = $2`,
      [puntosAdicionales, usuarioId]
    );

    // 7. Actualizar progreso del mundo
    const totalNivelesResult = await client.query(
      `SELECT COUNT(*) as total FROM catalogo_niveles WHERE mundo_id = $1`,
      [mundoId]
    );

    const completadosResult = await client.query(
      `SELECT COUNT(*) as completados
       FROM usuario_niveles un
       JOIN catalogo_niveles cn ON un.nivel_id = cn.id
       WHERE un.usuario_id = $1 AND cn.mundo_id = $2 AND un.completado = TRUE`,
      [usuarioId, mundoId]
    );

    const totalNiveles = parseInt(totalNivelesResult.rows[0].total);
    const completados = parseInt(completadosResult.rows[0].completados);
    const progresoMundo = Math.round((completados / totalNiveles) * 100);

    await client.query(
      `UPDATE progreso_mundos 
       SET progreso = $1, nivel_actual = $2, fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE usuario_id = $3 AND mundo_id = $4`,
      [progresoMundo, Math.min(completados + 1, totalNiveles), usuarioId, mundoId]
    );

    // 8. Desbloquear siguiente nivel
    const siguienteNivelResult = await client.query(
      `SELECT id FROM catalogo_niveles 
       WHERE mundo_id = $1 AND numero_nivel = $2`,
      [mundoId, parseInt(nivelId) + 1]
    );

    let siguienteNivelDesbloqueado = false;
    if (siguienteNivelResult.rows.length > 0) {
      const siguienteNivelId = siguienteNivelResult.rows[0].id;
      await client.query(
        `INSERT INTO usuario_niveles (usuario_id, nivel_id, desbloqueado)
         VALUES ($1, $2, TRUE)
         ON CONFLICT (usuario_id, nivel_id) 
         DO UPDATE SET desbloqueado = TRUE`,
        [usuarioId, siguienteNivelId]
      );
      siguienteNivelDesbloqueado = true;
    }

    // 9. Verificar si completó el mundo
    const mundoCompletado = completados === totalNiveles;
    
    if (mundoCompletado) {
      const mundoNombres = {
        1: 'Biología',
        2: 'Geografía',
        3: 'Ciencias Naturales'
      };

      await client.query(
        `UPDATE trofeos_mundo 
         SET completado = TRUE, fecha_completado = CURRENT_TIMESTAMP
         WHERE usuario_id = $1 AND mundo = $2`,
        [usuarioId, mundoNombres[mundoId]]
      );

      // Desbloquear siguiente mundo si existe
      await client.query(
        `UPDATE progreso_mundos 
         SET desbloqueado = TRUE
         WHERE usuario_id = $1 AND mundo_id = $2`,
        [usuarioId, parseInt(mundoId) + 1]
      );
    }

    // 10. Verificar insignias desbloqueadas
    let insigniaDesbloqueada = false;
    const puntosActualesResult = await client.query(
      'SELECT puntos_totales FROM usuarios WHERE id = $1',
      [usuarioId]
    );
    const puntosActuales = puntosActualesResult.rows[0].puntos_totales;

    // Otorgar insignia si cumple requisitos
    const insigniaResult = await client.query(
      `INSERT INTO usuario_insignias (usuario_id, insignia_id)
       SELECT $1, id FROM catalogo_insignias 
       WHERE mundo = (SELECT 
         CASE 
           WHEN $2 = 1 THEN 'Biología'
           WHEN $2 = 2 THEN 'Geografía'
           WHEN $2 = 3 THEN 'Ciencias Naturales'
         END)
       AND puntos_requeridos <= $3
       AND nivel_requerido <= $4
       ON CONFLICT (usuario_id, insignia_id) DO NOTHING
       RETURNING id`,
      [usuarioId, mundoId, puntosActuales, completados]
    );

    insigniaDesbloqueada = insigniaResult.rows.length > 0;

    await client.query('COMMIT');

    res.json({
      mensaje: 'Nivel completado exitosamente',
      estrellas,
      puntosGanados: puntosAdicionales,
      siguienteNivelDesbloqueado,
      mundoCompletado,
      insigniaDesbloqueada,
      esNuevoRecordTiempo,
      esNuevoRecordMovimientos,
      progresoMundo
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al completar nivel:', error);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    client.release();
  }
});

// DESBLOQUEAR PRIMER NIVEL DE CADA MUNDO
router.post('/mundos/:mundoId/inicializar', verificarToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { usuarioId } = req;
    const { mundoId } = req.params;

    await client.query('BEGIN');

    // 1. Verificar si el mundo está desbloqueado
    const mundoResult = await client.query(
      `SELECT desbloqueado FROM progreso_mundos 
       WHERE usuario_id = $1 AND mundo_id = $2`,
      [usuarioId, mundoId]
    );

    if (mundoResult.rows.length === 0 || !mundoResult.rows[0].desbloqueado) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Mundo no desbloqueado' });
    }

    // 2. Desbloquear primer nivel
    const primerNivelResult = await client.query(
      `SELECT id FROM catalogo_niveles 
       WHERE mundo_id = $1 AND numero_nivel = 1`,
      [mundoId]
    );

    if (primerNivelResult.rows.length > 0) {
      const primerNivelId = primerNivelResult.rows[0].id;
      
      await client.query(
        `INSERT INTO usuario_niveles (usuario_id, nivel_id, desbloqueado)
         VALUES ($1, $2, TRUE)
         ON CONFLICT (usuario_id, nivel_id) 
         DO UPDATE SET desbloqueado = TRUE`,
        [usuarioId, primerNivelId]
      );
    }

    await client.query('COMMIT');

    res.json({ mensaje: 'Mundo inicializado correctamente' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al inicializar mundo:', error);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    client.release();
  }
});
module.exports = router;