import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register"; // 👈 Te faltaba esto
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/Adminayout";


function App() {
  return (
    <Routes>
      {/* Layout principal (Navbar + páginas públicas) */}
      <Route element={<MainLayout />}>
        <Route path="/home" element={<Home />} /> {/* 👈 ojo, mejor en minúscula */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Route>

      {/* Dashboard de estudiante/profesor */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Panel admin con su propio layout */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminPanel />} />
      </Route>
    </Routes>
  );
}

export default App;