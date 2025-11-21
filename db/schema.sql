-- Create database if it doesn’t exist and use it
CREATE DATABASE IF NOT EXISTS H2Now;
USE H2Now;

-- Drop tables if they already exist (to avoid conflicts)
DROP TABLE IF EXISTS Intake;
DROP TABLE IF EXISTS UserPreferences;
DROP TABLE IF EXISTS Bottle;
DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS DrinkingSession;

-- ==============================
-- USER TABLE
-- ==============================
CREATE TABLE User (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(150) NOT NULL,
    profilePic VARCHAR(255),
    streakStart DATE,
    streak INT
);

-- ==============================
-- BOTTLE TABLE
-- ==============================
CREATE TABLE Bottle (
    bottleID VARCHAR(50) PRIMARY KEY,
    userID INT UNIQUE,
    bottleName VARCHAR(150) NOT NULL,
    capacity DECIMAL(6,2) NOT NULL,
    goal DECIMAL(6,2) NOT NULL,
    connected BOOLEAN DEFAULT FALSE,
    connectedAt DATETIME,
    FOREIGN KEY (userID) REFERENCES User(userID) ON DELETE CASCADE
);

-- ==============================
-- DRINKING SESSION TABLE
-- ==============================
CREATE TABLE DrinkingSession (
    sessionID INT AUTO_INCREMENT PRIMARY KEY,
    bottleID VARCHAR(50) NOT NULL,
    startTime DATETIME NOT NULL,
    endTime DATETIME,
    duration INT,
    estimatedIntake DECIMAL(6,2),
    FOREIGN KEY (bottleID) REFERENCES Bottle(bottleID) ON DELETE CASCADE
);

-- ==============================
-- INTAKE TABLE
-- ==============================
CREATE TABLE Intake (
    intakeID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    bottleID VARCHAR(50) NOT NULL,
    intakeDate DATE NOT NULL,
    totalIntake DECIMAL(6,2) NOT NULL,
    goalReached BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (userID) REFERENCES User(userID) ON DELETE CASCADE,
    FOREIGN KEY (bottleID) REFERENCES Bottle(bottleID) ON DELETE CASCADE,
    UNIQUE KEY unique_daily_intake (userID, bottleID, intakeDate)
);


-- ==============================
-- USER PREFERENCES TABLE
-- ==============================
CREATE TABLE UserPreferences (
    userID INT PRIMARY KEY,
    reminderFreq INT NOT NULL,
    themeMode ENUM('light','dark','system') DEFAULT 'system',
    FOREIGN KEY (userID) REFERENCES User(userID) ON DELETE CASCADE
);
