<?php
require_once __DIR__ . '/UserService.php';
require_once __DIR__ . '/CategoryService.php';
require_once __DIR__ . '/ReviewService.php';

echo "Running simple service validation tests...\n";

$tests = [];

// simple stub DAOs that avoid DB connections
class StubUserDao {
    public function getByEmail($email) { return null; }
    public function getById($id) { return ['user_id' => $id]; }
}

class StubCategoryDao {
    public function getByName($name) { return null; }
}

class StubCarDao {
    public function getById($id) { return ['car_id' => $id]; }
}

class StubReviewDao {
    public function insert($data) { return true; }
}

$tests[] = function() {
    $svc = new UserService(new StubUserDao());
    try {
        $svc->create(['password' => 'secret']);
        return ['ok' => false, 'msg' => 'Expected exception for missing email'];
    } catch (Exception $e) {
        return ['ok' => true, 'msg' => $e->getMessage()];
    }
};

$tests[] = function() {
    $svc = new UserService(new StubUserDao());
    try {
        $svc->create(['email' => 'not-an-email', 'password' => 'x']);
        return ['ok' => false, 'msg' => 'Expected exception for invalid email'];
    } catch (Exception $e) {
        return ['ok' => true, 'msg' => $e->getMessage()];
    }
};

$tests[] = function() {
    $svc = new CategoryService(new StubCategoryDao());
    try {
        $svc->create([]);
        return ['ok' => false, 'msg' => 'Expected exception for missing category name'];
    } catch (Exception $e) {
        return ['ok' => true, 'msg' => $e->getMessage()];
    }
};

$tests[] = function() {
    // Use stubs that indicate user/car exist so rating validation runs
    $svc = new ReviewService(new StubReviewDao(), new StubUserDao(), new StubCarDao());
    try {
        $svc->create(['user_id' => 1, 'car_id' => 1, 'rating' => 10]);
        return ['ok' => false, 'msg' => 'Expected exception for invalid rating'];
    } catch (Exception $e) {
        return ['ok' => true, 'msg' => $e->getMessage()];
    }
};

$i = 1;
foreach ($tests as $t) {
    $res = $t();
    echo "Test $i: ";
    echo $res['ok'] ? "PASS" : "FAIL";
    echo " - " . $res['msg'] . "\n";
    $i++;
}

echo "Done. Note: these tests exercise validation logic only and do not require DB writes.\n";

?>