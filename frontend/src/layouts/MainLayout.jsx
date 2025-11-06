import { Outlet } from "react-router-dom";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
