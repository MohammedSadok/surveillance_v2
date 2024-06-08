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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useModal } from "@/hooks/useModalStore";
import { TeacherSchema } from "@/lib/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";

const TeacherModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const params = useParams<{ departmentId: string }>();
  const router = useRouter();
  const { teacher } = data;

  const isModalOpen =
    isOpen && (type === "createTeacher" || type === "updateTeacher");

  const form = useForm<z.infer<typeof TeacherSchema>>({
    resolver: zodResolver(TeacherSchema),
  });
  useEffect(() => {
    if (teacher) {
      form.setValue("firstName", teacher.firstName);
      form.setValue("lastName", teacher.lastName);
      form.setValue("departmentId", teacher.departmentId);
      form.setValue("email", teacher.email);
      form.setValue("phoneNumber", teacher.phoneNumber);
      form.setValue("isDispense", teacher.isDispense);
    } else {
      form.reset();
    }
    form.setValue("departmentId", parseInt(params.departmentId));
  }, [teacher, form, params.departmentId, isOpen]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof TeacherSchema>) => {
    try {
      if (type === "createTeacher") await axios.post("/api/teacher", values);
      else await axios.patch(`/api/teacher/${teacher?.id}`, values);
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
            Enseignant
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="px-6 space-y-4">
              <FormField
                defaultValue=""
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <Input
                      disabled={isLoading}
                      placeholder="Entrez le nom de l'enseignant"
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                defaultValue=""
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <Input
                      disabled={isLoading}
                      placeholder="Entrez le prénom de l'enseignant"
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                defaultValue=""
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <Input
                      type="email"
                      disabled={isLoading}
                      placeholder="Entrez le mail de l'enseignant"
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                defaultValue=""
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de téléphone</FormLabel>
                    <Input
                      disabled={isLoading}
                      placeholder="Entrez le numéro de l'enseignant"
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="isDispense"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Est Dispencer</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter className="px-6 py-4 bg-gray-100">
              <Button disabled={isLoading}>
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

export default TeacherModal;
