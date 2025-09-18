import { Outlet } from "react-router-dom";
import PublicNavbar from "../components/navbar/PublicNavbar";

export default function PublicLayout() {
  return (
    <div>
      <PublicNavbar />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
