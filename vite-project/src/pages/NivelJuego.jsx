import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trophy, Clock, Eye, HelpCircle, X, Check, Map, Brain, Target, Loader } from 'lucide-react';
import axios from 'axios';

// ===== COMPONENTES VISUALES =====
const themeColors = {
  emerald: ['#10b981', '#059669', '#34d399', '#6ee7b7'],
  blue: ['#3b82f6', '#2563eb', '#60a5fa', '#06b6d4'],
  orange: ['#f59e0b', '#ea580c', '#fbbf24', '#fb923c']
};

const backgroundIcons = ['leaf', 'dna', 'globe', 'mountain', 'atom', 'microscope'];

const ThematicIcon = ({ type, x, y, size, rotation }) => {
  const icons = {
    leaf: (<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm0-14c-3.3 0-6 2.7-6 6h2c0-2.2 1.8-4 4-4V6z" fill="#10b981" opacity="0.3"/>),
    dna: (<g fill="#059669" opacity="0.3"><circle cx="12" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M8 8c2 2 4 4 8 0M8 16c2-2 4-4 8 0"/></g>),
    globe: (<circle cx="12" cy="12" r="10" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.3"/>),
    mountain: (<path d="M12 3L2 20h20L12 3z" fill="#2563eb" opacity="0.3"/>),
    atom: (<g fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.3"><circle cx="12" cy="12" r="8"/><ellipse cx="12" cy="12" rx="3" ry="8" transform="rotate(45 12 12)"/><ellipse cx="12" cy="12" rx="3" ry="8" transform="rotate(-45 12 12)"/><circle cx="12" cy="12" r="2" fill="#f59e0b"/></g>),
    microscope: (<path d="M8 3h3v4H8V3zm0 6h3v2H8V9zm5-6h3v7h-3V3zM6 15c0-2 1.5-3.5 3.5-3.5h5c2 0 3.5 1.5 3.5 3.5H6z" fill="#ea580c" opacity="0.3"/>)
  };
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24"
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: `rotate(${rotation}deg)`,
        animation: `float ${4 + Math.random() * 2}s ease-in-out infinite`,
        animationDelay: `${Math.random() * 2}s`
      }}
    >
      {icons[type]}
    </svg>
  );
};

const PuzzlePiece = ({ color, size = 100, topTab = false, rightTab = false, bottomTab = false, leftTab = false, icon }) => {
  const tabSize = size * 0.25;
  let path = `M ${leftTab ? tabSize : 0} 0`;
  if (topTab) {
    path += ` L ${size/2 - tabSize} 0 Q ${size/2 - tabSize} ${-tabSize} ${size/2} ${-tabSize} Q ${size/2 + tabSize} ${-tabSize} ${size/2 + tabSize} 0`;
  }
  path += ` L ${size} 0`;
  if (rightTab) {
    path += ` L ${size} ${size/2 - tabSize} Q ${size + tabSize} ${size/2 - tabSize} ${size + tabSize} ${size/2} Q ${size + tabSize} ${size/2 + tabSize} ${size} ${size/2 + tabSize}`;
  }
  path += ` L ${size} ${size}`;
  if (bottomTab) {
    path += ` L ${size/2 + tabSize} ${size} Q ${size/2 + tabSize} ${size + tabSize} ${size/2} ${size + tabSize} Q ${size/2 - tabSize} ${size + tabSize} ${size/2 - tabSize} ${size}`;
  }
  path += ` L ${leftTab ? tabSize : 0} ${size}`;
  if (leftTab) {
    path += ` L ${tabSize} ${size/2 + tabSize} Q ${-tabSize} ${size/2 + tabSize} ${-tabSize} ${size/2} Q ${-tabSize} ${size/2 - tabSize} ${tabSize} ${size/2 - tabSize}`;
  }
  path += ` Z`;

  return (
    <svg width={size + tabSize * 2} height={size + tabSize * 2} style={{ position: 'absolute' }}>
      <path d={path} fill={color} opacity="0.2" style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' }}/>
      <text x={size/2} y={size/2} fontSize={size/3} textAnchor="middle" dominantBaseline="middle" opacity="0.5">
        {icon}
      </text>
    </svg>
  );
};

// ===== COMPONENTE PRINCIPAL =====
const NivelJuego = () => {
  const { mundoId, nivelId } = useParams();
  const navigate = useNavigate();
  
  // Estados del juego
  const [etapa, setEtapa] = useState('cargando');
  const [pieces, setPieces] = useState([]);
  const [board, setBoard] = useState([]);
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [piezasBloqueadas, setPiezasBloqueadas] = useState(new Set());
  const [rompecabezasCompletado, setRompecabezasCompletado] = useState(false);
  const [movimientos, setMovimientos] = useState(0);
  const [tiempo, setTiempo] = useState(0);
  const [tiempoActivo, setTiempoActivo] = useState(true);
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);
  const [pistas, setPistas] = useState(3);
  const [respuestas, setRespuestas] = useState({});
  const [intentoActual, setIntentoActual] = useState(1);
  const [preguntasCorrectas, setPreguntasCorrectas] = useState(0);
  const [formasPiezas, setFormasPiezas] = useState([]);

  // Estados para datos del servidor
  const [nivelActual, setNivelActual] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos del nivel desde la API
  useEffect(() => {
    cargarDatosNivel();
  }, [mundoId, nivelId]);

  const cargarDatosNivel = async () => {
    try {
      setCargando(true);
      setError(null);
      
      const token = localStorage.getItem('userToken');
      
      if (!token) {
        console.warn('Token no encontrado');
      }

      const response = await axios.get(
        `http://localhost:5000/api/usuario/mundos/${mundoId}/niveles/${nivelId}/datos`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      console.log('Datos del nivel recibidos:', response.data);
      
      setNivelActual(response.data);
      setEtapa('rompecabezas');
      setCargando(false);
      
      setTimeout(() => inicializarPuzzle(response.data), 100);
      
    } catch (err) {
      console.error('Error al cargar nivel:', err);
      
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      
      setError(err.response?.data?.error || 'Error al cargar el nivel');
      setCargando(false);
    }
  };

  // Generación de formas de piezas
  const generarFormasPiezas = (filas, columnas) => {
    const formas = [];
    const totalPiezas = filas * columnas;
    const conexiones = {};
    
    for (let i = 0; i < totalPiezas; i++) {
      const fila = Math.floor(i / columnas);
      const columna = i % columnas;
      const forma = { top: 'plano', right: 'plano', bottom: 'plano', left: 'plano' };
      
      if (fila > 0) {
        const piezaArriba = i - columnas;
        if (conexiones[`${piezaArriba}-bottom`]) {
          forma.top = conexiones[`${piezaArriba}-bottom`] === 'saliente' ? 'entrante' : 'saliente';
        } else {
          forma.top = Math.random() > 0.5 ? 'entrante' : 'saliente';
          conexiones[`${i}-top`] = forma.top;
        }
      }
      
      if (columna < columnas - 1) {
        forma.right = Math.random() > 0.5 ? 'entrante' : 'saliente';
        conexiones[`${i}-right`] = forma.right;
      }
      
      if (fila < filas - 1) {
        forma.bottom = Math.random() > 0.5 ? 'entrante' : 'saliente';
        conexiones[`${i}-bottom`] = forma.bottom;
      }
      
      if (columna > 0) {
        const piezaIzquierda = i - 1;
        if (conexiones[`${piezaIzquierda}-right`]) {
          forma.left = conexiones[`${piezaIzquierda}-right`] === 'saliente' ? 'entrante' : 'saliente';
        }
      }
      
      formas.push(forma);
    }
    
    return formas;
  };

  // Timer
  useEffect(() => {
    let interval;
    if (tiempoActivo && !rompecabezasCompletado) {
      interval = setInterval(() => {
        setTiempo(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [tiempoActivo, rompecabezasCompletado]);

  // Verificar carga de imagen
  useEffect(() => {
    if (nivelActual?.nivel?.imagen) { 
      const urlFinal = nivelActual.nivel.imagen || 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQyCzQdJfKQjrniqwWR4mCSx-NCsBipFMb-yjS218OdO7wTAMmVWW4iUiQWPxla';
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {};
      img.onerror = () => {};
      img.src = urlFinal;
    }
  }, [nivelActual]);

  const inicializarPuzzle = (datosNivel = nivelActual) => {
    if (!datosNivel) return;
    
    const { filas, columnas } = datosNivel.nivel;
    const totalPiezas = filas * columnas;
    
    const formas = generarFormasPiezas(filas, columnas);
    setFormasPiezas(formas);
    
    const piezasIniciales = [];
    for (let i = 0; i < totalPiezas; i++) {
      piezasIniciales.push({
        id: i,
        posicionCorrecta: i,
        posicionActual: null,
        fila: Math.floor(i / columnas),
        columna: i % columnas
      });
    }
    
    const piezasMezcladas = [...piezasIniciales].sort(() => Math.random() - 0.5);
    setPieces(piezasMezcladas);
    
    const tableroVacio = Array(totalPiezas).fill(null);
    setBoard(tableroVacio);
    
    setRompecabezasCompletado(false);
    setMovimientos(0);
    setTiempo(0);
    setTiempoActivo(true);
    setPiezasBloqueadas(new Set());
    setIntentoActual(1);
    setRespuestas({});
    setPreguntasCorrectas(0);
  };

  const generarPathPieza = (forma, ancho, alto) => {
    const tab = ancho * 0.15;
    const curva = tab * 0.6;
    let path = `M 0,0`;
    if (forma.top === 'plano') {
      path += ` L ${ancho},0`;
    } else if (forma.top === 'saliente') {
      path += ` L ${ancho * 0.35},0 C ${ancho * 0.35},${-curva} ${ancho * 0.35},${-tab} ${ancho * 0.5},${-tab} C ${ancho * 0.65},${-tab} ${ancho * 0.65},${-curva} ${ancho * 0.65},0 L ${ancho},0`;
    } else {
      path += ` L ${ancho * 0.35},0 C ${ancho * 0.35},${curva} ${ancho * 0.35},${tab} ${ancho * 0.5},${tab} C ${ancho * 0.65},${tab} ${ancho * 0.65},${curva} ${ancho * 0.65},0 L ${ancho},0`;
    }
    if (forma.right === 'plano') {
      path += ` L ${ancho},${alto}`;
    } else if (forma.right === 'saliente') {
      path += ` L ${ancho},${alto * 0.35} C ${ancho + curva},${alto * 0.35} ${ancho + tab},${alto * 0.35} ${ancho + tab},${alto * 0.5} C ${ancho + tab},${alto * 0.65} ${ancho + curva},${alto * 0.65} ${ancho},${alto * 0.65} L ${ancho},${alto}`;
    } else {
      path += ` L ${ancho},${alto * 0.35} C ${ancho - curva},${alto * 0.35} ${ancho - tab},${alto * 0.35} ${ancho - tab},${alto * 0.5} C ${ancho - tab},${alto * 0.65} ${ancho - curva},${alto * 0.65} ${ancho},${alto * 0.65} L ${ancho},${alto}`;
    }
    if (forma.bottom === 'plano') {
      path += ` L 0,${alto}`;
    } else if (forma.bottom === 'saliente') {
      path += ` L ${ancho * 0.65},${alto} C ${ancho * 0.65},${alto + curva} ${ancho * 0.65},${alto + tab} ${ancho * 0.5},${alto + tab} C ${ancho * 0.35},${alto + tab} ${ancho * 0.35},${alto + curva} ${ancho * 0.35},${alto} L 0,${alto}`;
    } else {
      path += ` L ${ancho * 0.65},${alto} C ${ancho * 0.65},${alto - curva} ${ancho * 0.65},${alto - tab} ${ancho * 0.5},${alto - tab} C ${ancho * 0.35},${alto - tab} ${ancho * 0.35},${alto - curva} ${ancho * 0.35},${alto} L 0,${alto}`;
    }
    if (forma.left === 'plano') {
      path += ` L 0,0`;
    } else if (forma.left === 'saliente') {
      path += ` L 0,${alto * 0.65} C ${-curva},${alto * 0.65} ${-tab},${alto * 0.65} ${-tab},${alto * 0.5} C ${-tab},${alto * 0.35} ${-curva},${alto * 0.35} 0,${alto * 0.35} L 0,0`;
    } else {
      path += ` L 0,${alto * 0.65} C ${curva},${alto * 0.65} ${tab},${alto * 0.65} ${tab},${alto * 0.5} C ${tab},${alto * 0.35} ${curva},${alto * 0.35} 0,${alto * 0.35} L 0,0`;
    }
    path += ` Z`;
    return path;
  };

  const handleDragStart = (e, pieza) => {
    if (piezasBloqueadas.has(pieza.id)) {
      e.preventDefault();
      return;
    }
    setDraggedPiece(pieza);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', pieza.id.toString());
    // Crear imagen fantasma para mejor feedback visual
    if (e.dataTransfer.setDragImage) {
      const dragImage = document.createElement('div');
      dragImage.style.width = '80px';
      dragImage.style.height = '80px';
      dragImage.style.backgroundColor = 'rgba(59, 130, 246, 0.5)';
      dragImage.style.borderRadius = '8px';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 40, 40);
      setTimeout(() => document.body.removeChild(dragImage), 0);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropEnTablero = (posicion) => {
    if (!draggedPiece) return;
    setMovimientos(prev => prev + 1);

    if (draggedPiece.posicionActual === null) {
      const nuevasPiezas = pieces.map(p => 
        p.id === draggedPiece.id ? { ...p, posicionActual: posicion } : p
      );
      const nuevoTablero = [...board];
      if (nuevoTablero[posicion] !== null) {
        const piezaAnterior = nuevasPiezas.find(p => p.id === nuevoTablero[posicion]);
        if (piezaAnterior && !piezasBloqueadas.has(piezaAnterior.id)) {
          const index = nuevasPiezas.indexOf(piezaAnterior);
          nuevasPiezas[index] = { ...piezaAnterior, posicionActual: null };
        }
      }
      nuevoTablero[posicion] = draggedPiece.id;
      setPieces(nuevasPiezas);
      setBoard(nuevoTablero);
      setDraggedPiece(null);
      if (draggedPiece.posicionCorrecta === posicion) {
        const nuevasBloqueadas = new Set(piezasBloqueadas);
        nuevasBloqueadas.add(draggedPiece.id);
        setPiezasBloqueadas(nuevasBloqueadas);
      }
      verificarCompletado(nuevasPiezas);
    } else {
      const nuevasPiezas = pieces.map(p => 
        p.id === draggedPiece.id ? { ...p, posicionActual: posicion } : p
      );
      const nuevoTablero = [...board];
      nuevoTablero[draggedPiece.posicionActual] = null;
      if (nuevoTablero[posicion] !== null) {
        const piezaIntercambio = nuevasPiezas.find(p => p.id === nuevoTablero[posicion]);
        if (piezaIntercambio && !piezasBloqueadas.has(piezaIntercambio.id)) {
          const index = nuevasPiezas.indexOf(piezaIntercambio);
          nuevasPiezas[index] = { ...piezaIntercambio, posicionActual: draggedPiece.posicionActual };
          nuevoTablero[draggedPiece.posicionActual] = piezaIntercambio.id;
        }
      }
      nuevoTablero[posicion] = draggedPiece.id;
      setPieces(nuevasPiezas);
      setBoard(nuevoTablero);
      setDraggedPiece(null);
      if (draggedPiece.posicionCorrecta === posicion) {
        const nuevasBloqueadas = new Set(piezasBloqueadas);
        nuevasBloqueadas.add(draggedPiece.id);
        setPiezasBloqueadas(nuevasBloqueadas);
      }
      verificarCompletado(nuevasPiezas);
    }
  };

  const handleDropEnArea = () => {
    if (!draggedPiece || draggedPiece.posicionActual === null) return;
    if (piezasBloqueadas.has(draggedPiece.id)) return;
    setMovimientos(prev => prev + 1);
    const nuevasPiezas = pieces.map(p => 
      p.id === draggedPiece.id ? { ...p, posicionActual: null } : p
    );
    const nuevoTablero = [...board];
    nuevoTablero[draggedPiece.posicionActual] = null;
    setPieces(nuevasPiezas);
    setBoard(nuevoTablero);
    setDraggedPiece(null);
  };

  const verificarCompletado = (piezas) => {
    const todasColocadas = piezas.every(p => p.posicionActual !== null);
    const todasCorrectas = piezas.every(p => p.posicionActual === p.posicionCorrecta);
    if (todasColocadas && todasCorrectas) {
      setRompecabezasCompletado(true);
      setTiempoActivo(false);
      setTimeout(() => {
        setEtapa('preguntas');
      }, 2000);
    }
  };

  const usarPista = () => {
    if (pistas <= 0) return;
    
    // Buscar primero una pieza sin colocar
    const piezaSinColocar = pieces.find(p => 
      !piezasBloqueadas.has(p.id) && p.posicionActual === null
    );
    
    if (piezaSinColocar) {
      // Colocar directamente en su posición correcta
      const nuevasPiezas = pieces.map(p => 
        p.id === piezaSinColocar.id ? { ...p, posicionActual: piezaSinColocar.posicionCorrecta } : p
      );
      const nuevoTablero = [...board];
      
      // Si hay una pieza en la posición destino, moverla al área de piezas
      if (nuevoTablero[piezaSinColocar.posicionCorrecta] !== null) {
        const piezaDesplazada = pieces.find(p => p.id === nuevoTablero[piezaSinColocar.posicionCorrecta]);
        if (piezaDesplazada && !piezasBloqueadas.has(piezaDesplazada.id)) {
          const index = nuevasPiezas.findIndex(p => p.id === piezaDesplazada.id);
          nuevasPiezas[index] = { ...piezaDesplazada, posicionActual: null };
        }
      }
      
      nuevoTablero[piezaSinColocar.posicionCorrecta] = piezaSinColocar.id;
      setPieces(nuevasPiezas);
      setBoard(nuevoTablero);
      
      // Bloquear la pieza
      const nuevasBloqueadas = new Set(piezasBloqueadas);
      nuevasBloqueadas.add(piezaSinColocar.id);
      setPiezasBloqueadas(nuevasBloqueadas);
      
      setMovimientos(prev => prev + 1);
      setPistas(prev => prev - 1);
      
      verificarCompletado(nuevasPiezas);
    } else {
      // Si no hay piezas sin colocar, buscar una mal colocada
      const piezaMalColocada = pieces.find(p => 
        !piezasBloqueadas.has(p.id) && 
        p.posicionActual !== null && 
        p.posicionCorrecta !== p.posicionActual
      );
      
      if (piezaMalColocada) {
        const nuevasPiezas = pieces.map(p => 
          p.id === piezaMalColocada.id ? { ...p, posicionActual: piezaMalColocada.posicionCorrecta } : p
        );
        const nuevoTablero = [...board];
        
        // Limpiar posición anterior
        nuevoTablero[piezaMalColocada.posicionActual] = null;
        
        // Si hay una pieza en la posición destino, intercambiar
        if (nuevoTablero[piezaMalColocada.posicionCorrecta] !== null) {
          const piezaIntercambio = pieces.find(p => p.id === nuevoTablero[piezaMalColocada.posicionCorrecta]);
          if (piezaIntercambio && !piezasBloqueadas.has(piezaIntercambio.id)) {
            const index = nuevasPiezas.findIndex(p => p.id === piezaIntercambio.id);
            nuevasPiezas[index] = { ...piezaIntercambio, posicionActual: piezaMalColocada.posicionActual };
            nuevoTablero[piezaMalColocada.posicionActual] = piezaIntercambio.id;
          }
        }
        
        nuevoTablero[piezaMalColocada.posicionCorrecta] = piezaMalColocada.id;
        setPieces(nuevasPiezas);
        setBoard(nuevoTablero);
        
        // Bloquear la pieza
        const nuevasBloqueadas = new Set(piezasBloqueadas);
        nuevasBloqueadas.add(piezaMalColocada.id);
        setPiezasBloqueadas(nuevasBloqueadas);
        
        setMovimientos(prev => prev + 1);
        setPistas(prev => prev - 1);
        
        verificarCompletado(nuevasPiezas);
      }
    }
  };

  const handleRespuesta = (preguntaId, opcionIndex) => {
    setRespuestas(prev => ({ ...prev, [preguntaId]: opcionIndex }));
  };

  const verificarPreguntas = async () => {
    let correctas = 0;
    nivelActual.preguntas.forEach(pregunta => {
      if (respuestas[pregunta.id] === pregunta.correcta) {
        correctas++;
      }
    });
    
    setPreguntasCorrectas(correctas);
    
    if (correctas === nivelActual.preguntas.length) {
      try {
        const token = localStorage.getItem('userToken');
        const response = await axios.post(
          `http://localhost:5000/api/usuario/mundos/${mundoId}/niveles/${nivelId}/completar`,
          {
            tiempoSegundos: tiempo,
            movimientos,
            preguntasCorrectas: correctas,
            totalPreguntas: nivelActual.preguntas.length
          },
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        console.log('Nivel completado:', response.data);
        setEtapa('completado');
        
      } catch (error) {
        console.error('Error al completar nivel:', error);
        setEtapa('completado');
      }
    } else {
      setIntentoActual(prev => prev + 1);
    }
  };

  const formatearTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Pantalla de carga
  if (cargando || !nivelActual) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-blue-900 to-orange-900">
        <div className="text-center text-white">
          <Loader size={64} className="animate-spin mx-auto mb-4" />
          <p className="text-2xl font-bold">Cargando nivel...</p>
        </div>
      </div>
    );
  }

  // Pantalla de error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-blue-900 to-orange-900 p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-2xl">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-black text-gray-800 mb-4">Error al cargar</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(`/mundos/${mundoId}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition"
          >
            Volver al Mundo
          </button>
        </div>
      </div>
    );
  }

  // Verificar que tenemos todos los datos necesarios
  if (!nivelActual?.nivel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-blue-900 to-orange-900">
        <div className="text-center text-white">
          <p className="text-2xl font-bold">Error: Datos del nivel incompletos</p>
        </div>
      </div>
    );
  }

  const { filas, columnas, imagen: imagen_url, nombre } = nivelActual.nivel; 
  
  const imagenFinal = imagen_url || 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Animal_cell_structure_en.svg/500px-Animal_cell_structure_en.svg.png';
  
  const anchoPieza = 100;
  const altoPieza = 100;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-900 via-blue-900 to-orange-900 p-4 font-sans">
      {/* Fondo animado con iconos temáticos */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({length: 30}).map((_, i) => {
          const iconType = backgroundIcons[i % 6];
          return (
            <ThematicIcon
              key={i}
              type={iconType}
              x={Math.random() * 100}
              y={Math.random() * 100}
              size={40 + Math.random() * 60}
              rotation={Math.random() * 360}
            />
          );
        })}
      </div>

      {/* Piezas decorativas de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({length: 25}).map((_, i) => {
          const size = 70 + Math.random() * 50;
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          const rotation = Math.random() * 360;
          const theme = i % 3 === 0 ? 'emerald' : i % 3 === 1 ? 'blue' : 'orange';
          const themeColorsArray = themeColors[theme];
          const icons = ['🌿', '🌍', '🔬'];
          
          return (
            <div 
              key={i}
              style={{
                position: 'absolute',
                left: `${x}%`,
                top: `${y}%`,
                transform: `rotate(${rotation}deg)`,
                animation: `float ${5 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`
              }}
            >
              <PuzzlePiece 
                color={themeColorsArray[Math.floor(Math.random() * themeColorsArray.length)]}
                size={size}
                topTab={Math.random() > 0.5}
                rightTab={Math.random() > 0.5}
                bottomTab={Math.random() > 0.5}
                leftTab={Math.random() > 0.5}
                icon={icons[i % 3]}
              />
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.6; }
          33% { transform: translateY(-20px) translateX(15px); opacity: 0.8; }
          66% { transform: translateY(15px) translateX(-15px); opacity: 0.7; }
        }
      `}</style>

      <div className="relative z-10 max-w-7xl mx-auto py-8">
        {/* Header con botón volver */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(`/mundos/${mundoId}`)}
            className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          
          <h1 className="text-4xl font-black text-white drop-shadow-lg">
            {nombre}
          </h1>

          <button
            onClick={() => inicializarPuzzle()}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg"
          >
            <RotateCcw size={20} />
            Reiniciar
          </button>
        </div>

        {/* Etapa: ROMPECABEZAS */}
        {etapa === 'rompecabezas' && (
          <div className="flex justify-center items-start gap-6">
            {/* Tablero del Rompecabezas */}
            <div 
              className="bg-white bg-opacity-10 border-4 border-white border-opacity-30 rounded-xl relative shadow-2xl"
              style={{ 
                width: columnas * anchoPieza + 40,
                height: filas * altoPieza + 40,
                padding: '20px'
              }}
            >
              {Array.from({ length: filas * columnas }).map((_, index) => {
                const fila = Math.floor(index / columnas);
                const columna = index % columnas;
                const piezaEnPosicion = pieces.find(p => p.posicionActual === index);
                const isCorrect = piezaEnPosicion && piezaEnPosicion.posicionCorrecta === index;

                return (
                  <div 
                    key={index}
                    className={`absolute border-2 ${isCorrect ? 'border-emerald-400 bg-emerald-900 bg-opacity-10' : 'border-white border-opacity-30 bg-white bg-opacity-5'}`}
                    style={{
                      width: anchoPieza,
                      height: altoPieza,
                      left: columna * anchoPieza + 20,
                      top: fila * altoPieza + 20,
                    }}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDropEnTablero(index)}
                  >
                    {piezaEnPosicion && formasPiezas[piezaEnPosicion.posicionCorrecta] ? (
                      <div
                        draggable={!piezasBloqueadas.has(piezaEnPosicion.id)}
                        onDragStart={(e) => handleDragStart(e, piezaEnPosicion)}
                        style={{
                          position: 'absolute',
                          left: anchoPieza * -0.25,
                          top: altoPieza * -0.25,
                          cursor: piezasBloqueadas.has(piezaEnPosicion.id) ? 'not-allowed' : 'grab',
                          width: anchoPieza * 1.5,
                          height: altoPieza * 1.5,
                        }}
                      >
                        <svg
                          width={anchoPieza * 1.5}
                          height={altoPieza * 1.5}
                          viewBox={`0 0 ${anchoPieza * 1.5} ${altoPieza * 1.5}`}
                          style={{ pointerEvents: 'none' }}
                        >
                          <defs>
                            <mask id={`mask-${piezaEnPosicion.id}`}>
                              <path 
                                d={generarPathPieza(formasPiezas[piezaEnPosicion.posicionCorrecta], anchoPieza, altoPieza)} 
                                fill="white" 
                              />
                            </mask>
                          </defs>
                          
                          <g mask={`url(#mask-${piezaEnPosicion.id})`}>
                            <image 
                              href={imagenFinal}
                              crossOrigin="anonymous"
                              x={-(piezaEnPosicion.columna * anchoPieza)}
                              y={-(piezaEnPosicion.fila * altoPieza)}
                              width={columnas * anchoPieza}
                              height={filas * altoPieza}
                              preserveAspectRatio="xMidYMid slice"
                            />
                          </g>

                          <path 
                            d={generarPathPieza(formasPiezas[piezaEnPosicion.posicionCorrecta], anchoPieza, altoPieza)} 
                            fill="none" 
                            stroke={isCorrect ? '#34d399' : '#ffffff'} 
                            strokeWidth="2" 
                          />
                        </svg>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Panel Derecho */}
            <div className="flex flex-col gap-4" style={{ width: '350px' }}>
              {/* Estadísticas */}
              <div className="bg-black bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="text-blue-300" size={24} />
                    <span className="text-white font-bold text-xl">{formatearTiempo(tiempo)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="text-orange-300" size={24} />
                    <span className="text-white font-bold text-xl">{movimientos}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setMostrarVistaPrevia(!mostrarVistaPrevia)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-bold transition"
                  >
                    <Eye size={18} />
                    Vista
                  </button>
                  <button
                    onClick={usarPista}
                    disabled={pistas === 0}
                    className={`flex-1 flex items-center justify-center gap-2 ${pistas > 0 ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-gray-500 cursor-not-allowed'} text-white py-2 rounded-lg font-bold transition`}
                  >
                    <HelpCircle size={18} />
                    Pistas: {pistas}
                  </button>
                </div>
              </div>

              {/* Vista Previa */}
              {mostrarVistaPrevia && (
                <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
                  <img 
                    src={imagenFinal}
                    crossOrigin="anonymous"
                    alt="Vista previa"
                    className="w-full rounded-lg shadow-lg"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300?text=Error+al+cargar+imagen';
                    }}
                  />
                </div>
              )}

              {/* Piezas Mezcladas */}
              <div 
                className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm"
                onDragOver={handleDragOver}
                onDrop={handleDropEnArea}
                style={{ minHeight: '300px' }}
              >
                <h3 className="text-white text-lg font-bold mb-3">
                  Piezas Disponibles ({pieces.filter(p => p.posicionActual === null).length})
                </h3>
                <div className="flex flex-wrap gap-3">
                  {pieces.filter(p => p.posicionActual === null).length === 0 ? (
                    <p className="text-white text-sm">Todas las piezas están en el tablero</p>
                  ) : (
                    pieces
                      .filter(p => p.posicionActual === null)
                      .map(pieza => {
                        if (!formasPiezas[pieza.posicionCorrecta]) {
                          return null;
                        }
                        return (
                          <div 
                            key={pieza.id} 
                            className="relative bg-white bg-opacity-10 rounded-lg"
                            draggable
                            onDragStart={(e) => handleDragStart(e, pieza)}
                            style={{ 
                              width: anchoPieza * 0.8, 
                              height: altoPieza * 0.8,
                              display: 'inline-block',
                              cursor: 'grab'
                            }}
                          >
                            <svg
                              width={anchoPieza * 0.8}
                              height={altoPieza * 0.8}
                              viewBox={`0 0 ${anchoPieza * 1.5} ${altoPieza * 1.5}`}
                              style={{ 
                                display: 'block',
                                pointerEvents: 'none'
                              }}
                            >
                              <defs>
                                <mask id={`mask-pool-${pieza.id}`}>
                                  <path 
                                    d={generarPathPieza(formasPiezas[pieza.posicionCorrecta], anchoPieza, altoPieza)} 
                                    fill="white" 
                                  />
                                </mask>
                              </defs>

                              <g mask={`url(#mask-pool-${pieza.id})`}>
                                <image 
                                  href={imagenFinal}
                                  crossOrigin="anonymous"
                                  x={-(pieza.columna * anchoPieza)}
                                  y={-(pieza.fila * altoPieza)}
                                  width={columnas * anchoPieza}
                                  height={filas * altoPieza}
                                  preserveAspectRatio="xMidYMid slice"
                                />
                              </g>

                              <path 
                                d={generarPathPieza(formasPiezas[pieza.posicionCorrecta], anchoPieza, altoPieza)} 
                                fill="none" 
                                stroke="#ffffff" 
                                strokeWidth="2" 
                              />
                            </svg>
                            <span className="absolute top-0 left-0 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                              {pieza.id}
                            </span>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Etapa: PREGUNTAS */}
        {etapa === 'preguntas' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              <h2 className="text-3xl font-black text-gray-800 mb-6 flex items-center gap-3">
                <Brain className="text-blue-600" size={36} />
                Preguntas del Nivel
              </h2>

              {nivelActual.preguntas.map((pregunta, idx) => (
                <div key={pregunta.id} className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <p className="text-lg font-bold text-gray-800 mb-3">
                    {idx + 1}. {pregunta.texto}
                  </p>
                  <div className="space-y-2">
                    {pregunta.opciones.map((opcion, opIdx) => (
                      <button
                        key={opIdx}
                        onClick={() => handleRespuesta(pregunta.id, opIdx)}
                        className={`w-full text-left p-3 rounded-lg font-semibold transition ${
                          respuestas[pregunta.id] === opIdx
                            ? 'bg-blue-500 text-white'
                            : 'bg-white hover:bg-blue-100 text-gray-700'
                        }`}
                      >
                        {opcion}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={verificarPreguntas}
                disabled={Object.keys(respuestas).length !== nivelActual.preguntas.length}
                className={`w-full py-4 rounded-xl font-black text-lg transition ${
                  Object.keys(respuestas).length === nivelActual.preguntas.length
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Verificar Respuestas
              </button>

              {intentoActual > 1 && (
                <div className="mt-4 p-4 bg-orange-100 rounded-lg">
                  <p className="text-orange-800 font-bold">
                    Respuestas correctas: {preguntasCorrectas} de {nivelActual.preguntas.length}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Etapa: COMPLETADO */}
        {etapa === 'completado' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl p-12 text-center shadow-2xl">
              <Trophy className="mx-auto text-yellow-500 mb-6" size={80} />
              <h2 className="text-4xl font-black text-gray-800 mb-4">
                ¡Nivel Completado!
              </h2>
              <div className="space-y-3 mb-8">
                <p className="text-xl text-gray-700">
                  ⏱️ Tiempo: <span className="font-bold">{formatearTiempo(tiempo)}</span>
                </p>
                <p className="text-xl text-gray-700">
                  🎯 Movimientos: <span className="font-bold">{movimientos}</span>
                </p>
                <p className="text-xl text-gray-700">
                  ✅ Preguntas correctas: <span className="font-bold">{preguntasCorrectas}/{nivelActual.preguntas.length}</span>
                </p>
              </div>
              <button
                onClick={() => navigate(`/mundos/${mundoId}`)}
                className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white px-8 py-4 rounded-xl font-black text-lg transition shadow-lg"
              >
                Volver al Mundo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NivelJuego;