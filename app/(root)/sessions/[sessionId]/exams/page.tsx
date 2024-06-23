import Schedule from "@/components/Schedule";
import { getDaysWithExams } from "@/data/session";

interface ExamsPageProps {
  params: { sessionId: string };
}
const ExamsPage = async ({ params }: ExamsPageProps) => {
  const days = await getDaysWithExams(parseInt(params.sessionId));
  return <Schedule sessionDays={days} sessionId={params.sessionId} />;
};

export default ExamsPage;
