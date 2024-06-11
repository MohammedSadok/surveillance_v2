"use client";

import { AlertModal } from "@/components/modals/alert-modal";
// import PrintStudentPresent from "@/components/print/PrintStudentPresent";
// import PrintStudents from "@/components/print/PrintStudents";
import { Button } from "@/components/ui/button";
import { deleteExam, ExamWithDetails } from "@/data/exam";
// import { getStudentsForExam } from "@/data/exam";
// import { ExamType, PageTypeStudent } from "@/lib/types";

import { FileDown, Loader2, PenLine, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
interface CellActionProps {
  data: ExamWithDetails;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const componentRef = useRef<any>();
  const componentRefPresent = useRef<any>();
  // const [students, setStudents] = useState<PageTypeStudent>([]);
  const [printType, setPrintType] = useState<"Normal" | "Exam">("Normal");

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  const handlePrintPresent = useReactToPrint({
    content: () => componentRefPresent.current,
  });

  // useEffect(() => {
  //   if (students && students.length > 0) {
  //     if (printType == "Normal") handlePrint();
  //     else handlePrintPresent();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [students]);
  const onConfirm = async () => {
    try {
      setLoading(true);
      await deleteExam(data.examId);
      toast.success("Examen supprimé.");
      router.refresh();
    } catch (error) {
      toast.error("Error :" + error);
    } finally {
      setOpen(false);
      setLoading(false);
    }
  };
  // const loadStudents = async (triggerPrint: boolean) => {
  //   try {
  //     setLoading(true);
  //     const exam: ExamStudentType | null = await getStudentsForExam(data.id);
  //     if (exam) {
  //       let studentsNumber = exam.enrolledStudentsCount;
  //       let start = 0;
  //       const studentsPerLocation = exam?.Monitoring.map((item) => {
  //         if (item.location && item.location.size > 0) {
  //           const students =
  //             studentsNumber > item.location.size
  //               ? item.location.size
  //               : studentsNumber;
  //           studentsNumber -= students;
  //           const locationStudents = exam.students.slice(
  //             start,
  //             start + students
  //           );
  //           start += students;

  //           // Splitting locationStudents into arrays of maximum 30 lines each
  //           const dividedStudents = [];
  //           for (let i = 0; i < locationStudents.length; i += 40) {
  //             dividedStudents.push(locationStudents.slice(i, i + 40));
  //           }

  //           return {
  //             timeSlot: exam.TimeSlot,
  //             exam: exam,
  //             location: item.location,
  //             students: dividedStudents,
  //           };
  //         }
  //       }).filter(Boolean);
  //       setStudents(studentsPerLocation);
  //       setLoading(false);
  //       if (triggerPrint) setPrintType("Normal");
  //       else setPrintType("Exam");
  //     }
  //   } catch (error) {
  //     console.error("Error loading data:", error);
  //     setLoading(false);
  //   }
  // };
  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <div className="">
        <Button variant="ghost" onClick={() => setOpen(true)}>
          <Trash className="h-4 w-4 " color="#c1121f" />
        </Button>

        <Button
          // onClick={() => loadStudents(true)}
          variant="ghost"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4" />
          )}
        </Button>

        <Button
          // onClick={() => loadStudents(false)}
          variant="ghost"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <PenLine className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* <div className="hidden">
        <div ref={componentRef}>
          <PrintStudents students={students} />
        </div>
      </div>

      <div className="hidden">
        <div ref={componentRefPresent}>
          <PrintStudentPresent students={students} />
        </div>
      </div> */}
    </>
  );
};
