<?php
require_once __DIR__ . '/../dao/CategoryDao.php';
require_once __DIR__ . '/BaseService.php';

class CategoryService extends BaseService {
	public function __construct($dao = null) {
		parent::__construct($dao ?: new CategoryDao());
	}

	public function create($data) {
		if (!is_array($data)) throw new InvalidArgumentException('Category data must be an array');
		if (empty($data['name'])) throw new InvalidArgumentException('Category name is required');
		$existing = $this->dao->getByName($data['name']);
		if ($existing) throw new InvalidArgumentException('Category with this name already exists');
		return $this->dao->insert($data);
	}

	public function update($id, $data) {
		if (isset($data['name'])) {
			$existing = $this->dao->getByName($data['name']);
			if ($existing && isset($existing['category_id']) && $existing['category_id'] != $id) {
				throw new InvalidArgumentException('Category name already used');
			}
		}
		return $this->dao->update($id, $data);
	}
}

?>
