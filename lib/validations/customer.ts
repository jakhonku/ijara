import { z } from "zod";

export const customerSchema = z.object({
  full_name: z.string().min(2, "Ism kamida 2 ta belgi"),
  phone: z
    .string()
    .min(7, "Telefon raqami noto'g'ri")
    .regex(/^[+\d\s\-()]+$/, "Telefon raqamida faqat raqamlar bo'lishi kerak"),
  passport: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
