import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function TeacherClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [message, setMessage] = useState("");
  const [students, setStudents] = useState([]);
  // Estados para calificación y feedback por estudiante
  const [gradeInputs, setGradeInputs] = useState({}); // { [studentId]: { grade: '', type: '', date: today, obs: '' } }
  const [feedbackInputs, setFeedbackInputs] = useState({}); // { [studentId]: { text: '' } }
  const [rowMsg, setRowMsg] = useState({}); // { [studentId]: { type: 'success'|'error', text: string } }

  useEffect(() => {
    if (!user) return;
    // Obtener clases según rol (admin/docente/secretaria)
  fetch("/api/auth/classes", {
      headers: { "Content-Type": "application/json", "x-user-role": user.role, "x-user-email": user.email }
    })
      .then(res => res.json())
      .then(data => {
        setClasses(data || []);
        if (data && data[0]) setSelectedClass(data[0].id);
      })
      .catch(err => console.error('Error fetching classes', err));
  }, [user]);

  // Cargar estudiantes cuando cambia la clase seleccionada
  useEffect(() => {
    if (!selectedClass) return;
  fetch(`/api/auth/classes/${selectedClass}/students`, {
      headers: { "Content-Type": "application/json", "x-user-role": user.role, "x-user-email": user.email }
    })
      .then(res => res.json())
      .then(data => setStudents(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('Error fetching class students', err);
        setStudents([]);
      });
  }, [selectedClass, user]);

  const today = new Date().toISOString().split('T')[0];

  const updateGradeInput = (sid, field, value) => {
    setGradeInputs(prev => ({
      ...prev,
      [sid]: { grade: '', type: '', date: today, obs: '', ...(prev[sid] || {}), [field]: value }
    }));
  };

  const updateFeedbackInput = (sid, value) => {
    setFeedbackInputs(prev => ({ ...prev, [sid]: { text: value } }));
  };

  const setRowMessage = (sid, type, text) => {
    setRowMsg(prev => ({ ...prev, [sid]: { type, text } }));
    // Limpiar mensaje después de unos segundos
    setTimeout(() => {
      setRowMsg(prev2 => ({ ...prev2, [sid]: undefined }));
    }, 4000);
  };

  const submitGrade = async (sid) => {
    const input = gradeInputs[sid] || {};
    if (!selectedClass || !input.grade || !input.type || !input.date) {
      return setRowMessage(sid, 'error', 'Completa clase, nota, tipo y fecha.');
    }
    try {
  await axios.post('/api/academic/records', {
        student_id: sid,
        class_id: selectedClass,
        grade: input.grade,
        observations: input.obs || '',
        evaluation_type: input.type,
        evaluation_date: input.date,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user.role,
          'x-user-email': user.email,
        }
      });
      setRowMessage(sid, 'success', 'Calificación guardada');
      setGradeInputs(prev => ({ ...prev, [sid]: { grade: '', type: '', date: today, obs: '' } }));
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al guardar calificación';
      setRowMessage(sid, 'error', msg);
    }
  };

  const submitFeedback = async (sid) => {
    const input = feedbackInputs[sid] || {};
    if (!selectedClass || !input.text) {
      return setRowMessage(sid, 'error', 'Completa clase y mensaje.');
    }
    try {
  await axios.post('/api/feedback', {
        student_id: sid,
        class_id: selectedClass,
        feedback_text: input.text,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user.role,
          'x-user-email': user.email,
        }
      });
      setRowMessage(sid, 'success', 'Retroalimentación enviada');
      setFeedbackInputs(prev => ({ ...prev, [sid]: { text: '' } }));
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al enviar retroalimentación';
      setRowMessage(sid, 'error', msg);
    }
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAssign = async () => {
    if (!selectedClass || !studentEmail) return setMessage('Selecciona clase e ingresa email del estudiante');
    if (!validateEmail(studentEmail)) return setMessage('Formato de email inválido');
    setMessage('Asignando...');
    try {
  const res = await fetch('/api/auth/assign-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-role': user.role, 'x-user-email': user.email },
        body: JSON.stringify({ student_email: studentEmail, class_id: selectedClass })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Estudiante asignado');
        setStudentEmail('');
        // refrescar lista de estudiantes
  fetch(`/api/auth/classes/${selectedClass}/students`, {
          headers: { "Content-Type": "application/json", "x-user-role": user.role, "x-user-email": user.email }
        })
          .then(res2 => res2.json())
          .then(d2 => setStudents(Array.isArray(d2) ? d2 : []))
          .catch(() => {});
      } else {
        setMessage(data.message || 'Error al asignar estudiante');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error de conexión');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-green-700 mb-6">📖 Mis Clases</h1>
      <p className="text-gray-600 mb-6">Aquí puedes asignar estudiantes a tus clases.</p>

      <div className="bg-white p-6 rounded-lg shadow">
        <label className="block mb-2 font-medium">Seleccionar clase</label>
        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full p-2 border rounded mb-4">
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

  <label className="block mb-2 font-medium">Email del estudiante</label>
  <input value={studentEmail} onChange={e => setStudentEmail(e.target.value)} placeholder="correo@ejemplo.com" className="w-full p-2 border rounded mb-4" />

        <div className="flex gap-3">
          <button onClick={handleAssign} className="px-4 py-2 bg-green-600 text-white rounded">Asignar estudiante</button>
          <div className="text-sm text-gray-600 self-center">{message}</div>
        </div>
      </div>
        {/* Lista de estudiantes de la clase */}
        <div className="mt-6 bg-white p-6 rounded shadow">
          <h3 className="font-semibold mb-3">Estudiantes en esta clase</h3>
          {students.length === 0 ? (
            <p className="text-sm text-gray-500">No hay estudiantes asignados a esta clase.</p>
          ) : (
            <ul className="space-y-4">
              {students.map(s => (
                <li key={s.id} className="border rounded p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-sm text-gray-500">{s.email}</div>
                    </div>
                    <div className="text-sm text-gray-600">{s.coins ?? 0} coins</div>
                  </div>
                  {/* Acciones rápidas */}
                  <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {/* Calificación */}
                    <div className="bg-gray-50 rounded p-3">
                      <div className="text-sm font-semibold mb-2">📝 Calificar</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={gradeInputs[s.id]?.grade || ''}
                          onChange={(e) => updateGradeInput(s.id, 'grade', e.target.value)}
                          placeholder="Nota"
                          className="border rounded px-2 py-1"
                        />
                        <select
                          value={gradeInputs[s.id]?.type || ''}
                          onChange={(e) => updateGradeInput(s.id, 'type', e.target.value)}
                          className="border rounded px-2 py-1"
                        >
                          <option value="">Tipo</option>
                          <option value="Examen">Examen</option>
                          <option value="Tarea">Tarea</option>
                          <option value="Proyecto">Proyecto</option>
                          <option value="Participación">Participación</option>
                          <option value="Otro">Otro</option>
                        </select>
                        <input
                          type="date"
                          value={gradeInputs[s.id]?.date || today}
                          onChange={(e) => updateGradeInput(s.id, 'date', e.target.value)}
                          className="border rounded px-2 py-1"
                        />
                        <input
                          type="text"
                          value={gradeInputs[s.id]?.obs || ''}
                          onChange={(e) => updateGradeInput(s.id, 'obs', e.target.value)}
                          placeholder="Observación (opcional)"
                          className="border rounded px-2 py-1 col-span-2 md:col-span-4"
                        />
                      </div>
                      <div className="mt-2">
                        <button onClick={() => submitGrade(s.id)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Guardar</button>
                      </div>
                    </div>
                    {/* Retroalimentación */}
                    <div className="bg-gray-50 rounded p-3">
                      <div className="text-sm font-semibold mb-2">💬 Retroalimentación</div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={feedbackInputs[s.id]?.text || ''}
                          onChange={(e) => updateFeedbackInput(s.id, e.target.value)}
                          placeholder="Escribe un mensaje..."
                          className="border rounded px-2 py-1 flex-1"
                        />
                        <button onClick={() => submitFeedback(s.id)} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Enviar</button>
                      </div>
                    </div>
                  </div>
                  {rowMsg[s.id]?.text && (
                    <div className={`mt-2 text-sm ${rowMsg[s.id].type === 'success' ? 'text-green-700' : 'text-red-700'}`}>{rowMsg[s.id].text}</div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
    </div>
  );
}
