"use client";

import * as React from "react";

interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, ...props }, ref) => {
    if (!React.isValidElement(children)) return null;
    const child = children as React.ReactElement<Record<string, unknown>>;
    const childProps = (child.props ?? {}) as Record<string, unknown>;

    return React.cloneElement(child, {
      ...props,
      ...childProps,
      ref,
      className: [
        (props as Record<string, unknown>).className as string | undefined,
        childProps.className as string | undefined,
      ]
        .filter(Boolean)
        .join(" "),
    } as Record<string, unknown>);
  }
);
Slot.displayName = "Slot";
