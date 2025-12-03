import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/Dashboard";
import ModuloPuzzles from "./pages/ModuloPuzzles";
import PuzzleGame from "./pages/PuzzleGame";



function App() {
  return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="Dashboard" element={<Dashboard />} />
        <Route path="/modulo/:modulo" element={<ModuloPuzzles />} />
        <Route path="/puzzle/:modulo/:puzzleId" element={<PuzzleGame />} />

      </Routes>
  );
}

export default App;
