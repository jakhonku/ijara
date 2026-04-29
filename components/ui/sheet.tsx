"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  side: "left" | "right";
}

const SheetContext = React.createContext<SheetContextValue | null>(null);

interface SheetProps {
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  side?: "left" | "right";
  children: React.ReactNode;
}

export function Sheet({
  open: openProp,
  onOpenChange,
  side = "right",
  children,
}: SheetProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = (v: boolean) => {
    setInternalOpen(v);
    onOpenChange?.(v);
  };
  return (
    <SheetContext.Provider value={{ open, setOpen, side }}>
      {children}
    </SheetContext.Provider>
  );
}

export function SheetTrigger({
  asChild,
  children,
}: {
  asChild?: boolean;
  children: React.ReactElement;
}) {
  const ctx = React.useContext(SheetContext);
  if (!ctx) throw new Error("SheetTrigger must be inside Sheet");
  const onClick = () => ctx.setOpen(true);
  if (asChild) {
    return React.cloneElement(
      children as React.ReactElement<{ onClick?: () => void }>,
      { onClick }
    );
  }
  return <button onClick={onClick}>{children}</button>;
}

export function SheetContent({
  children,
  className,
  side: sideProp,
}: {
  children: React.ReactNode;
  className?: string;
  side?: "left" | "right";
}) {
  const ctx = React.useContext(SheetContext);
  if (!ctx) throw new Error("SheetContent must be inside Sheet");
  const side = sideProp ?? ctx.side;
  React.useEffect(() => {
    if (!ctx.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") ctx.setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [ctx]);

  if (!ctx.open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 animate-in fade-in"
        onClick={() => ctx.setOpen(false)}
      />
      <div
        className={cn(
          "absolute top-0 bottom-0 flex flex-col bg-background shadow-xl w-full sm:max-w-md",
          side === "right"
            ? "right-0 animate-in slide-in-from-right"
            : "left-0 animate-in slide-in-from-left",
          className
        )}
      >
        <button
          aria-label="Yopish"
          onClick={() => ctx.setOpen(false)}
          className="absolute right-3 top-3 z-10 rounded-md p-1 text-muted-foreground hover:bg-accent"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6 border-b", className)}
      {...props}
    />
  );
}

export function SheetFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-row justify-end gap-2 p-6 border-t mt-auto",
        className
      )}
      {...props}
    />
  );
}

export function SheetTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold", className)} {...props} />;
}

export function SheetDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function useSheet() {
  const ctx = React.useContext(SheetContext);
  if (!ctx) throw new Error("useSheet must be inside Sheet");
  return ctx;
}
