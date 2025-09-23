'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { logoutUser } from '@/app/actions';

const Menu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // This is just to ensure the component is mounted
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const menuItems = [
    { name: 'Inicio', href: '/' },
    { name: 'Botiquín', href: '/botiquin' },
    { name: 'Tratamientos', href: '/tratamientos' },
    { name: 'Precios', href: '/precios' },
    { name: 'Configuración', href: '/configuracion' },
  ];

  return (
    <>
      {/* Mostrar el botón solo cuando el menú está cerrado */}
      {!isMenuOpen && (
        <button
          onClick={toggleMenu}
          className="fixed top-4 left-4 z-50 p-2 rounded-md shadow-lg focus:outline-none"
          style={{
            backgroundColor: 'var(--color-primary-soft-blue)',
            color: 'var(--color-text-inverse)'
          }}
          aria-label="Abrir menú"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
              onClick={closeMenu}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full w-64 shadow-xl z-50 p-4"
              style={{ backgroundColor: 'var(--color-surface-secondary)' }}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Menú</h2>
                <button
                  onClick={closeMenu}
                  className="p-2 rounded-md focus:outline-none"
                  style={{ backgroundColor: 'var(--color-surface-tertiary)' }}
                  aria-label="Cerrar menú"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav>
                <ul className="space-y-2">
                  {menuItems.map((item, index) => (
                    <motion.li
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="rounded-md"
                      style={{ backgroundColor: 'var(--color-surface-tertiary)' }}
                    >
                      <Link href={item.href} className="block py-2 px-4"
                        style={{ color: 'var(--color-text-primary)' }}>
                        {item.name}
                      </Link>
                    </motion.li>
                  ))}
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: menuItems.length * 0.1 }}
                    className="rounded-md"
                    style={{ backgroundColor: 'var(--color-surface-tertiary)' }}
                  >
                    <form action={logoutUser} className="w-full">
                      <button
                        type="submit"
                        className="w-full text-left py-2 px-4 rounded-md transition-colors"
                        style={{ color: 'var(--color-text-primary)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-error)';
                          e.currentTarget.style.color = 'var(--color-text-inverse)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '';
                          e.currentTarget.style.color = 'var(--color-text-primary)';
                        }}
                      >
                        Cerrar Sesión
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