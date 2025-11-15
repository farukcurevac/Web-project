<?php
require_once __DIR__ . '/../dao/CarDao.php';
require_once __DIR__ . '/../dao/CategoryDao.php';
require_once __DIR__ . '/../dao/UserDao.php';
require_once __DIR__ . '/BaseService.php';

class CarService extends BaseService {
    private $categoryDao;
    private $userDao;

    public function __construct() {
        parent::__construct(new CarDao());
        $this->categoryDao = new CategoryDao();
        $this->userDao = new UserDao();
    }

    public function list($filters = []) {
        // For now, support only basic list; filtering can be added later
        return $this->getAll();
    }

    public function get($id) {
        return $this->getById($id);
    }

    public function create(array $data) {
        // No validators: do minimal referential checks and insert
        $cat = isset($data['category_id']) ? $this->categoryDao->getById($data['category_id']) : null;
        if ($cat === null) {
            throw new Exception('Category not found', 404);
        }
        $seller = isset($data['seller_id']) ? $this->userDao->getById($data['seller_id']) : null;
        if ($seller === null) {
            throw new Exception('Seller not found', 404);
        }
        if (isset($seller['role']) && $seller['role'] !== 'seller') {
            throw new Exception('User is not a seller', 400);
        }

        $payload = [
            'title' => isset($data['title']) ? $data['title'] : null,
            'description' => isset($data['description']) ? $data['description'] : null,
            'price' => isset($data['price']) ? $data['price'] : null,
            'category_id' => isset($data['category_id']) ? $data['category_id'] : null,
            'seller_id' => isset($data['seller_id']) ? $data['seller_id'] : null,
            'image_url' => isset($data['image_url']) ? $data['image_url'] : '',
            'status' => isset($data['status']) ? $data['status'] : 'available'
        ];

        return $this->create($payload);
    }

    public function update($id, array $data) {
        // No validators: if referential fields provided, do minimal existence checks
        if (isset($data['category_id'])) {
            $cat = $this->categoryDao->getById($data['category_id']);
            if (!$cat) throw new Exception('Category not found', 404);
        }
        if (isset($data['seller_id'])) {
            $seller = $this->userDao->getById($data['seller_id']);
            if (!$seller) throw new Exception('Seller not found', 404);
        }

        return $this->update($id, $data);
    }

    public function delete($id) {
        return $this->delete($id);
    }
}

?>
