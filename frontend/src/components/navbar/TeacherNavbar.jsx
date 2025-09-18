import { Link } from "react-router-dom";

export default function TeacherNavbar() {
  return (
    <nav className="bg-green-600 text-white p-4 flex justify-between">
      <h1 className="font-bold">Profesor</h1>
      <div className="flex gap-4">
        <Link to="/teacher/cerrar sesion">Cerrar sesion</Link>
        <Link to="/teacher/classes">Clases</Link>
        <Link to="/teacher/profile">Perfil</Link>
      </div>
    </nav>
  );
}
