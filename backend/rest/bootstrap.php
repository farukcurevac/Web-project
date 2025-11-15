<?php
// Minimal Flight bootstrap for REST routes
// Composer autoload is located at project root `vendor/autoload.php`.
require_once __DIR__ . '/../../vendor/autoload.php'; // if composer used
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

// Include route files
foreach (glob(__DIR__ . '/routes/*.php') as $routeFile) {
    require_once $routeFile;
}

// If run via CLI for quick test, show a small message
if (php_sapi_name() === 'cli') {
    echo "Flight bootstrap ready. Use a webserver (or php -S) to serve routes.\n";
}

?>
