import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StudentWithExams } from "@/data/option";
import { ModuleType } from "@/lib/schema";

type PrintStudentScheduleProps = {
  students: StudentWithExams[];
  modules: ModuleType[];
};
const PrintStudentSchedule = ({
  modules,
  students,
}: PrintStudentScheduleProps) => {
  return (
    <Table className="border rounded-lg">
      <TableHeader>
        <TableRow key={10}>
          <TableCell className="border text-center text-xs p-1" rowSpan={2}>
            CNE
          </TableCell>
          <TableCell className="border text-center text-xs p-1" rowSpan={2}>
            Nom et Prénom
          </TableCell>
        </TableRow>
        <TableRow key={11}>
          {modules.map((module) => (
            <TableCell
              key={module.id}
              className="border text-center text-xs p-1   w-[10%]"
            >
              {module.name}
            </TableCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student, index) => (
          <TableRow key={index} className="py-4">
            <TableCell className="border text-center text-xs p-0.2">
              {student.cne}
            </TableCell>
            <TableCell className="border text-center text-xs p-0.2">
              {student.firstName + " " + student.lastName}
            </TableCell>
            {modules.map((module) => {
              const exam = student.exams.find(
                (exam) => exam.moduleId === module.id
              );
              return (
                <TableCell
                  key={module.id}
                  className="border text-center text-xs p-0.2"
                >
                  {exam
                    ? exam.locationName + " - N°" + exam.numberOfStudent
                    : null}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PrintStudentSchedule;
