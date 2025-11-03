<?php
require_once __DIR__ . '/BaseDao.php';

class CarDao extends BaseDao {
	public function __construct() {
		// table name and primary key as defined in farukcars.sql
		parent::__construct('CAR', 'car_id');
	}

	// Example of an additional read helper
	public function getByCategory($category_id) {
		$stmt = $this->connection->prepare("SELECT * FROM " . $this->table . " WHERE category_id = :category_id");
		$stmt->bindParam(':category_id', $category_id);
		$stmt->execute();
		return $stmt->fetchAll();
	}

	public function getBySeller($seller_id) {
		$stmt = $this->connection->prepare("SELECT * FROM " . $this->table . " WHERE seller_id = :seller_id");
		$stmt->bindParam(':seller_id', $seller_id);
		$stmt->execute();
		return $stmt->fetchAll();
	}
}
?>
