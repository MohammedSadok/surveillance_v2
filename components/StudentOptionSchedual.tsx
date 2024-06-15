"use client";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StudentWithExams } from "@/data/option";
import { ModuleType } from "@/lib/schema";

import React, { useState } from "react";

interface StudentOptionScheduleProps {
  modules: ModuleType[];
  students: StudentWithExams[];
}

const StudentOptionSchedule: React.FC<StudentOptionScheduleProps> = ({
  modules,
  students,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 38;

  // Calculate the index of the first and last teacher to be displayed on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Slice the monitoring data to get only the teachers to be displayed on the current page
  const displayedStudents = students.slice(indexOfFirstItem, indexOfLastItem);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col gap-3">
      <Table className="border rounded-lg">
        <TableHeader>
          <TableRow key={10}>
            <TableCell className="border text-center text-xs p-0.5" rowSpan={2}>
              Étudiants
            </TableCell>
          </TableRow>
          <TableRow key={11}>
            {modules.map((module) => (
              <TableCell
                key={module.id}
                className="border text-center text-xs p-0"
              >
                {module.name}
              </TableCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedStudents.map((student, index) => (
            <TableRow key={index} className="py-4">
              <TableCell className="border text-center text-xs p-0.2">
                {student.cne}
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
                      ? exam.locationName + " N : " + exam.numberOfStudent
                      : null}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination className="flex flex-col">
        <PaginationContent className="self-end">
          <PaginationItem className="hover:cursor-pointer">
            <PaginationPrevious
              onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            />
          </PaginationItem>
          {Array.from(
            { length: Math.ceil(students.length / itemsPerPage) },
            (_, index) => (
              <PaginationItem key={index + 1} className="hover:cursor-pointer">
                <PaginationLink
                  onClick={() => handlePageChange(index + 1)}
                  isActive={index + 1 === currentPage}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem className="hover:cursor-pointer">
            <PaginationNext
              onClick={() =>
                currentPage < Math.ceil(students.length / itemsPerPage) &&
                setCurrentPage(currentPage + 1)
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default StudentOptionSchedule;
