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