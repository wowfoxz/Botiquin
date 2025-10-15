-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Medication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commercialName" TEXT NOT NULL,
    "activeIngredient" TEXT,
    "description" TEXT,
    "intakeRecommendations" TEXT,
    "imageUrl" TEXT,
    "initialQuantity" REAL NOT NULL,
    "currentQuantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "expirationDate" DATETIME NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Medication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NotificationSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "daysBeforeExpiration" INTEGER NOT NULL DEFAULT 30,
    "lowStockThreshold" REAL NOT NULL DEFAULT 10,
    "userId" TEXT NOT NULL,
    CONSTRAINT "NotificationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationSettings_userId_key" ON "NotificationSettings"("userId");
