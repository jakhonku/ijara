import { z } from "zod";
import { customerSchema } from "./customer";

export const cartItemSchema = z.object({
  equipment_id: z.string().uuid(),
  equipment_name: z.string(),
  unit: z.string(),
  available_qty: z.number().int().min(0),
  quantity: z.coerce.number().int().min(1, "Miqdor 1 dan kam emas"),
  daily_price: z.coerce.number().min(0, "Narx manfiy emas"),
});

export const newRentalSchema = z
  .object({
    mode: z.enum(["existing", "new"]),
    customer_id: z.string().uuid().nullable().optional(),
    new_customer: customerSchema.optional(),
    items: z.array(cartItemSchema).min(1, "Kamida bitta texnika qo'shing"),
    days_count: z.coerce.number().int().min(1, "Kamida 1 kun"),
    start_date: z.string().min(1, "Sana kerak"),
    expected_return_date: z.string().min(1, "Sana kerak"),
    notes: z.string().optional().nullable(),
  })
  .refine(
    (v) =>
      (v.mode === "existing" && !!v.customer_id) ||
      (v.mode === "new" && !!v.new_customer),
    { message: "Mijoz tanlanmagan", path: ["customer_id"] }
  );

export type NewRentalInput = z.infer<typeof newRentalSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
