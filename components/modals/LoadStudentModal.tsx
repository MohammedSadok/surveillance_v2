"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { insertStudents } from "@/data/students";
import { useModal } from "@/hooks/useModalStore";
import { StudentType } from "@/lib/schema";
import { LoadStudentSchema } from "@/lib/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { read, utils } from "xlsx";
import * as z from "zod";
import { Input } from "../ui/input";

// Define the schema type
type LoadStudentSchemaType = z.infer<typeof LoadStudentSchema>;

const LoadStudentModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onClose, type, data } = useModal();
  const { moduleId, optionId, sessionId } = useParams<{
    sessionId: string;
    optionId: string;
    moduleId: string;
  }>();
  const router = useRouter();

  const isModalOpen = isOpen && type === "loadStudents";

  const form = useForm<LoadStudentSchemaType>({
    resolver: zodResolver(LoadStudentSchema),
  });

  const onSubmit = async (values: LoadStudentSchemaType) => {
    setIsLoading(true);

    try {
      const file = values.urlFile as File;
      const reader = new FileReader();
      reader.onload = async (event) => {
        const binaryString = event.target?.result as string;
        const workbook = read(binaryString, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data: any[] = utils.sheet_to_json(sheet, { header: 1 });
        const trimmedData = data.slice(34);
        const students: Omit<StudentType, "id">[] = trimmedData.map(
          (element: any) => {
            return {
              cne: element[0] as string,
              firstName: element[1] as string,
              lastName: element[2] as string,
              moduleId,
              optionId,
              sessionExamId: parseInt(sessionId),
            };
          }
        );
        await insertStudents(students);
        setIsLoading(false);
        form.reset();
        router.refresh();
        onClose();
      };

      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        toast.error("An error occurred while reading the file.");
        setIsLoading(false);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error processing the form:", error);
      toast.error("An error occurred while processing the form.");
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="p-0 overflow-hidden text-black bg-white">
        <DialogHeader className="px-6 pt-4">
          <DialogTitle className="text-2xl font-bold text-center">
            Charger des étudiants
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="px-6 space-y-4">
              <FormField
                control={form.control}
                name="urlFile"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start space-y-2 min-w-max">
                    <FormLabel>Uploader un ficher excel</FormLabel>
                    <Input
                      accept=".xlsx, .xls"
                      type="file"
                      disabled={isLoading}
                      placeholder="Entrez le nombre d'étudiants inscrits"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        form.setValue(
                          "urlFile",
                          e.target.files ? e.target.files[0] : null
                        );
                      }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="px-6 py-4 bg-gray-100">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Créer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default LoadStudentModal;
