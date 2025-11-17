<?php
require_once __DIR__ . '/../dao/ReviewDao.php';
require_once __DIR__ . '/../dao/UserDao.php';
require_once __DIR__ . '/../dao/CarDao.php';
require_once __DIR__ . '/BaseService.php';

class ReviewService extends BaseService {
	protected $userDao;
	protected $carDao;

	public function __construct($reviewDao = null, $userDao = null, $carDao = null) {
		parent::__construct($reviewDao ?: new ReviewDao());
		$this->userDao = $userDao ?: new UserDao();
		$this->carDao = $carDao ?: new CarDao();
	}

	public function create($data) {
		if (!is_array($data)) throw new InvalidArgumentException('Review data must be an array');
		if (empty($data['user_id'])) throw new InvalidArgumentException('User id is required');
		if (empty($data['car_id'])) throw new InvalidArgumentException('Car id is required');
		if (!isset($data['rating'])) throw new InvalidArgumentException('Rating is required');

		$user = $this->userDao->getById($data['user_id']);
		if (!$user) throw new InvalidArgumentException('User not found');

		$car = $this->carDao->getById($data['car_id']);
		if (!$car) throw new InvalidArgumentException('Car not found');

		$rating = (int)$data['rating'];
		if ($rating < 1 || $rating > 5) throw new InvalidArgumentException('Rating must be between 1 and 5');

		return $this->dao->insert($data);
	}

	public function update($id, $data) {
		return $this->dao->update($id, $data);
	}
}

?>
