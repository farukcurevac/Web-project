USE farukcars;

-- Updated schema: non-destructive additions based on external dump

CREATE TABLE IF NOT EXISTS USER (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    -- added to store modern hashed passwords side-by-side; keep `password` until migration complete
    password_hash VARCHAR(255) DEFAULT NULL,
    phone VARCHAR(30),
    role VARCHAR(50)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS CATEGORY (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    -- additional descriptive field from the external schema
    description VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS CAR (
    car_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    -- added fields to match car_rental (non-destructive: nullable)
    brand VARCHAR(50) DEFAULT NULL,
    model VARCHAR(50) DEFAULT NULL,
    year INT DEFAULT NULL,
    price FLOAT,
    price_per_day DECIMAL(10,2) DEFAULT NULL,
    category_id INT,
    seller_id INT,
    image_url VARCHAR(255),
    status VARCHAR(50),
    FOREIGN KEY (category_id) REFERENCES CATEGORY(category_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES USER(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ORDERS (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT,
    buyer_id INT,
    -- enriched reservation-like fields (added non-destructively)
    order_date DATE,
    start_date DATETIME DEFAULT NULL,
    end_date DATETIME DEFAULT NULL,
    total_price DECIMAL(10,2) DEFAULT NULL,
    status VARCHAR(50),
    FOREIGN KEY (car_id) REFERENCES CAR(car_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES USER(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS REVIEW (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT,
    user_id INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    review_date DATE,
    FOREIGN KEY (car_id) REFERENCES CAR(car_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES USER(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

