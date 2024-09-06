import { PageStudent } from "@/data/students";
import logo from "@/images/logo.png";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"; // Assurez-vous d'ajuster le chemin selon votre structure réelle de composants UI
interface PrintStudentsProps {
  pageStudents: PageStudent[];
  moduleName: string;
  responsibleName: string | null;
  isPresent?: boolean;
  option: string;
}

const PrintStudents = ({
  pageStudents,
  moduleName,
  responsibleName,
  option,
}: PrintStudentsProps) => {
  return (
    <div className="teacher-monitoring">
      {pageStudents.map((pageStudent, index) => (
        <div key={index} className="page-student">
          <Table className="my-2 w-full">
            <TableBody>
              <TableRow>
                <TableCell className="border p-1">
                  <span className="font-bold">Local : </span>
                  {pageStudent.location.name}
                </TableCell>
                <TableCell className="border p-1">
                  <span className="font-bold">Filière : </span> {option}
                </TableCell>
                <TableCell rowSpan={2} className="border">
                  <Image
                    src={logo}
                    alt={""}
                    style={{
                      objectFit: "contain",
                    }}
                    className="w-[160px] m-auto"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="border p-1">
                  <span className="font-bold">Module : </span>
                  {moduleName}
                </TableCell>
                <TableCell className="border p-1">
                  <span className="font-bold">Responsable : </span>
                  {responsibleName ?? "Non spécifié"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          {pageStudent.studentGroups.map((studentGroup, groupIndex) => (
            <div key={groupIndex} className="student-group">
              <Table className="student-table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="border text-center p-0 w-5">
                      {"N° examen"}
                    </TableHead>
                    <TableHead className="border text-center p-0  w-24">
                      {"Numéro d'étudiant"}
                    </TableHead>
                    <TableHead className="border text-center p-0 w-44">
                      {"Nom et prénom"}
                    </TableHead>
                    <TableHead className="border text-center p-0">
                      {"Signature"}
                    </TableHead>
                    <TableHead className="border text-center p-0">
                      {"Observation"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentGroup.map((student, studentIndex) => (
                    <TableRow key={studentIndex}>
                      <TableCell className="border text-center text-xs p-0.5">
                        {student.numberOfStudent}
                      </TableCell>
                      <TableCell className="border text-center text-xs p-0.5">
                        {student.cne}
                      </TableCell>
                      <TableCell className="border text-center text-xs p-0.5">
                        {student.lastName} {student.firstName}
                      </TableCell>
                      <TableCell className="border text-center text-xs p-0.5"></TableCell>
                      <TableCell className="border text-center text-xs p-0.5"></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* Ajouter une rupture de page après chaque groupe sauf le dernier */}
              {groupIndex !== pageStudent.studentGroups.length - 1 ||
              index !== pageStudents.length - 1 ? (
                <div className="pagebreak"></div>
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default PrintStudents;
