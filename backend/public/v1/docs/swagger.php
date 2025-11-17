<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

$autoload = __DIR__ . '/../../../vendor/autoload.php';
if (!file_exists($autoload)) {
	header('Content-Type: application/json', true, 500);
	echo json_encode(['error' => "Composer autoload not found at $autoload"]);
	exit(1);
}

require $autoload;

// Define BASE_URL depending on environment
if (isset($_SERVER['SERVER_NAME']) && ($_SERVER['SERVER_NAME'] === 'localhost' || $_SERVER['SERVER_NAME'] === '127.0.0.1')) {
	define('BASE_URL', 'http://localhost/WEB_PROJEKAT.1/backend');
} else {
	define('BASE_URL', 'https://your-production-domain/backend');
}

try {
	// Capture any warnings/deprecation output so headers and JSON stay clean
	ini_set('display_errors', '0');
	error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED & ~E_NOTICE);
	ob_start();
	$openapi = \OpenApi\Generator::scan([
		__DIR__ . '/doc_setup.php',
		__DIR__ . '/../../../rest/routes'
	]);
	$json = $openapi->toJson();
	$buffer = ob_get_clean();
	if (!empty($buffer)) {
		// Save warnings to project root for later inspection
		@file_put_contents(__DIR__ . '/../../../swagger-warnings.log', date('c') . "\n" . $buffer . "\n----\n", FILE_APPEND);
	}

	header('Content-Type: application/json');
	echo $json;
} catch (\Throwable $e) {
	// Discard any buffered output
	if (ob_get_level()) {
		ob_end_clean();
	}
	http_response_code(500);
	header('Content-Type: application/json');
	echo json_encode(['error' => 'Failed to generate OpenAPI JSON', 'message' => $e->getMessage()]);
	exit(1);
}

