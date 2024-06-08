import db from "@/lib/db";
import { ExamClient } from "./components/Client";

type Props = {
  params: { sessionId: string; timeSlotId: string };
};

const ExamsPage = async ({ params }: Props) => {
  const session = await db.sessionExam.findUnique({
    where: { id: parseInt(params.sessionId) },
  });
  const timeSlot = await db.timeSlot.findFirst({
    where: { id: parseInt(params.timeSlotId) },
    include: { day: true },
  });

  const exams = await db.exam.findMany({
    where: {
      moduleName: { not: "Rs" },
      AND: [
        { moduleName: { not: "Rs" } },
        { enrolledStudentsCount: { gt: 0 } },
        { timeSlotId: parseInt(params.timeSlotId) },
      ],
    },
    include: {
      moduleResponsible: true,
    },
  });

  return (
    <div className="flex-1 space-y-4 pt-2">
      <ExamClient data={exams} timeSlot={timeSlot} session={session} />
    </div>
  );
};

export default ExamsPage;
