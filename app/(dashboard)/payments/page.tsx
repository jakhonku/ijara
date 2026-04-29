"use client";

import { useEffect, useState } from "react";
import { Search, Wallet, Calendar, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPayments } from "@/app/actions/payments";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getPayments();
      setPayments(data);
    } catch (error) {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPayments = payments.filter(
    (p) =>
      p.rentals?.rental_number.toLowerCase().includes(search.toLowerCase()) ||
      p.rentals?.customers?.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const getMethodBadge = (method: string) => {
    const labels: Record<string, string> = {
      cash: "Naqd",
      card: "Karta",
      click: "Click",
      payme: "Payme",
      bank: "Bank",
    };
    return <Badge variant="secondary">{labels[method] || method}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">To'lovlar tarixi</h1>
          <p className="text-muted-foreground">Tizimga kiritilgan barcha to'lovlar ro'yxati.</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Qidirish..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sana</TableHead>
              <TableHead>Mijoz</TableHead>
              <TableHead>Ijara №</TableHead>
              <TableHead>Summa</TableHead>
              <TableHead>Tur</TableHead>
              <TableHead>Izoh</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Yuklanmoqda...
                </TableCell>
              </TableRow>
            ) : filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  To'lovlar topilmadi.
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium">{format(new Date(payment.paid_at), "dd.MM.yyyy")}</span>
                      <span className="text-[10px] text-muted-foreground">{format(new Date(payment.paid_at), "HH:mm")}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{payment.rentals?.customers?.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{payment.rentals?.rental_number}</TableCell>
                  <TableCell className="font-bold text-success">
                    {new Intl.NumberFormat("uz-UZ").format(payment.amount)} so'm
                  </TableCell>
                  <TableCell>{getMethodBadge(payment.method)}</TableCell>
                  <TableCell className="max-w-[150px] truncate text-xs text-muted-foreground">
                    {payment.notes || "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
