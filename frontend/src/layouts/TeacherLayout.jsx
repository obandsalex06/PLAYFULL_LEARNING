import { Outlet } from "react-router-dom";
import StudentNavbar from "../components/navbar/TeacherNavbar";

export default function TeacherLayout() {
  return (
    <div>
      <TeacherNavbar />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
