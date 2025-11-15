<?php
require_once __DIR__ . '/../dao/OrderDao.php';
require_once __DIR__ . '/../dao/CarDao.php';
require_once __DIR__ . '/../dao/UserDao.php';
require_once __DIR__ . '/BaseService.php';

class OrderService extends BaseService {
    private $carDao;
    private $userDao;

    public function __construct() {
        parent::__construct(new OrderDao());
        $this->carDao = new CarDao();
        $this->userDao = new UserDao();
    }

    public function list() {
        return $this->getAll();
    }

    public function get($id) {
        return $this->getById($id);
    }

    public function create(array $data) {
        // Minimal checks and insert
        $car = isset($data['car_id']) ? $this->carDao->getById($data['car_id']) : null;
        if (!$car) throw new Exception('Car not found', 404);
        if (isset($car['status']) && $car['status'] !== 'available') {
            throw new Exception('Car is not available for order', 400);
        }
        $buyer = isset($data['buyer_id']) ? $this->userDao->getById($data['buyer_id']) : null;
        if (!$buyer) throw new Exception('Buyer not found', 404);

        $payload = [
            'car_id' => isset($data['car_id']) ? $data['car_id'] : null,
            'buyer_id' => isset($data['buyer_id']) ? $data['buyer_id'] : null,
            'order_date' => isset($data['order_date']) ? $data['order_date'] : date('Y-m-d'),
            'status' => isset($data['status']) ? $data['status'] : 'pending'
        ];

        return $this->create($payload);
    }

    public function update($id, array $data) {
        return $this->update($id, $data);
    }

    public function delete($id) {
        return $this->delete($id);
    }
}

?>
