-- CreateTable
CREATE TABLE "Historial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "tipoAccion" TEXT NOT NULL,
    "entidadTipo" TEXT NOT NULL,
    "entidadId" TEXT,
    "datosPrevios" TEXT,
    "datosPosteriores" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Historial_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Historial_usuarioId_idx" ON "Historial"("usuarioId");

-- CreateIndex
CREATE INDEX "Historial_tipoAccion_idx" ON "Historial"("tipoAccion");

-- CreateIndex
CREATE INDEX "Historial_entidadTipo_entidadId_idx" ON "Historial"("entidadTipo", "entidadId");

-- CreateIndex
CREATE INDEX "Historial_createdAt_idx" ON "Historial"("createdAt");
