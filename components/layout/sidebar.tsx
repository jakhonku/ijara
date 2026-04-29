"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Wallet,
  AlertTriangle,
  Users,
  Boxes,
  BarChart3,
  Settings as SettingsIcon,
  HardHat,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    title: "Asosiy",
    items: [
      { href: "/", label: "Boshqaruv paneli", icon: LayoutDashboard },
      { href: "/rentals/new", label: "Yangi ijara", icon: PlusCircle },
    ],
  },
  {
    title: "Boshqaruv",
    items: [
      { href: "/rentals", label: "Ijaralar", icon: ClipboardList },
      { href: "/payments", label: "To'lovlar", icon: Wallet },
      { href: "/debtors", label: "Qarzdorlar", icon: AlertTriangle },
    ],
  },
  {
    title: "Ma'lumotlar",
    items: [
      { href: "/customers", label: "Mijozlar", icon: Users },
      { href: "/inventory", label: "Inventar", icon: Boxes },
      { href: "/reports", label: "Hisobotlar", icon: BarChart3 },
    ],
  },
];

const BOTTOM: NavItem[] = [
  { href: "/settings", label: "Sozlamalar", icon: SettingsIcon },
];

interface SidebarProps {
  onClose?: () => void;
  className?: string;
}

export function Sidebar({ onClose, className }: SidebarProps) {
  const pathname = usePathname() || "";

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside
      className={cn(
        "flex h-full w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar",
        className
      )}
    >
      <div className="flex h-16 items-center justify-between gap-2 border-b border-sidebar-border px-5">
        <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HardHat className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold">TechnaIjara</p>
            <p className="text-[10px] text-muted-foreground">Boshqaruv tizimi</p>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent md:hidden"
            aria-label="Yopish"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        {NAV.map((group) => (
          <div key={group.title} className="mb-5">
            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/80 hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-3">
        <ul className="space-y-0.5">
          {BOTTOM.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/80 hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
