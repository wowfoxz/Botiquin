'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { User } from 'lucide-react';

interface Consumidor {
  id: string;
  name: string;
  tipo: "usuario" | "perfil";
  rol?: string;
  foto?: string;
}

interface RadialAvatarSelectorProps {
  consumidores: Consumidor[];
  onSelect: (consumidorId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  buttonPosition: { x: number; y: number };
}

const RadialAvatarSelector: React.FC<RadialAvatarSelectorProps> = ({
  consumidores,
  onSelect,
  isOpen,
  onClose,
  buttonPosition,
}) => {
  const [hoveredAvatar, setHoveredAvatar] = useState<string | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'entering' | 'visible' | 'exiting' | 'selecting'>('entering');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const avatarRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Calcular posiciones de los avatares en círculo
  const getAvatarPosition = (index: number, total: number) => {
    if (total === 1) {
      return { x: 0, y: 0 };
    }
    
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2; // Empezar desde arriba
    const radius = 80; // Radio del círculo
    
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  // ✅ Detectar qué avatar está bajo el cursor/dedo durante el arrastre
  const getAvatarUnderPosition = (x: number, y: number): string | null => {
    for (const [id, element] of avatarRefs.current.entries()) {
      if (!element) continue;
      
      const rect = element.getBoundingClientRect();
      if (
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom
      ) {
        return id;
      }
    }
    return null;
  };

  // Manejar la animación de entrada
  useEffect(() => {
    if (isOpen) {
      setAnimationPhase('entering');
      // Después de un breve delay, cambiar a visible
      const timer = setTimeout(() => {
        setAnimationPhase('visible');
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimationPhase('exiting');
    }
  }, [isOpen]);

  const handleAvatarClick = (consumidorId: string) => {
    setSelectedAvatarId(consumidorId);
    setAnimationPhase('selecting');
    
    // Esperar a que termine la animación antes de ejecutar la acción
    setTimeout(() => {
      onSelect(consumidorId);
      onClose();
    }, 300); // Duración de la animación de selección
  };

  // ✅ MOUSE: Press (iniciar arrastre)
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMouseDown(true);
    setDragPosition({ x: e.clientX, y: e.clientY });
  };

  // ✅ MOUSE: Drag (arrastrar y detectar avatar bajo cursor)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown) return;
    
    e.preventDefault();
    setDragPosition({ x: e.clientX, y: e.clientY });
    
    // Detectar qué avatar está bajo el cursor
    const avatarId = getAvatarUnderPosition(e.clientX, e.clientY);
    setHoveredAvatar(avatarId);
  };

  // ✅ MOUSE: Release (soltar y seleccionar avatar si está sobre uno)
  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMouseDown(false);
    setDragPosition(null);
    
    // Detectar qué avatar está bajo el cursor al soltar
    const avatarId = getAvatarUnderPosition(e.clientX, e.clientY);
    
    if (avatarId) {
      // Seleccionar el avatar
      handleAvatarClick(avatarId);
    } else {
      // Si no hay avatar bajo el cursor, cerrar el selector
      onClose();
    }
  };

  const handleMouseLeave = () => {
    // No cerrar automáticamente al salir del área
    // Permitir que el usuario mantenga el selector abierto
  };

  // ✅ TOUCH: Press (iniciar arrastre)
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsMouseDown(true);
    
    const touch = e.touches[0];
    setDragPosition({ x: touch.clientX, y: touch.clientY });
  };

