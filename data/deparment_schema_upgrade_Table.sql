ALTER TABLE products
 
ADD COLUMN product_sales DECIMAL(10,2) NOT NULL DEFAULT 0.00,

DROP TABLE IF EXISTS departments;


CREATE TABLE departments(
	
department_id INTEGER(10) AUTO_INCREMENT PRIMARY KEY,

	department_name VARCHAR(20),

	over_head_cost DECIMAL(10,2) DEFAULT 0.00

)