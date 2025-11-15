<?php
require_once __DIR__ . '/../services/ReviewService.php';
require_once __DIR__ . '/../Response.php';

$service = new ReviewService();

function route_reviews_list() {
    global $service;
    $data = $service->list();
    Response::json($data, 200);
}

function route_reviews_get($id) {
    global $service;
    $r = $service->get($id);
    if (!$r) Response::error('Not found', 404);
    Response::json($r, 200);
}

function route_reviews_create() {
    global $service;
    $input = json_decode(file_get_contents('php://input'), true);
    $service->create($input);
    Response::json(['message' => 'Created'], 201);
}

function route_reviews_update($id) {
    global $service;
    $input = json_decode(file_get_contents('php://input'), true);
    $service->update($id, $input);
    Response::json(['message' => 'Updated'], 200);
}

function route_reviews_delete($id) {
    global $service;
    $service->delete($id);
    Response::json(['message' => 'Deleted'], 200);
}

if (class_exists('Flight')) {
    Flight::route('GET /api/reviews', 'route_reviews_list');
    Flight::route('GET /api/reviews/@id', 'route_reviews_get');
    Flight::route('POST /api/reviews', 'route_reviews_create');
    Flight::route('PUT /api/reviews/@id', 'route_reviews_update');
    Flight::route('DELETE /api/reviews/@id', 'route_reviews_delete');
}

?>
