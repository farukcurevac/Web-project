<?php
require_once __DIR__ . '/../services/CarService.php';
require_once __DIR__ . '/../Response.php';

$service = new CarService();

function route_cars_list() {
    global $service;
    $data = $service->list();
    Response::json($data, 200);
}

function route_cars_get($id) {
    global $service;
    $car = $service->get($id);
    if (!$car) Response::error('Not found', 404);
    Response::json($car, 200);
}

function route_cars_create() {
    global $service;
    $input = json_decode(file_get_contents('php://input'), true);
    $service->create($input);
    Response::json(['message' => 'Created'], 201);
}

function route_cars_update($id) {
    global $service;
    $input = json_decode(file_get_contents('php://input'), true);
    $service->update($id, $input);
    Response::json(['message' => 'Updated'], 200);
}

function route_cars_delete($id) {
    global $service;
    $service->delete($id);
    Response::json(['message' => 'Deleted'], 200);
}

if (class_exists('Flight')) {
    Flight::route('GET /api/cars', 'route_cars_list');
    Flight::route('GET /api/cars/@id', 'route_cars_get');
    Flight::route('POST /api/cars', 'route_cars_create');
    Flight::route('PUT /api/cars/@id', 'route_cars_update');
    Flight::route('DELETE /api/cars/@id', 'route_cars_delete');
}

?>
