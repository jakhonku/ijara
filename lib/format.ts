const TZ = "Asia/Tashkent";

export function formatUZS(value: number | string | null | undefined): string {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return "0 so'm";
  const formatted = new Intl.NumberFormat("uz-UZ", {
    maximumFractionDigits: 0,
  })
    .format(Math.round(n))
    .replace(/,/g, " ");
  return `${formatted} so'm`;
}

export function formatNumber(value: number | string | null | undefined): string {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return "0";
  return new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 0 })
    .format(n)
    .replace(/,/g, " ");
}

function toDate(d: string | Date | null | undefined): Date | null {
  if (!d) return null;
  const date = typeof d === "string" ? new Date(d) : d;
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(d: string | Date | null | undefined): string {
  const date = toDate(d);
  if (!date) return "—";
  return new Intl.DateTimeFormat("uz-UZ", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(date)
    .replace(/\//g, ".");
}

export function formatDateTime(d: string | Date | null | undefined): string {
  const date = toDate(d);
  if (!date) return "—";
  const day = new Intl.DateTimeFormat("uz-UZ", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(date)
    .replace(/\//g, ".");
  const time = new Intl.DateTimeFormat("uz-UZ", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return `${day} ${time}`;
}

export function todayISO(): string {
  const d = new Date();
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(d);
}

export function addDaysISO(base: string, days: number): string {
  const [y, m, d] = base.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function diffDays(a: string | Date, b: string | Date): number {
  const da = toDate(a);
  const db = toDate(b);
  if (!da || !db) return 0;
  const ms = db.getTime() - da.getTime();
  return Math.ceil(ms / 86400000);
}

export function startOfMonthISO(d?: Date): string {
  const date = d ?? new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

export function startOfDayISO(d?: Date): string {
  const date = d ?? new Date();
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
