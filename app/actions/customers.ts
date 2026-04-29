"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Customer } from "@/types/database";

export async function getCustomers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function upsertCustomer(formData: any) {
  const supabase = await createClient();
  
  const payload = {
    full_name: formData.full_name,
    phone: formData.phone,
    passport: formData.passport || null,
    address: formData.address || null,
    notes: formData.notes || null,
  };

  let result;
  let error;
  if (formData.id) {
    const { data, error: updateError } = await (supabase
      .from("customers") as any)
      .update(payload)
      .eq("id", formData.id)
      .select()
      .single();
    error = updateError;
    result = data;
  } else {
    const { data, error: insertError } = await (supabase
      .from("customers") as any)
      .insert([payload])
      .select()
      .single();
    error = insertError;
    result = data;
  }

  if (error) throw new Error(error.message);
  
  revalidatePath("/customers");
  return result;
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);
  
  if (error) throw new Error(error.message);
  
  revalidatePath("/customers");
}
