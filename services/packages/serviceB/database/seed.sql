CREATE TABLE products (
    product_id serial primary key,
    product_name varchar(20),
    product_desc varchar(100),
    product_price float
);

INSERT INTO products(product_name, product_desc, product_price) VALUES ('Black T-Shirt', 'Brand new T-Shirt', 100.00);
INSERT INTO products(product_name, product_desc, product_price) VALUES ('Black Hoodie', 'Brand new Black Hoodie', 200.00);
INSERT INTO products(product_name, product_desc, product_price) VALUES ('White T-Shirt', 'Brand new white T-Shirt', 100.00);
INSERT INTO products(product_name, product_desc, product_price) VALUES ('White Hoodie', 'Brand new White Hoodie', 200.00);
INSERT INTO products(product_name, product_desc, product_price) VALUES ('Cap', 'Brand new Cap', 20.00);

select * from products;