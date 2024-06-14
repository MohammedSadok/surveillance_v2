import { Sidebar } from "@/components/navigation/sidebar";

interface SessionPageProps {
  children: React.ReactNode;
  params: { sessionId: string };
}

export default function SessionPage({ children, params }: SessionPageProps) {
  const sessionId = parseInt(params.sessionId);

  return (
    <>
      <Sidebar sessionId={sessionId} />
      <div className="px-4 w-full">{children}</div>
    </>
  );
}
