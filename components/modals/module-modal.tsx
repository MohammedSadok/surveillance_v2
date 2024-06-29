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
import { createModule, updateModule } from "@/data/modules";
import { useModal } from "@/hooks/useModalStore";
import { moduleSchema } from "@/lib/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "../ui/input";

const ModuleModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const { module } = data;
  const { optionId } = useParams<{ optionId: string }>();
  const router = useRouter();

  const isModalOpen =
    isOpen && (type === "createModule" || type === "updateModule");

  const form = useForm({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      name: "",
      id: "",
    },
  });
  useEffect(() => {
    if (module) {
      form.setValue("id", module.id);
      form.setValue("name", module.name);
    }
  }, [module, form]);
  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof moduleSchema>) => {
    try {
      if (type === "createModule") await createModule(values, optionId);
      else if (type === "updateModule") await updateModule(values);

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
            Département
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="px-6 space-y-4">
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Id du module</FormLabel>
                    <Input
                      disabled={isLoading || type === "updateModule"}
                      placeholder="Entrez l'id du module"
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du module</FormLabel>
                    <Input
                      disabled={isLoading}
                      placeholder="Entrez le nom du module"
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
                ) : type === "createModule" ? (
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
export default ModuleModal;
