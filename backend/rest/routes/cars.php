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

// (List cars route removed; use POST /car to create and GET /car/{id} to fetch individual cars)

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
    $data = Flight::getRequestData();
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
    Flight::json(Flight::carService()->delete($id));
});

?>
