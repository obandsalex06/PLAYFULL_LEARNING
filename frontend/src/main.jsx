import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/global.css";
import { AuthProvider } from "./context/AuthContext";

// Páginas
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import RegisterTeacher from "./pages/RegisterTeacher";
import TeacherClasses from "./pages/TeacherClasses";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

// Navbars
import PublicNavbar from "./components/navbar/PublicNavbar";
import AdminNavbar from "./components/navbar/AdminNavbar";
import StudentNavbar from "./components/navbar/StudentNavbar";
import TeacherNavbar from "./components/navbar/TeacherNavbar";
import SecretaryNavbar from "./components/navbar/SecretaryNavbar";
import SecretaryDashboard from "./pages/SecretaryDashboard";

// Protected route
import ProtectedRoute from "./components/ProtectedRoute";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Público */}
          <Route
            element={
              <MainLayout>
                <PublicNavbar />
              </MainLayout>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register-teacher" element={<RegisterTeacher />} />
          </Route>

          {/* Estudiante */}
          <Route
            element={
              <MainLayout>
                <StudentNavbar />
              </MainLayout>
            }
          >
            <Route
              path="/student-dashboard"
              element={
                <ProtectedRoute allowedRoles={["estudiante"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Profesor */}
          <Route
            element={
              <MainLayout>
                <TeacherNavbar />
              </MainLayout>
            }
          >
            <Route
              path="/teacher-dashboard"
              element={
                <ProtectedRoute allowedRoles={["docente"]}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/classes"
              element={
                <ProtectedRoute allowedRoles={["docente"]}>
                  <TeacherClasses />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Admin */}
          <Route
            element={
              <AdminLayout>
                <AdminNavbar />
              </AdminLayout>
            }
          >
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Secretaria */}
          <Route
            element={
              <MainLayout>
                <SecretaryNavbar />
              </MainLayout>
            }
          >
            <Route
              path="/secretary"
              element={
                <ProtectedRoute allowedRoles={["secretaria"]}>
                  <SecretaryDashboard />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Genérico */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
