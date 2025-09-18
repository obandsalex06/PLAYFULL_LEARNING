import { Outlet } from "react-router-dom";
import StudentNavbar from "../components/navbar/StudentNavbar";

export default function StudentLayout() {
  return (
    <div>
      <StudentNavbar />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
