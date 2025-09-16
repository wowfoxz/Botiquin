import { addMedication } from '@/app/actions';
import Link from 'next/link';
import React from 'react';

export default function NewMedicationPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-50">
        <div className="w-full max-w-lg">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold">Agregar Nuevo Medicamento</h1>
                <p className="text-gray-600 mt-2">
                    o{' '}
                    <Link href="/medications/new/upload" className="text-blue-500 hover:underline">
                        prueba a agregarlo con una foto
                    </Link>
                </p>
            </div>
            <form action={addMedication} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full px-3">
                        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="commercialName">
                        Nombre Comercial
                        </label>
                        <input name="commercialName" defaultValue={searchParams?.nombre_comercial as string ?? ''} className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white" id="commercialName" type="text" placeholder="Ej: Paracetamol 500mg" required />
                    </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full px-3">
                        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="activeIngredient">
                        Principio Activo
                        </label>
                        <input name="activeIngredient" defaultValue={searchParams?.principios_activos as string ?? ''} className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white" id="activeIngredient" type="text" placeholder="Ej: Paracetamol" />
                    </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="initialQuantity">
                        Cantidad Inicial
                        </label>
                        <input name="initialQuantity" defaultValue={searchParams?.cantidad_inicial as string ?? ''} className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white" id="initialQuantity" type="number" step="any" required />
                    </div>
                    <div className="w-full md:w-1/2 px-3">
                        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="unit">
                        Unidad
                        </label>
                        <input name="unit" defaultValue={searchParams?.unidad as string ?? ''} className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white" id="unit" type="text" placeholder="Ej: comprimidos, ml" required />
                    </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full px-3">
                        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="description">
                        Descripción (Para qué se usa)
                        </label>
                        <textarea name="description" defaultValue={searchParams?.descripcion_uso as string ?? ''} className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white" id="description" rows={3}></textarea>
                    </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full px-3">
                        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="intakeRecommendations">
                        Recomendaciones de Ingesta
                        </label>
                        <textarea name="intakeRecommendations" defaultValue={searchParams?.recomendaciones_ingesta as string ?? ''} className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white" id="intakeRecommendations" rows={3}></textarea>
                    </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full px-3">
                        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="expirationDate">
                        Fecha de Vencimiento
                        </label>
                        <input name="expirationDate" className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white" id="expirationDate" type="date" required />
<<<<<<< HEAD
                        <p className="text-gray-600 text-xs italic mt-2">Este campo debes rellenarlo manualmente.</p>
=======
                        <p className="text-gray-600 text-xs italic mt-2">Este campo debes rellenarlo manually.</p>
>>>>>>> main
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                        Guardar Medicamento
                    </button>
                </div>
            </form>
        </div>
    </main>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> main
