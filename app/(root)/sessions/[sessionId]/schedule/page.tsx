import StudentOptionSchedule from "@/components/StudentOptionSchedual";
import { getOptions } from "@/data/option";

type SchedulePageProps = {
  params: { sessionId: string };
};

const SchedulePage = async ({ params }: SchedulePageProps) => {
  const options = await getOptions();
  return (
    <div className="mt-2">
      <StudentOptionSchedule
        options={options}
        sessionId={parseInt(params.sessionId)}
      />
    </div>
  );
};

export default SchedulePage;
