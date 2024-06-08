import Schedule from "@/components/Schedule";
import { Heading } from "@/components/ui/heading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDays } from "@/lib/query";

interface ExamsPageProps {
  params: { sessionId: string };
}
const ExamsPage = async ({ params }: ExamsPageProps) => {
  const id = parseInt(params.sessionId);
  const days = await getDays(id);

  // const formattedDays: sessionDays[] = days.map((item) => ({
  //   ...item,
  //   date: format(item.date, "dd/MM/yyyy"),
  // }));

  return (
    <div className="flex-1 space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <Heading
          title={`Journées (${days.length})`}
          description="Gérer les journées"
        />
      </div>
      <Tabs
        // defaultValue={!session?.isValidated ? "exam" : "surveillance"}
        className="space-y-4"
      >
        <div>
          <TabsList>
            <TabsTrigger value="exam">Exam</TabsTrigger>
            <TabsTrigger value="surveillance">Surveillance</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="exam">
          <Schedule sessionDays={days} sessionId={params.sessionId} />
        </TabsContent>
        <TabsContent value="surveillance">
          {/* <TeacherMonitoring sessionDays={days} sessionId={params.sessionId} /> */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExamsPage;
