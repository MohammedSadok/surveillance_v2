import {
  getModuleById,
  getOptionById,
  getStudentsInOptionAndModule,
} from "@/data/students";
import { StudentClient } from "./components/Client";
interface OptionsPageProps {
  params: { sessionId: string; optionId: string; moduleId: string };
}
const StudentsPage = async ({ params }: OptionsPageProps) => {
  const students = await getStudentsInOptionAndModule(
    params.optionId,
    params.moduleId,
    parseInt(params.sessionId)
  );
  const selectedModule = await getModuleById(params.moduleId);
  const option = await getOptionById(params.optionId);

  return (
    <div className="flex-1 space-y-4 ">
      {selectedModule && option && (
        <StudentClient
          data={students}
          option={option}
          module={selectedModule}
          sessionId={params.sessionId}
        />
      )}
    </div>
  );
};

export default StudentsPage;
