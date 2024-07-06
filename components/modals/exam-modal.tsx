"use client";

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
import { getDepartments } from "@/data/departement";
import { createExam } from "@/data/exam";
import { getFreeLocations } from "@/data/location";
import { getModulesForExam, getNumberOfStudentsInModule } from "@/data/modules";
import { getOptionsForExam } from "@/data/option";
import { getFreeTeachersByDepartment } from "@/data/teacher";
import { useModal } from "@/hooks/useModalStore";
import {
  Department,
  LocationType,
  ModuleType,
  Option,
  Teacher,
} from "@/lib/schema";
import { cn } from "@/lib/utils";
import { ExamSchema } from "@/lib/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpDown, Check, Loader2, Minus, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";
import { FormError } from "../auth/form-error";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const ExamModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const { exam } = data;
  const [departments, setDepartments] = useState<Department[]>([]);
  const [modules, setModules] = useState<ModuleType[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [department, setDepartment] = useState<number | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [error, setError] = useState<string | undefined>("");
  const [studentNumber, setStudentNumber] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const params = useParams<{ timeSlotId: string; sessionId: string }>();
  const router = useRouter();
  const isModalOpen = isOpen && type === "createExam";

  const form = useForm<z.infer<typeof ExamSchema>>({
    resolver: zodResolver(ExamSchema),
    defaultValues: {
      locations: [],
    },
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getDepartments();
        if (params.timeSlotId) {
          const locations = await getFreeLocations(parseInt(params.timeSlotId));
          setLocations(locations);
        }
        setDepartments(response);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des départements :",
          error
        );
      }
    };
    fetchData();
  }, [params.timeSlotId]);

  const handleCheckboxChange = (checked: boolean, locationId: number) => {
    const location = locations.find((loc) => loc.id === locationId);
    if (location) {
      setStudentNumber((prevStudentNumber) =>
        checked
          ? prevStudentNumber - location.size
          : prevStudentNumber + location.size
      );
    }
  };

  const handleLocationChange = (locationId: number, increment: boolean) => {
    const currentLocations = form.getValues("locations");
    let sizeChange = 0;
    const updatedLocations = currentLocations.map((location) => {
      if (location.id === locationId) {
        sizeChange = increment ? 1 : -1;
        return {
          ...location,
          size: location.size + sizeChange,
        };
      }
      return location;
    });

    form.setValue("locations", updatedLocations);
    setStudentNumber((prevStudentNumber) => prevStudentNumber - sizeChange);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (department !== null) {
          const freeTeachers = await getFreeTeachersByDepartment(
            parseInt(params.timeSlotId),
            department
          );
          setTeachers(freeTeachers);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des enseignants :",
          error
        );
      }
    };
    if (department !== null && params.timeSlotId) {
      fetchData();
    }
  }, [department, isOpen, params.timeSlotId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (params.timeSlotId) {
          const options = await getOptionsForExam(parseInt(params.timeSlotId));
          setOptions(options);
        }
      } catch (error) {
        console.error("Erreur lors de la sélection des modules :", error);
      }
    };
    form.setValue("timeSlotId", parseInt(params.timeSlotId));
    fetchData();
  }, [exam, form, params.timeSlotId, isOpen]);
  const moduleId = form.watch("moduleId");
  const optionId = form.watch("optionId");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const number = await getNumberOfStudentsInModule(
          moduleId,
          optionId,
          parseInt(params.sessionId)
        );
        setStudentNumber(number);
        form.setValue("locations", []);
      } catch (error) {
        console.error("Erreur lors de la sélection des étudiants :", error);
      }
    };
    if ((params.sessionId, moduleId)) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId, params.sessionId]);
  useEffect(() => {
    console.log("fetch modules");
    const fetchData = async () => {
      try {
        const modules = await getModulesForExam(
          parseInt(params.timeSlotId),
          form.getValues("optionId")
        );
        setModules(modules);
        setStudentNumber(0);
      } catch (error) {
        console.error("Erreur lors de la récupération des modules :", error);
      }
    };
    if (optionId) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionId]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof ExamSchema>) => {
    try {
      if (values.manual && studentNumber > 0) {
        toast.error(
          `Il n'y a pas assez de places pour ce module. Il y en a ${studentNumber}.`
        );
        return;
      }
      if (type === "createExam") await createExam(values);
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
      <DialogContent className="p-0 overflow-hidden text-black bg-white h-auto">
        <DialogHeader className="px-6 pt-4">
          <DialogTitle className="text-2xl font-bold text-center">
            Exam
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="px-6 space-y-4">
              <div className="space-y-2">
                <FormLabel
                  className={cn(
                    form.formState.errors.responsibleId ? "text-red-500" : ""
                  )}
                >
                  Résponsable du module
                </FormLabel>
                <div className="flex justify-center items-center space-x-2">
                  <Select
                    onValueChange={(value) => setDepartment(Number(value))}
                  >
                    <FormControl>
                      <SelectTrigger className="w-1/3">
                        <SelectValue placeholder="Sélectionnez le département" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((item, index) => (
                        <SelectItem value={item.id + ""} key={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormField
                    control={form.control}
                    name="responsibleId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col w-2/3">
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
                                  ? teachers.find(
                                      (teacher) => teacher.id === field.value
                                    )?.lastName
                                  : "Select enseignant"}
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
                                  {teachers.map((teacher) => (
                                    <CommandItem
                                      value={teacher.lastName} // Use teacher's last name for value
                                      key={teacher.id}
                                      onSelect={() => {
                                        form.setValue(
                                          "responsibleId",
                                          teacher.id
                                        );
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          teacher.id === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {teacher.firstName +
                                        " " +
                                        teacher.lastName}
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
              </div>

              <FormField
                control={form.control}
                name="optionId"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full">
                    <FormLabel>Option</FormLabel>
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
                              : "Select option"}
                            <ArrowUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Chércher l'option..." />
                          <CommandEmpty>No option found.</CommandEmpty>
                          <CommandList>
                            <CommandGroup>
                              {options.map((option) => (
                                <CommandItem
                                  value={option.name}
                                  key={option.id}
                                  onSelect={() => {
                                    form.setValue("optionId", option.id);
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
              <FormField
                control={form.control}
                name="moduleId"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full">
                    <FormLabel>Module</FormLabel>
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
                              ? modules.find(
                                  (module) => module.id === field.value
                                )?.name
                              : "Select module"}
                            <ArrowUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Chércher le module..." />
                          <CommandEmpty>No module found.</CommandEmpty>
                          <CommandList>
                            <CommandGroup>
                              {modules.map((module) => (
                                <CommandItem
                                  value={module.name}
                                  key={module.id}
                                  onSelect={() => {
                                    form.setValue("moduleId", module.id);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      module.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {module.name}
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

              {form.watch("moduleId") && (
                <FormField
                  control={form.control}
                  name="manual"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="flex justify-between w-full">
                        <FormLabel>Manuelle</FormLabel>
                        <FormLabel>{studentNumber}</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              )}
              {form.watch("manual") && (
                <ScrollArea className="rounded-md border p-2 h-48">
                  <FormField
                    control={form.control}
                    name="locations"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Locaux</FormLabel>
                        </div>
                        {locations?.length &&
                          locations.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="locations"
                              render={({ field }) => (
                                <FormItem className="flex flex-row space-x-3 space-y-0 rounded-md border items-center p-2 h-14">
                                  <FormControl>
                                    <Checkbox
                                      disabled={
                                        !field.value.some(
                                          (location) => location.id === item.id
                                        ) && studentNumber <= 0
                                      }
                                      checked={field.value?.some(
                                        (location) => location.id === item.id
                                      )}
                                      onCheckedChange={(checked) => {
                                        const locationObj = {
                                          id: item.id,
                                          size: item.size,
                                        };
                                        field.onChange(
                                          checked
                                            ? [...field.value, locationObj]
                                            : field.value?.filter(
                                                (value) => value.id !== item.id
                                              )
                                        );
                                        handleCheckboxChange(
                                          !!checked,
                                          item.id
                                        );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="flex flex-1 justify-start items-center">
                                    {item.name}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="ml-2"
                                      onClick={(e: any) => {
                                        e.preventDefault();
                                        if (studentNumber > 0)
                                          handleLocationChange(item.id, true);
                                      }}
                                    >
                                      <Plus size={14} />
                                    </Button>
                                    <span>
                                      {
                                        form
                                          .getValues("locations")
                                          .find(
                                            (location) =>
                                              location.id === item.id
                                          )?.size
                                      }
                                    </span>

                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="mr-2"
                                      onClick={(e: any) => {
                                        e.preventDefault(),
                                          handleLocationChange(item.id, false);
                                      }}
                                    >
                                      <Minus size={14} />
                                    </Button>
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </ScrollArea>
              )}
            </div>
            <FormError message={error} />
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

export default ExamModal;
