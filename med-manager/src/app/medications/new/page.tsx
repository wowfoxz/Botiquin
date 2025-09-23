import { addMedication } from '@/app/actions';
import Link from 'next/link';
import React from 'react';

export default async function NewMedicationPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center p-24" style={{ backgroundColor: 'var(--color-surface-secondary)' }}>
        <div className="w-full max-w-lg">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Agregar Nuevo Medicamento</h1>
                <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                    o{' '}
                    <Link href="/medications/new/upload" className="hover:underline" style={{ color: 'var(--color-primary-soft-blue)' }}>
                        prueba a agregarlo con una foto
                    </Link>
                </p>
            </div>
            <form action={addMedication} className="shadow-md rounded px-8 pt-6 pb-8 mb-4" style={{ backgroundColor: 'var(--color-surface-primary)' }}>
                <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full px-3">
                        <label className="block uppercase tracking-wide text-xs font-bold mb-2" style={{ color: 'var(--color-text-primary)' }} htmlFor="commercialName">
                        Nombre Comercial
                        </label>
                        <input name="commercialName" defaultValue={resolvedSearchParams?.nombre_comercial as string ?? ''} className="appearance-none block w-full border rounded py-3 px-4 mb-3 leading-tight focus:outline-none" id="commercialName" type="text" placeholder="Ej: Paracetamol 500mg" required
                          style={{
                            backgroundColor: 'var(--color-surface-secondary)',
                            color: 'var(--color-text-primary)',
                            borderColor: 'var(--color-border-primary)'
                          }} />
                    </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full px-3">
                        <label className="block uppercase tracking-wide text-xs font-bold mb-2" style={{ color: 'var(--color-text-primary)' }} htmlFor="activeIngredient">
                        Principio Activo
                        </label>
                        <input name="activeIngredient" defaultValue={resolvedSearchParams?.principios_activos as string ?? ''} className="appearance-none block w-full border rounded py-3 px-4 mb-3 leading-tight focus:outline-none" id="activeIngredient" type="text" placeholder="Ej: Paracetamol"
                          style={{
                            backgroundColor: 'var(--color-surface-secondary)',
                            color: 'var(--color-text-primary)',
                            borderColor: 'var(--color-border-primary)'
                          }} />
                    </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                        <label className="block uppercase tracking-wide text-xs font-bold mb-2" style={{ color: 'var(--color-text-primary)' }} htmlFor="initialQuantity">
                        Cantidad Inicial
                        </label>
                        <input name="initialQuantity" defaultValue={resolvedSearchParams?.cantidad_inicial as string ?? ''} className="appearance-none block w-full border rounded py-3 px-4 leading-tight focus:outline-none" id="initialQuantity" type="number" step="any" required
                          style={{
                            backgroundColor: 'var(--color-surface-secondary)',
                            color: 'var(--color-text-primary)',
                            borderColor: 'var(--color-border-primary)'
                          }} />
                    </div>
                    <div className="w-full md:w-1/2 px-3">
                        <label className="block uppercase tracking-wide text-xs font-bold mb-2" style={{ color: 'var(--color-text-primary)' }} htmlFor="unit">
                        Unidad
                        </label>
                        <input name="unit" defaultValue={resolvedSearchParams?.unidad as string ?? ''} className="appearance-none block w-full border rounded py-3 px-4 leading-tight focus:outline-none" id="unit" type="text" placeholder="Ej: comprimidos, ml" required
                          style={{
                            backgroundColor: 'var(--color-surface-secondary)',
                            color: 'var(--color-text-primary)',
                            borderColor: 'var(--color-border-primary)'
                          }} />
                    </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full px-3">
                        <label className="block uppercase tracking-wide text-xs font-bold mb-2" style={{ color: 'var(--color-text-primary)' }} htmlFor="description">
                        Descripción (Para qué se usa)
                        </label>
                        <textarea name="description" defaultValue={resolvedSearchParams?.descripcion_uso as string ?? ''} className="appearance-none block w-full border rounded py-3 px-4 mb-3 leading-tight focus:outline-none" id="description" rows={3}
                          style={{
                            backgroundColor: 'var(--color-surface-secondary)',
                            color: 'var(--color-text-primary)',
                            borderColor: 'var(--color-border-primary)'
                          }}></textarea>
                    </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full px-3">
                        <label className="block uppercase tracking-wide text-xs font-bold mb-2" style={{ color: 'var(--color-text-primary)' }} htmlFor="intakeRecommendations">
                        Recomendaciones de Ingesta
                        </label>
                        <textarea name="intakeRecommendations" defaultValue={resolvedSearchParams?.recomendaciones_ingesta as string ?? ''} className="appearance-none block w-full border rounded py-3 px-4 mb-3 leading-tight focus:outline-none" id="intakeRecommendations" rows={3}
                          style={{
                            backgroundColor: 'var(--color-surface-secondary)',
                            color: 'var(--color-text-primary)',
                            borderColor: 'var(--color-border-primary)'
                          }}></textarea>
                    </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full px-3">
                        <label className="block uppercase tracking-wide text-xs font-bold mb-2" style={{ color: 'var(--color-text-primary)' }} htmlFor="expirationDate">
                        Fecha de Vencimiento
                        </label>
                        <input name="expirationDate" className="appearance-none block w-full border rounded py-3 px-4 leading-tight focus:outline-none" id="expirationDate" type="date" required
                          style={{
                            backgroundColor: 'var(--color-surface-secondary)',
                            color: 'var(--color-text-primary)',
                            borderColor: 'var(--color-border-primary)'
                          }} />
                        <p className="text-xs italic mt-2" style={{ color: 'var(--color-text-secondary)' }}>Este campo debes rellenarlo manualmente.</p>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <button className="font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit"
                      style={{
                        backgroundColor: 'var(--color-primary-soft-blue)',
                        color: 'var(--color-text-inverse)'
                      }}>
                        Guardar Medicamento
                    </button>
                </div>
            </form>
        </div>
    </main>
  );
}
