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
import { insertStudent, updateStudent } from "@/data/students";
import { useModal } from "@/hooks/useModalStore";
import { NewStudentSchema } from "@/lib/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "../ui/input";

const StudentModal = () => {
  const { moduleId, optionId, sessionId } = useParams<{
    sessionId: string;
    optionId: string;
    moduleId: string;
  }>();
  const { isOpen, onClose, type, data } = useModal();
  const { student } = data;
  const router = useRouter();

  const isModalOpen =
    isOpen && (type === "createStudent" || type === "updateStudent");

  const form = useForm({
    resolver: zodResolver(NewStudentSchema),
    defaultValues: {
      cne: "",
      lastName: "",
      firstName: "",
    },
  });

  useEffect(() => {
    if (student) {
      form.setValue("cne", student.cne);
      form.setValue("lastName", student.lastName);
      form.setValue("firstName", student.firstName);
    }
  }, [student, form]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof NewStudentSchema>) => {
    try {
      if (type === "createStudent")
        await insertStudent({
          ...values,
          moduleId,
          optionId,
          sessionExamId: parseInt(sessionId),
        });
      else if (student)
        await updateStudent({
          ...values,
          id: student.id,
          moduleId: student.moduleId,
          optionId: student.optionId,
          sessionExamId: student.sessionExamId,
        });
      form.reset();
      router.refresh();
      onClose();
    } catch (error) {
      console.log(error);
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
            Étudiant
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="px-6 space-y-4">
              <FormField
                control={form.control}
                name="cne"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNE</FormLabel>
                    <Input
                      disabled={isLoading}
                      placeholder="Entrez le CNE"
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de famille</FormLabel>
                    <Input
                      disabled={isLoading}
                      placeholder="Entrez le nom de famille"
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <Input
                      disabled={isLoading}
                      placeholder="Entrez le prénom"
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="px-6 py-4 bg-gray-100">
              <Button disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentModal;
