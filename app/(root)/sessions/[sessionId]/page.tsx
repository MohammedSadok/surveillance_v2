// import { RecentExams } from "@/components/recent-exams";
import { Overview } from "@/components/overview";
import { RecentExams } from "@/components/recent-exams";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { getStatisticsOfLastSession } from "@/data/session";
import { BookCheck, Users } from "lucide-react";

const DashboardPage = async () => {
  const {
    lastFiveExams,
    examsPerDay,
    numberOfTeachers,
    numberOfDepartments,
    numberOfExams,
    totalMonitoring,
  } = await getStatisticsOfLastSession();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Sessions`} description="Gérer les sessions" />
      </div>
      <Separator className="my-4" />
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Exams</CardTitle>
              <BookCheck className="text-gray-600 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{numberOfExams}</div>
              <p className="text-xs text-muted-foreground">
                Nombre total d&apos;exams du dernier session
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enseignants</CardTitle>
              <Users className="text-gray-600 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{numberOfTeachers}</div>
              <p className="text-xs text-muted-foreground">
                Nombre total d&apos;enseignants dans la faculte
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Nombre total de départements
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{numberOfDepartments}</div>
              <p className="text-xs text-muted-foreground">
                +19% par rapport au mois dernier
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Surveillance actuelle
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(totalMonitoring / numberOfTeachers).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Moyenne de surveillance par enseignant dans la dernière session
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Aperçu</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <Overview data={examsPerDay} />
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Exams récentes</CardTitle>
              <CardDescription>Les cinq dernier exams</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentExams lastExams={lastFiveExams} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
