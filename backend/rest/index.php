<?php
// Entry point for Flight-based REST API
require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/bootstrap.php';

// Allow simple health check
if (php_sapi_name() === 'cli-server') {
    // built-in PHP server will serve static files automatically
}

if (class_exists('Flight')) {
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
