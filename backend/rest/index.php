<?php
// Entry point for Flight-based REST API
// Try to load Composer autoload from several locations (backend/vendor, project root vendor)
$autoloadPaths = [
    __DIR__ . '/../vendor/autoload.php',    // backend/vendor
    __DIR__ . '/../../vendor/autoload.php', // project-root/vendor (fallback)
    __DIR__ . '/../../vendor/mikecao/flight/flight/autoload.php', // flight shipped autoload
];
$loaded = false;
foreach ($autoloadPaths as $p) {
    if (file_exists($p)) {
        require_once $p;
        $loaded = true;
        break;
    }
}
if (!$loaded) {
    // No composer autoload found; continue but Flight may not be available.
    error_log('Warning: Composer autoload not found in expected locations.');
}

require_once __DIR__ . '/middleware/AuthMiddleware.php';
require_once __DIR__ . '/bootstrap.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

ini_set('display_errors', 1);
error_reporting(E_ALL);

// Allow simple health check
if (php_sapi_name() === 'cli-server') {
    // built-in PHP server will serve static files automatically
}

if (class_exists('Flight')) {
    // Register the middleware
    Flight::register('auth_middleware', 'AuthMiddleware');

    // Apply token verification globally
    // Allow login/register routes to skip verification
    Flight::route('/*', function() {
        if(
            strpos(Flight::request()->url, '/auth/login') === 0 ||
            strpos(Flight::request()->url, '/auth/register') === 0 ||
            strpos(Flight::request()->url, '/docs') === 0
        ) {
            return TRUE;
        } else {
            try {
                $token = Flight::request()->getHeader("Authentication");
                if(Flight::auth_middleware()->verifyToken($token))
                    return TRUE;
            } catch (\Exception $e) {
                Flight::halt(401, $e->getMessage());
            }
        }
    });

    // Optionally set JSON response header globally
    Flight::map('json', function($data) {
        header('Content-Type: application/json');
        echo json_encode($data);
    });

    Flight::start();
} else {
    echo "Flight framework not available.\n";
}

?>
