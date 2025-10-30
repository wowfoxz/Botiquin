'use client';

import React, { useEffect, useRef } from 'react';
import lottie, { AnimationItem } from 'lottie-web';
import Link from 'next/link';
import { config } from '@/lib/config';

const Custom404 = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let anim: AnimationItem | null = null;
    let mounted = true;

    (async () => {
      try {
        // Cargar el archivo JSON de animación directamente desde public
        const response = await fetch(`${config.BASE_PATH}/animation/Caveman-404Page.json`);
        const animationData = await response.json();

        if (!mounted || !containerRef.current) return;

        anim = lottie.loadAnimation({
          container: containerRef.current,
          animationData: animationData,
          loop: true,
          autoplay: true,
        });
      } catch (err) {
        // Optional: log the error for debugging
        console.error('Failed to load Lottie animation:', err);
      }
    })();

    return () => {
      mounted = false;
      if (anim) {
        anim.destroy();
      }
    };
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="w-full max-w-2xl flex flex-col items-center">
        <h1
          className="text-3xl md:text-4xl font-bold mb-4 text-center"
          style={{ color: 'var(--foreground)' }}
        >
          ¡Oops! Página no encontrada
        </h1>
        <p
          className="text-center max-w-md mb-8 text-muted-foreground"
        >
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
      </div>
      <div ref={containerRef} className="w-full max-w-lg h-full max-h-lg" />
      <div className="w-full max-w-2xl flex flex-col items-center mt-8">
        <Link
          href="/"
          className="px-6 py-3 rounded-md transition-colors duration-300 font-medium bg-[var(--color-primary-soft-blue)] text-[var(--color-primary-foreground)] hover:opacity-90"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default Custom404;