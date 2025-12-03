import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trophy, Clock, Eye, HelpCircle, X, Check, Map, Brain, Target, Flame } from 'lucide-react';

// --- MOCKS DE DATOS Y ESTILOS GLOBALES ---

// Colores temáticos: Biología (verde), Geografía (azul), Ciencias Naturales (naranja/amarillo)
const themeColors = {
  emerald: ['#10b981', '#059669', '#34d399', '#6ee7b7'], // Biología
  blue: ['#3b82f6', '#2563eb', '#60a5fa', '#06b6d4'], // Geografía
  orange: ['#f59e0b', '#ea580c', '#fbbf24', '#fb923c'] // Ciencias
};

// Iconos SVG temáticos para el fondo
const backgroundIcons = [
  'leaf', 'dna', 'globe', 'mountain', 'atom', 'microscope'
];

// Iconos SVG temáticos para el fondo
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
    path += ` L ${size/2 - tabSize} 0 
            Q ${size/2 - tabSize} ${-tabSize} ${size/2} ${-tabSize}
            Q ${size/2 + tabSize} ${-tabSize} ${size/2 + tabSize} 0`;
  }
  path += ` L ${size} 0`;
  
  if (rightTab) {
    path += ` L ${size} ${size/2 - tabSize}
            Q ${size + tabSize} ${size/2 - tabSize} ${size + tabSize} ${size/2}
            Q ${size + tabSize} ${size/2 + tabSize} ${size} ${size/2 + tabSize}`;
  }
  path += ` L ${size} ${size}`;
  
  if (bottomTab) {
    path += ` L ${size/2 + tabSize} ${size}
            Q ${size/2 + tabSize} ${size + tabSize} ${size/2} ${size + tabSize}
            Q ${size/2 - tabSize} ${size + tabSize} ${size/2 - tabSize} ${size}`;
  }
  path += ` L ${leftTab ? tabSize : 0} ${size}`;
  
  if (leftTab) {
    path += ` L ${tabSize} ${size/2 + tabSize}
            Q ${-tabSize} ${size/2 + tabSize} ${-tabSize} ${size/2}
            Q ${-tabSize} ${size/2 - tabSize} ${tabSize} ${size/2 - tabSize}`;
  }
  path += ` Z`;

  return (
    <svg width={size + tabSize * 2} height={size + tabSize * 2} style={{ position: 'absolute' }}>
      <path d={path} fill={color} opacity="0.2" 
        style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' }}/>
      <text x={size/2} y={size/2} fontSize={size/3} textAnchor="middle" dominantBaseline="middle" opacity="0.5">
        {icon}
      </text>
    </svg>
  );
};
// --- FIN HELPERS DE DISEÑO ---

