import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function TeacherNavbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <nav className="bg-green-600 text-white p-4 flex justify-between">
      <h1 className="font-bold">Profesor</h1>
      <div className="flex gap-4">
        <button
          className="bg-transparent text-white font-semibold hover:underline"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Cerrar sesión
        </button>
        <Link to="/teacher/classes">Clases</Link>
        <Link to="/teacher/profile">Perfil</Link>
      </div>
    </nav>
  );
}
