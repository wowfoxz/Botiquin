'use client';

import { useState } from 'react';
import Link from 'next/link';
import { loginUser } from '@/app/actions';

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Limpiar error anterior
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      // Llamar a la acción del servidor para iniciar sesión
      await loginUser(formData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Credenciales no válidas.');
      } else {
        setError('Credenciales no válidas.');
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24" style={{ backgroundColor: 'var(--color-surface-secondary)' }}>
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="shadow-md rounded px-8 pt-6 pb-8 mb-4" style={{ backgroundColor: 'var(--color-surface-primary)' }}>
          <h1 className="text-3xl font-bold text-center mb-6" style={{ color: 'var(--color-text-primary)' }}>Iniciar Sesión</h1>

          {error && (
            <div className="mb-4 text-sm" style={{ color: 'var(--color-error)' }}>{error}</div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-primary)' }} htmlFor="email">
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              style={{
                backgroundColor: 'var(--color-surface-secondary)',
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border-primary)'
              }}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-primary)' }} htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              style={{
                backgroundColor: 'var(--color-surface-secondary)',
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border-primary)'
              }}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              style={{
                backgroundColor: 'var(--color-primary-soft-blue)',
                color: 'var(--color-text-inverse)'
              }}
            >
              Ingresar
            </button>
          </div>
        </form>

        <div className="text-center">
          <p style={{ color: 'var(--color-text-secondary)' }}>
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className="hover:underline" style={{ color: 'var(--color-primary-soft-blue)' }}>
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}