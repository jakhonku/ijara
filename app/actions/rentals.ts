"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { RentalStatus } from "@/types/database";

export async function createRental(data: {
  customer_id: string;
  items: { equipment_id: string; quantity: number; daily_price: number; days_count: number }[];
  start_date: string;
  expected_return_date: string;
  days_count: number;
  total_amount: number;
  notes?: string;
}) {
  const supabase = await createClient();

  // 1. Get next rental number
  const { data: rentalNumber, error: rpcError } = await supabase.rpc("next_rental_number");
  if (rpcError) throw new Error(rpcError.message);

  // 2. Create rental
  const { data: rental, error: rentalError } = await (supabase
    .from("rentals") as any)
    .insert([{
      rental_number: rentalNumber,
      customer_id: data.customer_id,
      start_date: data.start_date,
      expected_return_date: data.expected_return_date,
      days_count: data.days_count,
      total_amount: data.total_amount,
      status: "active" as RentalStatus,
      notes: data.notes || null,
    }])
    .select()
    .single();

  if (rentalError) throw new Error(rentalError.message);

  // 3. Create rental items
  // We need snapshots of equipment names and units
  const equipmentIds = data.items.map(i => i.equipment_id);
  const { data: equipmentData } = await supabase
    .from("equipment")
    .select("id, name, unit")
    .in("id", equipmentIds);

  const itemsToInsert = data.items.map(item => {
    const eq = equipmentData?.find(e => e.id === item.equipment_id);
    return {
      rental_id: rental.id,
      equipment_id: item.equipment_id,
      equipment_name_snapshot: eq?.name || "Noma'lum",
      unit_snapshot: eq?.unit || "dona",
      quantity: item.quantity,
      daily_price: item.daily_price,
      days_count: item.days_count,
      subtotal: item.quantity * item.daily_price * item.days_count,
    };
  });

  const { error: itemsError } = await (supabase.from("rental_items") as any).insert(itemsToInsert);
  if (itemsError) throw new Error(itemsError.message);

  revalidatePath("/rentals");
  revalidatePath("/");
  
  return rental;
}

export async function getRentals() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rentals")
    .select(`
      *,
      customers (
        full_name,
        phone
      ),
      rental_items (
        id,
        equipment_name_snapshot,
        quantity,
        subtotal
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function closeRental(id: string) {
  const supabase = await createClient();
  const { error } = await (supabase
    .from("rentals") as any)
    .update({ 
      status: "closed",
      actual_return_date: new Date().toISOString().split("T")[0]
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  
  revalidatePath("/rentals");
  revalidatePath("/");
  revalidatePath("/inventory");
}
