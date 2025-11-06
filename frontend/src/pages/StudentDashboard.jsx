// src/pages/StudentDashboard.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [rewards, setRewards] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState([]);
  const [academicRecords, setAcademicRecords] = useState([]);
  const [classes, setClasses] = useState([]);
  const [evidences, setEvidences] = useState([]);
  
  // Logging effect - Debe estar antes de los condicionales
  useEffect(() => {
    console.log('[StudentDashboard] Mounting/Rendering');
    console.log('[StudentDashboard] user=', JSON.stringify(user, null, 2));
    console.log('[StudentDashboard] localStorage=', localStorage.getItem('user'));
  }, [user]);

  // Cargar registros académicos
  useEffect(() => {
    if (!user || !user.id) return;
    
  fetch(`/api/academic/records/student/${user.id}`, {
      headers: {
        "Content-Type": "application/json",
        "x-user-role": "estudiante",
        "x-user-email": user.email
      }
    })
    .then(res => res.json())
    .then(data => {
      setAcademicRecords(Array.isArray(data) ? data : []);
    })
    .catch(err => {
      console.error("Error al cargar registros académicos:", err);
      setAcademicRecords([]);
    });
  }, [user]);

  // Cargar retroalimentación
  useEffect(() => {
    if (!user || !user.id) return;
    
  fetch(`/api/feedback/student/${user.id}`, {
      headers: {
        "Content-Type": "application/json",
        "x-user-role": "estudiante",
        "x-user-email": user.email
      }
    })
    .then(res => res.json())
    .then(data => {
      setFeedback(Array.isArray(data) ? data : []);
    })
    .catch(err => {
      console.error("Error al cargar retroalimentación:", err);
      setFeedback([]);
    });
  }, [user]);

  // Cargar clases del estudiante
  useEffect(() => {
    if (!user || !user.id) return;
    
  fetch(`/api/student/classes/${user.id}`, {
      headers: {
        "Content-Type": "application/json",
        "x-user-role": "estudiante",
        "x-user-email": user.email
      }
    })
    .then(res => res.json())
    .then(data => {
      setClasses(Array.isArray(data) ? data : []);
    })
    .catch(err => {
      console.error("Error al cargar clases:", err);
      setClasses([]);
    });
  }, [user]);

  // Cargar evidencias del estudiante
  useEffect(() => {
    if (!user || !user.id) return;
    
  fetch(`/api/student/evidences/${user.id}`, {
      headers: {
        "Content-Type": "application/json",
        "x-user-role": "estudiante",
        "x-user-email": user.email
      }
    })
    .then(res => res.json())
    .then(data => {
      setEvidences(Array.isArray(data) ? data : []);
    })
    .catch(err => {
      console.error("Error al cargar evidencias:", err);
      setEvidences([]);
    });
  }, [user]);

  // Cargar premios effect - Debe estar antes de los condicionales
  useEffect(() => {
    if (!user || user.role !== "estudiante") {
      setLoading(false);
      return;
    }

  fetch("/api/auth/rewards", {
      headers: {
        "Content-Type": "application/json",
        "x-user-role": "estudiante",
        "x-user-email": user.email
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log('Rewards response:', data);
        // Asegurar que rewards es siempre un array
        setRewards(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al cargar premios:", err);
        setLoading(false);
      });
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">🔑 Por favor inicia sesión para continuar.</p>
      </div>
    );
  }

  if (user.role !== "estudiante") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">🚫 No tienes permiso para acceder a esta página.</p>
      </div>
    );
  }
    // Remove duplicate code

  // Función para canjear premio
  const handleRedeemReward = async (rewardId) => {
    if (!user) return;
    
    try {
  const res = await fetch("/api/auth/redeem-reward", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "estudiante",
          "x-user-email": user.email
        },
        body: JSON.stringify({ reward_id: rewardId })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMensaje("¡Premio canjeado con éxito!");
        // Actualizar los learncoins del usuario en el estado local
        const updatedUser = { ...user, coins: data.newBalance };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.location.reload(); // Recargar para actualizar el balance
      } else {
        setMensaje(data.message || "Error al canjear el premio");
      }
    } catch {
      setMensaje("Error de conexión al canjear el premio");
    }
  };

  // Auth check already done above

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Hero */}
      <header className="mb-8 relative overflow-hidden rounded-3xl">
  <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-8 rounded-3xl shadow-lg text-white">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold">Panel de Estudiante</h1>
              <p className="mt-2 text-indigo-100/90">Bienvenido <span className="font-semibold">{user.name}</span></p>
              <div className="mt-4 flex items-center gap-4">
                <div className="bg-white/10 px-3 py-2 rounded-full">👩‍🎓 Estudiante</div>
                <div className="bg-white/10 px-3 py-2 rounded-full">📚 {user.school_id ? 'Colegio: ' + user.school_id : 'Sin colegio'}</div>
              </div>
            </div>

            <div className="w-full md:w-auto flex items-center gap-4">
              <div className="bg-white rounded-xl p-4 text-indigo-700 shadow-md">
                <div className="text-sm font-medium">Learncoins</div>
                <div className="text-2xl font-bold">{user.coins ?? 0}</div>
              </div>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="bg-white text-indigo-700 font-semibold px-4 py-2 rounded-xl shadow hover:opacity-90"
              >Cerrar sesión</button>
            </div>
          </div>
        </div>
      </header>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-8">
        <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">📅 Clases</h3>
              <p className="mt-1 text-sm text-gray-500">Clases asignadas</p>
            </div>
            <div className="text-3xl font-bold text-indigo-600">{classes.length}</div>
          </div>
          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-2 bg-indigo-600 rounded-full" style={{ width: classes.length > 0 ? '60%' : '0%' }}></div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">📝 Evidencias</h3>
              <p className="mt-1 text-sm text-gray-500">Tareas y evidencias entregadas</p>
            </div>
            <div className="text-3xl font-bold text-rose-600">{evidences.length}</div>
          </div>
          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-2 bg-rose-600 rounded-full" style={{ width: evidences.length > 0 ? '40%' : '0%' }}></div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">🏆 Learncoins</h3>
              <p className="mt-1 text-sm text-gray-500">Moneda que acumulas por buen rendimiento</p>
            </div>
            <div className="text-3xl font-bold text-yellow-600">{user.coins ?? 0}</div>
          </div>
          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-2 bg-yellow-400 rounded-full" style={{ width: `${Math.min((user.coins??0)/200*100,100)}%` }}></div>
          </div>
        </div>
      </div>

      {/* Actividades */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Últimas actividades</h2>
        <ul className="bg-white shadow-md rounded-xl divide-y divide-gray-200">
          <li className="p-4 hover:bg-gray-50 transition-colors">
            Entregaste "Tarea de matemáticas" - 20/08/2025
          </li>
          <li className="p-4 hover:bg-gray-50 transition-colors">
            Recibiste 10 learncoins por asistencia
          </li>
          <li className="p-4 hover:bg-gray-50 transition-colors">
            Nueva clase: Historia - 25/08/2025
          </li>
        </ul>
      </section>

      {/* Registros Académicos */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Registros Académicos
        </h2>
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clase</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nota</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profesor</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {academicRecords.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No hay registros académicos disponibles
                    </td>
                  </tr>
                ) : (
                  academicRecords.map((record, index) => (
                    <tr key={record.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.class_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.evaluation_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.evaluation_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-sm font-semibold ${
                          record.grade >= 70 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {record.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.teacher_name}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Retroalimentación de Profesores */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Retroalimentación de Profesores
        </h2>
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          {feedback.length === 0 ? (
            <p className="p-6 text-gray-500 text-center">No hay retroalimentación disponible</p>
          ) : (
            <div className="divide-y divide-gray-200">
              {feedback.map((f, index) => (
                <div key={f.id || index} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800">{f.class_name}</h3>
                      <p className="text-sm text-gray-500">Prof. {f.teacher_name}</p>
                    </div>
                    <span className="text-sm text-gray-400">
                      {new Date(f.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{f.message || f.feedback_text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Mis Clases */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          📚 Mis Clases
        </h2>
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          {classes.length === 0 ? (
            <p className="p-6 text-gray-500 text-center">No tienes clases asignadas</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {classes.map((classItem, index) => (
                <div key={classItem.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 text-lg">{classItem.name}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Activa</span>
                  </div>
                  {classItem.description && (
                    <p className="text-sm text-gray-600 mb-3">{classItem.description}</p>
                  )}
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span className="mr-2">👨‍🏫</span>
                    <span>{classItem.teacher_name || 'Sin profesor asignado'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <span className="mr-2">📅</span>
                    <span>Asignado: {new Date(classItem.assigned_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Mis Evidencias */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          📝 Mis Evidencias
        </h2>
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clase</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Archivo</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {evidences.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No has subido evidencias aún
                    </td>
                  </tr>
                ) : (
                  evidences.map((evidence, index) => (
                    <tr key={evidence.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {evidence.class_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {evidence.description || 'Sin descripción'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          evidence.status === 'aprobado' ? 'bg-green-100 text-green-800' :
                          evidence.status === 'rechazado' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {evidence.status === 'aprobado' ? '✓ Aprobado' :
                           evidence.status === 'rechazado' ? '✗ Rechazado' :
                           '⏳ Pendiente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(evidence.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {evidence.file_url ? (
                          <a 
                            href={evidence.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            Ver archivo
                          </a>
                        ) : (
                          <span className="text-gray-400">Sin archivo</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Premios Disponibles */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Premios Disponibles</h2>
        {mensaje && (
          <div className={`mb-4 p-4 rounded-lg ${
            mensaje.includes("éxito") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            {mensaje}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p className="text-gray-500">Cargando premios disponibles...</p>
          ) : (
            rewards.map(reward => (
              <div key={reward.id} className="bg-white shadow-md rounded-xl p-6 hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-gray-700">{reward.name}</h3>
                <p className="mt-2 text-gray-500">{reward.description || "Sin descripción"}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xl font-bold text-indigo-600">
                    {reward.cost} learncoins
                  </span>
                  <button
                    onClick={() => handleRedeemReward(reward.id)}
                    disabled={user.coins < reward.cost}
                    className={`px-4 py-2 rounded font-semibold ${
                      user.coins >= reward.cost
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {user.coins >= reward.cost ? "Canjear" : "Insuficiente"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
