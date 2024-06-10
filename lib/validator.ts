import { z } from "zod";

const TimeSchema = z.string().regex(/^\d{2}:\d{2}$/, "Format d'heure invalide");

const TimeRangeSchema = z
  .object({
    start: TimeSchema,
    end: TimeSchema,
  })
  .refine((data) => data.start < data.end, {
    message: "L'heure de début doit être avant l'heure de fin",
  });

export const SessionSchema = z.object({
  urlFile: z.instanceof(File).nullable(),
  type: z.string({
    message: "Veuillez sélectionner un type pour la session d'examens.",
  }),
  dateRange: z
    .object({
      from: z.date({
        message: "Une date de début est requise.",
      }),
      to: z.date({
        message: "Une date de fin est requise.",
      }),
    })
    .refine((data) => data.from <= data.to, {
      message: "La date de début ne peut pas être après la date de fin.",
      path: ["dateRange"],
    }),
  morningSession1: TimeRangeSchema,
  morningSession2: TimeRangeSchema,
  afternoonSession1: TimeRangeSchema,
  afternoonSession2: TimeRangeSchema,
});

export const DepartmentSchema = z.object({
  name: z.string().min(3, {
    message: "Le nom doit contenir au moins 3 caractères.",
  }),
});

export const TeacherSchema = z.object({
  lastName: z.string().min(3, {
    message: "Le nom doit contenir au moins 3 caractères.",
  }),
  firstName: z.string().min(3, {
    message: "Le prénom doit contenir au moins 3 caractères.",
  }),
  phoneNumber: z.string().refine((value) => value.length === 10, {
    message: "Le numéro de téléphone doit contenir exactement 10 caractères.",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse e-mail valide.",
  }),
  isDispense: z.boolean().default(false),
  departmentId: z.number().int().min(1, {
    message: "Veuillez sélectionner un département.",
  }),
});

export const LocationSchema = z.object({
  name: z.string().min(1, {
    message: "Le nom doit contenir au moins 1 caractère.",
  }),
  size: z.number().int().min(1, {
    message: "La taille doit être un nombre entier positif.",
  }),
  type: z.enum(["CLASSROOM", "AMPHITHEATER"], {
    message: "Vous devez selectionner le type.",
  }),
});

const StudentSchema = z.object({
  number: z.number(),
  firstName: z.string(),
  lastName: z.string(),
});

export const ExamSchema = z.object({
  moduleId: z.string().min(1, {
    message: "Le module est requis",
  }),
  responsibleId: z.number().int().min(1, {
    message: "Le responsable du module est requis.",
  }),
  timeSlotId: z.number().int().min(1, {
    message: "L'identifiant de l'intervalle de temps est requis.",
  }),
  manual: z.boolean().default(false),
  locations: z.array(z.number()),
});

export const LoginSchema = z.object({
  email: z.string().email({
    message: "L'adresse e-mail est requise",
  }),
  password: z.string().min(1, {
    message: "Le mot de passe est requis",
  }),
});

export const RegisterSchema = z.object({
  email: z.string().email({
    message: "L'adresse e-mail est requise",
  }),
  password: z.string().min(6, {
    message: "Au moins 6 caractères sont requis",
  }),
  name: z.string().min(1, {
    message: "Le nom est requis",
  }),
  isAdmin: z.boolean().default(false).optional(),
});

export const sessionsSchema = z.object({
  type: z.enum(["validate", "cancel"]),
});
