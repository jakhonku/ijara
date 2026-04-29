import { z } from "zod";

export const equipmentSchema = z.object({
  name: z.string().min(2, "Nomi kamida 2 ta belgi"),
  category_id: z.string().uuid().nullable().optional().or(z.literal("")),
  unit: z.string().min(1, "O'lchov birligi kerak"),
  total_qty: z.coerce.number().int().min(0, "Manfiy bo'la olmaydi"),
  daily_price: z.coerce.number().min(0, "Manfiy bo'la olmaydi"),
  description: z.string().optional().nullable(),
  status: z.enum(["active", "maintenance", "archived"]).default("active"),
});

export type EquipmentInput = z.infer<typeof equipmentSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, "Nomi kamida 2 ta belgi"),
  icon: z.string().optional().nullable(),
});
export type CategoryInput = z.infer<typeof categorySchema>;
