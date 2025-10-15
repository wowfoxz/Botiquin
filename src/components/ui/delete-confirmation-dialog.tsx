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
import { AlertTriangle, Trash2 } from "lucide-react";

interface DeleteConfirmationDialogProps {
  onConfirm: () => void;
  title: string;
  description: string;
  itemName: string;
  trigger?: React.ReactNode;
}

export function DeleteConfirmationDialog({
  onConfirm,
  title,
  description,
  itemName,
  trigger,
}: DeleteConfirmationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (confirmationText !== "ELIMINAR") {
      return;
    }

    setIsDeleting(true);
    try {
      await onConfirm();
      setIsOpen(false);
      setConfirmationText("");
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setConfirmationText("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-left">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <p className="text-sm font-medium text-destructive">
              ¿Estás seguro de que quieres eliminar "{itemName}"?
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Esta acción no se puede deshacer.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmation">
              Escribe <span className="font-mono font-bold">ELIMINAR</span> para confirmar:
            </Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="ELIMINAR"
              className="font-mono"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={confirmationText !== "ELIMINAR" || isDeleting}
            className="flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Eliminar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
