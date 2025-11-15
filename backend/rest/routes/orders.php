<?php
require_once __DIR__ . '/../services/OrderService.php';
require_once __DIR__ . '/../Response.php';

$service = new OrderService();

function route_orders_list() {
    global $service;
    $data = $service->list();
    Response::json($data, 200);
}

function route_orders_get($id) {
    global $service;
    $order = $service->get($id);
    if (!$order) Response::error('Not found', 404);
    Response::json($order, 200);
}

function route_orders_create() {
    global $service;
    $input = json_decode(file_get_contents('php://input'), true);
    $service->create($input);
    Response::json(['message' => 'Created'], 201);
}

function route_orders_update($id) {
    global $service;
    $input = json_decode(file_get_contents('php://input'), true);
    $service->update($id, $input);
    Response::json(['message' => 'Updated'], 200);
}

function route_orders_delete($id) {
    global $service;
    $service->delete($id);
    Response::json(['message' => 'Deleted'], 200);
}

if (class_exists('Flight')) {
    Flight::route('GET /api/orders', 'route_orders_list');
    Flight::route('GET /api/orders/@id', 'route_orders_get');
    Flight::route('POST /api/orders', 'route_orders_create');
    Flight::route('PUT /api/orders/@id', 'route_orders_update');
    Flight::route('DELETE /api/orders/@id', 'route_orders_delete');
}

?>
