import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "../api";
import { getTeacherClasses } from "../api";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  
  // Formularios
  const [assignForm, setAssignForm] = useState({ student_id: '', class_id: '' });
  const [coinsForm, setCoinsForm] = useState({
    student_id: '',
    class_id: '',
    amount: '',
    reason: ''
  });
  const [feedbackForm, setFeedbackForm] = useState({
    student_id: '',
    class_id: '',
    feedback_text: ''
  });
  const [academicForm, setAcademicForm] = useState({
    student_id: '',
    class_id: '',
    grade: '',
    observations: '',
    evaluation_type: '',
    evaluation_date: new Date().toISOString().split('T')[0]
  });
  const [academicRecords, setAcademicRecords] = useState([]);
  const [selectedClassRecords, setSelectedClassRecords] = useState(null);

  // Cargar clases del docente
  useEffect(() => {
    if (!user || user.role !== "docente") return;
    async function fetchClasses() {
      try {
        const res = await getTeacherClasses({
          "x-user-role": user.role,
          "x-user-email": user.email,
        });
        setClasses(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error('[TeacherDashboard] Error al cargar clases:', error);
        setClasses([]);
      }
    }
    fetchClasses();
  }, [user]);

  // Cargar todos los estudiantes
  useEffect(() => {
    if (!user || user.role !== "docente") return;
    async function fetchAllStudents() {
      try {
        const res = await API.get("/auth/all-students", {
          headers: {
            "x-user-role": user.role,
            "x-user-email": user.email,
          }
        });
        setAllStudents(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error al cargar estudiantes:", err);
        setAllStudents([]);
      }
    }
    fetchAllStudents();
  }, [user]);

  // Actualizar estudiantes cuando se selecciona una clase
  useEffect(() => {
    if (!feedbackForm.class_id && !coinsForm.class_id && !academicForm.class_id) return;
    
    const classId = feedbackForm.class_id || coinsForm.class_id || academicForm.class_id;
    const clase = classes.find(c => String(c.id) === String(classId));
    setStudents(clase && Array.isArray(clase.students) ? clase.students : []);
  }, [feedbackForm.class_id, coinsForm.class_id, academicForm.class_id, classes]);

  // Handlers para asignar estudiante a clase
  const handleAssignFormChange = (e) => {
    setAssignForm({ ...assignForm, [e.target.name]: e.target.value });
  };

  const handleAssignStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      const res = await API.post(
        "/auth/assign-student",
        assignForm,
        {
          headers: {
            "x-user-role": user.role,
            "x-user-email": user.email,
          },
        }
      );
      setMsg({ type: 'success', text: res.data.message });
      setAssignForm({ student_id: '', class_id: '' });
      
      // Recargar clases
      const classRes = await getTeacherClasses({
        "x-user-role": user.role,
        "x-user-email": user.email,
      });
      setClasses(Array.isArray(classRes.data) ? classRes.data : []);
    } catch (err) {
      setMsg({ 
        type: 'error', 
        text: err.response?.data?.message || 'Error al asignar estudiante' 
      });
    }
    setLoading(false);
  };

  // Handlers para learncoins
  const handleCoinsFormChange = (e) => {
    setCoinsForm({ ...coinsForm, [e.target.name]: e.target.value });
  };

  const handleAssignCoins = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      const res = await API.post(
        "/auth/assign-coins",
        coinsForm,
        {
          headers: {
            "x-user-role": user.role,
            "x-user-email": user.email,
          },
        }
      );
      setMsg({ type: 'success', text: res.data.message });
      setCoinsForm({ student_id: '', class_id: '', amount: '', reason: '' });
    } catch (err) {
      setMsg({ 
        type: 'error', 
        text: err.response?.data?.message || 'Error al asignar learncoins' 
      });
    }
    setLoading(false);
  };

  // Handlers para retroalimentación
  const handleFeedbackChange = (e) => {
    setFeedbackForm({ ...feedbackForm, [e.target.name]: e.target.value });
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await API.post("/feedback", feedbackForm, {
        headers: {
          "Content-Type": "application/json",
          "x-user-role": user.role,
          "x-user-email": user.email,
        }
      });
      setMsg({ type: 'success', text: res.data.message });
      setFeedbackForm({ ...feedbackForm, feedback_text: '' });
    } catch (err) {
      setMsg({ 
        type: 'error', 
        text: err.response?.data?.message || 'Error al enviar retroalimentación' 
      });
    }
    setLoading(false);
  };

  // Handlers para registros académicos
  const handleAcademicFormChange = (e) => {
    setAcademicForm({ ...academicForm, [e.target.name]: e.target.value });
  };

  const handleAcademicSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await API.post("/academic/records", academicForm, {
        headers: {
          "Content-Type": "application/json",
          "x-user-role": user.role,
          "x-user-email": user.email,
        }
      });
      setMsg({ type: 'success', text: res.data.message });
      setAcademicForm({
        ...academicForm,
        grade: '',
        observations: '',
        evaluation_type: ''
      });
      if (selectedClassRecords === academicForm.class_id) {
        loadClassRecords(academicForm.class_id);
      }
    } catch (err) {
      setMsg({ 
        type: 'error', 
        text: err.response?.data?.message || 'Error al guardar el registro académico' 
      });
    }
    setLoading(false);
  };

  const loadClassRecords = async (classId) => {
    try {
      const res = await API.get(`/academic/records/class/${classId}`, {
        headers: {
          "x-user-role": user.role,
          "x-user-email": user.email,
        }
      });
      setAcademicRecords(res.data);
      setSelectedClassRecords(classId);
    } catch (err) {
      console.error('Error al cargar registros académicos:', err);
      setAcademicRecords([]);
    }
  };

  if (!user || user.role !== "docente") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">🚫 No tienes permiso para acceder.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Panel de Docente</h1>
              <p className="text-blue-100 mt-1">Bienvenido, {user.name}</p>
            </div>
          </div>

          {/* Pestañas de navegación */}
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              { id: 'dashboard', icon: '📊', label: 'Resumen' },
              { id: 'students', icon: '👥', label: 'Estudiantes' },
              { id: 'grades', icon: '📝', label: 'Calificaciones' },
              { id: 'feedback', icon: '💬', label: 'Retroalimentación' },
              { id: 'coins', icon: '🪙', label: 'Learncoins' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-700 shadow-md'
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mensajes */}
        {msg && (
          <div className={`mb-6 p-4 rounded-lg ${
            msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {msg.text}
          </div>
        )}

        {/* Pestaña: Resumen */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Mis Clases</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{classes.length}</p>
                  </div>
                  <div className="text-4xl">🎓</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Estudiantes Total</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{allStudents.length}</p>
                  </div>
                  <div className="text-4xl">👥</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Registros Académicos</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{academicRecords.length}</p>
                  </div>
                  <div className="text-4xl">📊</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📚 Tus Clases</h2>
              {classes.length === 0 ? (
                <p className="text-gray-500">No tienes clases asignadas.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classes.map(c => (
                    <div key={c.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <h3 className="font-bold text-lg text-blue-700">{c.name}</h3>
                      <p className="text-sm text-gray-600 mt-2">
                        👥 {c.students?.length || 0} estudiantes
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pestaña: Estudiantes */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            {/* Asignar estudiante a clase */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">➕ Asignar Estudiante a Clase</h2>
              <form onSubmit={handleAssignStudent} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estudiante</label>
                  <select
                    name="student_id"
                    value={assignForm.student_id}
                    onChange={handleAssignFormChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecciona un estudiante</option>
                    {allStudents.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Clase</label>
                  <select
                    name="class_id"
                    value={assignForm.class_id}
                    onChange={handleAssignFormChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecciona una clase</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {loading ? 'Asignando...' : 'Asignar'}
                  </button>
                </div>
              </form>
            </div>

            {/* Lista de estudiantes */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                👥 Todos los Estudiantes ({allStudents.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Learncoins</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {allStudents.map(student => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            🪙 {student.coins}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(student.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Pestaña: Calificaciones */}
        {activeTab === 'grades' && (
          <div className="space-y-6">
            {/* Formulario de calificaciones */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📝 Registrar Calificación</h2>
              <form onSubmit={handleAcademicSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Clase</label>
                    <select
                      name="class_id"
                      value={academicForm.class_id}
                      onChange={handleAcademicFormChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecciona una clase</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estudiante</label>
                    <select
                      name="student_id"
                      value={academicForm.student_id}
                      onChange={handleAcademicFormChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={!academicForm.class_id}
                    >
                      <option value="">Selecciona un estudiante</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nota</label>
                    <input
                      type="number"
                      name="grade"
                      value={academicForm.grade}
                      onChange={handleAcademicFormChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="100"
                      step="0.1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Evaluación</label>
                    <select
                      name="evaluation_type"
                      value={academicForm.evaluation_type}
                      onChange={handleAcademicFormChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecciona el tipo</option>
                      <option value="Examen">Examen</option>
                      <option value="Tarea">Tarea</option>
                      <option value="Proyecto">Proyecto</option>
                      <option value="Participación">Participación</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                    <input
                      type="date"
                      name="evaluation_date"
                      value={academicForm.evaluation_date}
                      onChange={handleAcademicFormChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                  <textarea
                    name="observations"
                    value={academicForm.observations}
                    onChange={handleAcademicFormChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                    placeholder="Observaciones adicionales..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar Calificación'}
                </button>
              </form>
            </div>

            {/* Ver registros por clase */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Ver Registros por Clase</h2>
              <div className="mb-4">
                <select
                  onChange={(e) => e.target.value && loadClassRecords(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecciona una clase</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              {selectedClassRecords && (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nota</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {academicRecords.map(record => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.student_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.evaluation_type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(record.evaluation_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded font-semibold ${
                              record.grade >= 70 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {record.grade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pestaña: Retroalimentación */}
        {activeTab === 'feedback' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">💬 Enviar Retroalimentación</h2>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Clase</label>
                  <select
                    name="class_id"
                    value={feedbackForm.class_id}
                    onChange={handleFeedbackChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecciona una clase</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estudiante</label>
                  <select
                    name="student_id"
                    value={feedbackForm.student_id}
                    onChange={handleFeedbackChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!feedbackForm.class_id}
                  >
                    <option value="">Selecciona un estudiante</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
                <textarea
                  name="feedback_text"
                  value={feedbackForm.feedback_text}
                  onChange={handleFeedbackChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                  required
                  placeholder="Escribe tu retroalimentación aquí..."
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar Retroalimentación'}
              </button>
            </form>
          </div>
        )}

        {/* Pestaña: Learncoins */}
        {activeTab === 'coins' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🪙 Asignar Learncoins</h2>
            <form onSubmit={handleAssignCoins} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Clase</label>
                  <select
                    name="class_id"
                    value={coinsForm.class_id}
                    onChange={handleCoinsFormChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecciona una clase</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estudiante</label>
                  <select
                    name="student_id"
                    value={coinsForm.student_id}
                    onChange={handleCoinsFormChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!coinsForm.class_id}
                  >
                    <option value="">Selecciona un estudiante</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                  <input
                    type="number"
                    name="amount"
                    value={coinsForm.amount}
                    onChange={handleCoinsFormChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Razón</label>
                  <input
                    type="text"
                    name="reason"
                    value={coinsForm.reason}
                    onChange={handleCoinsFormChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Buen comportamiento, excelente trabajo..."
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Asignando...' : 'Asignar Learncoins'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
