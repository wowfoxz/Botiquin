"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Trash2, Shield, Info } from "lucide-react";

interface AdvancedConfirmationModalProps {
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  itemName: string;
  itemType: string;
  trigger?: React.ReactNode;
  variant?: "default" | "destructive" | "warning";
  confirmationText?: string;
}

export function AdvancedConfirmationModal({
  onConfirm,
  title,
  description,
  itemName,
  itemType,
  trigger,
  variant = "destructive",
  confirmationText = "ELIMINAR",
}: AdvancedConfirmationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (userInput !== confirmationText) {
      return;
    }

    setIsDeleting(true);
    try {
      await onConfirm();
      setIsOpen(false);
      setUserInput("");
    } catch (error) {
      console.error("Error al ejecutar acción:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setUserInput("");
  };

  const getIcon = () => {
    switch (variant) {
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-[var(--color-warning)]" />;
      case "destructive":
        return <Trash2 className="w-5 h-5 text-destructive" />;
      default:
        return <Shield className="w-5 h-5 text-primary" />;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "warning":
        return {
          titleColor: "text-[var(--color-warning)]",
          borderColor: "border-[var(--color-warning)]/20",
          bgColor: "bg-[var(--color-warning)]/10",
          textColor: "text-[var(--color-warning)]",
        };
      case "destructive":
        return {
          titleColor: "text-destructive",
          borderColor: "border-destructive/20",
          bgColor: "bg-destructive/10",
          textColor: "text-destructive",
        };
      default:
        return {
          titleColor: "text-primary",
          borderColor: "border-primary/20",
          bgColor: "bg-primary/10",
          textColor: "text-primary",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            variant={variant === "destructive" ? "outline" : variant === "warning" ? "secondary" : variant} 
            size="sm" 
            className={variant === "destructive" ? "text-destructive hover:text-destructive" : ""}
          >
            {getIcon()}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${styles.titleColor}`}>
            {getIcon()}
            {title}
          </DialogTitle>
          <DialogDescription className="text-left">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className={`${styles.bgColor} ${styles.borderColor} border rounded-lg p-4`}>
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div className="space-y-2">
                <p className={`text-sm font-medium ${styles.textColor}`}>
                  ¿Estás seguro de que quieres eliminar &quot;{itemName}&quot;?
                </p>
                <p className="text-xs text-muted-foreground">
                  Esta acción afectará el {itemType} y no se puede deshacer.
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Se eliminarán todos los datos asociados</li>
                  <li>• Esta acción se registrará en el historial</li>
                  <li>• No se podrá recuperar la información</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmation">
              Escribe <span className="font-mono font-bold">{confirmationText}</span> para confirmar:
            </Label>
            <Input
              id="confirmation"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={confirmationText}
              className="font-mono"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={userInput !== confirmationText || isDeleting}
            className="flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                {getIcon()}
                Confirmar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
