import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Clock, Target, Flame, Award, Calendar, Zap, Brain, Map } from 'lucide-react';

// --- MOCKS DE DATOS Y ESTILOS GLOBALES ---

// Colores temáticos: Biología (verde), Geografía (azul), Ciencias Naturales (naranja/amarillo)
const themeColors = {
  emerald: ['#10b981', '#059669', '#34d399', '#6ee7b7'], // Biología
  blue: ['#3b82f6', '#2563eb', '#60a5fa', '#06b6d4'], // Geografía
  orange: ['#f59e0b', '#ea580c', '#fbbf24', '#fb923c'] // Ciencias
};

// --- HELPERS DE DISEÑO (Iconos flotantes y Puzzle) ---
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

// --- COMPONENTE PRINCIPAL ---

const Estadisticas = () => {
  const navigate = useNavigate();

  const estadisticas = {
    nivelesCompletados: 7,
    nivelesTotal: 12,
    tiempoTotal: 3600, // segundos
    promedioTiempo: 514, // segundos por nivel
    puntajeTotal: 450,
    racha: 7,
    mejorRacha: 12,
    insignias: 8,
    mundoFavorito: 'Biología',
  };

  const historialNiveles = [
    { nivel: 'La Célula', mundoColor: 'emerald', tiempo: '8:30', movimientos: 45, estrellas: 3, fecha: '2024-12-01' },
    { nivel: 'Fotosíntesis', mundoColor: 'emerald', tiempo: '10:15', movimientos: 52, estrellas: 3, fecha: '2024-12-01' },
    { nivel: 'Continentes', mundoColor: 'blue', tiempo: '7:45', movimientos: 38, estrellas: 2, fecha: '2024-12-02' },
    { nivel: 'La Célula (repetido)', mundoColor: 'emerald', tiempo: '6:20', movimientos: 32, estrellas: 3, fecha: '2024-12-03' },
    { nivel: 'Geología', mundoColor: 'orange', tiempo: '12:00', movimientos: 60, estrellas: 1, fecha: '2024-12-04' },
  ];

  const progresoMundos = [
    { mundo: 'Biología', color: 'emerald', completados: 2, total: 5, porcentaje: 40 },
    { mundo: 'Geografía', color: 'blue', completados: 1, total: 4, porcentaje: 25 },
    { mundo: 'Ciencias Naturales', color: 'orange', completados: 0, total: 3, porcentaje: 0 },
  ];

  const formatearTiempo = (segundos) => {
    const horas = Math.floor(segundos / 3600);
    const mins = Math.floor((segundos % 3600) / 60);
    const secs = segundos % 60;
    
    if (horas > 0) return `${horas}h ${mins}m`;
    return `${mins}m ${secs}s`;
  };

  const getColorClass = (colorName, type = 'bg') => {
    const map = {
      emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-500', light: 'bg-emerald-50' },
      blue: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-500', light: 'bg-blue-50' },
      orange: { bg: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-500', light: 'bg-orange-50' },
      purple: { bg: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-500', light: 'bg-purple-50' },
      yellow: { bg: 'bg-yellow-500', text: 'text-yellow-600', border: 'border-yellow-500', light: 'bg-yellow-50' },
    };
    return map[colorName]?.[type] || map.emerald[type];
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

        {/* Banner de Estadísticas (Estilo Perfil Banner) */}
        <div className="bg-white rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
          
          {/* Fondo de Gradiente Temático */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 opacity-90 rounded-3xl" style={{ zIndex: 1 }}></div>
          
          <div className="relative" style={{ zIndex: 2 }}>
            <h1 className="text-4xl sm:text-5xl font-black mb-2 text-white drop-shadow-lg flex items-center gap-3">
              <TrendingUp size={48} className="text-white"/> 
              Tu Cuadro de Mando 
            </h1>
            <p className="text-white opacity-90 text-lg font-semibold">Revisa tu progreso y encuentra áreas para mejorar tu aventura.</p>
          </div>
        </div>

        {/* Estadísticas Generales (Cards) */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Niveles Completados */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-b-4 border-emerald-500 transition hover:shadow-emerald-300/50">
            <Target className="text-emerald-600 mb-2" size={32} />
            <p className="text-gray-600 text-sm font-semibold">Niveles Completados</p>
            <p className="text-4xl font-black text-emerald-700">{estadisticas.nivelesCompletados}/{estadisticas.nivelesTotal}</p>
          </div>

          {/* Tiempo Total */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-b-4 border-blue-500 transition hover:shadow-blue-300/50">
            <Clock className="text-blue-600 mb-2" size={32} />
            <p className="text-gray-600 text-sm font-semibold">Tiempo Total de Estudio</p>
            <p className="text-4xl font-black text-blue-700">{formatearTiempo(estadisticas.tiempoTotal)}</p>
          </div>

          {/* Racha Actual */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-b-4 border-orange-500 transition hover:shadow-orange-300/50">
            <Flame className="text-orange-600 mb-2" size={32} />
            <p className="text-gray-600 text-sm font-semibold">Racha Actual</p>
            <p className="text-4xl font-black text-orange-700">{estadisticas.racha} días</p>
          </div>

          {/* Puntaje Total */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-b-4 border-purple-500 transition hover:shadow-purple-300/50">
            <Award className="text-purple-600 mb-2" size={32} />
            <p className="text-gray-600 text-sm font-semibold">Puntaje Total</p>
            <p className="text-4xl font-black text-purple-700">{estadisticas.puntajeTotal}</p>
          </div>
        </div>

        {/* Contenedor de 2 Columnas para Progreso/Historial */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* COLUMNA IZQUIERDA: Progreso por Mundo */}
          <div className="bg-white rounded-3xl shadow-xl p-8 transition-all duration-300 hover:shadow-emerald-500/30">
            <h2 className="text-2xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-600 flex items-center gap-3">
              <Map className="text-emerald-500" size={28} />
              Progreso por Mundo
            </h2>
            <div className="space-y-6">
              {progresoMundos.map((mundo, idx) => {
                const colorClass = getColorClass(mundo.color, 'bg');
                const textClass = getColorClass(mundo.color, 'text');
                return (
                  <div key={idx} className="p-4 bg-gray-50 rounded-xl border-l-4 border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-800">{mundo.mundo}</span>
                      <span className={`text-lg font-black ${textClass}`}>
                        {mundo.porcentaje}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                      <div
                        className={`${colorClass} h-full rounded-full transition-all`}
                        style={{ width: `${mundo.porcentaje}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 mt-1 block">
                      {mundo.completados} de {mundo.total} niveles completados.
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUMNA DERECHA: Historial de Niveles */}
          <div className="bg-white rounded-3xl shadow-xl p-8 transition-all duration-300 hover:shadow-orange-500/30">
            <h2 className="text-2xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-purple-500 flex items-center gap-3">
              <Calendar className="text-orange-500" size={28} />
              Historial de Niveles
            </h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Nivel</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Tiempo</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 hidden sm:table-cell">Mov.</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Estrellas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {historialNiveles.map((nivel, idx) => {
                    const colorClass = getColorClass(nivel.mundoColor, 'border');
                    return (
                      <tr key={idx} className="hover:bg-gray-50 border-l-4" style={{ borderColor: getColorClass(nivel.mundoColor, 'border').split('-')[1] }}>
                        <td className="px-4 py-3 font-semibold text-gray-800 text-sm">
                          {nivel.nivel}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-sm">{nivel.tiempo}</td>
                        <td className="px-4 py-3 text-gray-600 text-sm hidden sm:table-cell">{nivel.movimientos}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {[...Array(3)].map((_, i) => (
                              <span key={i} className={i < nivel.estrellas ? 'text-yellow-500' : 'text-gray-300'}>
                                ⭐
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Logros y Objetivos (Parte Inferior) */}
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          
          {/* Logros Destacados */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border-4 border-purple-400/50">
            <h2 className="text-2xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 flex items-center gap-3">
              <Award className="text-purple-500" size={28} />
              Mejores Marcas
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-xl shadow-sm">
                <div className="text-3xl">🥇</div>
                <div>
                  <p className="font-bold text-gray-800">Mejor Racha Histórica</p>
                  <p className="text-xl font-black text-yellow-600">{estadisticas.mejorRacha} días</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-xl shadow-sm">
                <div className="text-3xl">🧠</div>
                <div>
                  <p className="font-bold text-gray-800">Mundo Más Explorado</p>
                  <p className="text-xl font-black text-emerald-600">{estadisticas.mundoFavorito}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-xl shadow-sm">
                <div className="text-3xl">⏱️</div>
                <div>
                  <p className="font-bold text-gray-800">Velocidad Promedio</p>
                  <p className="text-xl font-black text-blue-600">{Math.floor(estadisticas.promedioTiempo / 60)}:{(estadisticas.promedioTiempo % 60).toString().padStart(2, '0')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Objetivos */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border-4 border-blue-400/50">
            <h2 className="text-2xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-orange-500 flex items-center gap-3">
              <Target className="text-blue-500" size={28} />
              Objetivos de la Semana
            </h2>
            <div className="space-y-5">
              
              {/* Objetivo 1 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-700">Completar 10 niveles</span>
                  <span className="text-sm font-black text-emerald-600">7/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '70%' }} />
                </div>
              </div>
              
              {/* Objetivo 2 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-700">Alcanzar racha de 14 días</span>
                  <span className="text-sm font-black text-orange-600">7/14</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="bg-orange-500 h-full rounded-full" style={{ width: '50%' }} />
                </div>
              </div>

              {/* Objetivo 3 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-700">Obtener 15 insignias</span>
                  <span className="text-sm font-black text-purple-600">8/15</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: '53%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Estadisticas;