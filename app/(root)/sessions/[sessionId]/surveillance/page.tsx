import TeacherMonitoring from "@/components/TeacherMonitoring";
import { getDepartments } from "@/data/departement";
import { getDaysWithMonitoring } from "@/data/monitoring";

interface MonitoringPageProps {
  params: { sessionId: string };
}

const MonitoringPage = async ({ params }: MonitoringPageProps) => {
  const monitoring = await getDaysWithMonitoring(parseInt(params.sessionId));
  const departments = await getDepartments();
  return (
    <TeacherMonitoring sessionDays={monitoring} departments={departments} />
  );
};

export default MonitoringPage;
