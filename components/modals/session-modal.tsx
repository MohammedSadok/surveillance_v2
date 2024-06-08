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
import { createSession } from "@/lib/query";
import { cn } from "@/lib/utils";
import { SessionSchema } from "@/lib/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { TimeInput } from "../TimeInput";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const SessionModal = () => {
  const { isOpen, onClose, type } = useModal();
  const router = useRouter();

  const isModalOpen = isOpen && type === "createSession";

  const form = useForm<z.infer<typeof SessionSchema>>({
    resolver: zodResolver(SessionSchema),
    defaultValues: {
      morningSession1: { start: "08:00", end: "10:00" },
      morningSession2: { start: "10:00", end: "12:00" },
      afternoonSession1: { start: "02:00", end: "04:00" },
      afternoonSession2: { start: "04:00", end: "06:00" },
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof SessionSchema>) => {
    const start = format(values.dateRange.from, "yyyy-MM-dd");
    const end = format(values.dateRange.to, "yyyy-MM-dd");
    const startDate = new Date(start);
    const endDate = new Date(end);
    const data = {
      startDate,
      endDate,
      type: values.type,
      morningSession1: values.morningSession1,
      morningSession2: values.morningSession2,
      afternoonSession1: values.afternoonSession1,
      afternoonSession2: values.afternoonSession2,
    };
    const result = await createSession(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="p-0 overflow-hidden text-black bg-white min-w-max">
        <DialogHeader className="px-6 pt-4">
          <DialogTitle className="text-2xl font-bold text-center">
            Ajouter Session
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 ">
            <div className="px-6 space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="className=text-xs font-bold text-zinc-500">
                      Session
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le type de session" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Normale d'hiver">
                          Normale d&apos;hiver
                        </SelectItem>
                        <SelectItem value="Normale de printemps">
                          Normale de printemps
                        </SelectItem>
                        <SelectItem value="Rattrapage d'hiver">
                          Rattrapage d&apos;hiver
                        </SelectItem>
                        <SelectItem value="Rattrapage de printemps">
                          Rattrapage de printemps
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex space-x-4">
                <FormField
                  control={form.control}
                  name="dateRange"
                  render={({ field }) => (
                    <FormItem className="flex flex-col w-full">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-ful pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value?.from ? (
                                field.value.to ? (
                                  <>
                                    {format(field.value.from, "LLL dd, y")} -{" "}
                                    {format(field.value.to, "LLL dd, y")}
                                  </>
                                ) : (
                                  format(field.value.from, "LLL dd, y")
                                )
                              ) : (
                                <span>Pick a date range</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            initialFocus
                            mode="range"
                            selected={field.value}
                            onSelect={field.onChange}
                            numberOfMonths={2}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-full mx-auto grid grid-cols-2 gap-x-14 gap-y-4">
                <div className="flex space-x-2">
                  <FormItem>
                    <TimeInput
                      control={form.control}
                      name="morningSession1.start"
                    />
                  </FormItem>
                  <FormItem>
                    <TimeInput
                      control={form.control}
                      name="morningSession1.end"
                    />
                  </FormItem>
                </div>
                <div className="flex space-x-2">
                  <FormItem>
                    <TimeInput
                      control={form.control}
                      name="morningSession2.start"
                    />
                  </FormItem>
                  <FormItem>
                    <TimeInput
                      control={form.control}
                      name="morningSession2.end"
                    />
                  </FormItem>
                </div>
                <div className="flex space-x-2">
                  <FormItem>
                    <TimeInput
                      control={form.control}
                      name="afternoonSession1.start"
                    />
                  </FormItem>
                  <FormItem>
                    <TimeInput
                      control={form.control}
                      name="afternoonSession1.end"
                    />
                  </FormItem>
                </div>
                <div className="flex space-x-2">
                  <FormItem>
                    <TimeInput
                      control={form.control}
                      name="afternoonSession2.start"
                    />
                  </FormItem>
                  <FormItem>
                    <TimeInput
                      control={form.control}
                      name="afternoonSession2.end"
                    />
                  </FormItem>
                </div>
              </div>
            </div>
            <DialogFooter className="px-6 py-4 bg-gray-100 w-full">
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

export default SessionModal;
