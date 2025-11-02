<?php
require_once __DIR__ . '/BaseDao.php';

class ReviewDao extends BaseDao {
	public function __construct() {
		parent::__construct('REVIEW', 'review_id');
	}

	public function getByCar($car_id) {
		$stmt = $this->connection->prepare("SELECT * FROM " . $this->table . " WHERE car_id = :car_id");
		$stmt->bindParam(':car_id', $car_id);
		$stmt->execute();
		return $stmt->fetchAll();
	}

	public function getByUser($user_id) {
		$stmt = $this->connection->prepare("SELECT * FROM " . $this->table . " WHERE user_id = :user_id");
		$stmt->bindParam(':user_id', $user_id);
		$stmt->execute();
		return $stmt->fetchAll();
	}
}
?>