  // ✅ TOUCH: Drag (arrastrar y detectar avatar bajo dedo)
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMouseDown) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    setDragPosition({ x: touch.clientX, y: touch.clientY });
    
    // Detectar qué avatar está bajo el dedo
    const avatarId = getAvatarUnderPosition(touch.clientX, touch.clientY);
    setHoveredAvatar(avatarId);
  };

  // ✅ TOUCH: Release (soltar y seleccionar avatar si está sobre uno)
  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsMouseDown(false);
    
    // Usar la última posición conocida del dedo
    if (dragPosition) {
      const avatarId = getAvatarUnderPosition(dragPosition.x, dragPosition.y);
      
      if (avatarId) {
        // Seleccionar el avatar
        handleAvatarClick(avatarId);
      } else {
        // Si no hay avatar bajo el dedo, cerrar el selector
        onClose();
      }
    } else {
      onClose();
    }
    
    setDragPosition(null);
  };

  // Cerrar si se hace clic/toque fuera del contenedor
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  console.log('RadialAvatarSelector render:', { isOpen, consumidores: consumidores.length, buttonPosition });
  
  if (!isOpen || consumidores.length === 0) {
    console.log('RadialAvatarSelector: No renderizando - isOpen:', isOpen, 'consumidores:', consumidores.length);
    return null;
  }

  return (
    <TooltipProvider>
      <div
        ref={containerRef}
        className="fixed inset-0 z-50"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: `${buttonPosition.x}px`,
            top: `${buttonPosition.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Avatares en círculo */}
          {consumidores.map((consumidor, index) => {
            const position = getAvatarPosition(index, consumidores.length);
            
            // Calcular propiedades de animación basadas en la fase
            const getAnimationStyles = () => {
              const isSelected = selectedAvatarId === consumidor.id;
              
              switch (animationPhase) {
                case 'entering':
                  return {
                    transform: `translate(0px, 0px) scale(0.3)`,
                    opacity: 0,
                    transitionDelay: `${index * 80}ms`,
                  };
                case 'visible':
                  return {
                    transform: `translate(${position.x}px, ${position.y}px) scale(1)`,
                    opacity: 1,
                    transitionDelay: `${index * 80}ms`,
                  };
                case 'selecting':
                  if (isSelected) {
                    // Avatar seleccionado: animar hacia el centro con escala mayor
                    return {
                      transform: `translate(0px, 0px) scale(1.2)`,
                      opacity: 1,
                      transitionDelay: '0ms',
                      zIndex: 20,
                    };
                  } else {
                    // Otros avatares: desvanecer rápidamente
                    return {
                      transform: `translate(${position.x}px, ${position.y}px) scale(0.8)`,
                      opacity: 0.3,
                      transitionDelay: '0ms',
                    };
                  }
                case 'exiting':
                  return {
                    transform: `translate(${position.x}px, ${position.y}px) scale(0.3)`,
                    opacity: 0,
                    transitionDelay: `${index * 30}ms`,
                  };
                default:
                  return {};
              }
            };
            
            return (
              <Tooltip key={consumidor.id}>
                <TooltipTrigger asChild>
                  <div
                    ref={(el) => {
                      if (el) {
                        avatarRefs.current.set(consumidor.id, el);
                      } else {
                        avatarRefs.current.delete(consumidor.id);
                      }
                    }}
                    className={`absolute cursor-pointer transform hover:scale-110 ${
                      hoveredAvatar === consumidor.id ? 'z-10 scale-125' : 'z-0'
                    } ${
                      animationPhase === 'selecting' 
                        ? 'transition-all duration-300 ease-in-out' 
                        : 'transition-all duration-500 ease-out'
                    }`}
                    style={getAnimationStyles()}
                  >
                    <Avatar className={`w-16 h-16 bg-white ${
                      animationPhase === 'selecting' && selectedAvatarId === consumidor.id
                        ? 'shadow-[0_20px_50px_rgba(0,0,0,0.3)]'
                        : 'shadow-xl'
                    }`}>
                      <AvatarImage 
                        src={consumidor.foto || ''} 
                        alt={consumidor.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gray-100 text-gray-600 flex items-center justify-center">
                        <User className="w-8 h-8" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-gray-900 text-white">
                  <p className="font-medium">{consumidor.name}</p>
                  {consumidor.rol && (
                    <p className="text-xs text-gray-300">{consumidor.rol}</p>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
          
          {/* Botón central (para referencia visual) */}
          <div className="w-8 h-8 bg-blue-500 rounded-full shadow-xl border-2 border-white flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full opacity-80" />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default RadialAvatarSelector;
