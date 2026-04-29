"use client";

import { useEffect, useState } from "react";
import { Search, Wallet, AlertTriangle, User } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getRentals } from "@/app/actions/rentals";
import { createPayment } from "@/app/actions/payments";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DebtorsPage() {
  const [debtors, setDebtors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRental, setSelectedRental] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getRentals();
      // Filter for rentals with remaining balance
      const debtorList = data.filter((r: any) => r.total_amount > r.paid_amount);
      setDebtors(debtorList);
    } catch (error) {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredDebtors = debtors.filter(
    (r) =>
      r.rental_number.toLowerCase().includes(search.toLowerCase()) ||
      r.customers?.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const handlePayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error("Iltimos, to'g'ri summa kiriting");
      return;
    }

    try {
      setSubmitting(true);
      await createPayment({
        rental_id: selectedRental.id,
        amount: parseFloat(paymentAmount),
        method: paymentMethod as any,
      });
      toast.success("To'lov muvaffaqiyatli qabul qilindi");
      setIsPaymentOpen(false);
      setPaymentAmount("");
      fetchData();
    } catch (error) {
      toast.error("To'lovda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  const openPaymentDialog = (rental: any) => {
    setSelectedRental(rental);
    setPaymentAmount((rental.total_amount - rental.paid_amount).toString());
    setIsPaymentOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Qarzdorlar</h1>
          <p className="text-muted-foreground">To'lovi to'liq amalga oshirilmagan ijaralar.</p>
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
              <TableHead>Mijoz</TableHead>
              <TableHead>Ijara №</TableHead>
              <TableHead>Jami summa</TableHead>
              <TableHead>To'langan</TableHead>
              <TableHead>Qarz</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Yuklanmoqda...
                </TableCell>
              </TableRow>
            ) : filteredDebtors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Qarzdorlar topilmadi.
                </TableCell>
              </TableRow>
            ) : (
              filteredDebtors.map((rental) => {
                const debt = rental.total_amount - rental.paid_amount;
                return (
                  <TableRow key={rental.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{rental.customers?.full_name}</span>
                          <span className="text-[10px] text-muted-foreground">{rental.customers?.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{rental.rental_number}</TableCell>
                    <TableCell>{new Intl.NumberFormat("uz-UZ").format(rental.total_amount)} so'm</TableCell>
                    <TableCell className="text-success">{new Intl.NumberFormat("uz-UZ").format(rental.paid_amount)} so'm</TableCell>
                    <TableCell className="font-bold text-destructive">
                      {new Intl.NumberFormat("uz-UZ").format(debt)} so'm
                    </TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => openPaymentDialog(rental)}>
                        <Wallet className="mr-2 h-4 w-4" /> To'lov
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>To'lov qabul qilish</DialogTitle>
            <DialogDescription>
              {selectedRental?.customers?.full_name} uchun to'lov ma'lumotlarini kiriting.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Summa (so'm)</Label>
              <Input
                id="amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="method">To'lov turi</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Tanlang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Naqd</SelectItem>
                  <SelectItem value="card">Plastik karta</SelectItem>
                  <SelectItem value="click">Click</SelectItem>
                  <SelectItem value="payme">Payme</SelectItem>
                  <SelectItem value="bank">Bank o'tkazmasi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {parseFloat(paymentAmount) > (selectedRental?.total_amount - selectedRental?.paid_amount) && (
              <div className="flex items-center gap-2 rounded-md bg-warning/10 p-3 text-xs text-warning">
                <AlertTriangle className="h-4 w-4" />
                <span>Eslatma: Kiritilgan summa qarzdan ko'p.</span>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>Bekor qilish</Button>
            <Button onClick={handlePayment} disabled={submitting}>
              {submitting ? "Saqlanmoqda..." : "Tasdiqlash"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
