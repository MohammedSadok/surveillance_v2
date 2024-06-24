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
  createOccupiedLocation,
  deleteOccupiedLocation,
  updateOccupiedLocation,
} from "@/data/location";
import { useModal } from "@/hooks/useModalStore";
import { occupiedLocationSchema } from "@/lib/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "../ui/input";

const OccupiedLocationModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const { occupiedLocation } = data;
  const router = useRouter();

  const isModalOpen =
    isOpen &&
    (type === "createOccupiedLocation" || type === "updateOccupiedLocation");

  const form = useForm({
    resolver: zodResolver(occupiedLocationSchema),
    defaultValues: {
      cause: "",
    },
  });
  useEffect(() => {
    if (occupiedLocation) {
      form.setValue("cause", occupiedLocation.cause);
    }
  }, [occupiedLocation, form]);
  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof occupiedLocationSchema>) => {
    try {
      if (!occupiedLocation) return;
      if (type === "createOccupiedLocation")
        await createOccupiedLocation({
          ...occupiedLocation,
          cause: values.cause,
        });
      else
        await updateOccupiedLocation({
          ...occupiedLocation,
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
            Local Occupé
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
                    <FormLabel>La cause de l`&apos;`occupation</FormLabel>

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
              {type === "updateOccupiedLocation" && (
                <Button
                  disabled={isLoading}
                  variant="destructive"
                  onClick={async (e: any) => {
                    e.preventDefault();
                    if (!occupiedLocation) return;
                    await deleteOccupiedLocation(occupiedLocation);
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
                ) : type === "createOccupiedLocation" ? (
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
export default OccupiedLocationModal;
