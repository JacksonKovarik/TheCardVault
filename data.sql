CREATE TABLE cards(
	id SERIAL,
	category VARCHAR(100),
	cardName VARCHAR(100),
	brand VARCHAR(25),
	type VARCHAR(50),
	year INT,
	cardNumber INT,
	condition VARCHAR(25),
	price DECIMAL,
  description VARCHAR(200),
  imageURL VARCHAR(500),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users(
	id SERIAL,
	username VARCHAR(50),
	email VARCHAR(100) UNIQUE,
	pwd VARCHAR(255),
	createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);