<?php
// Bootstrap: require Composer autoload from backend/vendor
require_once __DIR__ . '/../vendor/autoload.php';

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/Response.php';
// Error handler mapping (generic)
set_exception_handler(function($e) {
    // Determine status code from exception if valid HTTP code present, otherwise 500
    $code = $e->getCode();
    $status = ($code >= 100 && $code < 600) ? $code : 500;
    $details = null;
    if (is_object($e) && method_exists($e, 'getErrors')) {
        $details = $e->getErrors();
        $status = $code ?: 422;
    }
    Response::error($e->getMessage(), $status, $details);
});

    // Register commonly used services in Flight so routes can call Flight::carService()
    require_once __DIR__ . '/services/CarService.php';
    require_once __DIR__ . '/services/UserService.php';
    require_once __DIR__ . '/services/CategoryService.php';
    require_once __DIR__ . '/services/OrderService.php';
    require_once __DIR__ . '/services/ReviewService.php';
    if (class_exists('Flight')) {
            if (class_exists('CarService')) Flight::register('carService', 'CarService');
            if (class_exists('UserService')) Flight::register('userService', 'UserService');
            if (class_exists('CategoryService')) Flight::register('categoryService', 'CategoryService');
            if (class_exists('OrderService')) Flight::register('orderService', 'OrderService');
            if (class_exists('ReviewService')) Flight::register('reviewService', 'ReviewService');
        }

        // Provide a safe helper to read JSON/request data in both real Flight and the fallback shim.
        if (class_exists('Flight')) {
            Flight::map('getRequestData', function() {
                try {
                    $req = Flight::request();
                    if (is_object($req)) {
                        if (isset($req->data) && is_object($req->data) && method_exists($req->data, 'getData')) {
                            return $req->data->getData();
                        }
                        if (isset($req->data) && is_array($req->data)) {
                            return $req->data;
                        }
                    }
                } catch (Exception $e) {
                    // ignore and fallback to raw input
                }
                $raw = file_get_contents('php://input');
                $decoded = json_decode($raw, true);
                return $decoded ?: [];
            });

            Flight::map('getQuery', function() {
                try {
                    $req = Flight::request();
                    if (is_object($req) && isset($req->query)) return $req->query;
                } catch (Exception $e) {
                    // ignore
                }
                return $_GET;
            });
        }

        // Include route files
        foreach (glob(__DIR__ . '/routes/*.php') as $routeFile) {
            require_once $routeFile;
        }

// If run via CLI for quick test, show a small message
if (php_sapi_name() === 'cli') {
    echo "Flight bootstrap ready. Use a webserver (or php -S) to serve routes.\n";
}

?>
