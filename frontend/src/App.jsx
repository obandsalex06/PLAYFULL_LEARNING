import { Routes, Route } from "react-router-dom";

// Páginas
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

// Navbars para cada rol
import PublicNavbar from "./components/navbar/PublicNavbar";
import AdminNavbar from "./components/navbar/AdminNavbar";
import StudentNavbar from "./components/navbar/StudentNavbar";
import TeacherNavbar from "./components/navbar/TeacherNavbar";

function App() {
  return (
    <Routes>
      {/* Layout público → Home, Login, Register */}
      <Route
        element={
          <MainLayout>
            <PublicNavbar />
          </MainLayout>
        }
      >
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Estudiante */}
      <Route
        element={
          <MainLayout>
            <StudentNavbar />
          </MainLayout>
        }
      >
        <Route path="/student-dashboard" element={<StudentDashboard />} />
      </Route>

      {/* Profesor */}
      <Route
        element={
          <MainLayout>
            <TeacherNavbar />
          </MainLayout>
        }
      >
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
      </Route>

      {/* Admin con su propio layout */}
      <Route
        element={
          <AdminLayout>
            <AdminNavbar />
          </AdminLayout>
        }
      >
        <Route path="/admin" element={<AdminPanel />} />
      </Route>

      {/* Dashboard genérico si lo usas */}
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;

