"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Equipment, EquipmentStatus } from "@/types/database";

export async function getInventory() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("equipment")
    .select("*, category:equipment_categories(*)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("equipment_categories")
    .select("*")
    .order("name");

  if (error) throw new Error(error.message);
  return data;
}

export async function upsertEquipment(formData: any) {
  const supabase = await createClient();
  
  const payload = {
    name: formData.name,
    category_id: formData.category_id || null,
    unit: formData.unit || "dona",
    total_qty: parseInt(formData.total_qty),
    daily_price: parseFloat(formData.daily_price),
    description: formData.description || null,
    status: (formData.status as EquipmentStatus) || "active",
  };

  let error;
  if (formData.id) {
    const { error: updateError } = await (supabase
      .from("equipment") as any)
      .update(payload)
      .eq("id", formData.id);
    error = updateError;
  } else {
    const { error: insertError } = await (supabase
      .from("equipment") as any)
      .insert([payload]);
    error = insertError;
  }

  if (error) throw new Error(error.message);
  
  revalidatePath("/inventory");
}

export async function deleteEquipment(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("equipment").delete().eq("id", id);
  
  if (error) throw new Error(error.message);
  
  revalidatePath("/inventory");
}
