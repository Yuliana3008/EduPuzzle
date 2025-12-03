import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Trophy, Clock } from 'lucide-react';

const PuzzleGame = () => {
  const [pieces, setPieces] = useState([]);
  const [board, setBoard] = useState([]);
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [completado, setCompletado] = useState(false);
  const [movimientos, setMovimientos] = useState(0);
  const [tiempo, setTiempo] = useState(0);
  const [tiempoActivo, setTiempoActivo] = useState(true);

  const puzzleConfig = {
    nombre: 'Paisaje Natural',
    imagen: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    filas: 5,
    columnas: 6
  };

  // Generar formas aleatorias para cada pieza
  const generarFormasPiezas = (filas, columnas) => {
    const formas = [];
    const totalPiezas = filas * columnas;
    
    for (let i = 0; i < totalPiezas; i++) {
      const fila = Math.floor(i / columnas);
      const columna = i % columnas;
      
      formas.push({
        top: fila === 0 ? 'plano' : (Math.random() > 0.5 ? 'entrante' : 'saliente'),
        right: columna === columnas - 1 ? 'plano' : (Math.random() > 0.5 ? 'entrante' : 'saliente'),
        bottom: fila === filas - 1 ? 'plano' : (Math.random() > 0.5 ? 'entrante' : 'saliente'),
        left: columna === 0 ? 'plano' : (Math.random() > 0.5 ? 'entrante' : 'saliente'),
      });
    }
    
    return formas;
  };

  const [formasPiezas] = useState(() => 
    generarFormasPiezas(puzzleConfig.filas, puzzleConfig.columnas)
  );

  // Temporizador
  useEffect(() => {
    let interval;
    if (tiempoActivo && !completado) {
      interval = setInterval(() => {
        setTiempo(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [tiempoActivo, completado]);

  useEffect(() => {
    inicializarPuzzle();
  }, []);

  const inicializarPuzzle = () => {
    const { filas, columnas } = puzzleConfig;
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
    
    setCompletado(false);
    setMovimientos(0);
    setTiempo(0);
    setTiempoActivo(true);
  };

  const generarPathPieza = (forma, ancho, alto) => {
    const tab = ancho * 0.2; // Tamaño de las pestañas
    
    let path = `M 0,0`;
    
    // Top
    if (forma.top === 'plano') {
      path += ` L ${ancho},0`;
    } else if (forma.top === 'saliente') {
      path += ` L ${ancho * 0.4},0 
                Q ${ancho * 0.4},${-tab} ${ancho * 0.5},${-tab}
                Q ${ancho * 0.6},${-tab} ${ancho * 0.6},0
                L ${ancho},0`;
    } else {
      path += ` L ${ancho * 0.4},0 
                Q ${ancho * 0.4},${tab} ${ancho * 0.5},${tab}
                Q ${ancho * 0.6},${tab} ${ancho * 0.6},0
                L ${ancho},0`;
    }
    
    // Right
    if (forma.right === 'plano') {
      path += ` L ${ancho},${alto}`;
    } else if (forma.right === 'saliente') {
      path += ` L ${ancho},${alto * 0.4}
                Q ${ancho + tab},${alto * 0.4} ${ancho + tab},${alto * 0.5}
                Q ${ancho + tab},${alto * 0.6} ${ancho},${alto * 0.6}
                L ${ancho},${alto}`;
    } else {
      path += ` L ${ancho},${alto * 0.4}
                Q ${ancho - tab},${alto * 0.4} ${ancho - tab},${alto * 0.5}
                Q ${ancho - tab},${alto * 0.6} ${ancho},${alto * 0.6}
                L ${ancho},${alto}`;
    }
    
    // Bottom
    if (forma.bottom === 'plano') {
      path += ` L 0,${alto}`;
    } else if (forma.bottom === 'saliente') {
      path += ` L ${ancho * 0.6},${alto}
                Q ${ancho * 0.6},${alto + tab} ${ancho * 0.5},${alto + tab}
                Q ${ancho * 0.4},${alto + tab} ${ancho * 0.4},${alto}
                L 0,${alto}`;
    } else {
      path += ` L ${ancho * 0.6},${alto}
                Q ${ancho * 0.6},${alto - tab} ${ancho * 0.5},${alto - tab}
                Q ${ancho * 0.4},${alto - tab} ${ancho * 0.4},${alto}
                L 0,${alto}`;
    }
    
    // Left
    if (forma.left === 'plano') {
      path += ` L 0,0`;
    } else if (forma.left === 'saliente') {
      path += ` L 0,${alto * 0.6}
                Q ${-tab},${alto * 0.6} ${-tab},${alto * 0.5}
                Q ${-tab},${alto * 0.4} 0,${alto * 0.4}
                L 0,0`;
    } else {
      path += ` L 0,${alto * 0.6}
                Q ${tab},${alto * 0.6} ${tab},${alto * 0.5}
                Q ${tab},${alto * 0.4} 0,${alto * 0.4}
                L 0,0`;
    }
    
    path += ` Z`;
    return path;
  };

  const handleDragStart = (e, pieza) => {
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
        p.id === draggedPiece.id 
          ? { ...p, posicionActual: posicion }
          : p
      );
      
      const nuevoTablero = [...board];
      
      if (nuevoTablero[posicion] !== null) {
        const piezaAnterior = nuevasPiezas.find(p => p.id === nuevoTablero[posicion]);
        if (piezaAnterior) {
          const index = nuevasPiezas.indexOf(piezaAnterior);
          nuevasPiezas[index] = { ...piezaAnterior, posicionActual: null };
        }
      }
      
      nuevoTablero[posicion] = draggedPiece.id;
      
      setPieces(nuevasPiezas);
      setBoard(nuevoTablero);
      setDraggedPiece(null);
      
      verificarCompletado(nuevasPiezas);
    } else {
      const nuevasPiezas = pieces.map(p => 
        p.id === draggedPiece.id 
          ? { ...p, posicionActual: posicion }
          : p
      );
      
      const nuevoTablero = [...board];
      nuevoTablero[draggedPiece.posicionActual] = null;
      
      if (nuevoTablero[posicion] !== null) {
        const piezaIntercambio = nuevasPiezas.find(p => p.id === nuevoTablero[posicion]);
        if (piezaIntercambio) {
          const index = nuevasPiezas.indexOf(piezaIntercambio);
          nuevasPiezas[index] = { ...piezaIntercambio, posicionActual: draggedPiece.posicionActual };
          nuevoTablero[draggedPiece.posicionActual] = piezaIntercambio.id;
        }
      }
      
      nuevoTablero[posicion] = draggedPiece.id;
      
      setPieces(nuevasPiezas);
      setBoard(nuevoTablero);
      setDraggedPiece(null);
      
      verificarCompletado(nuevasPiezas);
    }
  };

  const handleDropEnArea = () => {
    if (!draggedPiece || draggedPiece.posicionActual === null) return;

    setMovimientos(prev => prev + 1);

    const nuevasPiezas = pieces.map(p => 
      p.id === draggedPiece.id 
        ? { ...p, posicionActual: null }
        : p
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
      setCompletado(true);
      setTiempoActivo(false);
    }
  };

  const formatearTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const { filas, columnas, imagen, nombre } = puzzleConfig;
  const anchoPieza = 90;
  const altoPieza = 90;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
          <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition bg-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl">
            <ArrowLeft size={20} />
            Volver
          </button>
          
          <div className="flex gap-3 flex-wrap">
            <div className="bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <Clock size={20} className="text-blue-600" />
              <span className="font-bold text-gray-800">{formatearTiempo(tiempo)}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
              <span className="font-bold text-gray-800">Movimientos: {movimientos}</span>
            </div>
            <button
              onClick={inicializarPuzzle}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition"
            >
              <RotateCcw size={20} />
              Reiniciar
            </button>
          </div>
        </div>

        {/* Título */}
        <div className="bg-white rounded-xl p-4 shadow-xl mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center">{nombre}</h1>
          <p className="text-gray-600 text-center mt-1">Arrastra las piezas para completar el rompecabezas</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Área de piezas disponibles */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-4 shadow-xl">
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                🧩 Piezas ({pieces.filter(p => p.posicionActual === null).length})
              </h2>
              <div 
                className="grid grid-cols-3 gap-3 min-h-[400px] bg-gray-50 p-3 rounded-lg"
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
                        className="cursor-move hover:opacity-80 transition flex items-center justify-center"
                        style={{
                          width: anchoPieza + 20,
                          height: altoPieza + 20,
                        }}
                      >
                        <svg 
                          width={anchoPieza + 20} 
                          height={altoPieza + 20}
                          style={{ filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.3))' }}
                        >
                          <defs>
                            <pattern
                              id={`pattern-${pieza.id}`}
                              x="0"
                              y="0"
                              width="1"
                              height="1"
                            >
                              <image
                                href={imagen}
                                x={-pieza.columna * anchoPieza}
                                y={-pieza.fila * altoPieza}
                                width={columnas * anchoPieza}
                                height={filas * altoPieza}
                              />
                            </pattern>
                            <clipPath id={`clip-${pieza.id}`}>
                              <path d={pathData} transform="translate(10, 10)" />
                            </clipPath>
                          </defs>
                          <path
                            d={pathData}
                            transform="translate(10, 10)"
                            fill={`url(#pattern-${pieza.id})`}
                            stroke="#333"
                            strokeWidth="1"
                            clipPath={`url(#clip-${pieza.id})`}
                          />
                        </svg>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Tablero del puzzle */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-4 shadow-xl">
              <h2 className="text-lg font-bold text-gray-800 mb-3">🎯 Tablero del Rompecabezas</h2>
              <div className="flex justify-center overflow-auto">
                <div 
                  className="inline-grid gap-0 bg-gray-200 p-2 rounded-lg shadow-inner"
                  style={{
                    gridTemplateColumns: `repeat(${columnas}, ${anchoPieza}px)`,
                    gridTemplateRows: `repeat(${filas}, ${altoPieza}px)`
                  }}
                >
                  {board.map((piezaId, index) => (
                    <div
                      key={index}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDropEnTablero(index)}
                      className="bg-white flex items-center justify-center relative"
                      style={{
                        width: `${anchoPieza}px`,
                        height: `${altoPieza}px`
                      }}
                    >
                      {piezaId !== null && (() => {
                        const pieza = pieces.find(p => p.id === piezaId);
                        const esCorrecta = pieza && pieza.posicionCorrecta === index;
                        const forma = formasPiezas[piezaId];
                        const pathData = generarPathPieza(forma, anchoPieza, altoPieza);
                        
                        return (
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, pieza)}
                            className="cursor-move absolute"
                            style={{ top: 0, left: 0 }}
                          >
                            <svg 
                              width={anchoPieza} 
                              height={altoPieza}
                              style={{ 
                                filter: esCorrecta 
                                  ? 'drop-shadow(0 0 4px rgba(34,197,94,0.8))' 
                                  : 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))'
                              }}
                            >
                              <defs>
                                <pattern
                                  id={`pattern-board-${piezaId}`}
                                  x="0"
                                  y="0"
                                  width="1"
                                  height="1"
                                >
                                  <image
                                    href={imagen}
                                    x={-pieza.columna * anchoPieza}
                                    y={-pieza.fila * altoPieza}
                                    width={columnas * anchoPieza}
                                    height={filas * altoPieza}
                                  />
                                </pattern>
                                <clipPath id={`clip-board-${piezaId}`}>
                                  <path d={pathData} />
                                </clipPath>
                              </defs>
                              <path
                                d={pathData}
                                fill={`url(#pattern-board-${piezaId})`}
                                stroke={esCorrecta ? '#22c55e' : '#333'}
                                strokeWidth={esCorrecta ? '2' : '1'}
                                clipPath={`url(#clip-board-${piezaId})`}
                              />
                            </svg>
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de victoria */}
        {completado && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="text-center">
                <Trophy className="text-yellow-500 mx-auto mb-4" size={80} />
                <h2 className="text-4xl font-bold text-gray-800 mb-3">¡Felicidades! 🎉</h2>
                <p className="text-gray-600 mb-2 text-lg">Has completado el rompecabezas</p>
                
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 my-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm">Tiempo</p>
                      <p className="text-2xl font-bold text-purple-600">{formatearTiempo(tiempo)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Movimientos</p>
                      <p className="text-2xl font-bold text-pink-600">{movimientos}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={inicializarPuzzle}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition shadow-lg"
                  >
                    Jugar de nuevo
                  </button>
                  <button
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-lg font-semibold transition shadow-lg"
                  >
                    Siguiente puzzle
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

export default PuzzleGame;