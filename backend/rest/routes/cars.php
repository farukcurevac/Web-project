<?php
/**
 * Car routes — singular base path compatible with provided OA-style file
 *
 * GET /car            -> list or filter by brand using ?brand=...
 * GET /car/{id}       -> get by id
 * POST /car           -> create
 * PUT /car/{id}       -> replace
 * PATCH /car/{id}     -> partial update
 * DELETE /car/{id}    -> delete
 */

// List all cars
/**
 * @OA\Get(
 *     path="/car",
 *     summary="List all cars",
 *     @OA\Response(
 *         response=200,
 *         description="A list of cars",
 *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/Car"))
 *     )
 * )
 */
Flight::route('GET /car', function() {
    Flight::auth_middleware()->authorizeRoles([Roles::ADMIN, Roles::USER]);
    Flight::json(Flight::carService()->getAll());
});

// Get car by id
/**
 * @OA\Get(
 *     path="/car/{id}",
 *     summary="Get car by ID",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *     @OA\Response(
 *         response=200,
 *         description="Car details",
 *         @OA\JsonContent(ref="#/components/schemas/Car")
 *     ),
 *     @OA\Response(response=404, description="Not found")
 * )
 */
Flight::route('GET /car/@id', function($id) {
    Flight::auth_middleware()->authorizeRoles([Roles::ADMIN, Roles::USER]);
    Flight::json(Flight::carService()->getById($id));
});

// Create car
/**
 * @OA\Post(
 *     path="/car",
 *     summary="Create a new car",
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(ref="#/components/schemas/CarCreate")
 *     ),
 *     @OA\Response(
 *         response=201,
 *         description="Car created",
 *         @OA\JsonContent(ref="#/components/schemas/Car")
 *     )
 * )
 */
Flight::route('POST /car', function() {
    Flight::auth_middleware()->authorizeRoles([Roles::ADMIN, Roles::USER]);
    $data = Flight::getRequestData();
    $created = Flight::carService()->create($data);
    // Return created resource with 201 status when DAO returns the row
    Flight::response()->status(201);
    Flight::json($created);
});

// Replace car
/**
 * @OA\Put(
 *     path="/car/{id}",
 *     summary="Replace a car",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *     @OA\RequestBody(@OA\JsonContent(ref="#/components/schemas/CarCreate")),
 *     @OA\Response(response=200, description="Car updated", @OA\JsonContent(ref="#/components/schemas/Car"))
 * )
 */
Flight::route('PUT /car/@id', function($id) {
    // Allow both ADMIN and USER, but if USER then ensure they own the car
    Flight::auth_middleware()->authorizeRoles([Roles::ADMIN, Roles::USER]);
    $data = Flight::getRequestData();

    $user = Flight::get('user');
    if ($user && isset($user->role) && $user->role === Roles::USER) {
        $car = Flight::carService()->getById($id);
        $ownerId = isset($user->user_id) ? $user->user_id : (isset($user->id) ? $user->id : null);
        if (!$car || !$ownerId || (isset($car['seller_id']) ? $car['seller_id'] : $car['seller_id']) != $ownerId) {
            Flight::halt(403, 'You can only edit your own listings');
            return;
        }
    }

    // Only allow price update for USER role to keep scope minimal
    if ($user && isset($user->role) && $user->role === Roles::USER) {
        $data = ['price' => $data['price']];
    }

    Flight::json(Flight::carService()->update($id, $data));
});

// (PATCH /car/{id} removed)

// Delete car
/**
 * @OA\Delete(
 *     path="/car/{id}",
 *     summary="Delete a car",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *     @OA\Response(response=204, description="Deleted")
 * )
 */
Flight::route('DELETE /car/@id', function($id) {
    Flight::auth_middleware()->authorizeRole(Roles::ADMIN);
    Flight::json(Flight::carService()->delete($id));
});

?>
