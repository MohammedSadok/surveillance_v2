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

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createOption, getOptionsForExam, updateOption } from "@/data/option";
import { useModal } from "@/hooks/useModalStore";
import { Option } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { optionSchema } from "@/lib/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpDown, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "../ui/input";

const OptionModule = () => {
  const { isOpen, onClose, type, data } = useModal();
  const [options, setOptions] = useState<Option[]>([]);
  const { option } = data;
  const router = useRouter();

  const isModalOpen =
    isOpen && (type === "createOption" || type === "updateOption");

  const form = useForm({
    resolver: zodResolver(optionSchema),
    defaultValues: {
      id: "",
      name: "",
      childOf: "",
    },
  });
  useEffect(() => {
    if (option) {
      form.setValue("name", option.name);
      form.setValue("id", option.id);
      if (option.childOf) form.setValue("childOf", option.childOf);
    }
    const fetchOptions = async () => {
      const options = await getOptionsForExam();
      setOptions(options);
    };
    fetchOptions();
  }, [option, form]);
  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof optionSchema>) => {
    try {
      const newValues = {
        ...values,
        childOf: values.childOf ? values.childOf : null,
      };
      if (type === "createOption") await createOption(newValues);
      else if (type === "updateOption") await updateOption(newValues);
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
              <FormField
                control={form.control}
                name="childOf"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? options.find(
                                  (option) => option.id === field.value
                                )?.name
                              : "Select Option"}
                            <ArrowUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search teacher..." />
                          <CommandEmpty>No teacher found.</CommandEmpty>
                          <CommandList>
                            <CommandGroup>
                              <CommandItem
                                value={"null"} // Use teacher's last name for value
                                key={0}
                                onSelect={() => {
                                  form.setValue("childOf", "");
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    "" === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                Null
                              </CommandItem>
                              {options.map((option) => (
                                <CommandItem
                                  value={option.id} // Use teacher's last name for value
                                  key={option.id}
                                  onSelect={() => {
                                    form.setValue("childOf", option.id);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      option.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {option.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
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
