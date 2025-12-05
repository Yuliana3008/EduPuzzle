import React, { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, AlertTriangle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

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

  // FUNCIÓN DE REGISTRO CORREGIDA
  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    
    setError("");
    setSuccess("");
    setLoading(true);

    // Validaciones
    if (!username || !email || !password) {
      setError("Por favor completa todos los campos");
      setLoading(false);
      return;
    }

    if (username.length < 3) {
      setError("El nombre de usuario debe tener al menos 3 caracteres");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor ingresa un email válido");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/registro", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ 
          username, 
          email, 
          password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("¡Cuenta creada exitosamente! Redirigiendo al login...");
        setUsername("");
        setEmail("");
        setPassword("");
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(data.error || "Error al crear la cuenta");
      }
    } catch (error) {
      console.error("Error en registro:", error);
      setError("Error de conexión con el servidor. Verifica que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-900 via-blue-900 to-orange-900 flex items-center justify-center p-4">
      
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

      {/* Contenedor principal del REGISTRO */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        
        {/* Header con logo de piezas temáticas */}
        <div className="mb-8 text-center">
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
          
          <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-emerald-400 via-blue-400 to-orange-400 bg-clip-text text-transparent drop-shadow-2xl">
            EduPuzzle+
          </h1>
          <p className="text-white text-lg font-bold drop-shadow-lg mb-2">
            🌿 Biología • 🌍 Geografía • 🔬 Ciencias Naturales
          </p>
          <p className="text-emerald-200 font-semibold">¡Únete a la aventura científica!</p>
        </div>

        {/* Card principal de registro */}
        <div className="relative w-full">
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

            <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Crear Cuenta</h2>
            <p className="text-gray-600 mb-6 text-center font-semibold">Comienza tu viaje en el conocimiento</p>
            
            {/* Register Form */}
            <form onSubmit={handleRegister}>
              <div className="space-y-5">
                
                {/* Mensaje de Error */}
                {error && (
                  <div className="flex items-center p-3 text-sm text-red-800 rounded-lg bg-red-100 border border-red-300 font-semibold">
                    <AlertTriangle className="mr-2" size={20} />
                    {error}
                  </div>
                )}

                {/* Mensaje de Éxito */}
                {success && (
                  <div className="flex items-center p-3 text-sm text-green-800 rounded-lg bg-green-100 border border-green-300 font-semibold">
                    <CheckCircle className="mr-2" size={20} />
                    {success}
                  </div>
                )}

                {/* Username Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    👤 Nombre de Usuario
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600" size={20} />
                    <input 
                      type="text" 
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-4 border-emerald-300 rounded-xl focus:ring-4 focus:ring-emerald-400 focus:border-emerald-500 transition outline-none hover:border-emerald-400 bg-white" 
                      placeholder="Tu nombre de usuario" 
                      disabled={loading}
                      minLength={3}
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    📧 Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600" size={20} />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-4 border-blue-300 rounded-xl focus:ring-4 focus:ring-blue-400 focus:border-blue-500 transition outline-none hover:border-blue-400 bg-white" 
                      placeholder="tu@email.com" 
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    🔒 Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-600" size={20} />
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 border-4 border-orange-300 rounded-xl focus:ring-4 focus:ring-orange-400 focus:border-orange-500 transition outline-none hover:border-orange-400 bg-white" 
                      placeholder="Mínimo 6 caracteres" 
                      disabled={loading}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-orange-600 hover:text-orange-800 transition"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Register Button con gradiente científico */}
                <button 
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-xl transition-all relative overflow-hidden group 
                    ${loading 
                      ? 'opacity-70 cursor-not-allowed bg-gray-400' 
                      : 'hover:shadow-2xl transform hover:scale-105 active:scale-95'}
                  `}
                  style={{
                    background: loading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #f59e0b 100%)'
                  }}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creando cuenta...
                      </>
                    ) : (
                      '🚀 Crear Cuenta'
                    )}
                  </span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-dashed border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-gradient-to-r from-white via-blue-50 to-white text-gray-600 font-semibold text-sm">
                  o regístrate con
                </span>
              </div>
            </div>

            {/* Social Register */}
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

            {/* Login link */}
            <div className="mt-6 text-center">
              <p className="text-gray-700 font-semibold">
                ¿Ya tienes cuenta?{' '}
                <button
                  onClick={() => navigate('/')}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-blue-600 to-orange-600 font-black hover:underline"
                >
                  Inicia Sesión aquí 🔑
                </button>
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

        {/* Texto decorativo inferior con temas */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-white font-bold text-lg drop-shadow-lg">
            🧩 Aprende Mientras Juegas 🧩
          </p>
          <p className="text-emerald-200 font-semibold drop-shadow-lg">
            🌿 Naturaleza • 🌍 Mundo • 🔬 Ciencia
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;