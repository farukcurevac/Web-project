<?php
use PHPUnit\Framework\TestCase;
use Firebase\JWT\JWT;

class StubAuthMiddleware {
    public function verifyToken($token) { return true; }
    public function authorizeRole($role) { return true; }
    public function authorizeRoles($roles) { return true; }
}

class StubCarService {
    public function getAll() {
        return [
            ['id' => 1, 'brand' => 'TestBrand', 'model' => 'Model X']
        ];
    }

    public function getById($id) {
        return ['id' => (int)$id, 'brand' => 'TestBrand', 'model' => 'Model S'];
    }

    public function create($data) {
        return ['id' => 10, 'brand' => $data['brand'] ?? 'NewBrand', 'model' => $data['model'] ?? 'NewModel'];
    }

    public function update($id, $data) {
        return ['id' => (int)$id, 'brand' => $data['brand'] ?? 'UpdBrand', 'model' => $data['model'] ?? 'UpdModel'];
    }

    public function delete($id) {
        return ['deleted' => (int)$id];
    }
}

class CarRoutesTest extends TestCase {
    private static array $requestData = [];
    private static $phpunitExceptionHandler = null;
    private static $phpunitErrorHandler = null;

    public static function setUpBeforeClass(): void {
        // Preserve PHPUnit's handlers before bootstrap overrides them.
        self::$phpunitExceptionHandler = set_exception_handler(null);
        self::$phpunitErrorHandler = set_error_handler(null);

        require_once __DIR__ . '/../vendor/autoload.php';
        require_once __DIR__ . '/../rest/config.php';
        require_once __DIR__ . '/../rest/data/roles.php';
        require_once __DIR__ . '/../rest/bootstrap.php';

        // Restore PHPUnit's handlers.
        if (self::$phpunitExceptionHandler) {
            set_exception_handler(self::$phpunitExceptionHandler);
        } else {
            restore_exception_handler();
        }
        if (self::$phpunitErrorHandler) {
            set_error_handler(self::$phpunitErrorHandler);
        } else {
            restore_error_handler();
        }

        if (class_exists('Flight')) {
            // Override auth middleware and car service with stubs to avoid DB and JWT requirements.
            Flight::register('auth_middleware', 'StubAuthMiddleware');
            Flight::register('carService', 'StubCarService');
            // Override request data reader so we can inject payloads without php://input.
            Flight::map('getRequestData', function() {
                return CarRoutesTest::$requestData;
            });
        }
    }

    protected function setUp(): void {
        if (class_exists('Flight')) {
            // Reset request-related globals per test.
            $_SERVER['REQUEST_METHOD'] = 'GET';
            $_SERVER['REQUEST_URI'] = '/';
            $_SERVER['HTTP_AUTHENTICATION'] = 'dummy-token';
            self::$requestData = [];
        }
    }

    protected function tearDown(): void {
        if (class_exists('Flight')) {
            Flight::response()->status(200);
        }
        if (self::$phpunitExceptionHandler) {
            set_exception_handler(self::$phpunitExceptionHandler);
        } else {
            restore_exception_handler();
        }
        if (self::$phpunitErrorHandler) {
            set_error_handler(self::$phpunitErrorHandler);
        } else {
            restore_error_handler();
        }
    }

    public function testGetAllCars(): void {
        $_SERVER['REQUEST_METHOD'] = 'GET';
        $_SERVER['REQUEST_URI'] = '/car';
        $_SERVER['HTTP_AUTHENTICATION'] = $this->makeToken('ADMIN');

        ob_start();
        Flight::start();
        $output = ob_get_clean();

        $this->assertEquals(200, Flight::response()->status());
        $this->assertJson($output);
        $this->assertStringContainsString('TestBrand', $output);
    }

    public function testGetCarById(): void {
        $_SERVER['REQUEST_METHOD'] = 'GET';
        $_SERVER['REQUEST_URI'] = '/car/2';
        $_SERVER['HTTP_AUTHENTICATION'] = $this->makeToken('USER');

        ob_start();
        Flight::start();
        $output = ob_get_clean();

        $this->assertEquals(200, Flight::response()->status());
        $this->assertJson($output);
        $this->assertStringContainsString('"id":2', $output);
    }

    public function testCreateCar(): void {
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_SERVER['REQUEST_URI'] = '/car';
        $_SERVER['HTTP_AUTHENTICATION'] = $this->makeToken('ADMIN');
        self::$requestData = ['brand' => 'CreateBrand', 'model' => 'CreateModel'];

        ob_start();
        Flight::start();
        $output = ob_get_clean();

        $this->assertContains(Flight::response()->status(), [200, 201]);
        $this->assertJson($output);
        $this->assertStringContainsString('CreateBrand', $output);
    }

    public function testUpdateCarPut(): void {
        $_SERVER['REQUEST_METHOD'] = 'PUT';
        $_SERVER['REQUEST_URI'] = '/car/5';
        $_SERVER['HTTP_AUTHENTICATION'] = $this->makeToken('ADMIN');
        self::$requestData = ['brand' => 'UpdatedBrand', 'model' => 'UpdatedModel'];

        ob_start();
        Flight::start();
        $output = ob_get_clean();

        $this->assertEquals(200, Flight::response()->status());
        $this->assertJson($output);
        $this->assertStringContainsString('UpdatedBrand', $output);
        $this->assertStringContainsString('"id":5', $output);
    }

    public function testDeleteCar(): void {
        $_SERVER['REQUEST_METHOD'] = 'DELETE';
        $_SERVER['REQUEST_URI'] = '/car/7';
        $_SERVER['HTTP_AUTHENTICATION'] = $this->makeToken('ADMIN');

        ob_start();
        Flight::start();
        $output = ob_get_clean();

        $this->assertEquals(200, Flight::response()->status());
        $this->assertJson($output);
        $this->assertStringContainsString('"deleted":7', $output);
    }


    private function makeToken($role): string {
        $payload = ['user' => (object)['id' => 99, 'role' => $role]];
        return JWT::encode($payload, Config::JWT_SECRET(), 'HS256');
    }
}
