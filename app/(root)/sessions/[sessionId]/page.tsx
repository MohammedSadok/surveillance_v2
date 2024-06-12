import Schedule from "@/components/Schedule";
import StudentOptionSchedule from "@/components/StudentOptionSchedual";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  generateStudentsExamOptionSchedule,
  getModulesInOption,
} from "@/data/option";
import { gestSessionById, getDays } from "@/data/session";

interface ExamsPageProps {
  params: { sessionId: string };
}
const ExamsPage = async ({ params }: ExamsPageProps) => {
  const id = parseInt(params.sessionId);
  const days = await getDays(id);
  const session = await gestSessionById(id);
  const modules = await getModulesInOption("SMS2I1");
  const studentsExamsSchedule = await generateStudentsExamOptionSchedule(
    id,
    "SMS2I1"
  );

  return (
    <div className="flex-1 space-y-4 pt-2">
      <Tabs
        defaultValue={!session?.isValidated ? "exam" : "surveillance"}
        className="space-y-4"
      >
        <div>
          <TabsList>
            <TabsTrigger value="exam">Exam</TabsTrigger>
            <TabsTrigger value="surveillance">Surveillance</TabsTrigger>
            <TabsTrigger value="students">Étudiants</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="exam">
          <Schedule sessionDays={days} sessionId={params.sessionId} />
        </TabsContent>
        <TabsContent value="surveillance">
          {/* <TeacherMonitoring sessionDays={days} sessionId={params.sessionId} /> */}
        </TabsContent>
        <TabsContent value="students">
          <StudentOptionSchedule
            modules={modules}
            students={studentsExamsSchedule}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExamsPage;
