<?php
require_once __DIR__ . '/../dao/UserDao.php';
require_once __DIR__ . '/BaseService.php';

class UserService extends BaseService {
    public function __construct() {
        parent::__construct(new UserDao());
    }

    public function list() {
        return parent::list();
    }

    public function get($id) {
        return parent::getById($id);
    }

    public function create(array $data) {
        // No validators: perform minimal uniqueness check and insert
        $existing = isset($data['email']) ? $this->dao->getByEmail($data['email']) : null;
        if ($existing) {
            throw new Exception('Email already in use', 400);
        }

        $payload = [
            'name' => isset($data['name']) ? $data['name'] : null,
            'email' => isset($data['email']) ? $data['email'] : null,
            'password' => isset($data['password']) ? $data['password'] : null,
            'phone' => isset($data['phone']) ? $data['phone'] : null,
            'role' => isset($data['role']) ? $data['role'] : 'buyer'
        ];

        return parent::create($payload);
    }

    public function update($id, array $data) {
        if (isset($data['email'])) {
            $existing = $this->dao->getByEmail($data['email']);
            if ($existing && $existing['user_id'] != $id) {
                throw new Exception('Email already in use', 400);
            }
        }
        return parent::update($id, $data);
    }

    public function delete($id) {
        return parent::delete($id);
    }
}

?>
