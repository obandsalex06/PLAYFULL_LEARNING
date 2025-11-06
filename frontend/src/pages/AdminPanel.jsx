import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../api";
import Pagination from "../components/Pagination";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import Breadcrumbs from "../components/Breadcrumbs";

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Estados principales
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // Estados para datos
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0, schools: 0, rewards: 0 });
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]); // Todos los estudiantes sin paginación
  const [classes, setClasses] = useState([]);
  const [schools, setSchools] = useState([]);
  const [rewards, setRewards] = useState([]);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Estados para modales de confirmación
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "danger"
  });
  
  // Estados para formularios
  const [teacherForm, setTeacherForm] = useState({
    name: "", email: "", password: "", school_id: ""
  });
  const [secretaryForm, setSecretaryForm] = useState({
    name: "", email: "", password: "", school_id: ""
  });
  const [classForm, setClassForm] = useState({
    name: "", description: "", teacher_id: "", school_id: ""
  });
  const [schoolForm, setSchoolForm] = useState({
    name: "", address: ""
  });
  const [rewardForm, setRewardForm] = useState({
    name: "", description: "", cost: ""
  });
  
  // Estados para asignación de clases a profesores
  const [selectedTeacherForClasses, setSelectedTeacherForClasses] = useState("");
  const [teacherClasses, setTeacherClasses] = useState([]);
  // Nota: availableClasses eliminado por no usarse

  // Verificar autenticación
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  // Funciones de carga de datos
  const loadStats = async () => {
    try {
      const [studentsRes, teachersRes, classesRes, schoolsRes, rewardsRes] = await Promise.all([
        API.get("/auth/all-students", { headers: { "x-user-role": "admin" } }),
        API.get("/auth/teachers", { headers: { "x-user-role": "admin" } }),
        API.get("/auth/all-classes", { 
          headers: { "x-user-role": "admin" } 
        }),
        API.get("/auth/schools", { headers: { "x-user-role": "admin" } }),
        API.get("/auth/rewards", { headers: { "x-user-role": "admin" } })
      ]);
      
      setStats({
        students: studentsRes.data.length,
        teachers: teachersRes.data.length,
        classes: classesRes.data.length,
        schools: schoolsRes.data.length,
        rewards: rewardsRes.data.length
      });
    } catch (err) {
      console.error("Error cargando estadísticas:", err);
    }
  };

  const loadTeachers = async () => {
    try {
      const res = await API.get("/auth/teachers", {
        headers: { "x-user-role": "admin" }
      });
      setTeachers(res.data);
    } catch (err) {
      console.error("Error cargando profesores:", err);
    }
  };

  const loadStudents = useCallback(async () => {
    try {
      const res = await API.get("/auth/all-students");
      setAllStudents(res.data);
      
      // Aplicar paginación del lado del cliente
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setStudents(res.data.slice(startIndex, endIndex));
    } catch (err) {
      console.error("Error cargando estudiantes:", err);
      setStudents([]);
      setAllStudents([]);
    }
  }, [currentPage, itemsPerPage]);

  const loadClasses = async () => {
    try {
      const res = await API.get("/auth/all-classes", {
        headers: { "x-user-role": "admin" }
      });
      setClasses(res.data);
    } catch (err) {
      console.error("Error cargando clases:", err);
    }
  };

  const loadSchools = async () => {
    try {
      const res = await API.get("/auth/schools", {
        headers: { "x-user-role": "admin" }
      });
      setSchools(res.data);
    } catch (err) {
      console.error("Error cargando colegios:", err);
    }
  };

  const loadRewards = async () => {
    try {
      const res = await API.get("/auth/rewards", {
        headers: { "x-user-role": "admin" }
      });
      setRewards(res.data);
    } catch (err) {
      console.error("Error cargando premios:", err);
    }
  };

  // Cargar estadísticas generales
  useEffect(() => {
    if (activeTab === "dashboard") {
      loadStats();
    }
  }, [activeTab]);

  // Cargar escuelas al inicio (necesarias para los formularios)
  useEffect(() => {
    loadSchools();
    loadTeachers();
  }, []);

  // Cargar datos según la pestaña activa
  useEffect(() => {
    if (activeTab === "teachers") loadTeachers();
    if (activeTab === "students") {
      setCurrentPage(1); // Reset página al cambiar tab
      loadStudents();
    }
    if (activeTab === "classes") loadClasses();
    if (activeTab === "schools") loadSchools();
    if (activeTab === "rewards") loadRewards();
  }, [activeTab, loadStudents]);

  // Recargar estudiantes cuando cambia la página
  useEffect(() => {
    if (activeTab === "students") {
      loadStudents();
    }
  }, [currentPage, activeTab, loadStudents]);

  // Handlers para profesor
  const handleTeacherFormChange = (e) => {
    setTeacherForm({ ...teacherForm, [e.target.name]: e.target.value });
  };

  const handleRegisterTeacher = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await API.post("/auth/register-teacher", teacherForm, {
        headers: { "Content-Type": "application/json", "x-user-role": "admin" }
      });
      setMsg({ type: 'success', text: res.data.message || 'Profesor registrado exitosamente' });
  setTeacherForm({ name: "", email: "", password: "", school_id: "" });
      loadTeachers();
    } catch (err) {
      setMsg({ 
        type: 'error', 
        text: err.response?.data?.message || 'Error al registrar profesor' 
      });
    }
    setLoading(false);
  };

  // Handlers para secretaria
  const handleSecretaryFormChange = (e) => {
    setSecretaryForm({ ...secretaryForm, [e.target.name]: e.target.value });
  };

  const handleRegisterSecretary = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await API.post("/auth/register-secretary", secretaryForm, {
        headers: { "Content-Type": "application/json", "x-user-role": "admin" }
      });
      setMsg({ type: 'success', text: res.data.message || 'Secretaria registrada exitosamente' });
      setSecretaryForm({ name: "", email: "", password: "", school_id: "" });
    } catch (err) {
      setMsg({ 
        type: 'error', 
        text: err.response?.data?.message || 'Error al registrar secretaria' 
      });
    }
    setLoading(false);
  };

  // Handlers para clases
  const handleClassFormChange = (e) => {
    setClassForm({ ...classForm, [e.target.name]: e.target.value });
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await API.post("/auth/create-class", classForm, {
        headers: { "Content-Type": "application/json", "x-user-role": "admin" }
      });
      setMsg({ type: 'success', text: res.data.message || 'Clase creada exitosamente' });
      setClassForm({ name: "", description: "", teacher_id: "", school_id: "" });
      loadClasses();
    } catch (err) {
      setMsg({ 
        type: 'error', 
        text: err.response?.data?.message || 'Error al crear clase' 
      });
    }
    setLoading(false);
  };

  // Handlers para colegios
  const handleSchoolFormChange = (e) => {
    setSchoolForm({ ...schoolForm, [e.target.name]: e.target.value });
  };

  const handleSchoolSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await API.post("/auth/schools", schoolForm, {
        headers: { "Content-Type": "application/json", "x-user-role": "admin" }
      });
      setMsg({ type: 'success', text: res.data.message });
      setSchoolForm({ name: "", address: "" });
      loadSchools();
    } catch (err) {
      console.error('Error al crear colegio:', err);
      setMsg({ type: 'error', text: err.response?.data?.message || 'Error al crear colegio' });
    }
    setLoading(false);
  };

  const handleDeleteSchool = async (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Eliminar Colegio",
      message: "¿Estás seguro de eliminar este colegio? Esta acción no se puede deshacer.",
      type: "danger",
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await API.delete(`/auth/schools/${id}`, {
            headers: { "x-user-role": "admin" }
          });
          setMsg({ type: 'success', text: res.data.message });
          loadSchools();
        } catch (err) {
          console.error('Error al eliminar colegio:', err);
          setMsg({ type: 'error', text: err.response?.data?.message || 'Error al eliminar colegio' });
        } finally {
          setLoading(false);
          setConfirmModal({ ...confirmModal, isOpen: false });
        }
      }
    });
  };

  // Handlers para premios
  const handleRewardFormChange = (e) => {
    setRewardForm({ ...rewardForm, [e.target.name]: e.target.value });
  };

  const handleRewardSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await API.post("/auth/rewards", 
        { ...rewardForm, cost: Number(rewardForm.cost) },
        { headers: { "Content-Type": "application/json", "x-user-role": "admin" } }
      );
      setMsg({ type: 'success', text: res.data.message });
      setRewardForm({ name: "", description: "", cost: "" });
      loadRewards();
    } catch (err) {
      console.error('Error al crear premio:', err);
      setMsg({ type: 'error', text: err.response?.data?.message || 'Error al crear premio' });
    }
    setLoading(false);
  };

  const handleDeleteReward = async (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Eliminar Premio",
      message: "¿Estás seguro de eliminar este premio? Los estudiantes que lo hayan canjeado seguirán teniéndolo.",
      type: "danger",
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await API.delete(`/auth/rewards/${id}`, {
            headers: { "x-user-role": "admin" }
          });
          setMsg({ type: 'success', text: res.data.message });
          loadRewards();
        } catch (err) {
          console.error('Error al eliminar premio:', err);
          setMsg({ type: 'error', text: err.response?.data?.message || 'Error al eliminar premio' });
        } finally {
          setLoading(false);
          setConfirmModal({ ...confirmModal, isOpen: false });
        }
      }
    });
  };

  // Función para cargar clases de un profesor
  const loadTeacherClasses = async (teacherId) => {
    try {
      // Filtrar las clases que pertenecen al profesor seleccionado
      const filtered = classes.filter(c => c.teacher_id === parseInt(teacherId));
      setTeacherClasses(filtered);
    } catch (err) {
      console.error("Error cargando clases del profesor:", err);
    }
  };

  // Handler para cambio de profesor en asignación de clases
  const handleTeacherSelectForClasses = (e) => {
    const teacherId = e.target.value;
    setSelectedTeacherForClasses(teacherId);
    if (teacherId) {
      loadTeacherClasses(teacherId);
    } else {
      setTeacherClasses([]);
    }
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con gradiente azul */}
      <header className="relative bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Panel de Administración</h1>
              <p className="text-blue-100 mt-1">Bienvenido, {user.name}</p>
            </div>
            <button
              onClick={() => { logout(); navigate("/login"); }}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
            >
              <LogOut size={20} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: "dashboard", label: "📊 Resumen", icon: "📊" },
              { id: "teachers", label: "👨‍🏫 Profesores", icon: "👨‍🏫" },
              { id: "students", label: "👥 Estudiantes", icon: "👥" },
              { id: "classes", label: "📚 Clases", icon: "📚" },
              { id: "schools", label: "🏫 Colegios", icon: "🏫" },
              { id: "rewards", label: "🎁 Premios", icon: "🎁" },
              { id: "secretary", label: "📋 Secretarias", icon: "📋" }
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
          { label: 'Panel de Administrador', path: '/admin-panel' }
        ]} />
        
        {/* Tab: Dashboard */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Resumen General</h2>
            
            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Estudiantes</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats.students}</p>
                  </div>
                  <div className="text-4xl">👥</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Profesores</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats.teachers}</p>
                  </div>
                  <div className="text-4xl">👨‍🏫</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Clases</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats.classes}</p>
                  </div>
                  <div className="text-4xl">📚</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Colegios</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats.schools}</p>
                  </div>
                  <div className="text-4xl">🏫</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Premios</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats.rewards}</p>
                  </div>
                  <div className="text-4xl">🎁</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Profesores */}
        {activeTab === "teachers" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Gestión de Profesores</h2>
            
            {/* Formulario de registro */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Registrar Nuevo Profesor</h3>
              <form onSubmit={handleRegisterTeacher} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre completo del profesor"
                  value={teacherForm.name}
                  onChange={handleTeacherFormChange}
                  className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  autoFocus
                  required
                  disabled={loading}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="ejemplo@correo.com"
                  value={teacherForm.email}
                  onChange={handleTeacherFormChange}
                  className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                  disabled={loading}
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña (mínimo 8 caracteres)"
                  value={teacherForm.password}
                  onChange={handleTeacherFormChange}
                  className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                  disabled={loading}
                />
                <select
                  name="school_id"
                  value={teacherForm.school_id}
                  onChange={handleTeacherFormChange}
                  className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={loading}
                >
                  <option value="">Seleccionar colegio (opcional)</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-800 hover:to-blue-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? "Registrando..." : "Registrar Profesor"}
                </button>
              </form>
            </div>

            {/* Sección de asignación de clases */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Clases Asignadas por Profesor</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecciona un profesor para ver sus clases:
                </label>
                <select
                  value={selectedTeacherForClasses}
                  onChange={handleTeacherSelectForClasses}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Seleccionar profesor --</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.email})
                    </option>
                  ))}
                </select>
              </div>

              {selectedTeacherForClasses && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-3">
                    Clases asignadas: {teacherClasses.length}
                  </h4>
                  {teacherClasses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {teacherClasses.map(cls => (
                        <div key={cls.id} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h5 className="font-semibold text-blue-800">{cls.name}</h5>
                          <p className="text-sm text-gray-600 mt-1">{cls.description || "Sin descripción"}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Este profesor no tiene clases asignadas</p>
                  )}
                </div>
              )}
            </div>

            {/* Lista de profesores */}
            <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Lista de Profesores</h3>
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
            </div>
          </div>
        )}

        {/* Tab: Estudiantes */}
        {activeTab === "students" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Lista de Estudiantes</h2>
            
            <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-3 font-semibold text-gray-700">ID</th>
                    <th className="pb-3 font-semibold text-gray-700">Nombre</th>
                    <th className="pb-3 font-semibold text-gray-700">Email</th>
                    <th className="pb-3 font-semibold text-gray-700">Learncoins</th>
                    <th className="pb-3 font-semibold text-gray-700">Fecha de Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id} className="border-b hover:bg-gray-50">
                      <td className="py-3">{student.id}</td>
                      <td className="py-3 font-medium">{student.name}</td>
                      <td className="py-3">{student.email}</td>
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
              
              {students.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No hay estudiantes registrados
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
            </div>
          </div>
        )}

        {/* Tab: Clases */}
        {activeTab === "classes" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Gestión de Clases</h2>
            
            {/* Formulario para crear clase */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Crear Nueva Clase</h3>
              <form onSubmit={handleCreateClass} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre de la clase"
                  value={classForm.name}
                  onChange={handleClassFormChange}
                  className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
                <input
                  type="text"
                  name="description"
                  placeholder="Descripción"
                  value={classForm.description}
                  onChange={handleClassFormChange}
                  className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <select
                  name="teacher_id"
                  value={classForm.teacher_id}
                  onChange={handleClassFormChange}
                  className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Seleccionar profesor</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                  ))}
                </select>
                <select
                  name="school_id"
                  value={classForm.school_id}
                  onChange={handleClassFormChange}
                  className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Seleccionar colegio (opcional)</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-800 hover:to-blue-600 transition disabled:opacity-50"
                >
                  {loading ? "Creando..." : "Crear Clase"}
                </button>
              </form>
            </div>

            {/* Lista de clases */}
            <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Lista de Clases</h3>
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-3 font-semibold text-gray-700">ID</th>
                    <th className="pb-3 font-semibold text-gray-700">Nombre</th>
                    <th className="pb-3 font-semibold text-gray-700">Descripción</th>
                    <th className="pb-3 font-semibold text-gray-700">Profesor</th>
                    <th className="pb-3 font-semibold text-gray-700">Fecha de Creación</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map(cls => (
                    <tr key={cls.id} className="border-b hover:bg-gray-50">
                      <td className="py-3">{cls.id}</td>
                      <td className="py-3 font-medium">{cls.name}</td>
                      <td className="py-3">{cls.description || "-"}</td>
                      <td className="py-3">{cls.teacher_name || "Sin asignar"}</td>
                      <td className="py-3">{new Date(cls.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Colegios */}
        {activeTab === "schools" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Gestión de Colegios</h2>
            
            {/* Formulario para crear colegio */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Crear Nuevo Colegio</h3>
              <form onSubmit={handleSchoolSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre del colegio"
                  value={schoolForm.name}
                  onChange={handleSchoolFormChange}
                  className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Dirección"
                  value={schoolForm.address}
                  onChange={handleSchoolFormChange}
                  className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-800 hover:to-blue-600 transition disabled:opacity-50"
                >
                  {loading ? "Creando..." : "Crear Colegio"}
                </button>
              </form>
            </div>

            {/* Lista de colegios */}
            <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Lista de Colegios</h3>
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-3 font-semibold text-gray-700">ID</th>
                    <th className="pb-3 font-semibold text-gray-700">Nombre</th>
                    <th className="pb-3 font-semibold text-gray-700">Dirección</th>
                    <th className="pb-3 font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {schools.map(school => (
                    <tr key={school.id} className="border-b hover:bg-gray-50">
                      <td className="py-3">{school.id}</td>
                      <td className="py-3 font-medium">{school.name}</td>
                      <td className="py-3">{school.address || "-"}</td>
                      <td className="py-3">
                        <button
                          onClick={() => handleDeleteSchool(school.id)}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Premios */}
        {activeTab === "rewards" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Gestión de Premios</h2>
            
            {/* Formulario para crear premio */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Crear Nuevo Premio</h3>
              <form onSubmit={handleRewardSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre del premio"
                  value={rewardForm.name}
                  onChange={handleRewardFormChange}
                  className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
                <input
                  type="text"
                  name="description"
                  placeholder="Descripción"
                  value={rewardForm.description}
                  onChange={handleRewardFormChange}
                  className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <input
                  type="number"
                  name="cost"
                  placeholder="Costo (learncoins)"
                  value={rewardForm.cost}
                  onChange={handleRewardFormChange}
                  min="1"
                  className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-800 hover:to-blue-600 transition disabled:opacity-50"
                >
                  {loading ? "Creando..." : "Crear Premio"}
                </button>
              </form>
            </div>

            {/* Lista de premios */}
            <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Lista de Premios</h3>
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-3 font-semibold text-gray-700">ID</th>
                    <th className="pb-3 font-semibold text-gray-700">Nombre</th>
                    <th className="pb-3 font-semibold text-gray-700">Descripción</th>
                    <th className="pb-3 font-semibold text-gray-700">Costo</th>
                    <th className="pb-3 font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rewards.map(reward => (
                    <tr key={reward.id} className="border-b hover:bg-gray-50">
                      <td className="py-3">{reward.id}</td>
                      <td className="py-3 font-medium">{reward.name}</td>
                      <td className="py-3">{reward.description || "-"}</td>
                      <td className="py-3">
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                          🪙 {reward.cost}
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleDeleteReward(reward.id)}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Secretarias */}
        {activeTab === "secretary" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Registro de Secretarias</h2>
            
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Registrar Nueva Secretaria</h3>
              <form onSubmit={handleRegisterSecretary} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre completo"
                  value={secretaryForm.name}
                  onChange={handleSecretaryFormChange}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Correo electrónico"
                  value={secretaryForm.email}
                  onChange={handleSecretaryFormChange}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  value={secretaryForm.password}
                  onChange={handleSecretaryFormChange}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
                <select
                  name="school_id"
                  value={secretaryForm.school_id}
                  onChange={handleSecretaryFormChange}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Seleccionar colegio (opcional)</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-800 hover:to-blue-600 transition disabled:opacity-50"
                >
                  {loading ? "Registrando..." : "Registrar Secretaria"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />

      {/* Toast de notificaciones */}
      <Toast message={msg} onClose={() => setMsg(null)} />
    </div>
  );
}
