CREATE TABLE sports(
	id SERIAL,
	category VARCHAR(100),
	playerName VARCHAR(100),
	sport VARCHAR(25),
	year INT,
	brand VARCHAR(25),
	cardNumber INT,
	condition VARCHAR(25),
	price DECIMAL,
    description VARCHAR(200),
    imageURL VARCHAR(500),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tcgs(
	id SERIAL,
	category VARCHAR(100),
    cardName VARCHAR(100),
	tcg VARCHAR(25),
	set VARCHAR(50),
	year INT,
	cardNumber INT,
	condition VARCHAR(10),
	price DECIMAL,
    description VARCHAR(200),
    imageURL VARCHAR(500),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);