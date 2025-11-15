<?php
require_once __DIR__ . '/../dao/ReviewDao.php';
require_once __DIR__ . '/../dao/CarDao.php';
require_once __DIR__ . '/../dao/UserDao.php';

/**
 * ReviewService - business logic for reviews (simple, no external validators)
 */
require_once __DIR__ . '/BaseService.php';

class ReviewService extends BaseService {
    /** @var ReviewDao */
    protected $dao;
    /** @var CarDao */
    private $carDao;
    /** @var UserDao */
    private $userDao;

    public function __construct() {
        $this->dao = new ReviewDao();
        $this->carDao = new CarDao();
        $this->userDao = new UserDao();
    }

    /**
     * List all reviews
     * @return array
     */
    public function list() {
        return $this->dao->getAll();
    }

    /**
     * Get a review by id
     * @param int|string $id
     * @return array|false
     */
    public function get($id) {
        return $this->dao->getById($id);
    }

    /**
     * Create a review
     * @param array $data
     * @return mixed
     * @throws Exception on missing refs or invalid rating
     */
    public function create(array $data) {
        if (!isset($data['car_id']) || !isset($data['user_id']) || !isset($data['rating'])) {
            throw new Exception('Missing required fields: car_id, user_id, rating', 400);
        }

        $rating = $data['rating'];
        if (!is_numeric($rating) || $rating < 1 || $rating > 5) {
            throw new Exception('Rating must be between 1 and 5', 400);
        }

        $car = $this->carDao->getById($data['car_id']);
        if (!$car) throw new Exception('Car not found', 404);

        $user = $this->userDao->getById($data['user_id']);
        if (!$user) throw new Exception('User not found', 404);

        $payload = [
            'car_id' => $data['car_id'],
            'user_id' => $data['user_id'],
            'rating' => $rating,
            'comment' => isset($data['comment']) ? $data['comment'] : null,
            'review_date' => isset($data['review_date']) ? $data['review_date'] : date('Y-m-d')
        ];

        return $this->dao->insert($payload);
    }

    /**
     * Update a review
     * @param int|string $id
     * @param array $data
     * @return mixed
     * @throws Exception on invalid rating
     */
    public function update($id, array $data) {
        if (isset($data['rating'])) {
            $r = $data['rating'];
            if (!is_numeric($r) || $r < 1 || $r > 5) {
                throw new Exception('Rating must be between 1 and 5', 400);
            }
        }
        return $this->dao->update($id, $data);
    }

    /**
     * Delete a review
     * @param int|string $id
     * @return bool
     */
    public function delete($id) {
        return $this->dao->delete($id);
    }
}

?>
