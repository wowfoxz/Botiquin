-- CreateTable
CREATE TABLE "TreatmentMedication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "treatmentId" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    "frequencyHours" INTEGER NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "dosage" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "startAtSpecificTime" BOOLEAN NOT NULL DEFAULT false,
    "specificStartTime" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TreatmentMedication_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "Treatment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TreatmentMedication_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TreatmentImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "treatmentId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageType" TEXT NOT NULL,
    "extractedText" TEXT,
    "aiAnalysis" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TreatmentImage_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "Treatment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- AlterTable
ALTER TABLE "Treatment" ADD COLUMN "patientId" TEXT;
ALTER TABLE "Treatment" ADD COLUMN "patientType" TEXT;
ALTER TABLE "Treatment" ADD COLUMN "symptoms" TEXT;

-- CreateIndex
CREATE INDEX "TreatmentMedication_treatmentId_idx" ON "TreatmentMedication"("treatmentId");
CREATE INDEX "TreatmentMedication_medicationId_idx" ON "TreatmentMedication"("medicationId");
CREATE INDEX "TreatmentImage_treatmentId_idx" ON "TreatmentImage"("treatmentId");
