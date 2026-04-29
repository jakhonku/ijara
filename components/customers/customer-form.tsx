"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { upsertCustomer } from "@/app/actions/customers";
import { toast } from "sonner";
import { Customer } from "@/types/database";

const formSchema = z.object({
  id: z.string().optional(),
  full_name: z.string().min(3, "Ism kamida 3 ta belgidan iborat bo'lishi kerak"),
  phone: z.string().min(9, "Telefon raqami noto'g'ri"),
  passport: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

interface CustomerFormProps {
  initialData?: Customer | null;
  onSuccess: () => void;
}

export function CustomerForm({ initialData, onSuccess }: CustomerFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: initialData?.id,
      full_name: initialData?.full_name || "",
      phone: initialData?.phone || "",
      passport: initialData?.passport || "",
      address: initialData?.address || "",
      notes: initialData?.notes || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await upsertCustomer(values);
      toast.success(initialData ? "Mijoz ma'lumotlari yangilandi" : "Yangi mijoz qo'shildi");
      
      const nextAction = (window as any).nextAction;
      if (nextAction === 'rental' && result?.id) {
        window.location.href = `/rentals/new?customerId=${result.id}`;
      } else {
        onSuccess();
      }
    } catch (error: any) {
      toast.error("Xatolik yuz berdi: " + error.message);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>F.I.SH.</FormLabel>
              <FormControl>
                <Input placeholder="Masalan: Alisher Navoiy" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefon</FormLabel>
                <FormControl>
                  <Input placeholder="+998 90 123 45 67" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="passport"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pasport seriyasi</FormLabel>
                <FormControl>
                  <Input placeholder="AB1234567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Manzil</FormLabel>
              <FormControl>
                <Input placeholder="Toshkent sh., Yunusobod tumani..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Izoh (ixtiyoriy)</FormLabel>
              <FormControl>
                <Textarea placeholder="Mijoz haqida qo'shimcha ma'lumot..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-2 pt-4">
          <Button type="submit" className="w-full" onClick={() => (window as any).nextAction = 'save'}>
            {initialData ? "Saqlash" : "Mijozni saqlash"}
          </Button>
          {!initialData && (
            <Button 
              type="submit" 
              variant="secondary" 
              className="w-full bg-primary/10 text-primary hover:bg-primary/20"
              onClick={() => (window as any).nextAction = 'rental'}
            >
              Saqlash va ijara boshlash
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
