import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../api";
import Pagination from "../components/Pagination";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import Breadcrumbs from "../components/Breadcrumbs";

export default function SecretaryDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Estados principales
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingTeachersState, setLoadingTeachersState] = useState(false);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);

  // Estados para datos
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0, announcements: 0 });
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]); // Todos los estudiantes sin paginación
  const [gradeFilter, setGradeFilter] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Estados para formularios
  const [announcementForm, setAnnouncementForm] = useState({
    title: "", message: "", priority: "normal"
  });

  // Verificar autenticación
  useEffect(() => {
    if (!user || user.role !== "secretaria") {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  // Funciones de carga de datos
  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const [studentsRes, teachersRes, classesRes, announcementsRes] = await Promise.all([
        API.get("/auth/all-students", { headers: { "x-user-role": "secretaria" } }),
        API.get("/auth/teachers", { headers: { "x-user-role": "secretaria" } }),
        API.get("/auth/all-classes", { headers: { "x-user-role": "secretaria" } }),
        API.get("/announcements/announcements", { headers: { "x-user-role": "secretaria" } })
      ]);
      
      setStats({
        students: studentsRes.data.length,
        teachers: teachersRes.data.length,
        classes: classesRes.data.length,
        announcements: announcementsRes.data.length
      });
    } catch (err) {
      console.error("Error cargando estadísticas:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadStudents = useCallback(async () => {
    try {
      setLoadingStudents(true);
      // Cargar todos los estudiantes (el filtro de grade se puede aplicar en el servidor)
      const params = {};
      if (gradeFilter) params.grade = gradeFilter;
      
      const res = await API.get("/auth/all-students", { params });
      const dataArray = Array.isArray(res.data) ? res.data : [];
      setAllStudents(dataArray);
      
      // Aplicar paginación del lado del cliente
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setStudents(dataArray.slice(startIndex, endIndex));
    } catch (err) {
      console.error("Error cargando estudiantes:", err);
      setStudents([]);
      setAllStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }, [gradeFilter, currentPage, itemsPerPage]);

  const loadTeachers = async () => {
    try {
      setLoadingTeachersState(true);
      const res = await API.get("/auth/teachers", {
        headers: { "x-user-role": "secretaria" }
      });
      setTeachers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando profesores:", err);
      setTeachers([]);
    } finally {
      setLoadingTeachersState(false);
    }
  };

  const loadAnnouncements = async () => {
    try {
      setLoadingAnnouncements(true);
      const res = await API.get("/announcements/announcements", {
        headers: { "x-user-role": "secretaria" }
      });
      setAnnouncements(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando comunicados:", err);
      setAnnouncements([]);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  // Cargar estadísticas generales
  useEffect(() => {
    if (activeTab === "dashboard") {
      loadStats();
    }
  }, [activeTab]);

  // Cargar datos según la pestaña activa
  useEffect(() => {
    if (activeTab === "students") {
      setCurrentPage(1); // Reset página al cambiar filtro
      loadStudents();
    }
    if (activeTab === "teachers") loadTeachers();
    if (activeTab === "announcements") loadAnnouncements();
  }, [activeTab, gradeFilter, loadStudents]);

  // Recargar estudiantes cuando cambia la página
  useEffect(() => {
    if (activeTab === "students") {
      loadStudents();
    }
  }, [currentPage, activeTab, loadStudents]);

  // Handlers para comunicados
  const handleAnnouncementFormChange = (e) => {
    setAnnouncementForm({ ...announcementForm, [e.target.name]: e.target.value });
  };

  const showMsg = (m) => {
    setMsg(m);
    setTimeout(() => setMsg(null), 3000);
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    
    try {
      const res = await API.post(
        "/announcements/announcements",
        announcementForm,
        {
          headers: { 
            "x-user-role": "secretaria",
            "x-user-email": user.email
          }
        }
      );
      
      setAnnouncements([res.data, ...announcements]);
      showMsg({ type: 'success', text: 'Comunicado creado exitosamente' });
      setAnnouncementForm({ title: "", message: "", priority: "normal" });
    } catch (err) {
      console.error("Error creando comunicado:", err);
      showMsg({ type: 'error', text: 'Error al crear el comunicado' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este comunicado?")) return;
    
    try {
      await API.delete(
        `/announcements/announcements/${id}`,
        {
          headers: { 
            "x-user-role": "secretaria",
            "x-user-email": user.email
          }
        }
      );
      
      setAnnouncements(announcements.filter(a => a.id !== id));
      showMsg({ type: 'success', text: 'Comunicado eliminado' });
    } catch (err) {
      console.error("Error eliminando comunicado:", err);
      showMsg({ type: 'error', text: 'Error al eliminar el comunicado' });
    }
  };

  // Filtrar estudiantes por búsqueda
  const filteredStudents = students
    .filter(student =>
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(student => gradeFilter ? Number(student.grade) === Number(gradeFilter) : true);

  if (!user || user.role !== "secretaria") return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con gradiente azul */}
      <header className="relative bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Panel de Secretaría</h1>
              <p className="text-blue-100 mt-1">Bienvenida, {user.name}</p>
            </div>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: "dashboard", label: "📊 Resumen" },
              { id: "students", label: "👥 Estudiantes" },
              { id: "teachers", label: "👨‍🏫 Profesores" },
              { id: "announcements", label: "📢 Comunicados" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMsg(null); }}
                className={`px-6 py-3 rounded-t-lg font-semibold whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? "bg-white text-blue-700 shadow-lg"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: 'Panel de Secretaría', path: '/secretary-dashboard' }
        ]} />
        
        {/* Tab: Dashboard */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Resumen General</h2>
            
            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Estudiantes</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{loadingStats ? 'Cargando…' : stats.students}</p>
                  </div>
                  <div className="text-4xl">👥</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Profesores</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{loadingStats ? 'Cargando…' : stats.teachers}</p>
                  </div>
                  <div className="text-4xl">👨‍🏫</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Clases Activas</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{loadingStats ? 'Cargando…' : stats.classes}</p>
                  </div>
                  <div className="text-4xl">📚</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Comunicados</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{loadingStats ? 'Cargando…' : stats.announcements}</p>
                  </div>
                  <div className="text-4xl">📢</div>
                </div>
              </div>
            </div>

            {/* Accesos rápidos */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Accesos Rápidos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab("students")}
                  className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
                >
                  <div className="text-2xl mb-2">👥</div>
                  <div className="font-semibold text-gray-800">Ver Estudiantes</div>
                  <div className="text-sm text-gray-600">Gestionar lista completa</div>
                </button>
                
                <button
                  onClick={() => setActiveTab("teachers")}
                  className="p-4 border-2 border-green-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-left"
                >
                  <div className="text-2xl mb-2">👨‍🏫</div>
                  <div className="font-semibold text-gray-800">Ver Profesores</div>
                  <div className="text-sm text-gray-600">Consultar información</div>
                </button>
                
                <button
                  onClick={() => setActiveTab("announcements")}
                  className="p-4 border-2 border-orange-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition text-left"
                >
                  <div className="text-2xl mb-2">📢</div>
                  <div className="font-semibold text-gray-800">Comunicados</div>
                  <div className="text-sm text-gray-600">Publicar anuncios</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Estudiantes */}
        {activeTab === "students" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Lista de Estudiantes</h2>
              <div className="flex items-center gap-3">
                <input
                type="text"
                placeholder="🔍 Buscar estudiante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Todos los cursos</option>
                {Array.from({ length: 11 }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n}°</option>
                ))}
              </select>
              </div>
            </div>

            {/* Formulario registro de estudiante (solo secretaria) */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Registrar nuevo estudiante</h3>
              <StudentRegisterForm onCreated={() => { loadStudents(); loadStats(); }} userEmail={user.email} />
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
              {loadingStudents ? (
                <div className="text-center py-8 text-gray-500">Cargando estudiantes…</div>
              ) : (
                <>
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="pb-3 font-semibold text-gray-700">ID</th>
                        <th className="pb-3 font-semibold text-gray-700">Nombres</th>
                        <th className="pb-3 font-semibold text-gray-700">Apellidos</th>
                        <th className="pb-3 font-semibold text-gray-700">Email</th>
                        <th className="pb-3 font-semibold text-gray-700">Colegio</th>
                        <th className="pb-3 font-semibold text-gray-700">Curso</th>
                        <th className="pb-3 font-semibold text-gray-700">Learncoins</th>
                        <th className="pb-3 font-semibold text-gray-700">Fecha de Registro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map(student => (
                        <tr key={student.id} className="border-b hover:bg-gray-50">
                          <td className="py-3">{student.id}</td>
                          <td className="py-3 font-medium">{student.first_name || (student.name?.split(' ')[0] || '')}</td>
                          <td className="py-3 font-medium">{student.last_name || (student.name?.split(' ').slice(1).join(' ') || '')}</td>
                          <td className="py-3">{student.email}</td>
                          <td className="py-3">{student.school_name || '-'}</td>
                          <td className="py-3">{student.grade ? `${student.grade}°` : '-'}</td>
                          <td className="py-3">
                            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                              🪙 {student.coins || 0}
                            </span>
                          </td>
                          <td className="py-3">{new Date(student.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredStudents.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      {searchTerm ? "No se encontraron estudiantes" : "No hay estudiantes registrados"}
                    </div>
                  )}
                  
                  {/* Paginación */}
                  {allStudents.length > itemsPerPage && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={Math.ceil(allStudents.length / itemsPerPage)}
                      onPageChange={setCurrentPage}
                      totalItems={allStudents.length}
                      itemsPerPage={itemsPerPage}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Tab: Profesores */}
        {activeTab === "teachers" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Lista de Profesores</h2>
            
            <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
              {loadingTeachersState ? (
                <div className="text-center py-8 text-gray-500">Cargando profesores…</div>
              ) : (
                <>
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="pb-3 font-semibold text-gray-700">ID</th>
                        <th className="pb-3 font-semibold text-gray-700">Nombre</th>
                        <th className="pb-3 font-semibold text-gray-700">Email</th>
                        <th className="pb-3 font-semibold text-gray-700">Fecha de Registro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map(teacher => (
                        <tr key={teacher.id} className="border-b hover:bg-gray-50">
                          <td className="py-3">{teacher.id}</td>
                          <td className="py-3 font-medium">{teacher.name}</td>
                          <td className="py-3">{teacher.email}</td>
                          <td className="py-3">{new Date(teacher.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {teachers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No hay profesores registrados</div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Tab: Comunicados */}
        {activeTab === "announcements" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Gestión de Comunicados</h2>
            
            {/* Formulario para crear comunicado */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Nuevo Comunicado</h3>
              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <input
                  type="text"
                  name="title"
                  placeholder="Título del comunicado"
                  value={announcementForm.title}
                  onChange={handleAnnouncementFormChange}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
                <textarea
                  name="message"
                  placeholder="Mensaje del comunicado"
                  value={announcementForm.message}
                  onChange={handleAnnouncementFormChange}
                  className="w-full border rounded-lg px-4 py-2 h-32 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
                <div className="flex gap-4">
                  <select
                    name="priority"
                    value={announcementForm.priority}
                    onChange={handleAnnouncementFormChange}
                    className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">Alta Prioridad</option>
                    <option value="urgent">Urgente</option>
                  </select>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-800 hover:to-blue-600 transition disabled:opacity-50"
                  >
                    {loading ? "Publicando..." : "Publicar Comunicado"}
                  </button>
                </div>
              </form>
            </div>

            {/* Lista de comunicados */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Comunicados Activos</h3>
              <div className="space-y-4">
                {loadingAnnouncements ? (
                  <div className="text-center py-8 text-gray-500">Cargando comunicados…</div>
                ) : (
                  <>
                    {announcements.map(announcement => (
                      <div key={announcement.id} className={`p-4 rounded-lg border-l-4 ${
                        announcement.priority === 'urgent' ? 'border-red-500 bg-red-50' :
                        announcement.priority === 'high' ? 'border-orange-500 bg-orange-50' :
                        'border-blue-500 bg-blue-50'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-800">{announcement.title}</h4>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                announcement.priority === 'urgent' ? 'bg-red-200 text-red-800' :
                                announcement.priority === 'high' ? 'bg-orange-200 text-orange-800' :
                                'bg-blue-200 text-blue-800'
                              }`}>
                                {announcement.priority === 'urgent' ? 'Urgente' :
                                 announcement.priority === 'high' ? 'Alta' : 'Normal'}
                              </span>
                            </div>
                            <p className="text-gray-700">{announcement.message}</p>
                            <p className="text-sm text-gray-500 mt-2">📅 {new Date(announcement.created_at || announcement.date).toLocaleDateString()}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteAnnouncement(announcement.id)}
                            className="text-red-600 hover:text-red-800 font-semibold ml-4"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                    {announcements.length === 0 && (
                      <div className="text-center py-8 text-gray-500">No hay comunicados publicados</div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}


      </main>
      
      {/* Toast de notificaciones */}
      <Toast message={msg} onClose={() => setMsg(null)} />
    </div>
  );
}

// Componente de formulario para registrar estudiantes
function StudentRegisterForm({ onCreated, userEmail }) {
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "", grade: "", school_id: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [schools, setSchools] = useState([]);
  const [schoolsError, setSchoolsError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    // Cargar lista de colegios desde el backend. Usamos rol 'admin' porque el endpoint actual es solo para admin.
    // Si falla (403 u otro), dejamos el selector vacío y el backend inferirá el colegio de la secretaria.
    const loadSchools = async () => {
      try {
        const res = await API.get("/auth/schools", {
          headers: { "x-user-role": "admin" }
        });
        setSchools(res.data || []);
      } catch (err) {
        console.warn("No se pudo cargar la lista de colegios:", err?.response?.status || err?.message);
        setSchoolsError("No se pudieron cargar los colegios. Puedes continuar sin seleccionar y se usará tu colegio por defecto.");
        setSchools([]);
      }
    };
    loadSchools();
  }, []);

  const validateField = (name, value) => {
    const errors = {};
    
    if (name === 'first_name' && !value.trim()) {
      errors.first_name = 'El nombre es obligatorio';
    } else if (name === 'first_name' && value.length < 2) {
      errors.first_name = 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (name === 'last_name' && !value.trim()) {
      errors.last_name = 'El apellido es obligatorio';
    } else if (name === 'last_name' && value.length < 2) {
      errors.last_name = 'El apellido debe tener al menos 2 caracteres';
    }
    
    if (name === 'email' && !value) {
      errors.email = 'El correo es obligatorio';
    } else if (name === 'email' && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
      errors.email = 'Formato de correo inválido';
    }
    
    if (name === 'password' && !value) {
      errors.password = 'La contraseña es obligatoria';
    } else if (name === 'password' && value.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (name === 'password' && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      errors.password = 'Debe incluir mayúscula, minúscula y número';
    }
    
    if (name === 'grade' && !value) {
      errors.grade = 'Selecciona un curso';
    }
    
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Validar el campo mientras se escribe
    const fieldErrors = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: fieldErrors[name]
    }));
  };

  const validateForm = () => {
    const errors = {};
    Object.keys(form).forEach(key => {
      if (key !== 'school_id') { // school_id es opcional
        const fieldErrors = validateField(key, form[key]);
        if (fieldErrors[key]) {
          errors[key] = fieldErrors[key];
        }
      }
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMsg({ type: 'error', text: 'Por favor corrige los errores del formulario' });
      return;
    }
    
    setLoading(true);
    setMsg(null);
    try {
      await API.post(
        "/auth/register",
        form,
        {
          headers: {
            "x-user-role": "secretaria",
            "x-user-email": userEmail
          }
        }
      );
      setMsg({ type: 'success', text: 'Estudiante registrado con éxito' });
      setForm({ first_name: "", last_name: "", email: "", password: "", grade: "", school_id: "" });
      setValidationErrors({});
      onCreated && onCreated();
    } catch (err) {
      const text = err.response?.data?.message || 'Error al registrar estudiante';
      setMsg({ type: 'error', text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <input
            type="text"
            name="first_name"
            placeholder="Nombre(s)"
            value={form.first_name}
            onChange={handleChange}
            className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:outline-none ${
              validationErrors.first_name ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
            }`}
            required
          />
          {validationErrors.first_name && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.first_name}</p>
          )}
        </div>
        <div>
          <input
            type="text"
            name="last_name"
            placeholder="Apellido(s)"
            value={form.last_name}
            onChange={handleChange}
            className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:outline-none ${
              validationErrors.last_name ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
            }`}
            required
          />
          {validationErrors.last_name && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.last_name}</p>
          )}
        </div>
        <div>
          <input
            type="email"
            name="email"
            placeholder="Correo"
            value={form.email}
            onChange={handleChange}
            className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:outline-none ${
              validationErrors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
            }`}
            required
          />
          {validationErrors.email && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
          )}
        </div>
        <div>
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:outline-none ${
              validationErrors.password ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
            }`}
            required
          />
          {validationErrors.password && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
          )}
        </div>
        <div>
          <select
            name="grade"
            value={form.grade}
            onChange={handleChange}
            className={`border rounded-lg px-4 py-2 w-full focus:ring-2 focus:outline-none ${
              validationErrors.grade ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
            }`}
            required
          >
            <option value="">Selecciona curso</option>
            {Array.from({ length: 11 }, (_, i) => i + 1).map(n => (
              <option key={n} value={n}>{n}°</option>
            ))}
          </select>
          {validationErrors.grade && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.grade}</p>
          )}
        </div>
        <select
          name="school_id"
          value={form.school_id}
          onChange={handleChange}
          className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">Selecciona colegio (opcional)</option>
          {schools.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      {schoolsError && (
        <p className="text-sm text-amber-600">{schoolsError}</p>
      )}
      <div>
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-800 hover:to-blue-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Registrando...' : 'Registrar Estudiante'}
        </button>
      </div>
    </form>
    <Toast message={msg} onClose={() => setMsg(null)} />
    </>
  );
}
