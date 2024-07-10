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
import {
  generateStudentsExamOptionSchedule,
  getModulesInOption,
  StudentWithExams,
} from "@/data/option";
import logo from "@/images/logo.png";
import { ModuleType, Option } from "@/lib/schema";
import { Check, ChevronsUpDown, FileDown } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, DayWithTimeSlots } from "@/lib/utils";

import { getDaysWithExamsForOption } from "@/data/session";
import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import PrintStudentSchedule from "./print/PrintStudentSchedule";
import ScheduleOption from "./ScheduleOption";
import { Loader } from "./ui/loader";

interface StudentOptionScheduleProps {
  options: Option[];
  sessionId: number;
}

const StudentOptionSchedule: React.FC<StudentOptionScheduleProps> = ({
  options,
  sessionId,
}) => {
  const [students, setStudents] = useState<StudentWithExams[]>([]);
  const [modules, setModules] = useState<ModuleType[]>([]);
  const [sessionDays, setSessionDays] = useState<DayWithTimeSlots[]>([]);
  const [selectedOption, setSelectedOption] = useState<Option>(options[0]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const modulesSchedule = await getDaysWithExamsForOption(
          sessionId,
          selectedOption.id
        );
        setSessionDays(modulesSchedule);
        const studentsExamsSchedule = await generateStudentsExamOptionSchedule(
          sessionId,
          selectedOption.id
        );
        const modules = await getModulesInOption(selectedOption.id);
        setStudents(studentsExamsSchedule);
        setModules(modules);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [sessionId, selectedOption]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  // Calculate the index of the first and last teacher to be displayed on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Slice the monitoring data to get only the teachers to be displayed on the current page
  const displayedStudents = students.slice(indexOfFirstItem, indexOfLastItem);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const componentRef = useRef<any>();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className=" justify-between"
            >
              {selectedOption
                ? options.find((option) => option.id === selectedOption.id)
                    ?.name
                : "Select Option..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className=" p-0">
            <Command>
              <CommandInput placeholder="Search Option..." />
              <CommandList>
                <CommandEmpty>No Options found.</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.id}
                      value={option.name}
                      onSelect={() => {
                        setSelectedOption(option);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedOption.id === option.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {option.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Button onClick={handlePrint} variant="ghost">
          <FileDown />
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Loader />
        </div>
      ) : (
        <Table className="border rounded-lg">
          <TableHeader>
            <TableRow key={10}>
              <TableCell className="border text-center text-xs p-1" rowSpan={2}>
                cne
              </TableCell>
              <TableCell className="border text-center text-xs p-1" rowSpan={2}>
                Nom et Prénom
              </TableCell>
            </TableRow>
            <TableRow key={11}>
              {modules.map((module) => (
                <TableCell
                  key={module.id}
                  className="border text-center text-xs p-1   w-[11%]"
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
      )}

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

      <div className="hidden">
        <div ref={componentRef}>
          <div className="flex justify-between items-center">
            <Image
              src={logo}
              alt={""}
              style={{
                objectFit: "contain",
              }}
              className="w-[200px]"
            />
            <p className="capitalize text-xl">{selectedOption.name}</p>
          </div>
          <ScheduleOption sessionDays={sessionDays} />
          <div className="pagebreak"></div>
          <div className="flex justify-between items-center">
            <Image
              src={logo}
              alt={""}
              style={{
                objectFit: "contain",
              }}
              className="w-[200px]"
            />
            <p className="capitalize text-xl">{selectedOption.name}</p>
          </div>
          <PrintStudentSchedule modules={modules} students={students} />
        </div>
      </div>
    </div>
  );
};

export default StudentOptionSchedule;
