import { getExamsWithDetailsAndCounts } from "@/data/exam";
import { gestSessionById } from "@/data/session";
import { getTimeSlotById } from "@/data/timeSlot";
import { ExamClient } from "./components/Client";

type Props = {
  params: { sessionId: string; timeSlotId: string };
};

const ExamsPage = async ({ params }: Props) => {
  const session = await gestSessionById(parseInt(params.sessionId));
  const exams = await getExamsWithDetailsAndCounts(parseInt(params.timeSlotId));
  const timeSlot = await getTimeSlotById(parseInt(params.timeSlotId));
  return (
    <div className="flex-1 space-y-4 pt-2">
      {session && timeSlot && (
        <ExamClient data={exams} timeSlot={timeSlot} session={session} />
      )}
    </div>
  );
};

export default ExamsPage;
