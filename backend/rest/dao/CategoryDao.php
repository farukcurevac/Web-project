<?php
require_once __DIR__ . '/BaseDao.php';

class CategoryDao extends BaseDao {
	public function __construct() {
		parent::__construct('CATEGORY', 'category_id');
	}

	// You can add category-specific helpers here
	public function getByName($name) {
		$stmt = $this->connection->prepare("SELECT * FROM " . $this->table . " WHERE name = :name");
		$stmt->bindParam(':name', $name);
		$stmt->execute();
		return $stmt->fetch();
	}
}
?>
