import { getOptions } from "@/data/option";
import { OptionsClient } from "./components/Client";
interface OptionsPageProps {
  params: { sessionId: string };
}
const OptionsPage = async ({ params }: OptionsPageProps) => {
  const options = await getOptions();

  return (
    <div className="flex-1 space-y-4 ">
      <OptionsClient data={options} sessionId={params.sessionId} />
    </div>
  );
};

export default OptionsPage;
