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

	public function getByBrand($brand) {
		// Some deployments don't have a `brand` column. Support either numeric id lookup
		// or a text search against `title`/`model` to be tolerant of payloads.
		if (is_numeric($brand)) {
			// treat numeric brand as an id lookup
			$stmt = $this->connection->prepare("SELECT * FROM " . $this->table . " WHERE " . $this->pk . " = :id");
			$stmt->bindValue(':id', (int)$brand, PDO::PARAM_INT);
			$stmt->execute();
			$row = $stmt->fetch();
			return $row ? [$row] : [];
		}
		$stmt = $this->connection->prepare("SELECT * FROM " . $this->table . " WHERE title LIKE :q OR model LIKE :q");
		$like = "%" . $brand . "%";
		$stmt->bindValue(':q', $like, PDO::PARAM_STR);
		$stmt->execute();
		return $stmt->fetchAll();
	}
}
?>
