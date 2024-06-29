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
import { createOption, updateOption } from "@/data/option";
import { useModal } from "@/hooks/useModalStore";
import { optionSchema } from "@/lib/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "../ui/input";

const OptionModule = () => {
  const { isOpen, onClose, type, data } = useModal();
  const { option } = data;
  const router = useRouter();

  const isModalOpen =
    isOpen && (type === "createOption" || type === "updateOption");

  const form = useForm({
    resolver: zodResolver(optionSchema),
    defaultValues: {
      id: "",
      name: "",
    },
  });
  useEffect(() => {
    if (option) {
      form.setValue("name", option.name);
      form.setValue("id", option.id);
    }
  }, [option, form]);
  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof optionSchema>) => {
    try {
      if (type === "createOption") await createOption(values);
      else if (type === "updateOption") await updateOption(values);
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
            Option
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
                    <FormLabel>ID de l&#39;option</FormLabel>
                    <Input
                      disabled={isLoading || type === "updateOption"}
                      placeholder="Entrez l'identifiant de l'option"
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
                    <FormLabel>Nom de l&#39;option</FormLabel>
                    <Input
                      disabled={isLoading}
                      placeholder="Entrez le nom de l'option"
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
                ) : type === "createOption" ? (
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
export default OptionModule;
