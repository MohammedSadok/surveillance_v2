import TeacherMonitoring from "@/components/TeacherMonitoring";
import { getDepartments } from "@/data/departement";

interface MonitoringPageProps {
  params: { sessionId: string };
}

const MonitoringPage = async ({ params }: MonitoringPageProps) => {
  const departments = await getDepartments();
  return (
    <TeacherMonitoring
      departments={departments}
      sessionId={parseInt(params.sessionId)}
    />
  );
};

export default MonitoringPage;