const NivelJuego = () => {
  const { mundoId, nivelId } = useParams();
  const navigate = useNavigate();
  
  const [etapa, setEtapa] = useState('rompecabezas'); // 'rompecabezas', 'preguntas', 'completado'
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

  // Preguntas
  const [respuestas, setRespuestas] = useState({});
  const [intentoActual, setIntentoActual] = useState(1);
  const [preguntasCorrectas, setPreguntasCorrectas] = useState(0);

  // Datos de niveles (Mantenidos)
  const nivelesData = {
    1: {
      1: {
        nombre: 'La Célula Animal',
        imagen: 'https://images.unsplash.com/photo-1530973428-5bf2db2e4d71?w=800',
        filas: 4, columnas: 5,
        preguntas: [
          { id: 1, pregunta: '¿Cuál es el centro de control de la célula que contiene el ADN?', opciones: ['Mitocondria', 'Núcleo', 'Citoplasma', 'Membrana'], correcta: 1, explicacion: 'El núcleo es el centro de control de la célula y contiene el material genético (ADN).' },
          { id: 2, pregunta: '¿Qué estructura genera energía para la célula?', opciones: ['Núcleo', 'Ribosoma', 'Mitocondria', 'Vacuola'], correcta: 2, explicacion: 'Las mitocondrias son conocidas como las "centrales eléctricas" de la célula.' },
          { id: 3, pregunta: '¿Qué protege y rodea a la célula?', opciones: ['Citoplasma', 'Núcleo', 'Membrana celular', 'Cloroplasto'], correcta: 2, explicacion: 'La membrana celular protege la célula y controla lo que entra y sale.' }
        ],
        recompensa: { tipo: 'insignia', nombre: 'Explorador Celular', descripcion: '¡Has dominado la estructura de la célula!', emoji: '🔬', puntos: 50 }
      },
      2: { nombre: 'Fotosíntesis', imagen: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800', filas: 4, columnas: 5, preguntas: [{ id: 1, pregunta: '¿Qué necesitan las plantas para realizar la fotosíntesis?', opciones: ['Luz solar, CO₂ y agua', 'Solo agua', 'Solo CO₂', 'Oxígeno'], correcta: 0, explicacion: 'Las plantas necesitan luz solar, dióxido de carbono y agua para la fotosíntesis.' }, { id: 2, pregunta: '¿Qué produce la fotosíntesis?', opciones: ['CO₂', 'Glucosa y Oxígeno', 'Solo agua', 'Nitrógeno'], correcta: 1, explicacion: 'La fotosíntesis produce glucosa (alimento) y oxígeno.' }], recompensa: { tipo: 'insignia', nombre: 'Guardián Verde', descripcion: '¡Entiendes cómo las plantas crean vida!', emoji: '🌱', puntos: 50 } },
      3: { nombre: 'Ecosistemas', imagen: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800', filas: 4, columnas: 5, preguntas: [{ id: 1, pregunta: '¿Qué es un ecosistema?', opciones: ['Solo animales', 'Seres vivos y su ambiente', 'Solo plantas', 'El clima'], correcta: 1, explicacion: 'Un ecosistema incluye todos los seres vivos y su entorno físico interactuando.' }], recompensa: { tipo: 'insignia', nombre: 'Protector Natural', descripcion: '¡Comprendes el equilibrio de la naturaleza!', emoji: '🌊', puntos: 50 } }
    },
    2: { 1: { nombre: 'Continentes', imagen: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800', filas: 4, columnas: 5, preguntas: [{ id: 1, pregunta: '¿Cuántos continentes hay en el mundo?', opciones: ['5', '6', '7', '8'], correcta: 2, explicacion: 'Hay 7 continentes: Asia, África, América del Norte, América del Sur, Antártida, Europa y Oceanía.' }], recompensa: { tipo: 'insignia', nombre: 'Explorador Mundial', emoji: '🗺️', puntos: 40 } } },
    3: { 1: { nombre: 'Estados de la Materia', imagen: 'https://images.unsplash.com/photo-1532634993-15f421e42ec0?w=800', filas: 4, columnas: 5, preguntas: [{ id: 1, pregunta: '¿Cuáles son los tres estados principales de la materia?', opciones: ['Sólido, líquido, gas', 'Duro, suave, húmedo', 'Frío, caliente, tibio', 'Grande, mediano, pequeño'], correcta: 0, explicacion: 'Los tres estados principales son sólido, líquido y gaseoso.' }], recompensa: { tipo: 'insignia', nombre: 'Científico Junior', emoji: '⚗️', puntos: 45 } } }
  };

  const nivelActual = nivelesData[mundoId]?.[nivelId];

  // Generación de formas y lógica de juego (mantenida)
  const generarFormasPiezas = (filas, columnas) => {
    const formas = [];
    const totalPiezas = filas * columnas;
    const conexiones = {};
    
    for (let i = 0; i < totalPiezas; i++) {
      const fila = Math.floor(i / columnas);
      const columna = i % columnas;
      
      const forma = {
        top: 'plano', right: 'plano', bottom: 'plano', left: 'plano'
      };
      
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

  const [formasPiezas] = useState(() => 
    nivelActual ? generarFormasPiezas(nivelActual.filas, nivelActual.columnas) : []
  );

  useEffect(() => {
    let interval;
    if (tiempoActivo && !rompecabezasCompletado) {
      interval = setInterval(() => {
        setTiempo(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [tiempoActivo, rompecabezasCompletado]);

  useEffect(() => {
    if (nivelActual) {
      inicializarPuzzle();
    }
  }, [mundoId, nivelId]);

  const inicializarPuzzle = () => {
    const { filas, columnas } = nivelActual;
    const totalPiezas = filas * columnas;
    
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
    setEtapa('rompecabezas');
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
  };

  const handleDragOver = (e) => {
    e.preventDefault();
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
    if (pistas > 0) {
      // Encontrar una pieza que no esté en su lugar correcto Y no esté ya colocada en el tablero (posicionActual === null)
      const piezaLibreEIncorrecta = pieces.find(p => 
        !piezasBloqueadas.has(p.id) && p.posicionActual === null && p.posicionCorrecta !== p.posicionActual
      );
      
      if (piezaLibreEIncorrecta) {
        // Simular arrastre a su posición correcta
        setDraggedPiece(piezaLibreEIncorrecta); // Necesario para que handleDropEnTablero funcione
        handleDropEnTablero(piezaLibreEIncorrecta.posicionCorrecta);
      } else {
        // Si todas las piezas libres están en su lugar (improbable) o ya están todas colocadas
        // Buscar una pieza colocada incorrectamente para reubicarla a su lugar
        const piezaMalColocada = pieces.find(p => 
          !piezasBloqueadas.has(p.id) && p.posicionActual !== null && p.posicionCorrecta !== p.posicionActual
        );
         if(piezaMalColocada) {
             setDraggedPiece(piezaMalColocada);
             handleDropEnTablero(piezaMalColocada.posicionCorrecta);
         }
      }
      
      setPistas(prev => prev - 1);
    }
  };


  const handleRespuesta = (preguntaId, opcionIndex) => {
    setRespuestas(prev => ({ ...prev, [preguntaId]: opcionIndex }));
  };

  const verificarPreguntas = () => {
    let correctas = 0;
    nivelActual.preguntas.forEach(pregunta => {
      if (respuestas[pregunta.id] === pregunta.correcta) {
        correctas++;
      }
    });
    
    setPreguntasCorrectas(correctas);
    
    if (correctas === nivelActual.preguntas.length) {
      setEtapa('completado');
    } else {
      setIntentoActual(prev => prev + 1);
    }
  };

  const formatearTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!nivelActual) {
    return <div className="p-8 text-white">Nivel no encontrado</div>;
  }

  const { filas, columnas, imagen, nombre } = nivelActual;
  const anchoPieza = 100;
  const altoPieza = 100;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-900 via-blue-900 to-orange-900 p-4 font-sans">
      
      {/* Fondo con iconos científicos flotantes */}
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

      {/* Piezas de rompecabezas temáticas flotantes */}
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

      {/* Contenido Principal */}
      <div className="relative z-10 max-w-7xl mx-auto py-8">
        
        {etapa === 'rompecabezas' && (
          <>
            {/* Header y Controles */}
            <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
              <button
                onClick={() => navigate(`/mundos/${mundoId}`)}
                className="flex items-center gap-2 text-white hover:text-emerald-300 transition bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg transform hover:scale-105"
              >
                <ArrowLeft size={20} />
                Volver
              </button>
              
              <div className="flex gap-3 flex-wrap">
                {/* Tiempo */}
                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 text-white border border-white/20">
                  <Clock size={20} className="text-blue-400" />
                  <span className="font-bold text-lg">{formatearTiempo(tiempo)}</span>
                </div>
                {/* Movimientos */}
                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 text-white border border-white/20">
                  <Target size={20} className="text-orange-400" />
                  <span className="font-bold text-lg">Movimientos: {movimientos}</span>
                </div>
                {/* Botón Pista */}
                <button
                  onClick={usarPista}
                  disabled={pistas === 0 || rompecabezasCompletado}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition transform hover:scale-[1.02] font-semibold ${
                    pistas > 0 && !rompecabezasCompletado
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-yellow-500/50' 
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <HelpCircle size={20} />
                  Pistas: {pistas}
                </button>
                {/* Botón Vista Previa */}
                <button
                  onClick={() => setMostrarVistaPrevia(!mostrarVistaPrevia)}
                  className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-xl shadow-lg hover:bg-white/20 transition border border-white/20"
                >
                  <Eye size={20} className="text-purple-400" />
                  Vista Previa
                </button>
                {/* Botón Reiniciar */}
                <button
                  onClick={inicializarPuzzle}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl shadow-lg hover:bg-red-700 transition"
                >
                  <RotateCcw size={20} />
                  Reiniciar
                </button>
              </div>
            </div>

            {/* Título */}
            <div className="bg-white rounded-2xl p-4 shadow-2xl mb-6 border-t-4 border-blue-500">
              <h1 className="text-3xl font-black text-gray-800 text-center">{nombre}</h1>
              <p className="text-gray-600 text-center mt-1">Arrastra y suelta las piezas para revelar la imagen.</p>
            </div>

            {/* Vista Previa Modal */}
            {mostrarVistaPrevia && (
              <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl relative border-4 border-white/10">
                  <button
                    onClick={() => setMostrarVistaPrevia(false)}
                    className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition shadow-md"
                  >
                    <X size={20} />
                  </button>
                  <h2 className="text-2xl font-bold text-white mb-4 text-center">Vista Previa</h2>
                  <img src={imagen} alt="Vista previa" className="w-full rounded-lg shadow-lg" />
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Área de piezas (Izquierda) */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 shadow-xl border-4 border-gray-200">
                  <h2 className="text-xl font-black text-gray-800 mb-3 flex items-center gap-2">
                    <Brain className="text-purple-500" size={24} /> 
                    Piezas Restantes ({pieces.filter(p => p.posicionActual === null).length})
                  </h2>
                  <div 
                    className="grid grid-cols-2 gap-4 min-h-[400px] bg-gray-100 p-4 rounded-xl shadow-inner border border-gray-300"
                    onDragOver={handleDragOver}
                    onDrop={handleDropEnArea}
                  >
                    {pieces
                      .filter(p => p.posicionActual === null)
                      .map((pieza) => {
                        const forma = formasPiezas[pieza.id];
                        const pathData = generarPathPieza(forma, anchoPieza, altoPieza);
                        
                        return (
                          <div
                            key={pieza.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, pieza)}
                            className="cursor-move hover:scale-105 transition flex items-center justify-center"
                            style={{
                              width: anchoPieza * 1.3,
                              height: altoPieza * 1.3,
                            }}
                          >
                            <svg 
                              width={anchoPieza * 1.3} 
                              height={altoPieza * 1.3}
                              viewBox={`${-anchoPieza * 0.15} ${-altoPieza * 0.15} ${anchoPieza * 1.3} ${altoPieza * 1.3}`}
                              style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' }}
                            >
                              <defs>
                                <pattern
                                  id={`pattern-${pieza.id}`}
                                  x="0" y="0"
                                  width={columnas * anchoPieza}
                                  height={filas * altoPieza}
                                  patternUnits="userSpaceOnUse"
                                >
                                  <image
                                    href={imagen}
                                    width={columnas * anchoPieza}
                                    height={filas * altoPieza}
                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x600/e0e0e0/555555?text=Imagen+no+disponible"; }} // Fallback
                                  />
                                </pattern>
                              </defs>
                              <g transform={`translate(${-pieza.columna * anchoPieza}, ${-pieza.fila * altoPieza})`}>
                                <path
                                  d={pathData}
                                  transform={`translate(${pieza.columna * anchoPieza}, ${pieza.fila * altoPieza})`}
                                  fill={`url(#pattern-${pieza.id})`}
                                  stroke="#222"
                                  strokeWidth="1.5"
                                />
                              </g>
                            </svg>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Tablero (Derecha) */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl p-6 shadow-xl border-4 border-gray-200">
                  <h2 className="text-xl font-black text-gray-800 mb-3 flex items-center gap-2">
                    <Map className="text-blue-500" size={24} />
                    Tablero del Rompecabezas
                  </h2>
                  <div className="flex justify-center overflow-auto">
                    <svg 
                      width={columnas * anchoPieza * 1.05} 
                      height={filas * altoPieza * 1.05}
                      viewBox={`${-anchoPieza * 0.15} ${-altoPieza * 0.15} ${columnas * anchoPieza * 1.05} ${filas * altoPieza * 1.05}`}
                      className="bg-gray-100 rounded-lg shadow-inner border border-gray-300"
                    >
                      <defs>
                        <pattern
                        id="pattern-main"
                        x="0" y="0"
                        width={columnas * anchoPieza}
                        height={filas * altoPieza}
                        patternUnits="userSpaceOnUse"
                        >
                          <image
                            href={imagen}
                            width={columnas * anchoPieza}
                            height={filas * altoPieza}
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x600/e0e0e0/555555?text=Imagen+no+disponible"; }} // Fallback
                          />
                        </pattern>
                      </defs>
                      
                      {board.map((piezaId, index) => {
                        const fila = Math.floor(index / columnas);
                        const columna = index % columnas;
                        
                        return (
                          <g key={index}>
                            {/* Área de Drop (Recuadro transparente para recibir piezas) */}
                            <rect
                              x={columna * anchoPieza - anchoPieza * 0.15}
                              y={fila * altoPieza - altoPieza * 0.15}
                              width={anchoPieza * 1.3}
                              height={altoPieza * 1.3}
                              fill="transparent"
                              onDragOver={handleDragOver}
                              onDrop={() => handleDropEnTablero(index)}
                              style={{ cursor: 'pointer' }}
                            />
                            
                            {piezaId !== null && (() => {
                              const pieza = pieces.find(p => p.id === piezaId);
                              const estaBloqueada = piezasBloqueadas.has(piezaId);
                              const forma = formasPiezas[piezaId];
                              const pathData = generarPathPieza(forma, anchoPieza, altoPieza);
                              
                              return (
                                <g
                                  onDragStart={(e) => handleDragStart(e, pieza)}
                                  draggable={!estaBloqueada}
                                  style={{ 
                                    cursor: estaBloqueada ? 'not-allowed' : 'move',
                                    filter: estaBloqueada 
                                      ? 'drop-shadow(0 0 6px rgba(34,197,94,0.8))' 
                                      : 'drop-shadow(1px 1px 3px rgba(0,0,0,0.4))'
                                  }}
                                >
                                  <path
                                    d={pathData}
                                    transform={`translate(${columna * anchoPieza}, ${fila * altoPieza})`}
                                    fill={`url(#pattern-main)`}
                                    stroke={estaBloqueada ? '#22c55e' : '#222'} // Borde verde para piezas correctas
                                    strokeWidth={estaBloqueada ? '2.5' : '1.5'}
                                  />
                                </g>
                              );
                            })()}
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal de rompecabezas completado */}
            {rompecabezasCompletado && etapa === 'rompecabezas' && (
              <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-pulse border-4 border-yellow-500">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🥳</div>
                    <h2 className="text-3xl font-black text-gray-800 mb-2">¡Rompecabezas Completado!</h2>
                    <p className="text-gray-700 mb-4">¡Gran trabajo! Estás listo para la fase de conocimiento.</p>
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-4">
                      <p className="text-lg font-bold text-blue-700">Tiempo: {formatearTiempo(tiempo)}</p>
                      <p className="text-lg font-bold text-purple-700">Movimientos: {movimientos}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {etapa === 'preguntas' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border-t-8 border-purple-500">
              <h2 className="text-3xl font-black text-gray-800 mb-2 text-center">📝 Prueba de Conocimiento</h2>
              <p className="text-gray-600 text-center mb-6">Responde correctamente para obtener la insignia del nivel.</p>
              
              {intentoActual > 1 && preguntasCorrectas < nivelActual.preguntas.length && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg font-semibold">
                  <p>❌ Incorrecto: {preguntasCorrectas}/{nivelActual.preguntas.length} correctas. Revisa la explicación y vuelve a intentarlo.</p>
                </div>
              )}
              
              <div className="space-y-8">
                {nivelActual.preguntas.map((pregunta, idx) => (
                  <div key={pregunta.id} className="border-2 border-gray-200 rounded-xl p-6 shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="text-purple-600">{idx + 1}.</span> {pregunta.pregunta}
                    </h3>
                    <div className="space-y-3">
                      {pregunta.opciones.map((opcion, opcionIdx) => {
                        const seleccionada = respuestas[pregunta.id] === opcionIdx;
                        const esCorrecta = opcionIdx === pregunta.correcta;
                        const mostrarResultado = intentoActual > 1;
                        
                        return (
                          <button
                            key={opcionIdx}
                            onClick={() => handleRespuesta(pregunta.id, opcionIdx)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition font-semibold ${
                              seleccionada
                                ? mostrarResultado && esCorrecta
                                  ? 'border-green-500 bg-green-50 text-green-800'
                                  : mostrarResultado && !esCorrecta
                                    ? 'border-red-500 bg-red-50 text-red-800'
                                    : 'border-purple-500 bg-purple-50 text-purple-800'
                                : 'border-gray-300 hover:border-purple-300 hover:bg-gray-50 text-gray-700'
                            }`}
                            disabled={mostrarResultado && esCorrecta} // Deshabilita la opción correcta después de verificar
                          >
                            <div className="flex items-center justify-between">
                              <span>{opcion}</span>
                              {seleccionada && mostrarResultado && (
                                esCorrecta ? <Check className="text-green-500" size={24} /> : <X className="text-red-500" size={24} />
                              )}
                              {!seleccionada && mostrarResultado && esCorrecta && (
                                <Trophy className="text-yellow-500" size={24} /> // Marca la respuesta correcta
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    
                    {mostrarResultado && (
                      <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong className="font-bold">Explicación:</strong> {pregunta.explicacion}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={verificarPreguntas}
                disabled={Object.keys(respuestas).length !== nivelActual.preguntas.length}
                className="w-full mt-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-black py-4 rounded-xl shadow-xl transition transform hover:scale-[1.01]"
              >
                Verificar Respuestas
              </button>
            </div>
          </div>
        )}

        {etapa === 'completado' && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-50 duration-500 border-4 border-yellow-500">
              <div className="text-center">
                <div className="text-8xl mb-4 animate-jiggle">{nivelActual.recompensa.emoji}</div>
                <Trophy className="text-yellow-500 mx-auto mb-4" size={60} fill="#FACC15" />
                <h2 className="text-4xl font-black text-gray-800 mb-2">¡Nivel Completado!</h2>
                <p className="text-xl text-gray-600 mb-6">Has demostrado tu dominio del tema. ¡Felicidades!</p>
                
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-6 mb-6 border-4 border-yellow-400">
                  <h3 className="text-2xl font-black text-orange-700 mb-2 flex items-center justify-center gap-2">
                    <Award size={32} className="text-orange-500" />
                    {nivelActual.recompensa.nombre}
                  </h3>
                  <p className="text-gray-700 font-semibold">{nivelActual.recompensa.descripcion}</p>
                  <div className="mt-4 text-3xl font-black text-purple-600">
                    +{nivelActual.recompensa.puntos} puntos
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-purple-50 p-4 rounded-xl border-l-4 border-purple-500 shadow-md">
                    <p className="text-sm text-purple-600 font-semibold">Tiempo</p>
                    <p className="text-2xl font-black text-purple-700">{formatearTiempo(tiempo)}</p>
                  </div>
                  <div className="bg-pink-50 p-4 rounded-xl border-l-4 border-pink-500 shadow-md">
                    <p className="text-sm text-pink-600 font-semibold">Movimientos</p>
                    <p className="text-2xl font-black text-pink-700">{movimientos}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={inicializarPuzzle}
                    className="flex-1 bg-gray-700 hover:bg-gray-800 text-white py-3 rounded-xl font-black transition shadow-lg transform hover:scale-105"
                  >
                    <RotateCcw size={20} className="inline mr-2" /> Repetir Nivel
                  </button>
                  <button
                    onClick={() => navigate(`/mundos/${mundoId}`)}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white py-3 rounded-xl font-black transition shadow-xl transform hover:scale-105"
                  >
                    <Map size={20} className="inline mr-2" /> Ir a Siguiente
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default NivelJuego;