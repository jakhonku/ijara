"use client";

import * as React from "react";
import {
  Users,
  Boxes,
  ClipboardList,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  User,
} from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Du", value: 1200000 },
  { name: "Se", value: 2100000 },
  { name: "Ch", value: 1800000 },
  { name: "Pa", value: 2400000 },
  { name: "Ju", value: 3200000 },
  { name: "Sh", value: 2800000 },
  { name: "Ya", value: 1500000 },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    maximumFractionDigits: 0,
  }).format(value);
};

export default function DashboardPage() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Xush kelibsiz!</h1>
        <p className="text-muted-foreground">Bugun tizimdagi asosiy ko'rsatkichlar.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Faol ijaralar"
          value="24"
          icon={ClipboardList}
          hint={
            <span className="flex items-center gap-1 text-success">
              <ArrowUpRight className="h-3 w-3" /> 12% o'sish
            </span>
          }
        />
        <StatCard
          label="Mijozlar"
          value="148"
          icon={Users}
          hint="Jami ro'yxatga olinganlar"
        />
        <StatCard
          label="Inventar qoldig'i"
          value="85%"
          icon={Boxes}
          tone="warning"
          hint="15 dona ijarada"
        />
        <StatCard
          label="Kunlik tushum"
          value={formatCurrency(4500000)}
          icon={Wallet}
          tone="success"
          hint={
            <span className="flex items-center gap-1 text-destructive">
              <ArrowDownRight className="h-3 w-3" /> 5% kamayish
            </span>
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Haftalik tushum</CardTitle>
                <CardDescription>Oxirgi 7 kundagi daromad statistikasi</CardDescription>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(value) => `${value / 1000000}M`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                      formatter={(value: number) => [formatCurrency(value), "Tushum"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full bg-muted animate-pulse rounded-md" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Oxirgi harakatlar</CardTitle>
            <CardDescription>Yaqinda amalga oshirilgan ijaralar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Alisher Navoiy", item: "Perforator Bosch", date: "Bugun, 10:45" },
                { name: "Islom Karimov", item: "Beton qorgich", date: "Bugun, 09:20" },
                { name: "Zuhra Akmalova", item: "Lazer sath o'lchagich", date: "Kecha, 17:30" },
                { name: "Murod Shokirov", item: "Silliqlash mashinasi", date: "Kecha, 15:15" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.item}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{item.date}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
