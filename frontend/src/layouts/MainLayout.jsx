import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar";

export default function MainLayout() {
  return (
    <div>

      <main className="p-6">
        <Outlet /> {/* Aquí se renderizan las páginas hijas */}
      </main>
    </div>
  );
}