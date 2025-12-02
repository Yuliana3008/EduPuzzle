import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, BookOpen, Brain, Trophy, Users } from 'lucide-react';
import { Link } from "react-router-dom";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Colores temáticos: Biología (verde), Geografía (azul), Ciencias Naturales (naranja/amarillo)
  const themeColors = {
    biologia: ['#10b981', '#059669', '#34d399', '#6ee7b7'],
    geografia: ['#3b82f6', '#2563eb', '#60a5fa', '#06b6d4'],
    ciencias: ['#f59e0b', '#ea580c', '#fbbf24', '#fb923c']
  };

  // Iconos SVG temáticos para el fondo
  const ThematicIcon = ({ type, x, y, size, rotation }) => {
    const icons = {
      leaf: (
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm0-14c-3.3 0-6 2.7-6 6h2c0-2.2 1.8-4 4-4V6z" 
              fill="#10b981" opacity="0.3"/>
      ),
      dna: (
        <g fill="#059669" opacity="0.3">
          <circle cx="12" cy="6" r="2"/>
          <circle cx="12" cy="18" r="2"/>
          <path d="M8 8c2 2 4 4 8 0M8 16c2-2 4-4 8 0"/>
        </g>
      ),
      globe: (
        <circle cx="12" cy="12" r="10" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.3"/>
      ),
      mountain: (
        <path d="M12 3L2 20h20L12 3z" fill="#2563eb" opacity="0.3"/>
      ),
      atom: (
        <g fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.3">
          <circle cx="12" cy="12" r="8"/>
          <ellipse cx="12" cy="12" rx="3" ry="8" transform="rotate(45 12 12)"/>
          <ellipse cx="12" cy="12" rx="3" ry="8" transform="rotate(-45 12 12)"/>
          <circle cx="12" cy="12" r="2" fill="#f59e0b"/>
        </g>
      ),
      microscope: (
        <path d="M8 3h3v4H8V3zm0 6h3v2H8V9zm5-6h3v7h-3V3zM6 15c0-2 1.5-3.5 3.5-3.5h5c2 0 3.5 1.5 3.5 3.5H6z" 
              fill="#ea580c" opacity="0.3"/>
      )
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

  // SVG de pieza de rompecabezas temática (fondo)
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

  const backgroundIcons = [
    'leaf', 'dna', 'globe', 'mountain', 'atom', 'microscope'
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-900 via-blue-900 to-orange-900">
      
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

      {/* Contenedor principal con dos columnas */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 items-center">
          
          {/* COLUMNA IZQUIERDA - Información "Quiénes Somos" */}
          <div className="space-y-8">
            
            {/* Header con logo de piezas temáticas */}
            <div className="text-center lg:text-left">
              <div className="relative inline-block mb-6" style={{ width: '220px', height: '220px' }}>
                
                {/* Pieza 1: Biología (verde) - Superior Izquierda */}
                <div className="absolute" style={{ left: '5px', top: '5px' }}>
                  <svg width="110" height="110" viewBox="0 0 110 110">
                    <defs>
                      <filter id="glow-green">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <path d="M 0 25 L 25 25 Q 25 0 50 0 Q 75 0 75 25 L 100 25 L 100 50 Q 125 50 125 75 Q 125 100 100 100 L 75 100 L 75 75 L 25 75 L 25 100 L 0 100 Z" 
                          fill="#10b981" 
                          stroke="#fff" 
                          strokeWidth="3"
                          filter="url(#glow-green)"
                          style={{ filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.5))' }}/>
                    <text x="50" y="60" fontSize="40" textAnchor="middle" fill="white">🌿</text>
                  </svg>
                </div>
                
                {/* Pieza 2: Geografía (azul) - Superior Derecha */}
                <div className="absolute" style={{ left: '105px', top: '5px' }}>
                  <svg width="110" height="110" viewBox="0 0 110 110">
                    <defs>
                      <filter id="glow-blue">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <path d="M 0 0 L 75 0 L 100 0 L 100 25 L 100 75 L 100 100 L 75 100 L 25 100 L 25 75 Q 0 75 0 50 Q 0 25 25 25 L 25 0 Z" 
                          fill="#3b82f6" 
                          stroke="#fff" 
                          strokeWidth="3"
                          filter="url(#glow-blue)"
                          style={{ filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.5))' }}/>
                    <text x="50" y="60" fontSize="40" textAnchor="middle" fill="white">🌍</text>
                  </svg>
                </div>
                
                {/* Pieza 3: Ciencias Naturales (naranja) - Inferior Izquierda */}
                <div className="absolute" style={{ left: '5px', top: '105px' }}>
                  <svg width="110" height="110" viewBox="0 0 110 110">
                    <defs>
                      <filter id="glow-orange">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <path d="M 0 0 L 25 0 L 75 0 L 75 25 L 100 25 L 100 75 L 75 75 L 75 100 L 25 100 Q 25 75 0 75 Q -25 75 -25 50 Q -25 25 0 25 Z" 
                          fill="#f59e0b" 
                          stroke="#fff" 
                          strokeWidth="3"
                          filter="url(#glow-orange)"
                          style={{ filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.5))' }}/>
                    <text x="50" y="60" fontSize="40" textAnchor="middle" fill="white">🔬</text>
                  </svg>
                </div>
                
                {/* Pieza 4: Combinada (multicolor) - Inferior Derecha */}
                <div className="absolute" style={{ left: '105px', top: '105px' }}>
                  <svg width="110" height="110" viewBox="0 0 110 110">
                    <defs>
                      <linearGradient id="multi-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                    <path d="M 0 0 L 75 0 L 75 25 Q 100 25 100 50 Q 100 75 75 75 L 75 100 L 50 100 Q 50 125 25 125 Q 0 125 0 100 L 0 75 L 25 75 L 25 25 L 0 25 Z" 
                          fill="url(#multi-grad)" 
                          stroke="#fff" 
                          strokeWidth="3"
                          style={{ filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.5))' }}/>
                    <text x="50" y="60" fontSize="40" textAnchor="middle" fill="white">🧩</text>
                  </svg>
                </div>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-black mb-3 bg-gradient-to-r from-emerald-400 via-blue-400 to-orange-400 bg-clip-text text-transparent drop-shadow-2xl">
                EduPuzzle+
              </h1>
              <p className="text-white text-lg font-bold drop-shadow-lg mb-2">
                🌿 Biología • 🌍 Geografía • 🔬 Ciencias Naturales
              </p>
            </div>

            {/* Sección "¿Quiénes Somos?" */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
              <h2 className="text-3xl font-black mb-4 bg-gradient-to-r from-emerald-600 via-blue-600 to-orange-600 bg-clip-text text-transparent flex items-center gap-3">
                <Users size={32} />
                ¿Quiénes Somos?
              </h2>
              <p className="text-gray-700 font-semibold leading-relaxed mb-4">
                Somos una plataforma educativa innovadora que transforma el aprendizaje de ciencias en una experiencia interactiva y divertida a través de <span className="text-emerald-600 font-black">rompecabezas educativos</span>.
              </p>
              <p className="text-gray-700 font-semibold leading-relaxed">
                Nuestro proyecto modular combina <span className="text-blue-600 font-black">Biología</span>, <span className="text-cyan-600 font-black">Geografía</span> y <span className="text-orange-600 font-black">Ciencias Naturales</span> para crear un camino único hacia el conocimiento científico.
              </p>
            </div>

            {/* Características principales */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-emerald-500/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl text-center">
                <Brain className="mx-auto mb-3 text-white" size={40} />
                <h3 className="text-white font-black text-lg mb-2">Aprendizaje Activo</h3>
                <p className="text-emerald-100 font-semibold text-sm">Resuelve rompecabezas mientras aprendes</p>
              </div>
              
              <div className="bg-blue-500/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl text-center">
                <BookOpen className="mx-auto mb-3 text-white" size={40} />
                <h3 className="text-white font-black text-lg mb-2">Contenido Científico</h3>
                <p className="text-blue-100 font-semibold text-sm">3 áreas del conocimiento</p>
              </div>
              
              <div className="bg-orange-500/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl text-center">
                <Trophy className="mx-auto mb-3 text-white" size={40} />
                <h3 className="text-white font-black text-lg mb-2">Progreso Visible</h3>
                <p className="text-orange-100 font-semibold text-sm">Avanza pieza por pieza</p>
              </div>
            </div>

            {/* Texto decorativo */}
            <div className="text-center lg:text-left">
              <p className="text-white font-bold text-lg drop-shadow-lg">
                🧩 Descubre, Explora y Aprende 🧩
              </p>
              <p className="text-emerald-200 font-semibold drop-shadow-lg">
                ¡Arma tu camino al conocimiento científico!
              </p>
            </div>
          </div>

          {/* COLUMNA DERECHA - Formulario de Login */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
            <div className="relative">
              <div className="relative z-10 p-10 bg-white rounded-[40px] shadow-2xl transition-all duration-300 hover:shadow-emerald-500/50">
                
                {/* Barra superior temática */}
                <div className="flex h-3 mb-6 rounded-full overflow-hidden shadow-lg">
                  <div className="flex-1 bg-emerald-500"></div>
                  <div className="flex-1 bg-green-600"></div>
                  <div className="flex-1 bg-blue-500"></div>
                  <div className="flex-1 bg-cyan-500"></div>
                  <div className="flex-1 bg-orange-500"></div>
                  <div className="flex-1 bg-amber-400"></div>
                </div>

                <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Bienvenido de vuelta</h2>
                <p className="text-gray-600 mb-6 text-center font-semibold">Conecta con el conocimiento científico</p>
                
                {/* Login Form */}
                <div className="space-y-5">
                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      📧 Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600" size={20} />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border-4 border-emerald-300 rounded-xl focus:ring-4 focus:ring-emerald-400 focus:border-emerald-500 transition outline-none hover:border-emerald-400 bg-white" 
                        placeholder="tu@email.com" 
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      🔒 Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600" size={20} />
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3 border-4 border-blue-300 rounded-xl focus:ring-4 focus:ring-blue-400 focus:border-blue-500 transition outline-none hover:border-blue-400 bg-white" 
                        placeholder="••••••••" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800 transition"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Remember me and Forgot password */}
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="w-5 h-5 text-emerald-600 border-3 border-emerald-400 rounded focus:ring-emerald-500 cursor-pointer" />
                      <span className="text-gray-700 font-semibold group-hover:text-emerald-600">Recordarme</span>
                    </label>
                    <a href="#" className="text-orange-600 hover:text-orange-700 font-bold hover:underline">
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>

                  {/* Login Button con gradiente científico */}
                  <button 
                    type="button"
                    className="w-full py-4 rounded-xl font-bold text-white text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all relative overflow-hidden group"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #f59e0b 100%)'
                    }}
                  >
                    <span className="relative z-10">🎯 Iniciar Sesión</span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-dashed border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-gradient-to-r from-white via-emerald-50 to-white text-gray-600 font-semibold text-sm">
                      o conecta con
                    </span>
                  </div>
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-2 px-4 py-3 border-4 border-emerald-300 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition font-bold text-gray-700">
                    <span className="text-2xl">G</span>
                    Google
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-3 border-4 border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition font-bold text-gray-700">
                    <span className="text-2xl">⚙</span>
                    GitHub
                  </button>
                </div>

                {/* Sign up link */}
                <div className="mt-6 text-center">
                  <p className="text-gray-700 font-semibold">
                    ¿Primera vez aquí?{' '}
                    <Link 
                      to="/register"
                      className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-blue-600 to-orange-600 font-black hover:underline"
                    >
                      ¡Únete a la aventura científica! 🚀
                    </Link>
                  </p>
                </div>

                {/* Barra inferior temática */}
                <div className="flex h-3 mt-6 rounded-full overflow-hidden shadow-lg">
                  <div className="flex-1 bg-amber-400"></div>
                  <div className="flex-1 bg-orange-500"></div>
                  <div className="flex-1 bg-cyan-500"></div>
                  <div className="flex-1 bg-blue-500"></div>
                  <div className="flex-1 bg-green-600"></div>
                  <div className="flex-1 bg-emerald-500"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;