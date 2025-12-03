import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, CheckCircle, Play } from 'lucide-react';

const ModuloPuzzles = () => {
  const { modulo } = useParams();
  const navigate = useNavigate();

  // Configuración de cada módulo
  const modulosConfig = {
    biologia: {
      nombre: 'Biología',
      color: 'emerald',
      emoji: '🌿',
      puzzles: [
        { id: 1, nombre: 'La Célula', dificultad: 'Fácil', completado: true, desbloqueado: true },
        { id: 2, nombre: 'Fotosíntesis', dificultad: 'Medio', completado: true, desbloqueado: true },
        { id: 3, nombre: 'Ecosistemas', dificultad: 'Medio', completado: false, desbloqueado: true },
        { id: 4, nombre: 'ADN y Genética', dificultad: 'Difícil', completado: false, desbloqueado: false },
      ]
    },
    geografia: {
      nombre: 'Geografía',
      color: 'blue',
      emoji: '🌍',
      puzzles: [
        { id: 1, nombre: 'Continentes', dificultad: 'Fácil', completado: true, desbloqueado: true },
        { id: 2, nombre: 'Climas del Mundo', dificultad: 'Medio', completado: false, desbloqueado: true },
        { id: 3, nombre: 'Relieves', dificultad: 'Medio', completado: false, desbloqueado: true },
        { id: 4, nombre: 'Capitales del Mundo', dificultad: 'Difícil', completado: false, desbloqueado: false },
      ]
    },
    ciencias: {
      nombre: 'Ciencias Naturales',
      color: 'orange',
      emoji: '🔬',
      puzzles: [
        { id: 1, nombre: 'Estados de la Materia', dificultad: 'Fácil', completado: false, desbloqueado: true },
        { id: 2, nombre: 'Fuerzas y Movimiento', dificultad: 'Medio', completado: false, desbloqueado: true },
        { id: 3, nombre: 'Reacciones Químicas', dificultad: 'Medio', completado: false, desbloqueado: false },
        { id: 4, nombre: 'Energía', dificultad: 'Difícil', completado: false, desbloqueado: false },
      ]
    }
  };

  const moduloActual = modulosConfig[modulo];

  if (!moduloActual) {
    return <div>Módulo no encontrado</div>;
  }

  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-500',
      hover: 'hover:bg-emerald-600',
      text: 'text-emerald-600',
      border: 'border-emerald-500'
    },
    blue: {
      bg: 'bg-blue-500',
      hover: 'hover:bg-blue-600',
      text: 'text-blue-600',
      border: 'border-blue-500'
    },
    orange: {
      bg: 'bg-orange-500',
      hover: 'hover:bg-orange-600',
      text: 'text-orange-600',
      border: 'border-orange-500'
    }
  };

  const colors = colorClasses[moduloActual.color];

  const handlePuzzleClick = (puzzle) => {
    if (puzzle.desbloqueado) {
      navigate(`/puzzle/${modulo}/${puzzle.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition"
        >
          <ArrowLeft size={20} />
          Volver al Dashboard
        </button>

        <div className={`${colors.bg} text-white rounded-2xl p-8 mb-8 shadow-xl`}>
          <div className="flex items-center gap-4">
            <span className="text-6xl">{moduloActual.emoji}</span>
            <div>
              <h1 className="text-4xl font-bold mb-2">{moduloActual.nombre}</h1>
              <p className="text-white opacity-90">Selecciona un rompecabezas para comenzar</p>
            </div>
          </div>
        </div>

        {/* Lista de Puzzles */}
        <div className="grid gap-4">
          {moduloActual.puzzles.map((puzzle) => (
            <div
              key={puzzle.id}
              onClick={() => handlePuzzleClick(puzzle)}
              className={`bg-white rounded-xl p-6 shadow-lg transition-all duration-300 ${
                puzzle.desbloqueado
                  ? 'cursor-pointer hover:shadow-2xl hover:scale-102'
                  : 'opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full ${colors.bg} flex items-center justify-center text-white text-2xl font-bold`}>
                    {puzzle.completado ? (
                      <CheckCircle size={32} />
                    ) : puzzle.desbloqueado ? (
                      <Play size={32} />
                    ) : (
                      <Lock size={32} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{puzzle.nombre}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-sm ${colors.text} font-semibold`}>
                        Dificultad: {puzzle.dificultad}
                      </span>
                      {puzzle.completado && (
                        <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                          ✓ Completado
                        </span>
                      )}
                      {!puzzle.desbloqueado && (
                        <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-semibold">
                          🔒 Bloqueado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {puzzle.desbloqueado && !puzzle.completado && (
                  <button className={`${colors.bg} ${colors.hover} text-white px-6 py-2 rounded-lg font-semibold transition`}>
                    Jugar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModuloPuzzles;