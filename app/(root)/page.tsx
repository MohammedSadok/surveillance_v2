import { UserNav } from "@/components/navigation/user-nav";
import { gestSessions } from "@/data/session";
import logo from "@/images/logo.png";
import Image from "next/image";
import { SessionClient } from "./components/Client";

const SessionsPage = async () => {
  const sessions = await gestSessions();

  return (
    <div className="flex flex-col space-y-2">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <Image
            src={logo}
            alt={""}
            style={{
              objectFit: "contain",
            }}
            className="w-[120px]"
          />
          <div className="flex justify-center items-center space-x-2">
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex w-full flex-1 flex-col overflow-hidden container">
        <div className="flex-1 space-y-4 ">
          <SessionClient data={sessions} />
        </div>
      </main>
    </div>
  );
};

export default SessionsPage;
