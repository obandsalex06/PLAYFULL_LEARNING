import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, School, Gift, LogOut, Menu, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import RegisterTeacherForm from "./RegisterTeacherForm";

const NAV = [
  { to: "/admin/users", label: "Usuarios", Icon: Users },
  { to: "/admin/schools", label: "Colegios", Icon: School },
  { to: "/admin/rewards", label: "Premios", Icon: Gift },
  { to: "#register-teacher", label: "Registrar profesor", Icon: UserPlus },
];

export default function AdminPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState("dashboard");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  if (!user || user.role !== "admin") return null;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-64"} md:translate-x-0`}
      >
        <div className="h-full bg-gradient-to-b from-purple-600 via-indigo-600 to-sky-600 text-white shadow-lg p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center font-extrabold">
              PL
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight">
                Playful <span className="font-medium">Admin</span>
              </h1>
              <p className="text-xs opacity-80">Panel de control</p>
            </div>
          </div>

          <nav className="flex-1 flex flex-col gap-2">
            {NAV.map(({ to, label, Icon }) => (
              <button
                key={to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition w-full text-left ${selectedSection === to ? "bg-white/10" : ""}`}
                onClick={() => setSelectedSection(to)}
              >
                <Icon size={18} />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-4">
            <button
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-600/90 transition"
              onClick={() => { logout(); navigate("/login"); }}
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0 md:ml-64"
        }`}
      >
        <header className="flex items-center justify-between bg-white/80 backdrop-blur px-6 py-4 shadow sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 rounded-md bg-white/60"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={20} />
            </button>
            <h2 className="text-xl font-semibold">
              Panel de Administración
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600">Admin</div>
            <img
              src="https://ui-avatars.com/api/?name=Admin&background=8a2be2&color=fff"
              alt="avatar admin"
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
            />
          </div>
        </header>

        <main className="p-6 max-w-6xl mx-auto w-full">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">
            Bienvenido, <span className="text-purple-600">Administrador</span> 👋
          </h3>

          {/* Sección dinámica */}
          {selectedSection === "#register-teacher" ? (
            <div className="bg-white rounded-xl shadow p-6 mb-8 max-w-lg mx-auto">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Registrar nuevo profesor
              </h4>
              <RegisterTeacherForm />
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow p-5">
                  <div className="text-sm text-slate-500">
                    Usuarios registrados
                  </div>
                  <div className="mt-3 text-3xl font-extrabold text-purple-600">
                    1,245
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow p-5">
                  <div className="text-sm text-slate-500">Colegios</div>
                  <div className="mt-3 text-3xl font-extrabold text-indigo-600">
                    56
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow p-5">
                  <div className="text-sm text-slate-500">Premios entregados</div>
                  <div className="mt-3 text-3xl font-extrabold text-sky-600">
                    320
                  </div>
                </div>
              </div>

              {/* Tabla */}
              <div className="bg-white rounded-xl shadow p-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-4">
                  Últimos usuarios registrados
                </h4>

                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-600 border-b">
                      <th className="py-2">Nombre</th>
                      <th className="py-2">Correo</th>
                      <th className="py-2">Rol</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-slate-50">
                      <td className="py-3">Juan Pérez</td>
                      <td className="py-3">juan@example.com</td>
                      <td className="py-3">
                        <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          Estudiante
                        </span>
                      </td>
                    </tr>

                    <tr className="border-b hover:bg-slate-50">
                      <td className="py-3">Ana López</td>
                      <td className="py-3">ana@example.com</td>
                      <td className="py-3">
                        <span className="inline-block bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">
                          Docente
                        </span>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="py-3">Carlos Gómez</td>
                      <td className="py-3">carlos@example.com</td>
                      <td className="py-3">
                        <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                          Administrador
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}