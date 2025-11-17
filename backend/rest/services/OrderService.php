<?php
require_once __DIR__ . '/../dao/OrderDao.php';
require_once __DIR__ . '/../dao/UserDao.php';
require_once __DIR__ . '/../dao/CarDao.php';
require_once __DIR__ . '/BaseService.php';

class OrderService extends BaseService {
	protected $userDao;
	protected $carDao;

	public function __construct($orderDao = null, $userDao = null, $carDao = null) {
		parent::__construct($orderDao ?: new OrderDao());
		$this->userDao = $userDao ?: new UserDao();
		$this->carDao = $carDao ?: new CarDao();
	}

	public function create($data) {
		if (!is_array($data)) throw new InvalidArgumentException('Order data must be an array');
		if (empty($data['buyer_id'])) throw new InvalidArgumentException('Buyer id is required');
		if (empty($data['car_id'])) throw new InvalidArgumentException('Car id is required');

		$buyer = $this->userDao->getById($data['buyer_id']);
		if (!$buyer) throw new InvalidArgumentException('Buyer not found');

		$car = $this->carDao->getById($data['car_id']);
		if (!$car) throw new InvalidArgumentException('Car not found');

		// Check availability
		if (!empty($car['status']) && strtoupper($car['status']) !== 'AVAILABLE') {
			throw new InvalidArgumentException('Car is not available for purchase');
		}

		$inserted = $this->dao->insert($data);
		if ($inserted) {
			// mark car as sold
			try {
				$this->carDao->update($data['car_id'], ['status' => 'SOLD']);
			} catch (Exception $e) {
				// If marking as sold fails, you might want to roll back the order in a real DB transaction.
				// Here we simply continue and return the insert result.
			}
		}

		return $inserted;
	}

	public function update($id, $data) {
		return $this->dao->update($id, $data);
	}
}

?>
