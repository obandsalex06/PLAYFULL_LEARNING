import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function StudentNavbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between">
      <h1 className="font-bold">Estudiante</h1>
      <div className="flex gap-4 items-center">
        <button
          className="bg-transparent text-white font-semibold hover:underline"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Cerrar sesión
        </button>
        <Link to="/student/courses">Cursos</Link>
        <Link to="/student/profile">Perfil</Link>
      </div>
    </nav>
  );
}
