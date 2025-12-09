import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, CheckCircle, Star, Play, Trophy, Loader } from 'lucide-react';

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

const MundoNiveles = () => {
  const { mundoId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mundo, setMundo] = useState(null);
  const [niveles, setNiveles] = useState([]);

  // CARGAR NIVELES DEL MUNDO DESDE LA BD
  useEffect(() => {
    const fetchNiveles = async () => {
      const token = localStorage.getItem('userToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/usuario/mundos/${mundoId}/niveles`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('userToken');
            localStorage.removeItem('username');
            navigate('/login');
            return;
          }
          throw new Error('Error al cargar niveles');
        }

        const data = await response.json();
        
        setMundo(data.mundo);
        setNiveles(data.niveles);
        setLoading(false);

      } catch (err) {
        console.error('Error fetching levels:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchNiveles();
  }, [mundoId, navigate]);

  // Clases de Tailwind para aplicar colores fácilmente
  const colorClasses = {
    emerald: {
      gradient: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-500',
      text: 'text-emerald-600',
      border: 'border-emerald-500',
      lightBg: 'bg-emerald-50',
    },
    blue: {
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-500',
      text: 'text-blue-600',
      border: 'border-blue-500',
      lightBg: 'bg-blue-50',
    },
    orange: {
      gradient: 'from-orange-500 to-orange-600',
      bg: 'bg-orange-500',
      text: 'text-orange-600',
      border: 'border-orange-500',
      lightBg: 'bg-orange-50',
    }
  };

  // PANTALLA DE CARGA
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-blue-900 to-orange-900">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-black text-gray-800">Cargando niveles...</h2>
        </div>
      </div>
    );
  }

  // PANTALLA DE ERROR
  if (error || !mundo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-blue-900 to-orange-900">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-black text-gray-800 mb-4">Mundo no encontrado</h2>
          <p className="text-gray-600 mb-6">{error || 'Este mundo no existe'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  const colors = colorClasses[mundo.color];

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
      <div className="relative z-10 max-w-5xl mx-auto py-8">
        
        {/* Header */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-white hover:text-emerald-300 mb-6 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg transition transform hover:scale-105"
        >
          <ArrowLeft size={20} />
          Volver al Dashboard
        </button>

        {/* Banner del Mundo */}
        <div className="bg-white rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden border-4 border-gray-100">
          
          {/* Fondo de Gradiente Temático del Mundo */}
          <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} opacity-90 rounded-[1.25rem]`} style={{ zIndex: 1 }}></div>
          
          <div className="relative flex items-center gap-6" style={{ zIndex: 2 }}>
            <div className="text-7xl bg-white p-3 rounded-full shadow-lg border-4 border-white/50">{mundo.emoji}</div>
            <div className="flex-1 text-white">
              <h1 className="text-4xl font-black mb-2 drop-shadow-lg">{mundo.nombre}</h1>
              <p className="text-white opacity-90 text-lg mb-4 font-semibold">{mundo.descripcion}</p>
              
              <div className="flex items-center gap-4">
                <div className="bg-white/20 px-4 py-2 rounded-full text-sm font-bold">
                  <span className="font-extrabold">{mundo.nivelesCompletados}/{mundo.totalNiveles} Niveles</span>
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-full text-sm font-bold">
                  <span className="font-extrabold">{mundo.progreso}% Completado</span>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de progreso del mundo */}
          <div className="w-full bg-white bg-opacity-30 rounded-full h-3 mt-6 overflow-hidden relative" style={{ zIndex: 2 }}>
            <div
              className={`bg-white h-full rounded-full transition-all duration-500`}
              style={{ width: `${mundo.progreso}%` }}
            />
          </div>
        </div>

        {/* Lista de Niveles */}
        <div className="grid gap-6">
          {niveles.map((nivel) => (
            <div
              key={nivel.id}
              onClick={() => nivel.desbloqueado && navigate(`/mundos/${mundoId}/nivel/${nivel.id}`)}
              className={`bg-white rounded-2xl shadow-xl p-6 transition-all border-l-8 ${
                nivel.completado
                  ? 'border-emerald-500 hover:shadow-2xl hover:scale-[1.01] cursor-pointer'
                  : nivel.desbloqueado
                  ? `${colors.border} hover:shadow-2xl hover:scale-[1.01] cursor-pointer`
                  : 'border-gray-300 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Icono de Estado / Número del nivel */}
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-black shadow-lg ${
                    nivel.completado
                      ? 'bg-emerald-500'
                      : nivel.desbloqueado
                      ? colors.bg
                      : 'bg-gray-500'
                  }`}>
                    {nivel.completado ? (
                      <CheckCircle size={28} />
                    ) : nivel.desbloqueado ? (
                      nivel.id
                    ) : (
                      <Lock size={24} />
                    )}
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-gray-800">{nivel.nombre}</h3>
                    {nivel.descripcion && (
                      <p className="text-sm text-gray-600 mt-1">{nivel.descripcion}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {nivel.completado ? (
                        <>
                          <div className="flex items-center gap-1">
                            {[...Array(3)].map((_, i) => (
                              <Star
                                key={i}
                                size={20}
                                className={i < nivel.estrellas ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                          <span className="text-sm bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold">
                            ✓ Ganado • {nivel.puntos} pts
                          </span>
                        </>
                      ) : nivel.desbloqueado ? (
                        <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">
                          💎 {nivel.puntos} puntos disponibles
                        </span>
                      ) : (
                        <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-semibold">
                          🔒 Completa el nivel anterior
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3">
                  {nivel.desbloqueado && !nivel.completado && (
                    <button className={`bg-gradient-to-r ${colors.gradient} hover:opacity-90 text-white px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 shadow-lg transform hover:scale-[1.02]`}>
                      <Play size={20} fill="white" />
                      Jugar
                    </button>
                  )}

                  {nivel.completado && (
                    <button className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg transform hover:scale-[1.02]">
                      Repetir
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recompensa del Mundo (si está al 100%) */}
        {mundo.progreso === 100 && (
          <div className="mt-8 bg-white rounded-3xl p-8 shadow-2xl relative overflow-hidden border-4 border-yellow-500/80">
            <div className={`absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 opacity-90 rounded-[1.25rem]`} style={{ zIndex: 1 }}></div>
            <div className="relative flex items-center gap-4 text-white" style={{ zIndex: 2 }}>
              <Trophy size={48} className="drop-shadow-lg" />
              <div>
                <h3 className="text-3xl font-black drop-shadow-lg">¡Trofeo de {mundo.nombre} Ganado!</h3>
                <p className="opacity-90 font-semibold">Has dominado este mundo. ¡Un nuevo Trofeo se ha añadido a tu Salón de Logros!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MundoNiveles;