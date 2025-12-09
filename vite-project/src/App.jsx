/*import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/Dashboard";


import MundoNiveles from "./pages/MundoNiveles";
import NivelJuego from "./pages/NivelJuego";
import Recompensas from "./pages/Recompensas";
import Estadisticas from "./pages/Estadisticas";
import Perfil from "./pages/Perfil";



function App() {
  return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="Dashboard" element={<Dashboard />} />
         <Route path="/mundos/:mundoId" element={<MundoNiveles />} />
        <Route path="/mundos/:mundoId/nivel/:nivelId" element={<NivelJuego />} />
        <Route path="/recompensas" element={<Recompensas />} />
        <Route path="/estadisticas" element={<Estadisticas />} />
        <Route path="/perfil" element={<Perfil />} />
      </Routes>
  );
}

export default App;*/

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/Dashboard";


import MundoNiveles from "./pages/MundoNiveles";
import NivelJuego from "./pages/NivelJuego";
import Recompensas from "./pages/Recompensas";
import Estadisticas from "./pages/Estadisticas";
import Perfil from "./pages/Perfil";


function App() {
  return (
    // Es buena práctica envolver <Routes> con <BrowserRouter> en el archivo principal (main.jsx o index.js)
    // o aquí si lo estás usando como componente principal.
    // Si ya tienes <BrowserRouter> en un nivel superior, este código es correcto:
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/Dashboard" element={<Dashboard />} />
      <Route path="/mundos/:mundoId" element={<MundoNiveles />} />
      
      {/* RUTA MODIFICADA: Cambiado de /nivel/ a /niveles/ para ser consistente con el plural */}
      <Route 
        path="/mundos/:mundoId/niveles/:nivelId"
        element={<NivelJuego />} 
      />

      <Route 
        path="/mundos/:mundoId/nivel/:nivelId" 
        element={<NivelJuego />} 
      />
      
      <Route path="/recompensas" element={<Recompensas />} />
      <Route path="/estadisticas" element={<Estadisticas />} />
      <Route path="/perfil" element={<Perfil />} />
    </Routes>
  );
}

export default App;
