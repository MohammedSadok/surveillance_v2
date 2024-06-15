import StudentOptionSchedule from "@/components/StudentOptionSchedual";
import {
  generateStudentsExamOptionSchedule,
  getModulesInOption,
} from "@/data/option";

type SchedulePageProps = {
  params: { sessionId: string };
};

const SchedulePage = async ({ params }: SchedulePageProps) => {
  const studentsExamsSchedule = await generateStudentsExamOptionSchedule(
    parseInt(params.sessionId)
  );
  console.log(studentsExamsSchedule[0]);

  const modules = await getModulesInOption("SLCPA1");
  return (
    <div className="mt-2">
      <StudentOptionSchedule
        modules={modules}
        students={studentsExamsSchedule}
      />
    </div>
  );
};

export default SchedulePage;
