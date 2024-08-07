import { PageStudent } from "@/data/students";
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
}

const PrintStudents = ({
  pageStudents,
  moduleName,
  responsibleName,
}: PrintStudentsProps) => {
  return (
    <div className="teacher-monitoring">
      {pageStudents.map((pageStudent, index) => (
        <div key={index} className="page-student">
          <h2>Local : {pageStudent.location.name}</h2>
          <p>Module : {moduleName}</p>
          <p>Résponsable : {responsibleName ?? "Non spécifié"}</p>

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
                        {student.firstName} {student.lastName}
                      </TableCell>
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
