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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { upsertEquipment } from "@/app/actions/inventory";
import { toast } from "sonner";
import { Equipment, EquipmentCategory } from "@/types/database";

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nom kamida 2 ta belgidan iborat bo'lishi kerak"),
  category_id: z.string().optional(),
  unit: z.string().default("dona"),
  total_qty: z.string().transform((v) => parseInt(v)).pipe(z.number().min(0)),
  daily_price: z.string().transform((v) => parseFloat(v)).pipe(z.number().min(0)),
  description: z.string().optional(),
  status: z.enum(["active", "maintenance", "archived"]).default("active"),
});

interface EquipmentFormProps {
  initialData?: Equipment | null;
  categories: EquipmentCategory[];
  onSuccess: () => void;
}

export function EquipmentForm({ initialData, categories, onSuccess }: EquipmentFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: initialData?.id,
      name: initialData?.name || "",
      category_id: initialData?.category_id || undefined,
      unit: initialData?.unit || "dona",
      total_qty: (initialData?.total_qty?.toString() as any) || "1",
      daily_price: (initialData?.daily_price?.toString() as any) || "0",
      description: initialData?.description || "",
      status: initialData?.status || "active",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await upsertEquipment(values);
      toast.success(initialData ? "Ma'lumotlar yangilandi" : "Yangi buyum qo'shildi");
      onSuccess();
    } catch (error: any) {
      toast.error("Xatolik yuz berdi: " + error.message);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nomi</FormLabel>
              <FormControl>
                <Input placeholder="Masalan: Perforator Bosch" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategoriya</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Tanlang" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>O'lchov birligi</FormLabel>
                <FormControl>
                  <Input placeholder="dona, kg, m..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="total_qty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Umumiy soni</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="daily_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kunlik ijara narxi (so'm)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Holati</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Tanlang" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Faol</SelectItem>
                  <SelectItem value="maintenance">Ta'mirda</SelectItem>
                  <SelectItem value="archived">Arxiv</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tavsif (ixtiyoriy)</FormLabel>
              <FormControl>
                <Textarea placeholder="Qo'shimcha ma'lumotlar..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" className="w-full">
            {initialData ? "Saqlash" : "Qo'shish"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
