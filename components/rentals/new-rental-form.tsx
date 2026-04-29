"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  User, 
  Boxes, 
  Calendar as CalendarIcon, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Trash2,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Customer, Equipment } from "@/types/database";
import { createRental } from "@/app/actions/rentals";
import { toast } from "sonner";
import { format, addDays, differenceInDays } from "date-fns";

interface NewRentalFormProps {
  customers: Customer[];
  inventory: Equipment[];
}

export function NewRentalForm({ customers, inventory }: NewRentalFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCustomerId = searchParams?.get("customerId") || "";
  
  const [step, setStep] = useState(initialCustomerId ? 2 : 1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [customerId, setCustomerId] = useState(initialCustomerId);
  const [selectedItems, setSelectedItems] = useState<{ equipment_id: string; quantity: number; daily_price: number }[]>([]);
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 1), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");
  const [smsSent, setSmsSent] = useState(false);

  // Calculations
  const daysCount = useMemo(() => {
    const diff = differenceInDays(new Date(endDate), new Date(startDate));
    return diff > 0 ? diff : 1;
  }, [startDate, endDate]);

  const dailyTotal = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + (item.quantity * item.daily_price), 0);
  }, [selectedItems]);

  const totalAmount = useMemo(() => {
    return dailyTotal * daysCount;
  }, [dailyTotal, daysCount]);

  // Handlers
  const addItem = () => {
    setSelectedItems([...selectedItems, { equipment_id: "", quantity: 1, daily_price: 0 }]);
  };

  const removeItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...selectedItems];
    if (field === "equipment_id") {
      const equipment = inventory.find(e => e.id === value);
      newItems[index] = { 
        ...newItems[index], 
        equipment_id: value, 
        daily_price: equipment?.daily_price || 0 
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setSelectedItems(newItems);
  };

  const sendSms = () => {
    setLoading(true);
    // Simulate SMS sending
    setTimeout(() => {
      setLoading(false);
      setSmsSent(true);
      toast.success("Mijozga tasdiqlash kodi yuborildi");
    }, 1500);
  };

  const handleSubmit = async () => {
    if (!customerId || selectedItems.length === 0) {
      toast.error("Iltimos, barcha maydonlarni to'ldiring");
      return;
    }

    try {
      setLoading(true);
      await createRental({
        customer_id: customerId,
        items: selectedItems.map(item => ({ ...item, days_count: daysCount })),
        start_date: startDate,
        expected_return_date: endDate,
        days_count: daysCount,
        total_amount: totalAmount,
        notes,
      });
      toast.success("Ijara muvaffaqiyatli yaratildi");
      router.push("/rentals");
    } catch (error: any) {
      toast.error("Xatolik: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Steps Indicator */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
              step >= s ? "bg-primary border-primary text-primary-foreground" : "border-muted text-muted-foreground"
            }`}>
              {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
            </div>
            {s < 3 && <div className={`h-0.5 w-16 sm:w-24 mx-2 ${step > s ? "bg-primary" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && "Mijozni tanlash"}
            {step === 2 && "Uskunalarni tanlash"}
            {step === 3 && "Muddat va yakunlash"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Customer */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Mijoz</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Mijozni tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.full_name} ({c.phone})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2 text-center">Yoki yangi mijoz qo'shing</p>
                <Button variant="outline" className="w-full" onClick={() => router.push("/customers")}>
                  <Plus className="mr-2 h-4 w-4" /> Yangi mijoz qo'shish
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Items */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <Label>Tanlangan uskunalar</Label>
                <div className="text-sm font-semibold text-primary">
                  Kunlik: {new Intl.NumberFormat("uz-UZ").format(dailyTotal)} so'm
                </div>
              </div>
              {selectedItems.map((item, index) => (
                <div key={index} className="flex gap-2 items-end border p-3 rounded-lg bg-muted/30 relative group">
                  <div className="flex-1 space-y-2">
                    <Label className="text-[10px] uppercase text-muted-foreground">Uskuna</Label>
                    <Select 
                      value={item.equipment_id} 
                      onValueChange={(v) => updateItem(index, "equipment_id", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventory.map((e) => (
                          <SelectItem key={e.id} value={e.id} disabled={e.total_qty - e.rented_qty <= 0}>
                            {e.name} ({e.total_qty - e.rented_qty} {e.unit} qolgan)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-20 space-y-2">
                    <Label className="text-[10px] uppercase text-muted-foreground">Soni</Label>
                    <Input 
                      type="number" 
                      min="1" 
                      value={item.quantity} 
                      onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value))} 
                    />
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeItem(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" className="w-full border-dashed" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" /> Buyum qo'shish
              </Button>
            </div>
          )}

          {/* Step 3: Dates & Total */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Boshlanish sanasi</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Qaytarish sanasi</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Izoh</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Qo'shimcha ma'lumotlar..." />
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Kunlik summa:</span>
                  <span className="font-medium">{new Intl.NumberFormat("uz-UZ").format(dailyTotal)} so'm</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Muddat:</span>
                  <span className="font-medium">{daysCount} kun</span>
                </div>
                <div className="h-px bg-primary/10" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Jami summa:</span>
                  <span className="text-primary">{new Intl.NumberFormat("uz-UZ").format(totalAmount)} so'm</span>
                </div>
              </div>

              {!smsSent ? (
                <Button variant="secondary" className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200" onClick={sendSms} disabled={loading}>
                  <CalendarIcon className="mr-2 h-4 w-4" /> SMS tasdiqlash yuborish
                </Button>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-md bg-success/10 text-success text-sm border border-success/20">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>SMS tasdiqlandi (Mijoz roziligi olingan)</span>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button 
              variant="ghost" 
              onClick={() => setStep(step - 1)} 
              disabled={step === 1 || loading}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Orqaga
            </Button>
            
            {step < 3 ? (
              <Button 
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !customerId) || 
                  (step === 2 && (selectedItems.length === 0 || selectedItems.some(i => !i.equipment_id)))
                }
              >
                Keyingisi <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading || !smsSent} className="bg-success hover:bg-success/90">
                {loading ? "Yaratilmoqda..." : "Ijarani yakunlash"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
