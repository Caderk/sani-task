CREATE DATABASE IF NOT EXISTS users_db;
USE users_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(32) NOT NULL,
    rut VARCHAR(32) UNIQUE NOT NULL,
    email VARCHAR(32),
    birthday DATE NOT NULL
);

INSERT INTO users (name, rut, email, birthday) VALUES
('Carlos Lopez',       '11111111-1', 'carlos.lopez@example.com',      '1990-05-15'),
('Maria Hernandez',    '22222222-2', 'maria.hernandez@example.com',   '1985-08-24'),
('Andres Gonzalez',    '33333333-3', 'andres.gonzalez@example.com',   '1978-12-01'),
('Sofia Castillo',     '44444444-4', 'sofia.castillo@example.com',    '1992-03-07'),
('Marcela Delgado',    '55555555-5', NULL,                            '1994-07-19'),
('Juan Pablo Torres',  '66666666-6', 'juan.torres@example.com',       '1989-11-13'),
('Patricia Rodriguez', '77777777-7', 'patricia.rodriguez@example.com','1986-02-28'),
('Victoria Munoz',     '88888888-8', NULL,                            '2001-10-05'),
('Pedro Figueroa',     '99999999-9', 'pedro.figueroa@example.com',    '1975-04-21'),
('Felipe Salazar',     '98765432-1', 'felipe.salazar@example.com',    '1998-09-09'),
('Ana Morales',        '10101010-0', 'ana.morales@example.com',       '1971-01-11'),
('Bernardo Sanchez',   '12121212-1', 'bernardo.sanchez@example.com',  '1977-06-22'),
('Carolina Gutierrez', '23232323-3', 'carolina.gutierrez@example.com','2002-12-25'),
('Ignacio Valenzuela', '45454545-5', NULL,                            '1981-03-09'),
('Ximena Contreras',   '56565656-6', 'ximena.contreras@example.com',  '1979-07-13'),
('Hector Rojas',       '89898989-8', 'hector.rojas@example.com',      '1993-11-30'),
('Lorena Vargas',      '91919191-1', 'lorena.vargas@example.com',     '1999-08-16'),
('Luis Fernandez',     '82828282-2', NULL,                            '1974-09-01'),
('Manuel Ortiz',       '74747474-4', 'manuel.ortiz@example.com',      '1995-02-10'),
('Alicia Fuentes',     '36363636-3', 'alicia.fuentes@example.com',    '1988-10-27');
