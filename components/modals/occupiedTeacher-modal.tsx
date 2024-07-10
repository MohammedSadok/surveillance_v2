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
import {
  createOccupiedTeacher,
  deleteOccupiedTeacher,
  updateOccupiedTeacher,
} from "@/data/teacher";
import { useModal } from "@/hooks/useModalStore";
import { occupiedTeacherSchema } from "@/lib/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "../ui/input";

const OccupiedTeacherModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const { occupiedTeacher } = data;
  const router = useRouter();

  const isModalOpen =
    isOpen &&
    (type === "createOccupiedTeacher" || type === "updateOccupiedTeacher");

  const form = useForm({
    resolver: zodResolver(occupiedTeacherSchema),
    defaultValues: {
      cause: "",
    },
  });
  useEffect(() => {
    if (occupiedTeacher) {
      form.setValue("cause", occupiedTeacher.cause);
    }
  }, [occupiedTeacher, form]);
  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof occupiedTeacherSchema>) => {
    try {
      if (!occupiedTeacher) return;
      if (type === "createOccupiedTeacher")
        await createOccupiedTeacher({
          ...occupiedTeacher,
          cause: values.cause,
        });
      else
        await updateOccupiedTeacher({
          ...occupiedTeacher,
          cause: values.cause,
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
            Enseignant Occupé
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="px-6 space-y-4">
              <FormField
                control={form.control}
                name="cause"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>La cause de l&apos;occupation</FormLabel>

                    <Input
                      disabled={isLoading}
                      placeholder="Entrez la cause de l'occupation"
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="px-6 py-4 bg-gray-100">
              {type === "updateOccupiedTeacher" && (
                <Button
                  disabled={isLoading}
                  variant="destructive"
                  onClick={async (e: any) => {
                    e.preventDefault();
                    if (!occupiedTeacher) return;
                    await deleteOccupiedTeacher(occupiedTeacher);
                    router.refresh();
                    onClose();
                  }}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Supprimer"
                  )}
                </Button>
              )}
              <Button disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : type === "createOccupiedTeacher" ? (
                  "Creér"
                ) : (
                  "Modifier"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
export default OccupiedTeacherModal;
