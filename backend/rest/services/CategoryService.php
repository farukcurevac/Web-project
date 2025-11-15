<?php
require_once __DIR__ . '/../dao/CategoryDao.php';
require_once __DIR__ . '/BaseService.php';

class CategoryService extends BaseService {
    public function __construct() {
        parent::__construct(new CategoryDao());
    }

    public function list() {
        return parent::list();
    }

    public function get($id) {
        return parent::getById($id);
    }

    public function create(array $data) {
        // Minimal: keep previous behaviour but use base create
        $payload = ['name' => isset($data['name']) ? $data['name'] : null];
        return parent::create($payload);
    }

    public function update($id, array $data) {
        return parent::update($id, $data);
    }

    public function delete($id) {
        return parent::delete($id);
    }
}

?>
