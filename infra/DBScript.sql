CREATE DATABASE RELATIONSHIP_NETWORK_DB
GO

USE RELATIONSHIP_NETWORK_DB
GO

CREATE TABLE Relationships(
    Id INT PRIMARY KEY IDENTITY(1,1),
    Type NVARCHAR(50) NOT NULL
)
GO

CREATE TABLE Persons(
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    BirthDate DATE NOT NULL,
    DeathDate DATE NULL,
    Location TEXT NULL,
    Gender CHAR(1) NOT NULL
)
GO

CREATE TABLE PersonRelationships(
    Id INT PRIMARY KEY IDENTITY(1,1),
    PersonId INT NOT NULL,
    RelatedPersonId INT NOT NULL,
    RelationshipId INT NOT NULL,
    FOREIGN KEY (PersonId) REFERENCES Persons(Id),
    FOREIGN KEY (RelatedPersonId) REFERENCES Persons(Id),
    FOREIGN KEY (RelationshipId) REFERENCES Relationships(Id)
)
GO

INSERT INTO Relationships VALUES 
('Chồng'),
('Vợ'),
('Con'),
('Cha'),
('Mẹ'),
('Bạn bè'),
('Đồng nghiệp')
GO