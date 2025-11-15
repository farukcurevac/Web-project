<?php
require_once __DIR__ . '/../services/UserService.php';
require_once __DIR__ . '/../Response.php';

$service = new UserService();

function route_users_list() {
    global $service;
    $data = $service->list();
    Response::json($data, 200);
}

function route_users_get($id) {
    global $service;
    $user = $service->get($id);
    if (!$user) Response::error('Not found', 404);
    Response::json($user, 200);
}

function route_users_create() {
    global $service;
    $input = json_decode(file_get_contents('php://input'), true);
    $service->create($input);
    Response::json(['message' => 'Created'], 201);
}

function route_users_update($id) {
    global $service;
    $input = json_decode(file_get_contents('php://input'), true);
    $service->update($id, $input);
    Response::json(['message' => 'Updated'], 200);
}

function route_users_delete($id) {
    global $service;
    $service->delete($id);
    Response::json(['message' => 'Deleted'], 200);
}

if (class_exists('Flight')) {
    Flight::route('GET /api/users', 'route_users_list');
    Flight::route('GET /api/users/@id', 'route_users_get');
    Flight::route('POST /api/users', 'route_users_create');
    Flight::route('PUT /api/users/@id', 'route_users_update');
    Flight::route('DELETE /api/users/@id', 'route_users_delete');
}

?>
