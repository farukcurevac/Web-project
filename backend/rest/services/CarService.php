<?php
require_once __DIR__ . '/../dao/CarDao.php';
require_once __DIR__ . '/../dao/CategoryDao.php';
require_once __DIR__ . '/../dao/UserDao.php';
require_once __DIR__ . '/BaseService.php';

class CarService extends BaseService {
	protected $categoryDao;
	protected $userDao;

	public function __construct($carDao = null, $categoryDao = null, $userDao = null) {
		parent::__construct($carDao ?: new CarDao());
		$this->categoryDao = $categoryDao ?: new CategoryDao();
		$this->userDao = $userDao ?: new UserDao();
	}

	public function create($data) {
		if (!is_array($data)) {
			throw new InvalidArgumentException('Car data must be an array');
		}
		// Accept either a title/name or a model for the car. Some front-end payloads
		// use `title` while older code used `name` — normalize to `title`.
		if (empty($data['name']) && empty($data['title']) && empty($data['model'])) {
			throw new InvalidArgumentException('Car title or model is required');
		}
		if (!empty($data['name']) && empty($data['title'])) {
			// normalize `name` -> `title` so DB column `title` is populated
			$data['title'] = $data['name'];
			unset($data['name']);
		}
		if (empty($data['seller_id'])) {
			throw new InvalidArgumentException('Seller id is required');
		}
		if (empty($data['category_id'])) {
			throw new InvalidArgumentException('Category id is required');
		}
		$seller = $this->userDao->getById($data['seller_id']);
		if (!$seller) {
			throw new InvalidArgumentException('Seller not found');
		}
		$category = $this->categoryDao->getById($data['category_id']);
		if (!$category) {
			throw new InvalidArgumentException('Category not found');
		}
		// Accept 'price' for buying/selling apps and validate it.
		// Keep the key as 'price' so we don't try to insert a non-existent column like `price_per_day`.
		if (isset($data['price'])) {
			if (!is_numeric($data['price'])) {
				throw new InvalidArgumentException('Price must be numeric');
			}
			// leave $data['price'] as-is; DB should have `price` column in this deployment
		}

		// Set default status for new car listings
		if (empty($data['status'])) {
			$data['status'] = 'AVAILABLE';
		}

		return $this->dao->insert($data);
	}

	public function update($id, $data) {
		if (isset($data['seller_id'])) {
			$seller = $this->userDao->getById($data['seller_id']);
			if (!$seller) throw new InvalidArgumentException('Seller not found');
		}
		if (isset($data['category_id'])) {
			$category = $this->categoryDao->getById($data['category_id']);
			if (!$category) throw new InvalidArgumentException('Category not found');
		}
		if (isset($data['price'])) {
			if (!is_numeric($data['price'])) {
				throw new InvalidArgumentException('Price must be numeric');
			}
			// keep price key unchanged so update uses column `price`
		}

		return $this->dao->update($id, $data);
	}

	/**
	 * Return cars filtered by brand (delegates to DAO). Accepts partial match.
	 */
	public function getByBrand($brand) {
		if (empty($brand)) return [];
		return $this->dao->getByBrand($brand);
	}
}

?>
