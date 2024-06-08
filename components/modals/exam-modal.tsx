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
import { getLocationsForExamManual } from "@/data/exam";
import { useModal } from "@/hooks/useModalStore";
import { Student } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ExamSchema } from "@/lib/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Department, Location, Teacher } from "@prisma/client";
import { CaretSortIcon } from "@radix-ui/react-icons";
import axios from "axios";
import { CheckIcon, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { read, utils } from "xlsx";
import * as z from "zod";
import { FormError } from "../auth/form-error";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
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
  const [error, setError] = useState<string | undefined>("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [department, setDepartment] = useState<number | null>(null);
  const [studentNumber, setStudentNumber] = useState<number>(0);
  const [teachers, setTeachers] = useState<Teacher[] | undefined>();
  const [open, setOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>();
  const params = useParams<{ timeSlotId: string }>();
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
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/departments`
        );
        setDepartments(response.data);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des départements :",
          error
        );
      }
    };
    fetchData();
  }, []);
  const handleCheckboxChange = (checked: boolean, locationId: number) => {
    if (checked) {
      const location = locations.find((loc) => loc.id === locationId);
      if (location) {
        setStudentNumber(
          (prevStudentNumber) => prevStudentNumber - location.size
        );
      }
    } else {
      const location = locations.find((loc) => loc.id === locationId);
      if (location) {
        setStudentNumber(
          (prevStudentNumber) => prevStudentNumber + location.size
        );
      }
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      const { freeLocations } = await getLocationsForExamManual(
        parseInt(params.timeSlotId)
      );
      setLocations(freeLocations);
    };
    if (studentNumber > 0) fetchData();
  }, [studentNumber, params.timeSlotId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (department !== null) {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/monitoring`,
            {
              departmentId: department,
              timeSlotId: parseInt(params.timeSlotId),
            }
          );
          setTeachers(response.data.freeTeachers);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des enseignants :",
          error
        );
      }
    };
    if (department !== undefined) {
      fetchData();
      setSelectedTeacher(null);
    }
  }, [department, isOpen, params.timeSlotId]);

  useEffect(() => {
    form.setValue("timeSlotId", parseInt(params.timeSlotId));
  }, [exam, form, params.timeSlotId, isOpen]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof ExamSchema>) => {
    if (studentNumber > 0 && values.manual) {
      setError("il reste des etudiants");
      return;
    }
    setError(undefined);
    const file = values.urlFile as File;
    const reader = new FileReader();

    reader.onload = async (event) => {
      const target = event?.target;
      if (target instanceof FileReader) {
        const binaryString = target.result as string;
        const workbook = read(binaryString, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        // Convert the sheet data to JSON
        const data: any[] = utils.sheet_to_json(sheet, { header: 1 }); // Assuming the first row contains headers

        // Skip the first 34 rows
        const trimmedData = data.slice(34);

        const students: Student[] = trimmedData.map((element: any) => {
          const etudiant: Student = {
            number: element[0], // Assuming the first column contains student numbers
            firstName: element[1], // Assuming the second column contains first names
            lastName: element[2], // Assuming the third column contains last names
          };
          return etudiant;
        });

        const newValues = {
          ...values,
          timeSlotId: parseInt(params.timeSlotId),
          students: students,
          enrolledStudentsCount: students.length, // Use the length of trimmedData instead of data
        };

        try {
          const response = await axios.post("/api/exams", newValues);
          if (response.data.error) {
            toast.error(response.data.error);
          }

          form.reset();
          setSelectedTeacher(null);
          router.refresh();
          onClose();
        } catch (error) {
          console.log(error);
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      form.setValue("urlFile", file);
      // Calculate and display the number of rows
      const fileReader = new FileReader();
      fileReader.onload = function () {
        const arrayBuffer = this.result;
        const workbook = read(arrayBuffer, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data: any[] = utils.sheet_to_json(sheet, { header: 1 });
        setStudentNumber(data.length - 34);
      };
      fileReader.readAsArrayBuffer(file);
    }
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
              <FormField
                defaultValue=""
                control={form.control}
                name="moduleName"
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
              <FormField
                defaultValue=""
                control={form.control}
                name="options"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Options</FormLabel>
                    <Input
                      disabled={isLoading}
                      placeholder="Entrez la liste des filières"
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <FormLabel>Responsable du module</FormLabel>
                <div className="grid gap-2 grid-cols-10">
                  <Select
                    onValueChange={(value) => setDepartment(Number(value))}
                  >
                    <FormControl>
                      <SelectTrigger className="col-span-4">
                        <SelectValue placeholder="Sélectionnez le département" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((item) => (
                        <SelectItem value={item.id.toString()} key={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormField
                    control={form.control}
                    name="responsibleId"
                    render={({ field }) => (
                      <FormItem className="col-span-6">
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-label="Charger les enseignants..."
                              aria-expanded={open}
                              className="flex-1 justify-between w-full"
                            >
                              {selectedTeacher
                                ? selectedTeacher.firstName +
                                  " " +
                                  selectedTeacher.lastName
                                : "Charger les enseignants..."}
                              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Rechercher des enseignants..." />
                              <CommandEmpty>
                                Aucun enseignant trouvé.
                              </CommandEmpty>
                              <CommandGroup>
                                <ScrollArea className="h-[200px]">
                                  {teachers?.map((teacher) => (
                                    <CommandItem
                                      key={teacher.id}
                                      onSelect={() => {
                                        setSelectedTeacher(teacher);
                                        field.onChange(teacher.id);
                                        setOpen(false);
                                      }}
                                    >
                                      {teacher.firstName +
                                        " " +
                                        teacher.lastName}
                                      <CheckIcon
                                        className={cn(
                                          "ml-auto h-4 w-4",
                                          field.value === teacher.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                                </ScrollArea>
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <FormField
                control={form.control}
                name="urlFile"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start space-y-2 min-w-max">
                    <FormLabel>Uploader un ficher excel</FormLabel>
                    <Input
                      accept=".xlsx, .xls"
                      type="file"
                      disabled={isLoading}
                      placeholder="Entrez le nombre d'étudiants inscrits"
                      onChange={handleFileChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch("urlFile") && (
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
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        disabled={
                                          !field.value?.includes(item.id) &&
                                          studentNumber < 0
                                        }
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          field.onChange(
                                            checked
                                              ? [...field.value, item.id]
                                              : field.value?.filter(
                                                  (value) => value !== item.id
                                                )
                                          );
                                          handleCheckboxChange(
                                            !!checked,
                                            item.id
                                          );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {item.name}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
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
