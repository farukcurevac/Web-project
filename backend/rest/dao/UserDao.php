<?php
require_once __DIR__ . '/BaseDao.php';

class UserDao extends BaseDao {
	public function __construct() {
		parent::__construct('USER', 'user_id');
	}

	// Find user by email (useful for login/registration checks)
	public function getByEmail($email) {
		$stmt = $this->connection->prepare("SELECT * FROM " . $this->table . " WHERE email = :email");
		$stmt->bindParam(':email', $email);
		$stmt->execute();
		return $stmt->fetch();
	}
}
?>
