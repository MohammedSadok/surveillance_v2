import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type ResentExamsProps = {
  lastExams: {
    id: number;
    module: string;
    firstName: string | null;
    lastName: string | null;
  }[];
};
export const RecentExams = ({ lastExams }: ResentExamsProps) => {
  return (
    <div className="space-y-8">
      {lastExams.map((exam) => (
        <div className="flex items-center" key={exam.id}>
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {exam.firstName ? exam.firstName.slice(0, 2).toUpperCase() : "NA"}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {exam.firstName || exam.lastName
                ? exam.firstName + " " + exam.lastName
                : "non spécifié"}
            </p>
          </div>
          <div className="ml-auto font-medium flex flex-col">
            <p className="ml-auto">
              {exam.module.slice(0, 35).toLocaleLowerCase()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
