'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface PressButtonProps {
  children: React.ReactNode;
  onPress: (event: React.MouseEvent & { buttonPosition?: { x: number; y: number } }) => void;
  onRelease?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const PressButton: React.FC<PressButtonProps> = ({
  children,
  onPress,
  onRelease,
  disabled = false,
  className = "",
  variant = "default",
  size = "default",
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseDown = (event: React.MouseEvent) => {
    if (disabled) return;
    
    event.preventDefault();
    setIsPressed(true);
    
    // Obtener posición del botón
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      setButtonPosition({ x: centerX, y: centerY });
    }

    // Ejecutar onPress inmediatamente para abrir el selector
    const customEvent = {
      ...event,
      buttonPosition: buttonRef.current ? {
        x: buttonRef.current.getBoundingClientRect().left + buttonRef.current.getBoundingClientRect().width / 2,
        y: buttonRef.current.getBoundingClientRect().top + buttonRef.current.getBoundingClientRect().height / 2
      } : { x: 0, y: 0 }
    };
    onPress(customEvent);
  };

  const handleMouseUp = (event: React.MouseEvent) => {
    if (disabled) return;
    
    event.preventDefault();
    setIsPressed(false);
    
    // NO llamar onRelease aquí - el selector se cierra solo cuando se selecciona un avatar
  };

  const handleMouseLeave = (event: React.MouseEvent) => {
    if (disabled) return;
    
    event.preventDefault();
    setIsPressed(false);
    
    // NO llamar onRelease aquí - permitir que el usuario mantenga el selector abierto
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    if (disabled) return;
    
    event.preventDefault();
    setIsPressed(true);
    
    // Obtener posición del botón
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      setButtonPosition({ x: centerX, y: centerY });
    }

    // Crear un evento similar al mouse para compatibilidad
    const mouseEvent = {
      preventDefault: () => event.preventDefault(),
      stopPropagation: () => event.stopPropagation(),
      buttonPosition: buttonRef.current ? {
        x: buttonRef.current.getBoundingClientRect().left + buttonRef.current.getBoundingClientRect().width / 2,
        y: buttonRef.current.getBoundingClientRect().top + buttonRef.current.getBoundingClientRect().height / 2
      } : { x: 0, y: 0 }
    } as React.MouseEvent & { buttonPosition?: { x: number; y: number } };
    
    onPress(mouseEvent);
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (disabled) return;
    
    event.preventDefault();
    setIsPressed(false);
    
    // NO llamar onRelease aquí - el selector se cierra solo cuando se selecciona un avatar
  };

  // Limpiar timeout si el componente se desmonta
  useEffect(() => {
    return () => {
      if (pressTimeoutRef.current) {
        clearTimeout(pressTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Button
      ref={buttonRef}
      variant={variant}
      size={size}
      disabled={disabled}
      className={`transition-all duration-100 ${
        isPressed ? 'scale-95 shadow-inner' : 'scale-100 shadow-md'
      } ${className}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </Button>
  );
};

export default PressButton;
