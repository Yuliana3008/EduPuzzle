import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Award, Star, Lock, Zap, Brain, Map, Loader } from 'lucide-react';

const Recompensas = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [recompensasObtenidas, setRecompensasObtenidas] = useState([]);
  const [trofeosMundo, setTrofeosMundo] = useState([]);
  const [coleccionEspecial, setColeccionEspecial] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    totalInsignias: 0,
    insigniasObtenidas: 0,
    piezasObtenidas: 0,
    totalPiezas: 5
  });

  const themeColors = {
    emerald: ['#10b981', '#059669', '#34d399', '#6ee7b7'],
    blue: ['#3b82f6', '#2563eb', '#60a5fa', '#06b6d4'],
    orange: ['#f59e0b', '#ea580c', '#fbbf24', '#fb923c']
  };
  
  const colorMap = {
    emerald: { main: 'emerald', border: 'border-emerald-500', bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50' },
    blue: { main: 'blue', border: 'border-blue-500', bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50' },
    orange: { main: 'orange', border: 'border-orange-500', bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-50' },
    purple: { main: 'purple', border: 'border-purple-500', bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-50' },
    default: { main: 'gray', border: 'border-gray-500', bg: 'bg-gray-500', text: 'text-gray-600', light: 'bg-gray-50' },
  };
  
  const getColorClasses = (colorName) => colorMap[colorName] || colorMap.default;

  // CARGAR RECOMPENSAS DESDE LA BD
  useEffect(() => {
    const fetchRecompensas = async () => {
      const token = localStorage.getItem('userToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/usuario/recompensas', {
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
          throw new Error('Error al cargar recompensas');
        }

        const data = await response.json();
        
        setRecompensasObtenidas(data.insignias);
        setTrofeosMundo(data.trofeos);
        setColeccionEspecial(data.coleccion);
        setEstadisticas(data.estadisticas);
        setLoading(false);

      } catch (err) {
        console.error('Error fetching rewards:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchRecompensas();
  }, [navigate]);

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

  // PANTALLA DE CARGA
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-blue-900 to-orange-900">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-black text-gray-800">Cargando recompensas...</h2>
        </div>
      </div>
    );
  }

  // PANTALLA DE ERROR
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-blue-900 to-orange-900">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-black text-gray-800 mb-4">Error al cargar recompensas</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

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
          const colors = themeColors[theme];
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
                color={colors[Math.floor(Math.random() * colors.length)]}
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
        
        {/* Header */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-white hover:text-emerald-300 mb-6 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg transition transform hover:scale-105"
        >
          <ArrowLeft size={20} />
          Volver al Dashboard
        </button>

        {/* Banner de Recompensas */}
        <div className="bg-white rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
          
          {/* Fondo de Gradiente Temático */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-blue-500 to-orange-500 opacity-90 rounded-3xl" style={{ zIndex: 1 }}></div>
          
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6" style={{ zIndex: 2 }}>
            <div className="flex-1 text-white text-center md:text-left">
              <h1 className="text-4xl sm:text-5xl font-black mb-2 drop-shadow-lg">
                🏆 Salón de Logros
              </h1>
              <p className="text-white opacity-90 text-lg font-semibold">
                Colecciona insignias, trofeos y completa la colección especial.
              </p>
            </div>
            <div className="text-center bg-white/20 rounded-xl p-5 shadow-inner border border-white">
              <Trophy size={48} className="mx-auto mb-2 text-white drop-shadow-md" />
              <p className="text-3xl font-black text-white">{estadisticas.insigniasObtenidas}/{estadisticas.totalInsignias}</p>
              <p className="text-sm opacity-90">Insignias Obtenidas</p>
            </div>
          </div>
        </div>

        {/* Contenedor de Secciones */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* COLUMNA DERECHA: Insignias por Nivel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-8 transition-all duration-300 hover:shadow-blue-500/30">
              <h2 className="text-2xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center gap-3">
                <Award className="text-blue-500" size={28} />
                Insignias por Nivel
              </h2>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recompensasObtenidas.map((insignia) => {
                  const colors = getColorClasses(insignia.color);
                  return (
                    <div
                      key={insignia.id}
                      className={`rounded-xl p-4 text-center transition transform shadow-md ${
                        insignia.obtenido
                          ? `${colors.light} border-b-4 ${colors.border} hover:shadow-lg`
                          : 'bg-gray-100 opacity-70 cursor-not-allowed border-b-2 border-gray-300'
                      }`}
                    >
                      <div className="relative inline-block mb-3">
                        <div className={`text-5xl ${insignia.obtenido ? '' : 'grayscale opacity-70'}`}>
                          {insignia.emoji}
                        </div>
                        {!insignia.obtenido && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-600 p-1 rounded-full">
                            <Lock className="text-white" size={16} />
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-800 mb-1">{insignia.nombre}</h3>
                      <p className="text-sm text-gray-600 mb-2">{insignia.descripcion}</p>
<span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        insignia.obtenido
                          ? `${colors.bg.replace('500', '100')} ${colors.text}`
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {insignia.mundo}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* COLUMNA IZQUIERDA: Trofeos y Colección */}
          <div className="lg:col-span-1 space-y-6">

            {/* Trofeos de Mundo */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border-4 border-emerald-400/50">
              <h2 className="text-2xl font-black mb-5 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-green-500 flex items-center gap-3">
                <Map className="text-emerald-500" size={28} />
                Trofeos de Mundo
              </h2>
              <div className="space-y-4">
                {trofeosMundo.map((trofeo, idx) => {
                  const colors = getColorClasses(trofeo.color);
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl flex items-center justify-between transition border-l-4 ${
                        trofeo.completado
                          ? `${colors.light} ${colors.border} shadow-md`
                          : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="text-3xl mr-4">{trofeo.emoji}</div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{trofeo.mundo}</h3>
                          {trofeo.completado ? (
                            <span className="text-sm font-bold text-yellow-600 flex items-center gap-1">
                              <Zap size={16} /> ¡Trofeo Obtenido!
                            </span>
                          ) : (
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`${colors.bg} h-full rounded-full transition-all`}
                                  style={{ width: `${trofeo.progreso}%` }}
                                />
                              </div>
                              <p className="text-xs font-medium text-gray-600">{trofeo.progreso}%</p>
                            </div>
                          )}
                        </div>
                      </div>
                      {trofeo.completado && <Trophy className="text-yellow-500 ml-4" size={24} fill="#FACC15" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Colección Especial */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border-4 border-orange-400/50">
              <h2 className="text-2xl font-black mb-5 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-purple-500 flex items-center gap-3">
                <Brain className="text-orange-500" size={28} />
                Colección Especial
              </h2>
              <p className="text-sm text-gray-600 mb-4">Reúne las 5 piezas del Súper Cerebro para desbloquear el secreto.</p>
              
              <div className="grid grid-cols-5 gap-2">
                {coleccionEspecial.map((pieza) => (
                  <div
                    key={pieza.id}
                    title={pieza.nombre}
                    className={`aspect-square rounded-xl flex items-center justify-center text-4xl transition ${
                      pieza.obtenido
                        ? 'bg-purple-100 text-purple-600 shadow-md border-2 border-purple-400'
                        : 'bg-gray-200 text-gray-500 border-2 border-dashed border-gray-400 opacity-60'
                    }`}
                  >
                    {pieza.obtenido ? '🧠' : '🔒'}
                  </div>
                ))}
              </div>

              {estadisticas.piezasObtenidas === 5 ? (
                <div className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-4 text-center">
                  <h3 className="text-lg font-bold">¡Colección Completa! 🎉</h3>
                  <p className="text-sm">¡Has revelado el premio secreto!</p>
                </div>
              ) : (
                <p className="mt-4 text-center text-sm font-semibold text-gray-700">
                    Piezas Obtenidas: {estadisticas.piezasObtenidas} / 5
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recompensas;