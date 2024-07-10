import MonitoringOut from "@/components/MonitoringOut";
import TeacherSchedule from "@/components/TeacherSchedule";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { getTeacherById, getTeacherCalendar } from "@/data/teacher";

type Props = {
  params: { teacherId: string; sessionId: string };
};

const page = async ({ params }: Props) => {
  const teacher = await getTeacherById(parseInt(params.teacherId));
  const occupationCalendar = await getTeacherCalendar(
    parseInt(params.sessionId),
    parseInt(params.teacherId)
  );
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Enseignant  ${teacher?.firstName} ${teacher?.lastName}`}
          description="Gérer les heurs d'occupation"
        />
        {teacher && <MonitoringOut teacherId={teacher.id} />}
      </div>
      <Separator />
      {teacher && (
        <TeacherSchedule
          sessionDays={occupationCalendar}
          teacherId={teacher.id}
        />
      )}
    </>
  );
};

export default page;
