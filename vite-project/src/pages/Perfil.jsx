import React, { useState } from 'react';
// Mock de useNavigate para que el componente sea ejecutable
const useNavigate = () => (path) => { console.log("Navigating to:", path); };
// Mock de alert para evitar problemas en el iframe
const alert = (message) => console.log('Alerta:', message); 

import { ArrowLeft, User, Mail, Calendar, Edit2, Save, Settings, Shield, Zap, Heart } from 'lucide-react';

const Perfil = () => {
  const navigate = useNavigate();
  const [editando, setEditando] = useState(false);
  
  // Datos simulados del usuario, utilizando localStorage para el nombre
  const [userData, setUserData] = useState({
    nombre: localStorage.getItem('username') || 'Explorador Científico',
    email: 'usuario@edupuzzle.com',
    fechaRegistro: '2024-11-15',
    nivel: 5,
    puntos: 450,
    avatar: '🧑‍🎓'
  });

  const [configuracion, setConfiguracion] = useState({
    sonido: true,
    musica: true,
    notificaciones: true,
    modoOscuro: false,
    dificultad: 'medio'
  });

  const avatares = ['👤', '😊', '🤓', '🧑‍🎓', '👨‍🔬', '👩‍🔬', '🧑‍💻', '🦸', '🦸‍♀️', '🧙', '🧙‍♀️', '🐱', '🐶', '🦊', '🐼', '🦁'];

  // Colores temáticos: Biología (verde), Geografía (azul), Ciencias Naturales (naranja/amarillo)
  const themeColors = {
    biologia: ['#10b981', '#059669', '#34d399', '#6ee7b7'], // Esmeralda/Verde
    geografia: ['#3b82f6', '#2563eb', '#60a5fa', '#06b6d4'], // Azul/Cian
    ciencias: ['#f59e0b', '#ea580c', '#fbbf24', '#fb923c'] // Naranja/Ámbar
  };

  const handleGuardar = () => {
    localStorage.setItem('username', userData.nombre);
    setEditando(false);
    alert('Perfil actualizado correctamente');
  };

  const handleConfigChange = (key, value) => {
    setConfiguracion(prev => ({ ...prev, [key]: value }));
  };

  const calcularDiasActivo = () => {
    const fechaRegistro = new Date(userData.fechaRegistro);
    const hoy = new Date();
    const diferencia = Math.floor((hoy - fechaRegistro) / (1000 * 60 * 60 * 24));
    return diferencia;
  };
  
  // --- HELPERS DE DISEÑO (Para el fondo flotante) ---
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
      `}</style>
      
      {/* Contenido Principal */}
      <div className="relative z-10 max-w-6xl mx-auto py-8">
        
        {/* Header */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-white hover:text-emerald-300 mb-6 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg transition transform hover:scale-105"
        >
          <ArrowLeft size={20} />
          Volver al Dashboard
        </button>

        {/* Banner del Perfil */}
        <div className="bg-white rounded-3xl p-8 mb-6 shadow-2xl relative overflow-hidden">
          
          {/* Fondo de Gradiente Temático */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-blue-500 to-orange-500 opacity-90 rounded-3xl" style={{ zIndex: 1 }}></div>
          
          <div className="relative flex flex-col md:flex-row items-center gap-6" style={{ zIndex: 2 }}>
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-5xl shadow-xl border-4 border-white">
              {userData.avatar}
            </div>
            <div className="flex-1 text-white text-center md:text-left">
              <h1 className="text-4xl font-black mb-2 drop-shadow-lg">
                {userData.nombre}
              </h1>
              <div className="flex flex-col sm:flex-row gap-4 text-white opacity-90 font-semibold text-sm justify-center md:justify-start">
                <span className="flex items-center gap-1">
                  <Mail size={16} /> {userData.email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={16} /> Miembro desde hace {calcularDiasActivo()} días
                </span>
              </div>
            </div>
            <button
              onClick={() => editando ? handleGuardar() : setEditando(true)}
              className="bg-white text-gray-800 font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 shadow-lg hover:bg-gray-100 transform hover:scale-105 active:scale-95"
            >
              {editando ? <Save size={20} className="text-emerald-600"/> : <Edit2 size={20} className="text-orange-600"/>}
              {editando ? 'Guardar Cambios' : 'Editar Perfil'}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* COLUMNA IZQUIERDA: INFORMACIÓN Y CONFIGURACIÓN */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Datos Personales */}
            <div className="bg-white rounded-3xl shadow-xl p-8 transition-all duration-300 hover:shadow-orange-500/30">
              <h2 className="text-2xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-500 flex items-center gap-3">
                <User className="text-orange-500" size={28} />
                Información Personal
              </h2>

              {editando ? (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nombre de Usuario</label>
                    <input
                      type="text"
                      value={userData.nombre}
                      onChange={(e) => setUserData({ ...userData, nombre: e.target.value })}
                      className="w-full px-4 py-3 border-4 border-orange-300 rounded-xl focus:ring-4 focus:ring-orange-400 focus:border-orange-500 transition outline-none hover:border-orange-400 bg-white"
                      placeholder="Nombre de Usuario"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={userData.email}
                      onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                      className="w-full px-4 py-3 border-4 border-emerald-300 rounded-xl focus:ring-4 focus:ring-emerald-400 focus:border-emerald-500 transition outline-none hover:border-emerald-400 bg-white"
                      placeholder="Email"
                      readOnly // Email is usually read-only
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Selecciona tu Avatar</label>
                    <div className="grid grid-cols-8 gap-2">
                      {avatares.map((avatar, idx) => (
                        <button
                          key={idx}
                          onClick={() => setUserData({ ...userData, avatar })}
                          className={`text-4xl p-3 rounded-xl transition transform hover:scale-110 shadow-md ${
                            userData.avatar === avatar
                              ? 'bg-blue-100 ring-4 ring-blue-500 text-blue-800'
                              : 'bg-gray-50 hover:bg-blue-50'
                          }`}
                        >
                          {avatar}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-orange-50 border-l-4 border-orange-400 rounded-xl shadow-sm">
                    <span className="font-bold text-gray-700">Nombre de Usuario</span>
                    <span className="text-gray-900 font-semibold">{userData.nombre}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-emerald-50 border-l-4 border-emerald-400 rounded-xl shadow-sm">
                    <span className="font-bold text-gray-700">Email</span>
                    <span className="text-gray-900 font-semibold">{userData.email}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 border-l-4 border-blue-400 rounded-xl shadow-sm">
                    <span className="font-bold text-gray-700">Registro</span>
                    <span className="text-gray-900 font-semibold">{userData.fechaRegistro}</span>
                  </div>
                </div>
              )}
              {/* Botón Guardar si no está en el banner */}
              {editando && (
                <button
                  onClick={handleGuardar}
                  className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-blue-500 text-white py-3 rounded-xl font-bold hover:from-emerald-600 hover:to-blue-600 transition shadow-lg transform hover:scale-[1.01]"
                >
                  <Save size={20} className="inline mr-2" /> Guardar Cambios
                </button>
              )}
            </div>

            {/* 2. Configuración */}
            <div className="bg-white rounded-3xl shadow-xl p-8 transition-all duration-300 hover:shadow-emerald-500/30">
              <h2 className="text-2xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-cyan-500 flex items-center gap-3">
                <Settings className="text-emerald-500" size={28} />
                Ajustes de la Aventura
              </h2>

              <div className="space-y-4">
                {/* Sonido */}
                <div className="flex items-center justify-between p-4 bg-gray-50 border-2 border-emerald-100 rounded-xl">
                  <div>
                    <p className="font-bold text-gray-800">Efectos de Sonido</p>
                    <p className="text-sm text-gray-600">Al completar puzzles y obtener logros</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={configuracion.sonido}
                      onChange={(e) => handleConfigChange('sonido', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {/* Música */}
                <div className="flex items-center justify-between p-4 bg-gray-50 border-2 border-emerald-100 rounded-xl">
                  <div>
                    <p className="font-bold text-gray-800">Música de Fondo</p>
                    <p className="text-sm text-gray-600">Banda sonora de la exploración</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={configuracion.musica}
                      onChange={(e) => handleConfigChange('musica', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
                
                {/* Dificultad */}
                <div className="p-4 bg-gray-50 border-2 border-blue-100 rounded-xl">
                  <p className="font-bold text-gray-800 mb-3">Nivel de Dificultad</p>
                  <div className="flex gap-2">
                    {['facil', 'medio', 'dificil'].map((nivel) => (
                      <button
                        key={nivel}
                        onClick={() => handleConfigChange('dificultad', nivel)}
                        className={`flex-1 py-3 rounded-xl font-bold transition shadow-md transform hover:scale-[1.02] ${
                          configuracion.dificultad === nivel
                            ? 'bg-blue-600 text-white shadow-blue-400/50'
                            : 'bg-white text-gray-700 hover:bg-blue-50 border border-blue-300'
                        }`}
                      >
                        {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Seguridad (Integrado en Configuración) */}
                <div className="p-4 bg-gray-50 border-2 border-orange-100 rounded-xl">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Shield className="text-orange-500" size={24} />
                    Seguridad
                  </h3>
                  <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold transition mb-3 shadow-md">
                    Cambiar Contraseña
                  </button>
                  <button className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold transition shadow-md">
                    Eliminar Cuenta
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: ESTADÍSTICAS */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* 3. Próximo Nivel */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border-4 border-emerald-400/50">
              <h3 className="text-xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-600 flex items-center gap-2">
                <Zap className="text-emerald-500" size={24} /> Progreso de Nivel
              </h3>
              <p className="mb-4 text-gray-700 font-semibold">
                Necesitas <span className="text-emerald-600 font-black">50 puntos</span> más para el nivel {userData.nivel + 1}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden shadow-inner">
                <div 
                    className="h-full rounded-full transition-all duration-700" 
                    style={{ 
                        width: `${(userData.puntos / 500) * 100}%`,
                        background: 'linear-gradient(90deg, #10b981, #3b82f6)'
                    }} 
                />
              </div>
              <p className="text-sm mt-2 text-gray-600 font-bold">{userData.puntos} / 500 puntos</p>
            </div>

            {/* 4. Resumen */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border-4 border-blue-400/50">
              <h3 className="text-xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center gap-2">
                📊 Resumen de Estadísticas
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-emerald-50 border-b-4 border-emerald-500 rounded-xl shadow-md">
                  <span className="text-gray-700 font-bold">Nivel Actual</span>
                  <span className="text-3xl font-black text-emerald-600">{userData.nivel}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 border-b-4 border-orange-500 rounded-xl shadow-md">
                  <span className="text-gray-700 font-bold">Puntos Totales</span>
                  <span className="text-3xl font-black text-orange-600">{userData.puntos}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 border-b-4 border-blue-500 rounded-xl shadow-md">
                  <span className="text-gray-700 font-bold">Insignias</span>
                  <span className="text-3xl font-black text-blue-600">8</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 border-b-4 border-amber-500 rounded-xl shadow-md">
                  <span className="text-gray-700 font-bold">Racha Activa</span>
                  <span className="text-3xl font-black text-amber-600">7 🔥</span>
                </div>
              </div>
            </div>

            {/* 5. Logros Recientes */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border-4 border-orange-400/50">
              <h3 className="text-xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-emerald-600 flex items-center gap-2">
                🏆 Logros Recientes
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-orange-50 border-l-4 border-orange-400 rounded-xl shadow-sm hover:shadow-md transition">
                  <div className="text-3xl">🔬</div>
                  <div>
                    <p className="font-bold text-sm text-gray-800">Explorador Celular</p>
                    <p className="text-xs text-gray-600">Ciencias Naturales - Hace 2 días</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-emerald-50 border-l-4 border-emerald-400 rounded-xl shadow-sm hover:shadow-md transition">
                  <div className="text-3xl">🌱</div>
                  <div>
                    <p className="font-bold text-sm text-gray-800">Guardián Verde</p>
                    <p className="text-xs text-gray-600">Biología - Hace 3 días</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-xl shadow-sm hover:shadow-md transition">
                  <div className="text-3xl">🗺️</div>
                  <div>
                    <p className="font-bold text-sm text-gray-800">Explorador Mundial</p>
                    <p className="text-xs text-gray-600">Geografía - Hace 5 días</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;