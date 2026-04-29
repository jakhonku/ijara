"use client";

import { useEffect, useState } from "react";
import { Plus, Search, MoreVertical, Eye, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { getRentals, closeRental } from "@/app/actions/rentals";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";

export default function RentalsPage() {
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getRentals();
      setRentals(data);
    } catch (error) {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRentals = rentals.filter(
    (r) =>
      r.rental_number.toLowerCase().includes(search.toLowerCase()) ||
      r.customers?.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleClose = async (id: string) => {
    if (confirm("Ushbu ijarani yakunlamoqchimisiz? Barcha uskunalar omborga qaytariladi.")) {
      try {
        await closeRental(id);
        toast.success("Ijara yakunlandi");
        fetchData();
      } catch (error) {
        toast.error("Xatolik yuz berdi");
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="border-primary text-primary bg-primary/5">
            <Clock className="mr-1 h-3 w-3" /> Faol
          </Badge>
        );
      case "closed":
        return (
          <Badge variant="outline" className="border-success text-success bg-success/5">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Yopilgan
          </Badge>
        );
      case "overdue":
        return (
          <Badge variant="outline" className="border-destructive text-destructive bg-destructive/5">
            <AlertCircle className="mr-1 h-3 w-3" /> Muddati o'tgan
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ijaralar</h1>
          <p className="text-muted-foreground">Barcha ijara shartnomalari va ularning holati.</p>
        </div>
        <Link href="/rentals/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Yangi ijara
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Raqam yoki mijoz bo'yicha qidirish..."
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
              <TableHead>Raqam</TableHead>
              <TableHead>Mijoz</TableHead>
              <TableHead>Sana</TableHead>
              <TableHead>Muddat</TableHead>
              <TableHead>Summa</TableHead>
              <TableHead>Holat</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Yuklanmoqda...
                </TableCell>
              </TableRow>
            ) : filteredRentals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Ijaralar topilmadi.
                </TableCell>
              </TableRow>
            ) : (
              filteredRentals.map((rental) => (
                <TableRow key={rental.id}>
                  <TableCell className="font-mono font-medium text-xs">
                    {rental.rental_number}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{rental.customers?.full_name}</span>
                      <span className="text-[10px] text-muted-foreground">{rental.customers?.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(rental.start_date), "dd.MM.yyyy")}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex flex-col">
                      <span>{format(new Date(rental.expected_return_date), "dd.MM.yyyy")}</span>
                      <span className="text-[10px] text-muted-foreground">{rental.days_count} kun</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{new Intl.NumberFormat("uz-UZ").format(rental.total_amount)} so'm</span>
                      {rental.paid_amount > 0 && (
                        <span className="text-[10px] text-success">To'langan: {new Intl.NumberFormat("uz-UZ").format(rental.paid_amount)}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(rental.status)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" /> Ko'rish
                        </DropdownMenuItem>
                        {rental.status === "active" && (
                          <DropdownMenuItem onClick={() => handleClose(rental.id)}>
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Yakunlash
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
