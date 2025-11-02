<?php
require_once __DIR__ . '/BaseDao.php';

class OrderDao extends BaseDao {
	public function __construct() {
		parent::__construct('ORDERS', 'order_id');
	}

	public function getByBuyer($buyer_id) {
		$stmt = $this->connection->prepare("SELECT * FROM " . $this->table . " WHERE buyer_id = :buyer_id");
		$stmt->bindParam(':buyer_id', $buyer_id);
		$stmt->execute();
		return $stmt->fetchAll();
	}

	public function getByCar($car_id) {
		$stmt = $this->connection->prepare("SELECT * FROM " . $this->table . " WHERE car_id = :car_id");
		$stmt->bindParam(':car_id', $car_id);
		$stmt->execute();
		return $stmt->fetchAll();
	}
}
?>
