"use server";

import { createClient } from "@/lib/supabase/server";

export async function getReportStats() {
  const supabase = await createClient();

  // 1. Get total revenue
  const { data: rentals } = await supabase
    .from("rentals")
    .select("total_amount, paid_amount, status, created_at");

  const totalRevenue = rentals?.reduce((sum, r) => sum + Number(r.paid_amount), 0) || 0;
  const totalDebt = rentals?.reduce((sum, r) => sum + (Number(r.total_amount) - Number(r.paid_amount)), 0) || 0;
  const activeRentalsCount = rentals?.filter(r => r.status === 'active').length || 0;

  // 2. Revenue by day (last 7 days)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const chartData = last7Days.map(date => {
    const dayName = new Date(date).toLocaleDateString('uz-UZ', { weekday: 'short' });
    const dayTotal = rentals
      ?.filter(r => r.created_at.startsWith(date))
      .reduce((sum, r) => sum + Number(r.total_amount), 0) || 0;
    return { name: dayName, value: dayTotal };
  });

  return {
    totalRevenue,
    totalDebt,
    activeRentalsCount,
    chartData,
  };
}
