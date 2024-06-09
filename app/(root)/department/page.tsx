import { getDepartments } from "@/data/departement";
import { DepartmentClient } from "./components/Client";

const DepartmentPage = async () => {
  const departments = await getDepartments();
  return (
    <div className="flex-1 space-y-4 pt-2">
      <DepartmentClient data={departments} />
    </div>
  );
};

export default DepartmentPage;
