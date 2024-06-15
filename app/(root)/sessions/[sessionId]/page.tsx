import Schedule from "@/components/Schedule";
import { getDaysWithExams } from "@/data/session";

interface ExamsPageProps {
  params: { sessionId: string };
}
const ExamsPage = async ({ params }: ExamsPageProps) => {
  const days = await getDaysWithExams(parseInt(params.sessionId));
  // const session = await gestSessionById(id);
  //

  return (
    <Schedule sessionDays={days} sessionId={params.sessionId} />
    // <Tabs
    //   defaultValue={!session?.isValidated ? "exam" : "surveillance"}
    //   className="space-y-4"
    // >
    //   <div>
    //     <TabsList>
    //       <TabsTrigger value="exam">Exam</TabsTrigger>
    //       <TabsTrigger value="surveillance">Surveillance</TabsTrigger>
    //       <TabsTrigger value="students">Étudiants</TabsTrigger>
    //     </TabsList>
    //   </div>
    //   <TabsContent value="exam">

    //   </TabsContent>
    //   <TabsContent value="surveillance">
    //     {/* <TeacherMonitoring sessionDays={days} sessionId={params.sessionId} /> */}
    //   </TabsContent>
    //   <TabsContent value="students">
    //     <StudentOptionSchedule
    //       modules={modules}
    //       students={studentsExamsSchedule}
    //     />
    //   </TabsContent>
    // </Tabs>
  );
};

export default ExamsPage;
