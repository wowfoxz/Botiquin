-- ================================================================
-- ESTRUCTURA DE BASE DE DATOS BOTILYX PARA MYSQL
-- Generado automáticamente desde Prisma Schema
-- Fecha: 2025-01-22
-- ================================================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS botilyx_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE botilyx_db;

-- ================================================================
-- TABLA: User (Usuarios)
-- ================================================================
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `dni` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `fechaNacimiento` DATETIME(3) NOT NULL,
    `foto` VARCHAR(191) NULL,
    `grupoId` VARCHAR(191) NULL,
    `rol` ENUM('ADULTO', 'MENOR') NOT NULL DEFAULT 'ADULTO',

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_dni_key`(`dni`),
    INDEX `User_grupoId_fkey`(`grupoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: Medication (Medicamentos)
-- ================================================================
CREATE TABLE `Medication` (
    `id` VARCHAR(191) NOT NULL,
    `commercialName` VARCHAR(191) NOT NULL,
    `activeIngredient` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `intakeRecommendations` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `initialQuantity` DOUBLE NOT NULL,
    `currentQuantity` DOUBLE NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `expirationDate` DATETIME(3) NOT NULL,
    `archived` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    INDEX `Medication_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: NotificationSettings (Configuración de Notificaciones)
-- ================================================================
CREATE TABLE `NotificationSettings` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `daysBeforeExpiration` INTEGER NOT NULL DEFAULT 30,
    `lowStockThreshold` DOUBLE NOT NULL DEFAULT 10,

    UNIQUE INDEX `NotificationSettings_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: Treatment (Tratamientos)
-- ================================================================
CREATE TABLE `Treatment` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endDate` DATETIME(3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `patient` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NULL,
    `patientType` VARCHAR(191) NULL,
    `symptoms` VARCHAR(191) NULL,

    INDEX `Treatment_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: TreatmentMedication (Medicamentos de Tratamientos)
-- ================================================================
CREATE TABLE `TreatmentMedication` (
    `id` VARCHAR(191) NOT NULL,
    `treatmentId` VARCHAR(191) NOT NULL,
    `medicationId` VARCHAR(191) NOT NULL,
    `frequencyHours` INTEGER NOT NULL,
    `durationDays` INTEGER NOT NULL,
    `dosage` VARCHAR(191) NOT NULL,
    `startAtSpecificTime` BOOLEAN NOT NULL DEFAULT false,
    `specificStartTime` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `startDate` DATETIME(3) NOT NULL,

    INDEX `TreatmentMedication_medicationId_fkey`(`medicationId`),
    INDEX `TreatmentMedication_treatmentId_fkey`(`treatmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: TreatmentImage (Imágenes de Tratamientos)
-- ================================================================
CREATE TABLE `TreatmentImage` (
    `id` VARCHAR(191) NOT NULL,
    `treatmentId` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `imageType` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `aiAnalysis` VARCHAR(191) NULL,
    `extractedText` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TreatmentImage_treatmentId_fkey`(`treatmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: Notification (Notificaciones)
-- ================================================================
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `treatmentId` VARCHAR(191) NOT NULL,
    `scheduledDate` DATETIME(3) NOT NULL,
    `sent` BOOLEAN NOT NULL DEFAULT false,
    `type` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Notification_treatmentId_fkey`(`treatmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: NotificationPreferences (Preferencias de Notificación)
-- ================================================================
CREATE TABLE `NotificationPreferences` (
    `id` VARCHAR(191) NOT NULL,
    `push` BOOLEAN NOT NULL DEFAULT false,
    `sound` BOOLEAN NOT NULL DEFAULT false,
    `email` BOOLEAN NOT NULL DEFAULT false,
    `browser` BOOLEAN NOT NULL DEFAULT false,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `NotificationPreferences_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: PushSubscription (Suscripciones Push)
-- ================================================================
CREATE TABLE `PushSubscription` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `endpoint` VARCHAR(191) NOT NULL,
    `p256dhKey` VARCHAR(191) NOT NULL,
    `authKey` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PushSubscription_userId_endpoint_key`(`userId`, `endpoint`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: ShoppingItem (Items de Lista de Compras)
-- ================================================================
CREATE TABLE `ShoppingItem` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `presentation` VARCHAR(191) NULL,
    `laboratory` VARCHAR(191) NULL,
    `price` DOUBLE NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `shoppingListId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ShoppingItem_shoppingListId_fkey`(`shoppingListId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: ShoppingList (Listas de Compras)
-- ================================================================
CREATE TABLE `ShoppingList` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `total` DOUBLE NOT NULL,
    `isArchived` BOOLEAN NOT NULL DEFAULT false,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ShoppingList_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: GrupoFamiliar (Grupo Familiar)
-- ================================================================
CREATE TABLE `GrupoFamiliar` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `creadorId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `GrupoFamiliar_creadorId_fkey`(`creadorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: PerfilMenor (Perfiles de Menores)
-- ================================================================
CREATE TABLE `PerfilMenor` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `dni` VARCHAR(191) NOT NULL,
    `fechaNacimiento` DATETIME(3) NOT NULL,
    `foto` VARCHAR(191) NULL,
    `grupoId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PerfilMenor_dni_key`(`dni`),
    INDEX `PerfilMenor_grupoId_fkey`(`grupoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: Toma (Registro de Tomas)
-- ================================================================
CREATE TABLE `Toma` (
    `id` VARCHAR(191) NOT NULL,
    `medicamentoId` VARCHAR(191) NOT NULL,
    `consumidorUsuarioId` VARCHAR(191) NULL,
    `consumidorPerfilId` VARCHAR(191) NULL,
    `registranteId` VARCHAR(191) NOT NULL,
    `fechaHora` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `grupoId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Toma_consumidorPerfilId_fkey`(`consumidorPerfilId`),
    INDEX `Toma_consumidorUsuarioId_fkey`(`consumidorUsuarioId`),
    INDEX `Toma_grupoId_fkey`(`grupoId`),
    INDEX `Toma_medicamentoId_fkey`(`medicamentoId`),
    INDEX `Toma_registranteId_fkey`(`registranteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: Historial (Historial de Actividades)
-- ================================================================
CREATE TABLE `Historial` (
    `id` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `tipoAccion` VARCHAR(191) NOT NULL,
    `entidadTipo` VARCHAR(191) NOT NULL,
    `entidadId` VARCHAR(191) NULL,
    `datosPrevios` VARCHAR(191) NULL,
    `datosPosteriores` VARCHAR(191) NULL,
    `metadata` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Historial_usuarioId_idx`(`usuarioId`),
    INDEX `Historial_tipoAccion_idx`(`tipoAccion`),
    INDEX `Historial_entidadTipo_entidadId_idx`(`entidadTipo`, `entidadId`),
    INDEX `Historial_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ================================================================
-- CLAVES FORÁNEAS (FOREIGN KEYS)
-- ================================================================
ALTER TABLE `User` ADD CONSTRAINT `User_grupoId_fkey` FOREIGN KEY (`grupoId`) REFERENCES `GrupoFamiliar`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Medication` ADD CONSTRAINT `Medication_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `NotificationSettings` ADD CONSTRAINT `NotificationSettings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Treatment` ADD CONSTRAINT `Treatment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `TreatmentMedication` ADD CONSTRAINT `TreatmentMedication_medicationId_fkey` FOREIGN KEY (`medicationId`) REFERENCES `Medication`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `TreatmentMedication` ADD CONSTRAINT `TreatmentMedication_treatmentId_fkey` FOREIGN KEY (`treatmentId`) REFERENCES `Treatment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `TreatmentImage` ADD CONSTRAINT `TreatmentImage_treatmentId_fkey` FOREIGN KEY (`treatmentId`) REFERENCES `Treatment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_treatmentId_fkey` FOREIGN KEY (`treatmentId`) REFERENCES `Treatment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `NotificationPreferences` ADD CONSTRAINT `NotificationPreferences_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `PushSubscription` ADD CONSTRAINT `PushSubscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `ShoppingItem` ADD CONSTRAINT `ShoppingItem_shoppingListId_fkey` FOREIGN KEY (`shoppingListId`) REFERENCES `ShoppingList`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `ShoppingList` ADD CONSTRAINT `ShoppingList_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `GrupoFamiliar` ADD CONSTRAINT `GrupoFamiliar_creadorId_fkey` FOREIGN KEY (`creadorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `PerfilMenor` ADD CONSTRAINT `PerfilMenor_grupoId_fkey` FOREIGN KEY (`grupoId`) REFERENCES `GrupoFamiliar`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Toma` ADD CONSTRAINT `Toma_consumidorPerfilId_fkey` FOREIGN KEY (`consumidorPerfilId`) REFERENCES `PerfilMenor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Toma` ADD CONSTRAINT `Toma_consumidorUsuarioId_fkey` FOREIGN KEY (`consumidorUsuarioId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Toma` ADD CONSTRAINT `Toma_grupoId_fkey` FOREIGN KEY (`grupoId`) REFERENCES `GrupoFamiliar`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Toma` ADD CONSTRAINT `Toma_medicamentoId_fkey` FOREIGN KEY (`medicamentoId`) REFERENCES `Medication`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Toma` ADD CONSTRAINT `Toma_registranteId_fkey` FOREIGN KEY (`registranteId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Historial` ADD CONSTRAINT `Historial_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- ================================================================
-- NOTAS IMPORTANTES
-- ================================================================
-- Este archivo refleja la estructura ACTUAL del schema de Prisma.
-- 
-- CAMBIOS PRINCIPALES respecto a versión anterior:
-- - Tabla User ahora incluye: fechaNacimiento, foto, grupoId, rol (en vez de role)
-- - Todas las tablas están sincronizadas con prisma/schema.prisma
-- 
-- Para aplicar esta estructura:
-- 1. Usar: npx prisma db push --force-reset --accept-data-loss
-- 2. O ejecutar este SQL manualmente en MySQL (borrará todos los datos)
-- 
-- Generado automáticamente con:
-- npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script
