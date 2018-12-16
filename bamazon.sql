DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(25) NULL,
  department_name VARCHAR(25) NULL,
  price DECIMAL(10, 2) NULL,
  stock_quantity INTEGER(10),
  PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity) 
VALUES 
	('Macbook Pro', 'Computers', 3000.00, 10),
	('Logitech Z623', 'Speakers', 67.50, 5),
	('Duck Debugger', 'Self Help', 0.99, 10000),
 	('iPhone 7 Plus', 'Cell Phones', 500.00, 100),
	('Oakley Carbon Shift', 'Sunglasses', 299.99, 1),
	('Logitech MX Master 2S', 'Computer Accessories', 55.49, 100),
	('LG 4K HD 27" Monitor', 'Computer Accessories', 649.99, 15),
	('35lb Hex Dumbbell', 'Fitness', 35.00, 10),
	('Flat Bench', 'Fitness', 150.00, 5),
	('Olympic Plate Set', 'Fitness', 300.00, 2);