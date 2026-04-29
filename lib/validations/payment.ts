import { z } from "zod";

export const paymentSchema = z.object({
  rental_id: z.string().uuid("Ijara tanlanmagan"),
  amount: z.coerce.number().positive("Summa 0 dan katta bo'lishi kerak"),
  method: z.enum(["cash", "card", "click", "payme", "bank", "other"]),
  notes: z.string().optional().nullable(),
});

export type PaymentInput = z.infer<typeof paymentSchema>;
