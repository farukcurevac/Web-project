<?php
/**
 * User routes (singular style)
 * GET /user         -> list users
 * GET /user/{id}    -> get user
 * POST /user        -> create
 * PUT/PATCH /user/{id} -> update
 * DELETE /user/{id} -> delete
 */

// List users
/**
 * @OA\Get(
 *     path="/user",
 *     summary="List users",
 *     @OA\Response(response=200, description="A list of users", @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/User")))
 * )
 */
Flight::route('GET /user', function() {
    Flight::json(Flight::userService()->getAll());
});

// Get user by id
/**
 * @OA\Get(
 *     path="/user/{id}",
 *     summary="Get user by ID",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *     @OA\Response(response=200, description="User details", @OA\JsonContent(ref="#/components/schemas/User")),
 *     @OA\Response(response=404, description="Not found")
 * )
 */
Flight::route('GET /user/@id', function($id) {
    Flight::json(Flight::userService()->getById($id));
});

// Create user
/**
 * @OA\Post(
 *     path="/user",
 *     summary="Create a new user",
 *     @OA\RequestBody(@OA\JsonContent(ref="#/components/schemas/UserCreate")),
 *     @OA\Response(response=201, description="User created", @OA\JsonContent(ref="#/components/schemas/User"))
 * )
 */
Flight::route('POST /user', function() {
    $data = Flight::getRequestData();
    $created = Flight::userService()->create($data);
    Flight::response()->status(201);
    Flight::json($created);
});

// Replace user
/**
 * @OA\Put(
 *     path="/user/{id}",
 *     summary="Replace a user",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *     @OA\RequestBody(@OA\JsonContent(ref="#/components/schemas/UserCreate")),
 *     @OA\Response(response=200, description="User updated", @OA\JsonContent(ref="#/components/schemas/User"))
 * )
 */
Flight::route('PUT /user/@id', function($id) {
    $data = Flight::getRequestData();
    Flight::json(Flight::userService()->update($id, $data));
});

// Partial update user
/**
 * @OA\Patch(
 *     path="/user/{id}",
 *     summary="Partially update a user",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *     @OA\RequestBody(@OA\JsonContent(ref="#/components/schemas/UserPatch")),
 *     @OA\Response(response=200, description="User updated", @OA\JsonContent(ref="#/components/schemas/User"))
 * )
 */
Flight::route('PATCH /user/@id', function($id) {
    $data = Flight::getRequestData();
    Flight::json(Flight::userService()->update($id, $data));
});

// Delete user
/**
 * @OA\Delete(
 *     path="/user/{id}",
 *     summary="Delete a user",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *     @OA\Response(response=204, description="Deleted")
 * )
 */
Flight::route('DELETE /user/@id', function($id) {
    Flight::json(Flight::userService()->delete($id));
});

?>
