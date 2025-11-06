import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-5xl font-extrabold text-blue-700">404</h1>
      <p className="mt-3 text-gray-600">La página que buscas no existe.</p>
      <Link to="/home" className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
        Volver al inicio
      </Link>
    </div>
  );
}
