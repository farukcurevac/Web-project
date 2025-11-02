<?php
// Single-file test runner for DB connection and DAO smoke tests.
// Usage: php backend/test_all.php

echo "Running connection test...\n";

require_once __DIR__ . '/rest/config.php';

// Connection test
try {
	$db = Database::connect();
	echo "OK - connected to database: " . (new ReflectionClass($db))->getName() . "\n";
} catch (Exception $e) {
	echo "ERR: " . $e->getMessage() . "\n";
	exit(1);
}

// DAO smoke test (runs inside a transaction and rolls back)
echo "\nRunning DAO smoke test...\n";

require_once __DIR__ . '/rest/dao/CategoryDao.php';
require_once __DIR__ . '/rest/dao/UserDao.php';
require_once __DIR__ . '/rest/dao/CarDao.php';
require_once __DIR__ . '/rest/dao/OrderDao.php';
require_once __DIR__ . '/rest/dao/ReviewDao.php';

try {
	$db->beginTransaction();

	$categoryDao = new CategoryDao();
	$userDao = new UserDao();
	$carDao = new CarDao();
	$orderDao = new OrderDao();
	$reviewDao = new ReviewDao();

	// 1) Create a category
	$ok = $categoryDao->insert(['name' => 'Test Category']);
	$categoryId = $db->lastInsertId();
	echo "Created category id={$categoryId} success=" . ($ok ? 'true' : 'false') . "\n";

	// 2) Create two users (seller and buyer)
	$userDao->insert([
		'name' => 'Test Seller',
		'email' => 'seller_test@example.com',
		'password' => password_hash('password', PASSWORD_DEFAULT),
		'phone' => '111-222-333',
		'role' => 'seller'
	]);
	$sellerId = $db->lastInsertId();
	echo "Created seller id={$sellerId}\n";

	$userDao->insert([
		'name' => 'Test Buyer',
		'email' => 'buyer_test@example.com',
		'password' => password_hash('password', PASSWORD_DEFAULT),
		'phone' => '444-555-666',
		'role' => 'buyer'
	]);
	$buyerId = $db->lastInsertId();
	echo "Created buyer id={$buyerId}\n";

	// 3) Create a car referencing the category and seller
	$carDao->insert([
		'title' => 'Test Car',
		'description' => 'Integration test car',
		'price' => 1000,
		'category_id' => $categoryId,
		'seller_id' => $sellerId,
		'image_url' => '',
		'status' => 'available'
	]);
	$carId = $db->lastInsertId();
	echo "Created car id={$carId}\n";

	// 4) Read back the car
	$car = $carDao->getById($carId);
	echo "Car read: "; print_r($car);

	// 5) Update the car
	$carDao->update($carId, ['price' => 1200, 'status' => 'reserved']);
	$updated = $carDao->getById($carId);
	echo "Updated car: "; print_r($updated);

	// 6) Create an order
	$orderDao->insert([
		'car_id' => $carId,
		'buyer_id' => $buyerId,
		'order_date' => date('Y-m-d'),
		'status' => 'pending'
	]);
	$orderId = $db->lastInsertId();
	echo "Created order id={$orderId}\n";

	// 7) Create a review
	$reviewDao->insert([
		'car_id' => $carId,
		'user_id' => $buyerId,
		'rating' => 5,
		'comment' => 'Excellent test car',
		'review_date' => date('Y-m-d')
	]);
	$reviewId = $db->lastInsertId();
	echo "Created review id={$reviewId}\n";

	// 8) Query helpers
	$byCategory = $carDao->getByCategory($categoryId);
	echo "Cars in category {$categoryId}: "; print_r($byCategory);

	$reviewsForCar = $reviewDao->getByCar($carId);
	echo "Reviews for car {$carId}: "; print_r($reviewsForCar);

	// 9) Clean-up: roll back transaction so DB remains unchanged
	$db->rollBack();
	echo "Transaction rolled back — no permanent changes were made.\n";

	echo "DAO smoke test completed successfully.\n";

} catch (Exception $e) {
	if ($db && $db->inTransaction()) {
		$db->rollBack();
	}
	echo "Error during DAO smoke test: " . $e->getMessage() . "\n";
	exit(1);
}

echo "\nAll tests finished.\n";
?>
