CREATE DATABASE IF NOT EXISTS users_db;
USE users_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(32) NOT NULL,
    rut VARCHAR(32) UNIQUE NOT NULL,
    email VARCHAR(32),
    birthday DATE NOT NULL
);

INSERT INTO users (name, rut, birthday) VALUES ('Sample User', '12345678-9', '2000-01-01');
