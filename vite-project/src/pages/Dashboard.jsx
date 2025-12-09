import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Importamos Bell para la notificación
import { LogOut, User, Trophy, Star, TrendingUp, Award, Play, Lock, Map, Loader, Bell } from 'lucide-react'; 

const Dashboard = () => {
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  const themeColors = {
    biologia: ['#10b981', '#059669', '#34d399', '#6ee7b7'],
    geografia: ['#3b82f6', '#2563eb', '#60a5fa', '#06b6d4'],
    ciencias: ['#f59e0b', '#ea580c', '#fbbf24', '#fb923c']
  };

  // CARGAR DATOS DEL USUARIO DESDE LA BD
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('userToken');
      const storedUsername = localStorage.getItem('username');
      
      if (!token || !storedUsername) {
        navigate('/login');
        return;
      }

      setUsername(storedUsername);

      try {
        const response = await fetch('http://localhost:5000/api/usuario/progreso', {
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
          throw new Error('Error al cargar los datos del usuario');
        }

        const data = await response.json();
        setUserData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('username');
    navigate('/');
  };

  const mundos = [
    { id: 1, nombre: 'Biología', emoji: '🌿', color: 'emerald' },
    { id: 2, nombre: 'Geografía', emoji: '🌍', color: 'blue' },
    { id: 3, nombre: 'Ciencias Naturales', emoji: '🔬', color: 'orange' },
    { id: 4, nombre: 'Historia', emoji: '📚', color: 'purple' },
  ];

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
          <h2 className="text-2xl font-black text-gray-800">Cargando tu progreso...</h2>
          <p className="text-gray-600 mt-2">Espera un momento</p>
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
          <h2 className="text-2xl font-black text-gray-800 mb-4">Error al cargar datos</h2>
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

  // Combinar mundos con progreso de la BD
  const mundosConProgreso = mundos.map(mundo => {
    const progresoMundo = userData.mundos?.find(m => m.mundoId === mundo.id);
    return {
      ...mundo,
      desbloqueado: progresoMundo?.desbloqueado || false,
      progreso: progresoMundo?.progreso || 0
    };
  });

  const mundoActual = mundosConProgreso.find(m => m.desbloqueado && m.progreso < 100) || mundosConProgreso[0];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-900 via-blue-900 to-orange-900 font-sans">
      
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

      {/* Piezas de rompecabezas */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({length: 25}).map((_, i) => {
          const size = 70 + Math.random() * 50;
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          const rotation = Math.random() * 360;
          const theme = i % 3 === 0 ? 'biologia' : i % 3 === 1 ? 'geografia' : 'ciencias';
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
      
        /* Estilo para el borde degradado del header. No se puede hacer con clases de Tailwind */
        .header-card-gradient-border {
            position: relative;
            z-index: 10;
        }

        .header-card-gradient-border::after {
            content: '';
            position: absolute;
            top: -2px; 
            left: -2px; 
            right: -2px; 
            bottom: -2px;
            background: linear-gradient(90deg, #10b981, #3b82f6, #f59e0b);
            z-index: -1;
            border-radius: 1.75rem; /* Ajuste para rounded-3xl */
        }
      `}</style>
      
      {/* Contenido Principal */}
      <div className="relative z-10">
        
        {/* Header Superior (Implementación del diseño de la imagen) */}
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-4">
            <div className="bg-white rounded-3xl shadow-2xl p-4 md:p-6 mb-8 relative header-card-gradient-border">
                
                {/* Contenido del Header */}
                <div className="flex justify-between items-center relative z-20">
                    
                    {/* Sección de Avatar y Nombre */}
                    <div className="flex items-center gap-4">
                        {/* Avatar (Cambiado para coincidir con la imagen) */}
                        <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            {/* Nombre del Usuario */}
                            <h1 className="text-2xl font-black text-gray-800 capitalize leading-snug">
                                {username.split(' ')[0]}
                            </h1>
                            {/* Nivel y Puntos Totales */}
                            <p className="text-sm text-gray-600 font-semibold mt-0.5">
                                Nivel <span className="text-blue-600 font-bold">{userData.nivel}</span> • 
                                <span className="text-orange-600 font-bold"> {userData.puntosTotales}</span> puntos
                            </p>
                        </div>
                    </div>
                    
                    {/* Botones de Notificación y Salir */}
                    <div className="flex items-center gap-3">
                        {/* Botón de Notificación */}
                        <button className="relative p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition">
                            <Bell size={20} />
                            {/* Círculo de notificación roja */}
                            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
                        </button>
                        
                        {/* Botón de Salir */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-full shadow-lg hover:bg-blue-600 transition transform hover:scale-105 active:scale-95"
                        >
                            Salir
                            <LogOut size={20} />
                        </button>
                    </div>

                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          
          {/* Panel de Progreso Principal */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 mb-8 border-t-8 border-emerald-500 transition-all duration-300 hover:shadow-emerald-500/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-600">
                  ¡Bienvenido de nuevo, {username.split(' ')[0]}! 🎉
                </h2>
                <p className="text-gray-700 font-semibold">Continúa tu aventura y arma el rompecabezas del conocimiento.</p>
              </div>

              {/* Racha (Lo dejo aquí ya que no estaba en la imagen, pero es buena data) */}
              <div className="bg-orange-100 border-4 border-orange-400 px-4 py-2 rounded-xl shadow-md text-center hidden sm:block">
                <p className="text-xs text-orange-700 font-bold">🔥 Racha</p>
                <p className="text-3xl font-black text-orange-600">{userData.racha} días</p>
              </div>
            </div>

            {/* Barra de progreso general */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-bold text-gray-800">Progreso General</span>
                <span className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-600">
                  {userData.progresoGeneral}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden shadow-inner">
                <div 
                  className="h-full rounded-full transition-all duration-700"
                  style={{ 
                    width: `${userData.progresoGeneral}%`,
                    background: 'linear-gradient(90deg, #10b981, #3b82f6, #f59e0b)'
                  }}
                />
              </div>
            </div>

            {/* Botón principal de juego */}
            <button
              onClick={() => navigate(`/mundos/${mundoActual.id}`)}
              className="w-full bg-gradient-to-r from-emerald-600 via-blue-600 to-orange-600 hover:from-emerald-700 hover:to-orange-700 text-white font-black py-4 rounded-xl shadow-xl hover:shadow-2xl transition transform hover:scale-[1.01] flex items-center justify-center gap-3"
            >
              <Play size={24} fill="white" />
              <span className="text-xl">Continuar con {mundoActual.nombre}</span>
            </button>
          </div>

          {/* Estadísticas Rápidas */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-b-4 border-blue-500 transition hover:shadow-blue-300/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Nivel Actual</p>
                  <p className="text-4xl font-black text-blue-600">{userData.nivel}</p>
                </div>
                <TrendingUp className="text-blue-500" size={40} />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-b-4 border-orange-500 transition hover:shadow-orange-300/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Puntos Totales</p>
                  <p className="text-4xl font-black text-orange-600">{userData.puntosTotales}</p>
                </div>
                <Star className="text-orange-500" size={40} />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-b-4 border-emerald-500 transition hover:shadow-emerald-300/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Insignias</p>
                  <p className="text-4xl font-black text-emerald-600">{userData.insignias}</p>
                </div>
                <Award className="text-emerald-500" size={40} />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-b-4 border-cyan-500 transition hover:shadow-cyan-300/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Trofeos</p>
                  <p className="text-4xl font-black text-cyan-600">{userData.trofeos}</p>
                </div>
                <Trophy className="text-cyan-500" size={40} />
              </div>
            </div>
          </div>

          {/* Accesos Rápidos */}
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            <button
              onClick={() => navigate('/recompensas')}
              className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition transform hover:scale-105 border-t-4 border-orange-500 text-center"
            >
              <Trophy className="text-orange-600 mx-auto mb-3" size={40} />
              <h3 className="text-xl font-black text-gray-800">Recompensas</h3>
              <p className="text-gray-600 text-sm mt-1">Ver tus logros y colecciones</p>
            </button>

            <button
              onClick={() => navigate('/estadisticas')}
              className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition transform hover:scale-105 border-t-4 border-emerald-500 text-center"
            >
              <TrendingUp className="text-emerald-600 mx-auto mb-3" size={40} />
              <h3 className="text-xl font-black text-gray-800">Estadísticas</h3>
              <p className="text-gray-600 text-sm mt-1">Tu progreso detallado y gráficas</p>
            </button>

            <button
              onClick={() => navigate('/perfil')}
              className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition transform hover:scale-105 border-t-4 border-blue-500 text-center"
            >
              <User className="text-blue-600 mx-auto mb-3" size={40} />
              <h3 className="text-xl font-black text-gray-800">Perfil</h3>
              <p className="text-gray-600 text-sm mt-1">Configuración y datos de avatar</p>
            </button>
          </div>

          {/* Mundos Disponibles */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 transition-all duration-300 hover:shadow-blue-500/50">
            <h2 className="text-2xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-600 flex items-center gap-3">
              <Map className="text-blue-500" size={28} />
              Mapa de Mundos Disponibles
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {mundosConProgreso.map((mundo) => {
                const colorClasses = {
                  emerald: 'from-emerald-500 to-emerald-600 border-emerald-500',
                  blue: 'from-blue-500 to-blue-600 border-blue-500',
                  orange: 'from-orange-500 to-orange-600 border-orange-500',
                  purple: 'from-gray-500 to-gray-600 border-gray-500'
                };
                const iconColor = mundo.desbloqueado ? 'text-white' : 'text-gray-700';

                return (
                  <div
                    key={mundo.id}
                    onClick={() => mundo.desbloqueado && navigate(`/mundos/${mundo.id}`)}
                    className={`relative rounded-xl shadow-lg p-6 transition transform border-4 ${
                      mundo.desbloqueado
                        ? 'hover:shadow-xl hover:scale-[1.02] cursor-pointer text-white bg-gradient-to-r ' + colorClasses[mundo.color]
                        : 'opacity-70 cursor-not-allowed bg-gray-200 text-gray-800 border-gray-400'
                    }`}
                  >
                    {!mundo.desbloqueado && (
                      <div className="absolute top-4 right-4">
                        <Lock className="text-gray-700" size={28} />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`text-5xl ${iconColor}`}>{mundo.emoji}</div>
                      <div className="flex-1">
                        <h3 className={`text-2xl font-black ${mundo.desbloqueado ? 'text-white' : 'text-gray-800'}`}>
                          {mundo.nombre}
                        </h3>
                        {mundo.desbloqueado ? (
                          <p className="text-white opacity-90 font-semibold text-sm">Progreso: {mundo.progreso}%</p>
                        ) : (
                          <p className="text-gray-700 font-semibold text-sm">¡Completa el mundo anterior!</p>
                        )}
                      </div>
                  </div>

                    {mundo.desbloqueado && (
                      <div className="w-full bg-white bg-opacity-30 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-white h-full rounded-full transition-all"
                          style={{ width: `${mundo.progreso}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;