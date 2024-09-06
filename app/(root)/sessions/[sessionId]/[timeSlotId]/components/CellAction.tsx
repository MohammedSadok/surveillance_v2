"use client";

import { AlertModal } from "@/components/modals/alert-modal";
import PrintStudents from "@/components/print/PrintStudents";
import PrintStudentsPresent from "@/components/print/PrintStudentsPresent";
// import PrintStudentPresent from "@/components/print/PrintStudentPresent";
// import PrintStudents from "@/components/print/PrintStudents";
import { Button } from "@/components/ui/button";
import { deleteExam, ExamWithDetails } from "@/data/exam";
import { getStudentsPassExam, PageStudent } from "@/data/students";
// import { ExamType, PageTypeStudent } from "@/lib/types";

import { FileDown, Loader2, PenLine, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  const [students, setStudents] = useState<PageStudent[]>([]);
  const [printType, setPrintType] = useState<"Normal" | "Exam">("Normal");

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  const handlePrintPresent = useReactToPrint({
    content: () => componentRefPresent.current,
  });

  useEffect(() => {
    if (students && students.length > 0) {
      if (printType == "Normal") handlePrint();
      else handlePrintPresent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students]);

  const loadStudents = async (present: boolean) => {
    try {
      setLoading(true);
      const result = await getStudentsPassExam(data);
      setPrintType(present ? "Normal" : "Exam");
      setStudents(result);
    } catch (error) {
      toast.error("Error :" + error);
    } finally {
      setLoading(false);
    }
  };
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
          onClick={() => loadStudents(true)}
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
          onClick={() => loadStudents(false)}
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

      <div className="hidden">
        <div ref={componentRef}>
          <PrintStudents
            option={data.optionName}
            pageStudents={students}
            moduleName={data.moduleName}
            responsibleName={data.responsibleName}
          />
        </div>
      </div>

      <div className="hidden">
        <div ref={componentRefPresent}>
          <PrintStudentsPresent
            option={data.optionName}
            pageStudents={students}
            moduleName={data.moduleName}
            responsibleName={data.responsibleName}
            isPresent
          />
        </div>
      </div>
    </>
  );
};
