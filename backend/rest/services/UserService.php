<?php
require_once __DIR__ . '/../dao/UserDao.php';
require_once __DIR__ . '/BaseService.php';

class UserService extends BaseService {
	public function __construct($dao = null) {
		parent::__construct($dao ?: new UserDao());
	}

	// Validate password strength
	private function validatePasswordStrength($password) {
		// At least 8 characters
		if (strlen($password) < 8) {
			throw new InvalidArgumentException('Password must be at least 8 characters');
		}
		// Max 128 characters
		if (strlen($password) > 128) {
			throw new InvalidArgumentException('Password must not exceed 128 characters');
		}
		// Must contain uppercase
		if (!preg_match('/[A-Z]/', $password)) {
			throw new InvalidArgumentException('Password must contain at least one uppercase letter');
		}
		// Must contain lowercase
		if (!preg_match('/[a-z]/', $password)) {
			throw new InvalidArgumentException('Password must contain at least one lowercase letter');
		}
		// Must contain digit
		if (!preg_match('/\d/', $password)) {
			throw new InvalidArgumentException('Password must contain at least one number');
		}
		// Must contain special character
		if (!preg_match('/[@$!%*?&]/', $password)) {
			throw new InvalidArgumentException('Password must contain at least one special character (@$!%*?&)');
		}
	}

	// Implement validation in create so it works with the minimal BaseService
	public function create($data) {
		if (!is_array($data)) {
			throw new InvalidArgumentException('User data must be an array');
		}
		if (empty($data['email'])) {
			throw new InvalidArgumentException('Email is required');
		}
		if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
			throw new InvalidArgumentException('Invalid email format');
		}
		// If password is not provided, generate a random one and store its hash.
		if (empty($data['password'])) {
			// generate a random 12-char password (not returned in API)
			$random = bin2hex(random_bytes(6));
			$data['password'] = $random;
		} else {
			// Validate password strength if provided
			$this->validatePasswordStrength($data['password']);
		}
		$existing = $this->dao->getByEmail($data['email']);
		if ($existing) {
			throw new InvalidArgumentException('Email already registered');
		}
		$data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
		return $this->dao->insert($data);
	}

	public function update($id, $data) {
		if (!is_array($data)) {
			throw new InvalidArgumentException('User data must be an array');
		}
		if (isset($data['email'])) {
			if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
				throw new InvalidArgumentException('Invalid email format');
			}
			$existing = $this->dao->getByEmail($data['email']);
			if ($existing && isset($existing['user_id']) && $existing['user_id'] != $id) {
				throw new InvalidArgumentException('Email already used by another account');
			}
		}
		if (isset($data['password']) && !empty($data['password'])) {
			// Validate password strength if being updated
			$this->validatePasswordStrength($data['password']);
			$data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
		}
		return $this->dao->update($id, $data);
	}
}

?>
