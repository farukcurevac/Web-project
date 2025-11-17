<?php
/**
 * Order routes (singular)
 */

// List orders
/**
 * @OA\Get(
 *     path="/order",
 *     summary="List orders",
 *     @OA\Response(response=200, description="A list of orders", @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/Order")))
 * )
 */
Flight::route('GET /order', function() {
    Flight::json(Flight::orderService()->getAll());
});

// Get order by id
/**
 * @OA\Get(
 *     path="/order/{id}",
 *     summary="Get order by ID",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *     @OA\Response(response=200, description="Order details", @OA\JsonContent(ref="#/components/schemas/Order")),
 *     @OA\Response(response=404, description="Not found")
 * )
 */
Flight::route('GET /order/@id', function($id) {
    Flight::json(Flight::orderService()->getById($id));
});

// Create order (purchase)
/**
 * @OA\Post(
 *     path="/order",
 *     summary="Create a new order",
 *     @OA\RequestBody(@OA\JsonContent(ref="#/components/schemas/OrderCreate")),
 *     @OA\Response(response=201, description="Order created", @OA\JsonContent(ref="#/components/schemas/Order"))
 * )
 */
Flight::route('POST /order', function() {
    $data = Flight::getRequestData();
    $created = Flight::orderService()->create($data);
    Flight::response()->status(201);
    Flight::json($created);
});

// Replace order
/**
 * @OA\Put(
 *     path="/order/{id}",
 *     summary="Replace an order",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *     @OA\RequestBody(@OA\JsonContent(ref="#/components/schemas/OrderCreate")),
 *     @OA\Response(response=200, description="Order updated", @OA\JsonContent(ref="#/components/schemas/Order"))
 * )
 */
Flight::route('PUT /order/@id', function($id) {
    $data = Flight::getRequestData();
    Flight::json(Flight::orderService()->update($id, $data));
});

// Partial update order
/**
 * @OA\Patch(
 *     path="/order/{id}",
 *     summary="Partially update an order",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *     @OA\RequestBody(@OA\JsonContent(ref="#/components/schemas/OrderPatch")),
 *     @OA\Response(response=200, description="Order updated", @OA\JsonContent(ref="#/components/schemas/Order"))
 * )
 */
Flight::route('PATCH /order/@id', function($id) {
    $data = Flight::getRequestData();
    Flight::json(Flight::orderService()->update($id, $data));
});

// Delete order
/**
 * @OA\Delete(
 *     path="/order/{id}",
 *     summary="Delete an order",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *     @OA\Response(response=204, description="Deleted")
 * )
 */
Flight::route('DELETE /order/@id', function($id) {
    Flight::json(Flight::orderService()->delete($id));
});

?>
