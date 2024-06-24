import { getDepartmentById } from "@/data/departement";
import { getTeachersInDepartment } from "@/data/teacher";
import { TeacherClient } from "./components/Client";
interface TeacherPageProps {
  params: { departmentId: string; sessionId: string };
}
const TeacherPage = async ({ params }: TeacherPageProps) => {
  const id = parseInt(params.departmentId);
  const teachers = await getTeachersInDepartment(id);
  const department = await getDepartmentById(id);

  return (
    <div className="flex-1 space-y-4 pt-2">
      {department && (
        <TeacherClient
          data={teachers}
          department={department}
          sessionId={parseInt(params.sessionId)}
        />
      )}
    </div>
  );
};

export default TeacherPage;
