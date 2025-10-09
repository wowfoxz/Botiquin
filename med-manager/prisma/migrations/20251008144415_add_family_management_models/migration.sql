/*
  Warnings:

  - Added the required column `dni` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fechaNacimiento` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "GrupoFamiliar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "creadorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GrupoFamiliar_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PerfilMenor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "fechaNacimiento" DATETIME NOT NULL,
    "foto" TEXT,
    "grupoId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PerfilMenor_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "GrupoFamiliar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Toma" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "medicamentoId" TEXT NOT NULL,
    "consumidorUsuarioId" TEXT,
    "consumidorPerfilId" TEXT,
    "registranteId" TEXT NOT NULL,
    "fechaHora" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grupoId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Toma_medicamentoId_fkey" FOREIGN KEY ("medicamentoId") REFERENCES "Medication" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Toma_consumidorUsuarioId_fkey" FOREIGN KEY ("consumidorUsuarioId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Toma_consumidorPerfilId_fkey" FOREIGN KEY ("consumidorPerfilId") REFERENCES "PerfilMenor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Toma_registranteId_fkey" FOREIGN KEY ("registranteId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Toma_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "GrupoFamiliar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "dni" TEXT NOT NULL,
    "fechaNacimiento" DATETIME NOT NULL,
    "foto" TEXT,
    "password" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'ADULTO',
    "grupoId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "GrupoFamiliar" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "password", "updatedAt", "dni", "fechaNacimiento") 
SELECT "createdAt", "email", "id", "name", "password", "updatedAt", "0000000" || substr("id", -3), "1990-01-01" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_dni_key" ON "User"("dni");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PerfilMenor_dni_key" ON "PerfilMenor"("dni");
