import { Badge } from "@/components/ui/badge";
import type { RentalStatus, EquipmentStatus } from "@/types/database";

const RENTAL_LABELS: Record<RentalStatus, { label: string; variant: "default" | "success" | "destructive" | "warning" | "secondary" }> = {
  active: { label: "Faol", variant: "default" },
  closed: { label: "Yopilgan", variant: "secondary" },
  overdue: { label: "Muddati o'tgan", variant: "destructive" },
};

const EQUIPMENT_LABELS: Record<EquipmentStatus, { label: string; variant: "default" | "success" | "destructive" | "warning" | "secondary" }> = {
  active: { label: "Faol", variant: "success" },
  maintenance: { label: "Ta'mirda", variant: "warning" },
  archived: { label: "Arxiv", variant: "secondary" },
};

export function RentalStatusBadge({
  status,
  isOverdue,
}: {
  status: RentalStatus;
  isOverdue?: boolean;
}) {
  const effective: RentalStatus = isOverdue && status === "active" ? "overdue" : status;
  const cfg = RENTAL_LABELS[effective];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export function EquipmentStatusBadge({ status }: { status: EquipmentStatus }) {
  const cfg = EQUIPMENT_LABELS[status];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Naqd",
  card: "Karta",
  click: "Click",
  payme: "Payme",
  bank: "Bank",
  other: "Boshqa",
};

export function PaymentMethodBadge({ method }: { method: string }) {
  return <Badge variant="secondary">{PAYMENT_METHOD_LABELS[method] ?? method}</Badge>;
}
