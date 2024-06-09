import { SessionClient } from "./components/Client";

import { gestSessions } from "@/data/session";

const SessionsPage = async () => {
  const sessions = await gestSessions();

  return (
    <div className="flex-1 space-y-4 ">
      <SessionClient data={sessions} />
    </div>
  );
};

export default SessionsPage;
