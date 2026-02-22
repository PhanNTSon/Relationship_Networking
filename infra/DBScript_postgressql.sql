-- Active: 1751472576514@@127.0.0.1@5432@postgres
-- Tạo database
CREATE DATABASE relationship_network_db;

-- Tạo bảng Relationships
CREATE TABLE Relationships (
  Id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  Type VARCHAR(50) NOT NULL
);

-- Tạo bảng Persons
CREATE TABLE Persons (
  Id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  BirthDate DATE NOT NULL,
  DeathDate DATE,
  Lat DECIMAL(10,8),
  Lon DECIMAL(11,8),
  Gender CHAR(1) NOT NULL
);

-- Tạo bảng PersonRelationships
CREATE TABLE PersonRelationships (
  Id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  PersonId INT NOT NULL,
  RelatedPersonId INT NOT NULL,
  RelationshipId INT NOT NULL,
  CONSTRAINT fk_person FOREIGN KEY (PersonId) REFERENCES Persons(Id),
  CONSTRAINT fk_related_person FOREIGN KEY (RelatedPersonId) REFERENCES Persons(Id),
  CONSTRAINT fk_relationship FOREIGN KEY (RelationshipId) REFERENCES Relationships(Id)
);

-- Dữ liệu mẫu
INSERT INTO Relationships (Type) VALUES
('Chồng'),
('Vợ'),
('Con'),
('Cha'),
('Mẹ'),
('Bạn bè'),
('Đồng nghiệp');
