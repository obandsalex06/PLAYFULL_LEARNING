import { Link } from "react-router-dom";

export default function PublicNavbar() {
  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-purple-700 font-bold"></h1>
      <div className="flex gap-4">
        <Link to="/home"></Link>
        <Link to="/login"></Link>
        <Link to="/register"></Link>
      </div>
    </nav>
  );
}
