import { getModulesInOption } from "@/data/option";
import { ModulesClient } from "./components/Client";
interface OptionsPageProps {
  params: { sessionId: string; optionId: string };
}
const ModulesPage = async ({ params }: OptionsPageProps) => {
  const modules = await getModulesInOption(params.optionId);

  return (
    <div className="flex-1 space-y-4 ">
      <ModulesClient
        data={modules}
        sessionId={params.sessionId}
        optionId={params.optionId}
      />
    </div>
  );
};

export default ModulesPage;
