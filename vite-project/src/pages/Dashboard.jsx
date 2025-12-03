import React, { useState, useEffect } from 'react';
import { LogOut, BookOpen, Brain, Trophy, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      handleLogout();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('username');
    navigate('/');
  };

  // Función para navegar a los módulos
  const handleModuleClick = (module) => {
    navigate(`/modulo/${module}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8">
      
      {/* Header del Dashboard */}
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl p-6 mb-8 border-t-8 border-emerald-500">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
            <User className="text-emerald-500" size={30} />
            Bienvenido, <span className="text-blue-600 capitalize">{username || 'Estudiante'}</span>
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-150"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
        <p className="text-gray-500 mt-2">¡Aquí comienza tu aventura científica en EduPuzzle+!</p>
      </div>

      {/* Sección de estadísticas rápidas */}
      <div className="w-full max-w-4xl grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Rompecabezas</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <Trophy className="opacity-80" size={32} />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Completados</p>
              <p className="text-2xl font-bold">7</p>
            </div>
            <Brain className="opacity-80" size={32} />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Puntos</p>
              <p className="text-2xl font-bold">850</p>
            </div>
            <BookOpen className="opacity-80" size={32} />
          </div>
        </div>
      </div>

      {/* Contenido Principal - Módulos de aprendizaje */}
      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-3xl">🧩</span>
          Módulos de Rompecabezas
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Tarjeta de Biología */}
          <div 
            onClick={() => handleModuleClick('biologia')}
            className="group bg-white p-6 rounded-xl shadow-lg border-t-4 border-emerald-500 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-500 transition-colors duration-300">
              <span className="text-3xl group-hover:scale-110 transition-transform duration-300">🌿</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Biología</h2>
            <p className="text-gray-600 text-sm mb-4">Explora células, ecosistemas y la diversidad de la vida</p>
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>🧩 4 rompecabezas</span>
              <span className="text-emerald-600 font-semibold">58% completo</span>
            </div>
            <button className="w-full bg-emerald-500 text-white py-2 rounded-lg font-semibold hover:bg-emerald-600 transition duration-200">
              Jugar Ahora
            </button>
          </div>
          
          {/* Tarjeta de Geografía */}
          <div 
            onClick={() => handleModuleClick('geografia')}
            className="group bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-500 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors duration-300">
              <span className="text-3xl group-hover:scale-110 transition-transform duration-300">🌍</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Geografía</h2>
            <p className="text-gray-600 text-sm mb-4">Descubre mapas, relieves, climas y culturas del mundo</p>
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>🧩 4 rompecabezas</span>
              <span className="text-blue-600 font-semibold">42% completo</span>
            </div>
            <button className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition duration-200">
              Jugar Ahora
            </button>
          </div>
          
          {/* Tarjeta de Ciencias Naturales */}
          <div 
            onClick={() => handleModuleClick('ciencias')}
            className="group bg-white p-6 rounded-xl shadow-lg border-t-4 border-orange-500 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-500 transition-colors duration-300">
              <span className="text-3xl group-hover:scale-110 transition-transform duration-300">🔬</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Ciencias Naturales</h2>
            <p className="text-gray-600 text-sm mb-4">Experimenta con física, química y fenómenos naturales</p>
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>🧩 4 rompecabezas</span>
              <span className="text-orange-600 font-semibold">25% completo</span>
            </div>
            <button className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition duration-200">
              Jugar Ahora
            </button>
          </div>
        </div>
      </div>

      {/* Sección motivacional */}
      <div className="w-full max-w-4xl mt-8 bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-xl shadow-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">🎯 ¡Sigue aprendiendo!</h3>
            <p className="text-purple-100">Completa rompecabezas para desbloquear logros y aprender mientras te diviertes</p>
          </div>
          <div className="hidden md:block text-6xl opacity-80">🧠</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;