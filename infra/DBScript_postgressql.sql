-- Active: 1751472576514@@127.0.0.1@5432@postgres
-- Tạo database
CREATE DATABASE relationship_network_db;

-- Tạo bảng Relationships
CREATE TABLE relationships (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type VARCHAR(50) NOT NULL
);

-- Tạo bảng Persons
CREATE TABLE persons (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  birth_date DATE NOT NULL,
  death_date DATE,
  lat DECIMAL(10,8),
  lon DECIMAL(11,8),
  gender CHAR(1) NOT NULL
);

-- Tạo bảng PersonRelationships
CREATE TABLE person_relationships (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  person_id INTEGER NOT NULL,
  related_person_id INTEGER NOT NULL,
  relationship_id INTEGER NOT NULL,

  CONSTRAINT fk_person
    FOREIGN KEY (person_id)
    REFERENCES persons(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_related_person
    FOREIGN KEY (related_person_id)
    REFERENCES persons(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_relationship
    FOREIGN KEY (relationship_id)
    REFERENCES relationships(id),

  CONSTRAINT no_self_relation
    CHECK (person_id <> related_person_id),

  CONSTRAINT unique_directed_relation
    UNIQUE (person_id, related_person_id, relationship_id)
);

-- Dữ liệu mẫu
INSERT INTO relationships (type) VALUES
('Chồng'),
('Vợ'),
('Con'),
('Cha'),
('Mẹ'),
('Bạn bè'),
('Đồng nghiệp');

ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.person_relationships ENABLE ROW LEVEL SECURITY;

-- Chỉ authenticated mới được SELECT
CREATE POLICY "Authenticated can view relationships"
ON public.relationships
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can view persons"
ON public.persons
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can insert persons"
ON public.persons
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can update persons"
ON public.persons
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated can delete persons"
ON public.persons
FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Authenticated can view person relationships"
ON public.person_relationships
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can insert person relationships"
ON public.person_relationships
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can update person relationships"
ON public.person_relationships
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated can delete person relationships"
ON public.person_relationships
FOR DELETE
TO authenticated
USING (true);