"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ServerActionButtonProps {
  action: () => Promise<void>;
  children: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  disabled?: boolean;
}

export function ServerActionButton({
  action,
  children,
  variant = "default",
  size = "default",
  className,
  disabled = false,
}: ServerActionButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await action();
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={disabled || isPending}
      onClick={handleClick}
    >
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Procesando...
        </>
      ) : (
        children
      )}
    </Button>
  );
}
