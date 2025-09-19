'use client';

import React, { useEffect, useRef } from 'react';
import lottie, { AnimationItem } from 'lottie-web';
import Link from 'next/link';

const Custom404 = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let anim: AnimationItem | null = null;
    let mounted = true;

    (async () => {
      try {
        // Cargar el archivo JSON de animación directamente desde public
        const response = await fetch('/animation/Caveman-404Page.json');
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-2xl flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 text-center">
          ¡Oops! Página no encontrada
        </h1>
        <p className="text-gray-600 text-center max-w-md mb-8">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
      </div>
      <div ref={containerRef} className="w-full max-w-lg h-full max-h-lg" />
      <div className="w-full max-w-2xl flex flex-col items-center mt-8">
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300 font-medium"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default Custom404;