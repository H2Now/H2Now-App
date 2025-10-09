-- Create database if it doesn’t exist and use it
CREATE DATABASE IF NOT EXISTS H2Now;
USE H2Now;

-- Drop tables if they already exist (to avoid conflicts)
DROP TABLE IF EXISTS Intake;
DROP TABLE IF EXISTS UserPreferences;
DROP TABLE IF EXISTS Bottle;
DROP TABLE IF EXISTS User;

-- ==============================
-- USER TABLE
-- ==============================
CREATE TABLE User (
    userID VARCHAR(20) PRIMARY KEY,
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
    bottleID INT AUTO_INCREMENT PRIMARY KEY,
    userID VARCHAR(20) NOT NULL,
    bottleName VARCHAR(150) NOT NULL,
    capacity DECIMAL(6,2) NOT NULL,
    goal DECIMAL(6,2) NOT NULL,
    FOREIGN KEY (userID) REFERENCES User(userID) ON DELETE CASCADE
);

-- ==============================
-- INTAKE TABLE
-- ==============================
CREATE TABLE Intake (
    intakeID INT AUTO_INCREMENT PRIMARY KEY,
    userID VARCHAR(20) NOT NULL,
    bottleID INT NOT NULL,
    intakeDate DATE NOT NULL,
    totalIntake DECIMAL(6,2) NOT NULL,
    goalReached BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (userID) REFERENCES User(userID) ON DELETE CASCADE,
    FOREIGN KEY (bottleID) REFERENCES Bottle(bottleID) ON DELETE CASCADE
);

-- ==============================
-- USER PREFERENCES TABLE
-- ==============================
CREATE TABLE UserPreferences (
    userID VARCHAR(20) PRIMARY KEY,
    reminderFreq INT NOT NULL,
    themeMode ENUM('light','dark','system') DEFAULT 'system',
    FOREIGN KEY (userID) REFERENCES User(userID) ON DELETE CASCADE
);
