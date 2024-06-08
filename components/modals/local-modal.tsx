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
import { LocationSchema } from "@/lib/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Loader2 } from "lucide-react";

const LocalModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const { building } = data;
  const router = useRouter();
  const isModalOpen =
    isOpen && (type === "createBuilding" || type === "updateBuilding");

  const form = useForm<z.infer<typeof LocationSchema>>({
    resolver: zodResolver(LocationSchema),
  });

  useEffect(() => {
    if (building) {
      form.setValue("name", building.name);
      form.setValue("size", building.size);
      form.setValue("type", building.type);
    } else {
      form.reset();
    }
  }, [building, form]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof LocationSchema>) => {
    try {
      if (type === "createBuilding") await axios.post("/api/location", values);
      else await axios.patch(`/api/location/${building?.id}`, values);
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
            Local
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="px-6 space-y-4">
              <FormField
                defaultValue=""
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <Input
                      {...field}
                      disabled={isLoading}
                      placeholder="Entrez le nom du local"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="size"
                defaultValue={0}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taille</FormLabel>
                    <Input
                      disabled={isLoading}
                      placeholder="Entrez la taille"
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10) || 0)
                      }
                      value={field.value}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex  space-x-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="CLASSROOM" />
                          </FormControl>
                          <FormLabel className="font-normal">salle</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="AMPHITHEATER" />
                          </FormControl>
                          <FormLabel className="font-normal">amphi</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="px-6 py-4 bg-gray-100">
              <Button disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : type === "createBuilding" ? (
                  "Créer"
                ) : (
                  "Mettre à jour"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default LocalModal;
