"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createPayment(data: {
  rental_id: string;
  amount: number;
  method: "cash" | "card" | "click" | "payme" | "bank" | "other";
  notes?: string;
}) {
  const supabase = await createClient();

  const { data: payment, error } = await supabase
    .from("payments")
    .insert([{
      rental_id: data.rental_id,
      amount: data.amount,
      method: data.method,
      notes: data.notes || null,
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/rentals");
  revalidatePath("/payments");
  revalidatePath("/debtors");
  revalidatePath("/");
  
  return payment;
}

export async function getPayments() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select(`
      *,
      rentals (
        rental_number,
        customers (
          full_name
        )
      )
    `)
    .order("paid_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}
