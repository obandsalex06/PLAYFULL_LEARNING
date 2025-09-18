import { Link } from "react-router-dom";

export default function StudentNavbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between">
      <h1 className="font-bold">Estudiante</h1>
      <div className="flex gap-4">
        <Link to="/student/courses">Cursos</Link>
        <Link to="/student/profile">Perfil</Link>
      </div>
    </nav>
  );
}
