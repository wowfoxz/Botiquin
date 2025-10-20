-- ================================================================
-- ESTRUCTURA DE BASE DE DATOS BOTILYX PARA MYSQL
-- ================================================================
-- Crear base de datos
CREATE DATABASE IF NOT EXISTS botilyx_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE botilyx_db;

-- ================================================================
-- TABLA: User (Usuarios)
-- ================================================================
CREATE TABLE User (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    name VARCHAR(191) NULL,
    dni VARCHAR(191) NOT NULL UNIQUE,
    password VARCHAR(191) NOT NULL,
    role ENUM('ADULTO', 'MENOR') NOT NULL DEFAULT 'ADULTO',
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

-- ================================================================
-- TABLA: Medication (Medicamentos)
-- ================================================================
CREATE TABLE Medication (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    commercialName VARCHAR(191) NOT NULL,
    activeIngredient TEXT NULL,
    description TEXT NULL,
    intakeRecommendations TEXT NULL,
    imageUrl TEXT NULL,
    initialQuantity DOUBLE NOT NULL,
    currentQuantity DOUBLE NOT NULL,
    unit VARCHAR(191) NOT NULL,
    expirationDate DATETIME(3) NOT NULL,
    archived BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    userId VARCHAR(191) NOT NULL,
    
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ================================================================
-- TABLA: NotificationSettings (Configuración de Notificaciones)
-- ================================================================
CREATE TABLE NotificationSettings (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    userId VARCHAR(191) NOT NULL,
    daysBeforeExpiration INT NOT NULL DEFAULT 7,
    lowStockThreshold INT NOT NULL DEFAULT 5,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ================================================================
-- TABLA: Treatment (Tratamientos)
-- ================================================================
CREATE TABLE Treatment (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    description TEXT NULL,
    startDate DATETIME(3) NOT NULL,
    endDate DATETIME(3) NOT NULL,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    userId VARCHAR(191) NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ================================================================
-- TABLA: TreatmentMedication (Medicamentos de Tratamientos)
-- ================================================================
CREATE TABLE TreatmentMedication (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    treatmentId VARCHAR(191) NOT NULL,
    medicationId VARCHAR(191) NOT NULL,
    frequencyHours INT NOT NULL,
    durationDays INT NOT NULL,
    dosage VARCHAR(191) NOT NULL,
    startAtSpecificTime BOOLEAN NOT NULL DEFAULT FALSE,
    specificStartTime DATETIME(3) NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    
    FOREIGN KEY (treatmentId) REFERENCES Treatment(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (medicationId) REFERENCES Medication(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ================================================================
-- TABLA: TreatmentImage (Imágenes de Tratamientos)
-- ================================================================
CREATE TABLE TreatmentImage (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    treatmentId VARCHAR(191) NOT NULL,
    imageUrl TEXT NOT NULL,
    imageType ENUM('receta', 'instrucciones') NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    
    FOREIGN KEY (treatmentId) REFERENCES Treatment(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ================================================================
-- TABLA: Notification (Notificaciones)
-- ================================================================
CREATE TABLE Notification (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    title VARCHAR(191) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(191) NOT NULL,
    userId VARCHAR(191) NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ================================================================
-- TABLA: NotificationPreferences (Preferencias de Notificación)
-- ================================================================
CREATE TABLE NotificationPreferences (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    userId VARCHAR(191) NOT NULL,
    emailNotifications BOOLEAN NOT NULL DEFAULT TRUE,
    pushNotifications BOOLEAN NOT NULL DEFAULT TRUE,
    medicationReminders BOOLEAN NOT NULL DEFAULT TRUE,
    expirationAlerts BOOLEAN NOT NULL DEFAULT TRUE,
    lowStockAlerts BOOLEAN NOT NULL DEFAULT TRUE,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ================================================================
-- TABLA: PushSubscription (Suscripciones Push)
-- ================================================================
CREATE TABLE PushSubscription (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    userId VARCHAR(191) NOT NULL,
    endpoint TEXT NOT NULL,
    p256dh VARCHAR(191) NOT NULL,
    auth VARCHAR(191) NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ================================================================
-- TABLA: ShoppingItem (Items de Lista de Compras)
-- ================================================================
CREATE TABLE ShoppingItem (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit VARCHAR(191) NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    shoppingListId VARCHAR(191) NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    
    FOREIGN KEY (shoppingListId) REFERENCES ShoppingList(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ================================================================
-- TABLA: ShoppingList (Listas de Compras)
-- ================================================================
CREATE TABLE ShoppingList (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    userId VARCHAR(191) NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ================================================================
-- TABLA: GrupoFamiliar (Grupo Familiar)
-- ================================================================
CREATE TABLE GrupoFamiliar (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    nombre VARCHAR(191) NOT NULL,
    userId VARCHAR(191) NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ================================================================
-- TABLA: PerfilMenor (Perfiles de Menores)
-- ================================================================
CREATE TABLE PerfilMenor (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    nombre VARCHAR(191) NOT NULL,
    fechaNacimiento DATETIME(3) NOT NULL,
    peso DOUBLE NULL,
    altura DOUBLE NULL,
    alergias TEXT NULL,
    grupoFamiliarId VARCHAR(191) NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    
    FOREIGN KEY (grupoFamiliarId) REFERENCES GrupoFamiliar(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ================================================================
-- TABLA: Toma (Registro de Tomas)
-- ================================================================
CREATE TABLE Toma (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    medicationId VARCHAR(191) NOT NULL,
    userId VARCHAR(191) NOT NULL,
    fechaToma DATETIME(3) NOT NULL,
    cantidad DOUBLE NOT NULL,
    observaciones TEXT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    
    FOREIGN KEY (medicationId) REFERENCES Medication(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ================================================================
-- TABLA: Historial (Historial de Actividades)
-- ================================================================
CREATE TABLE Historial (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    userId VARCHAR(191) NOT NULL,
    accion VARCHAR(191) NOT NULL,
    entidad VARCHAR(191) NOT NULL,
    entidadId VARCHAR(191) NOT NULL,
    detalles TEXT NULL,
    fecha DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ================================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ================================================================
CREATE INDEX idx_user_email ON User(email);
CREATE INDEX idx_user_dni ON User(dni);
CREATE INDEX idx_medication_userId ON Medication(userId);
CREATE INDEX idx_medication_expiration ON Medication(expirationDate);
CREATE INDEX idx_medication_archived ON Medication(archived);
CREATE INDEX idx_treatment_userId ON Treatment(userId);
CREATE INDEX idx_treatment_isActive ON Treatment(isActive);
CREATE INDEX idx_treatmentMedication_treatmentId ON TreatmentMedication(treatmentId);
CREATE INDEX idx_treatmentMedication_medicationId ON TreatmentMedication(medicationId);
CREATE INDEX idx_notification_userId ON Notification(userId);
CREATE INDEX idx_notification_read ON Notification(read);
CREATE INDEX idx_historial_userId ON Historial(userId);
CREATE INDEX idx_historial_fecha ON Historial(fecha);
CREATE INDEX idx_toma_medicationId ON Toma(medicationId);
CREATE INDEX idx_toma_userId ON Toma(userId);
CREATE INDEX idx_toma_fechaToma ON Toma(fechaToma);

-- ================================================================
-- INSERTAR DATOS DE EJEMPLO (OPCIONAL)
-- ================================================================
-- Usuario de ejemplo
INSERT INTO User (id, email, name, dni, password, role) VALUES 
('user_example_1', 'admin@botilyx.com', 'Administrador', '12345678', '$2a$10$example_hashed_password', 'ADULTO');

-- Configuración de notificaciones de ejemplo
INSERT INTO NotificationSettings (id, userId, daysBeforeExpiration, lowStockThreshold) VALUES 
('notif_example_1', 'user_example_1', 7, 5);

-- Preferencias de notificación de ejemplo
INSERT INTO NotificationPreferences (id, userId, emailNotifications, pushNotifications, medicationReminders, expirationAlerts, lowStockAlerts) VALUES 
('pref_example_1', 'user_example_1', TRUE, TRUE, TRUE, TRUE, TRUE);

-- ================================================================
-- VERIFICACIÓN DE ESTRUCTURA
-- ================================================================
SHOW TABLES;

-- Mostrar estructura de tablas principales
DESCRIBE User;
DESCRIBE Medication;
DESCRIBE Treatment;
DESCRIBE TreatmentMedication;
