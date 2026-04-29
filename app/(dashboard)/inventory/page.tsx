"use client";

import { useEffect, useState } from "react";
import { Plus, Search, MoreVertical, Edit, Trash2, Boxes } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EquipmentStatusBadge } from "@/components/shared/status-badge";
import { EquipmentForm } from "@/components/inventory/equipment-form";
import { getInventory, getCategories, deleteEquipment } from "@/app/actions/inventory";
import { Equipment, EquipmentCategory } from "@/types/database";
import { toast } from "sonner";

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inventoryData, categoriesData] = await Promise.all([
        getInventory(),
        getCategories(),
      ]);
      setItems(inventoryData);
      setCategories(categoriesData);
    } catch (error) {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm("Haqiqatan ham ushbu buyumni o'chirib tashlamoqchimisiz?")) {
      try {
        await deleteEquipment(id);
        toast.success("Buyum o'chirildi");
        fetchData();
      } catch (error) {
        toast.error("O'chirishda xatolik");
      }
    }
  };

  const handleEdit = (item: Equipment) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventar</h1>
          <p className="text-muted-foreground">Ombordagi barcha qurilmalar va asboblar.</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" /> Yangi buyum
        </Button>
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
              <TableHead>Nomi</TableHead>
              <TableHead>Kategoriya</TableHead>
              <TableHead>Qoldiq</TableHead>
              <TableHead>Narxi (kunlik)</TableHead>
              <TableHead>Holati</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Yuklanmoqda...
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Ma'lumot topilmadi.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category?.name || "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{item.total_qty - item.rented_qty} / {item.total_qty}</span>
                      <span className="text-[10px] text-muted-foreground">{item.unit}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("uz-UZ").format(item.daily_price)} so'm
                  </TableCell>
                  <TableCell>
                    <EquipmentStatusBadge status={item.status} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                          <Edit className="mr-2 h-4 w-4" /> Tahrirlash
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> O'chirish
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? "Buyumni tahrirlash" : "Yangi buyum qo'shish"}
            </DialogTitle>
            <DialogDescription>
              Buyum ma'lumotlarini kiriting va saqlash tugmasini bosing.
            </DialogDescription>
          </DialogHeader>
          <EquipmentForm
            initialData={selectedItem}
            categories={categories}
            onSuccess={() => {
              setIsFormOpen(false);
              fetchData();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
