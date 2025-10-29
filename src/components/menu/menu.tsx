"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { config } from "@/lib/config";
import { logoutUser } from "@/app/actions";
import { usePathname } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { 
  Home, 
  Package, 
  Calendar, 
  ShoppingCart, 
  Settings, 
  LogOut
} from "lucide-react";

const Menu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();

  // Determinar si estamos en una página de autenticación
  const basePath = config.BASE_PATH;
  const isAuthPage = pathname === `${basePath}/login` || 
                     pathname === `${basePath}/register` ||
                     pathname === '/login' || 
                     pathname === '/register';

  // ✅ HOOKS - Siempre llamar en el mismo orden
  // Función para verificar manualmente la autenticación
  const checkAuth = React.useCallback(async () => {
    // No verificar autenticación si estamos en una página de auth
    if (isAuthPage) {
      return;
    }
    
    try {
      const response = await apiFetch("/api/auth", { method: "GET" });
      setIsAuthenticated(response.ok);
    } catch (error) {
      console.error("Error al verificar autenticación:", error);
      setIsAuthenticated(false);
    }
  }, [isAuthPage]);

  useEffect(() => {
    // Solo verificar auth si NO estamos en páginas de autenticación
    if (!isAuthPage) {
      checkAuth();

      // Escuchar el evento de inicio de sesión
      const handleUserLogin = () => {
        checkAuth();
      };

      window.addEventListener('user-login', handleUserLogin);

      return () => {
        window.removeEventListener('user-login', handleUserLogin);
      };
    }
  }, [pathname, isAuthPage, checkAuth]); // Volver a verificar cuando cambia la ruta

  // ✅ Agregar padding-left al body cuando el usuario está autenticado para evitar que elementos queden detrás del botón
  useEffect(() => {
    if (isAuthenticated && !isAuthPage) {
      document.body.style.paddingLeft = '70px'; // Espacio para el botón del menú
    } else {
      document.body.style.paddingLeft = '0';
    }

    // Cleanup al desmontar
    return () => {
      document.body.style.paddingLeft = '0';
    };
  }, [isAuthenticated, isAuthPage]);

  // No mostrar el menú en páginas de autenticación
  if (isAuthPage) {
    return null; // No renderizar el menú en páginas de auth
  }
 
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Función para manejar el clic en los enlaces de navegación
  const handleNavigation = () => {
    closeMenu();
  };

  const menuItems = [
    { name: "Inicio", href: "/inicio", icon: Home },
    { name: "Botiquín", href: "/botiquin", icon: Package },
    { name: "Tratamientos", href: "/tratamientos", icon: Calendar },
    { name: "Lista de Compras", href: "/lista-compras", icon: ShoppingCart },
    { name: "Configuración", href: "/configuracion", icon: Settings },
  ];

  return (
    <>
      {/* Mostrar el botón solo cuando el menú está cerrado y el usuario está autenticado */}
      {!isMenuOpen && isAuthenticated && (
        <button
          onClick={toggleMenu}
          className="fixed top-4 left-4 z-50 p-2 rounded-md shadow-lg focus:outline-none"
          style={{
            backgroundColor: "var(--color-primary-soft-blue)",
            color: "var(--color-primary-foreground)",
          }}
          aria-label="Abrir menú"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}

      <AnimatePresence>
        {isMenuOpen && isAuthenticated && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
              onClick={closeMenu}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full w-64 shadow-xl z-50 p-4"
              style={{ backgroundColor: "var(--background)" }}
            >
              <div className="flex justify-center items-center w-full">
                {/* Logo de la aplicación */}
                <div className="h-25 w-full relative">
                  <Image
                    src={`${config.BASE_PATH}/Botilyx_color_2.svg`}
                    alt="Logo de Botilyx"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div
                style={{
                  borderTop: "1px solid var(--border)",
                  margin: "1rem 0",
                }}
              ></div>
              <nav>
                <ul className="space-y-2">
                  {menuItems.map((item, index) => (
                    <motion.li
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="rounded-md"
                      style={{ backgroundColor: "var(--muted)" }}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 py-3 px-4 rounded-md transition-colors duration-200 hover:bg-opacity-80"
                        style={{ color: "var(--foreground)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "var(--color-primary-soft-blue)";
                          e.currentTarget.style.color =
                            "var(--color-primary-foreground)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "";
                          e.currentTarget.style.color = "var(--foreground)";
                        }}
                        onClick={handleNavigation}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span>{item.name}</span>
                      </Link>
                    </motion.li>
                  ))}
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: menuItems.length * 0.1 }}
                    className="rounded-md"
                    style={{ backgroundColor: "var(--muted)" }}
                  >
                    <form action={logoutUser} className="w-full">
                      <button
                        type="submit"
                        className="flex items-center gap-3 w-full text-left py-3 px-4 rounded-md transition-colors duration-200 hover:bg-opacity-80"
                        style={{ color: "var(--foreground)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "var(--destructive)";
                          e.currentTarget.style.color =
                            "var(--destructive-foreground)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "";
                          e.currentTarget.style.color = "var(--foreground)";
                        }}
                      >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </form>
                  </motion.li>
                </ul>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Menu;
