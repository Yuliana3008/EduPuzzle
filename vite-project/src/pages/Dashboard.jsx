import React, { useState, useEffect } from 'react';
import { LogOut, BookOpen, Brain, Trophy, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  // 1. Obtener el nombre de usuario de localStorage al cargar
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      // Si por alguna razón no hay nombre de usuario, redirigir al login
      handleLogout();
    }
  }, []);

  // Función para cerrar sesión
  const handleLogout = () => {
    // 2. Eliminar el token y el nombre de usuario de localStorage
    localStorage.removeItem('userToken');
    localStorage.removeItem('username');
    
    // 3. Redirigir al usuario a la página de inicio de sesión
    navigate('/');
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

      {/* Contenido Principal */}
      <div className="w-full max-w-4xl grid md:grid-cols-3 gap-6">
        
        {/* Tarjeta de Biología */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-emerald-500 hover:shadow-xl transition duration-300">
          <BookOpen className="text-emerald-500 mb-3" size={32} />
          <h2 className="text-xl font-bold text-gray-800">Módulo de Biología</h2>
          <p className="text-gray-600 mt-1">Explora la célula y la vida en la naturaleza.</p>
          <button className="mt-4 text-emerald-600 font-semibold hover:underline">Ir a Rompecabezas 🌿</button>
        </div>
        
        {/* Tarjeta de Geografía */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition duration-300">
          <Brain className="text-blue-500 mb-3" size={32} />
          <h2 className="text-xl font-bold text-gray-800">Módulo de Geografía</h2>
          <p className="text-gray-600 mt-1">Descubre los mapas, relieves y el clima global.</p>
          <button className="mt-4 text-blue-600 font-semibold hover:underline">Ir a Rompecabezas 🌍</button>
        </div>
        
        {/* Tarjeta de Ciencias Naturales */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500 hover:shadow-xl transition duration-300">
          <Trophy className="text-orange-500 mb-3" size={32} />
          <h2 className="text-xl font-bold text-gray-800">Ciencias Naturales</h2>
          <p className="text-gray-600 mt-1">El mundo de la física y la química.</p>
          <button className="mt-4 text-orange-600 font-semibold hover:underline">Ir a Rompecabezas 🔬</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;