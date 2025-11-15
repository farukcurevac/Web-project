<?php
require_once __DIR__ . '/../services/CategoryService.php';
require_once __DIR__ . '/../Response.php';

$service = new CategoryService();

// List categories
if (!function_exists('route_categories_list')) {
    function route_categories_list() {
        global $service;
        $data = $service->list();
        Response::json($data, 200);
    }
}

// Get category by id
if (!function_exists('route_categories_get')) {
    function route_categories_get($id) {
        global $service;
        $cat = $service->get($id);
        if (!$cat) Response::error('Not found', 404);
        Response::json($cat, 200);
    }
}

// Create category
if (!function_exists('route_categories_create')) {
    function route_categories_create() {
        global $service;
        $input = json_decode(file_get_contents('php://input'), true);
        $service->create($input);
        Response::json(['message' => 'Created'], 201);
    }
}

// Update category
if (!function_exists('route_categories_update')) {
    function route_categories_update($id) {
        global $service;
        $input = json_decode(file_get_contents('php://input'), true);
        $service->update($id, $input);
        Response::json(['message' => 'Updated'], 200);
    }
}

// Delete category
if (!function_exists('route_categories_delete')) {
    function route_categories_delete($id) {
        global $service;
        $service->delete($id);
        Response::json(['message' => 'Deleted'], 200);
    }
}

// If Flight is available, register the routes; otherwise leave functions for manual wiring
if (class_exists('Flight')) {
    Flight::route('GET /api/categories', 'route_categories_list');
    Flight::route('GET /api/categories/@id', 'route_categories_get');
    Flight::route('POST /api/categories', 'route_categories_create');
    Flight::route('PUT /api/categories/@id', 'route_categories_update');
    Flight::route('DELETE /api/categories/@id', 'route_categories_delete');
}

?>
