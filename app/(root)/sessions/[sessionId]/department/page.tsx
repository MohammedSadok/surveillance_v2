import { getDepartments } from "@/data/departement";
import { DepartmentClient } from "./components/Client";
interface OptionsPageProps {
  params: { sessionId: string };
}
const DepartmentPage = async ({ params }: OptionsPageProps) => {
  const departments = await getDepartments();
  return (
    <div className="flex-1 space-y-4 pt-2">
      <DepartmentClient data={departments} sessionId={params.sessionId} />
    </div>
  );
};

export default DepartmentPage;
