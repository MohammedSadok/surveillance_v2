"use client";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DayWithTimeSlotsAndMonitoring,
  getDaysWithMonitoringDep,
} from "@/data/monitoring";
// Assurez-vous que le type est correct
import logo from "@/images/logo.png";
import { Department } from "@/lib/schema";
import { ArrowLeftCircle, ArrowRightCircle, FileDown } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import PrintTeacherMonitoring from "./print/PrintTeacherMonitoring";
import { Loader } from "./ui/loader";

interface TeacherMonitoringProps {
  departments: Department[];
  sessionId: number;
}

const TeacherMonitoring: React.FC<TeacherMonitoringProps> = ({
  departments,
  sessionId,
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState<number>(
    departments[0].id
  );
  const [sessionDays, setSessionDays] = useState<
    DayWithTimeSlotsAndMonitoring[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentRangeStart, setCurrentRangeStart] = useState(0);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 30;
  const daysPerRange = 3;
  const componentRef = useRef<any>();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await getDaysWithMonitoringDep(
        sessionId,
        selectedDepartment
      );
      setSessionDays(result);
      setLoading(false);
    };
    fetchData();
  }, [selectedDepartment, sessionId]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const currentRangeEnd = Math.min(
    currentRangeStart + daysPerRange,
    sessionDays.length
  );
  const displayedDays = sessionDays.slice(currentRangeStart, currentRangeEnd);

  const nextDays = () => {
    if (currentRangeEnd < sessionDays.length) {
      setCurrentRangeStart(currentRangeStart + daysPerRange);
      setCurrentPage(1);
    }
  };

  const previousDays = () => {
    if (currentRangeStart > 0) {
      setCurrentRangeStart(currentRangeStart - daysPerRange);
      setCurrentPage(1);
    }
  };

  const allTeachers = sessionDays.flatMap((day) =>
    day.timeSlots.flatMap((slot) => slot.monitoring)
  );

  const uniqueTeachers = Array.from(
    new Set(
      allTeachers.map(
        (teacher) => teacher.teacherFirstName + " " + teacher.teacherLastName
      )
    )
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const displayedTeachers = uniqueTeachers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col gap-3 mt-2">
      <div className="flex justify-between items-center">
        <Select onValueChange={(value) => setSelectedDepartment(Number(value))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sélectionnez le département" />
          </SelectTrigger>
          <SelectContent>
            {departments.length &&
              departments.map((item) => (
                <SelectItem value={item.id.toString()} key={item.id}>
                  {item.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
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
              <TableCell
                className="border text-center text-xs p-0.5 w-1/12"
                rowSpan={2}
              >
                Enseignants
              </TableCell>

              {displayedDays.map((day, index) => (
                <TableCell
                  key={day.date}
                  className="border text-center p-1 text-xs relative"
                  colSpan={day.timeSlots.length}
                >
                  {index === 0 && (
                    <Button
                      onClick={previousDays}
                      variant="ghost"
                      className="p-2 absolute left-0 top-1/2 transform -translate-y-1/2"
                    >
                      <ArrowLeftCircle className="w-5 h-5" />
                    </Button>
                  )}

                  {day.date}

                  {index === displayedDays.length - 1 && (
                    <Button
                      onClick={nextDays}
                      variant="ghost"
                      className="p-2 absolute right-0 top-1/2 transform -translate-y-1/2"
                    >
                      <ArrowRightCircle className="w-5 h-5" />
                    </Button>
                  )}
                </TableCell>
              ))}
            </TableRow>
            <TableRow key={11}>
              {displayedDays
                .flatMap((day) => day.timeSlots)
                .map((timeSlotItem) => (
                  <TableCell
                    key={timeSlotItem.id}
                    className="border text-center text-xs p-0"
                  >
                    {timeSlotItem.period}
                  </TableCell>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedTeachers.map((teacher, index) => (
              <TableRow key={index} className="py-4">
                <TableCell className="border text-center text-xs p-0.2">
                  {teacher}
                </TableCell>
                {displayedDays
                  .flatMap((day) => day.timeSlots)
                  .map((timeSlotItem) => {
                    const monitoringLine = allTeachers.find(
                      (monitoring) =>
                        monitoring.teacherFirstName +
                          " " +
                          monitoring.teacherLastName ===
                          teacher && monitoring.timeSlotId === timeSlotItem.id
                    );
                    return (
                      <TableCell
                        key={timeSlotItem.id}
                        className="border text-center text-xs p-0.2 w-8"
                      >
                        {monitoringLine ? (
                          <span>{monitoringLine.cause}</span>
                        ) : null}
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
            { length: Math.ceil(uniqueTeachers.length / itemsPerPage) },
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
                currentPage < Math.ceil(uniqueTeachers.length / itemsPerPage) &&
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
            <p className="capitalize text-xl">
              {"Département: " +
                departments.find((dep) => dep.id == selectedDepartment)?.name}
            </p>
          </div>

          <PrintTeacherMonitoring
            sessionDays={sessionDays}
            selectedDepartment={selectedDepartment}
          />
        </div>
      </div>
    </div>
  );
};

export default TeacherMonitoring;
