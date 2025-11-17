<?php
/**
 * Review routes (singular)
 */

// List reviews
/**
 * @OA\Get(
 *     path="/review",
 *     summary="List reviews",
 *     @OA\Response(response=200, description="A list of reviews", @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/Review")))
 * )
 */
Flight::route('GET /review', function() {
    Flight::json(Flight::reviewService()->getAll());
});

// Get review by id
/**
 * @OA\Get(
 *     path="/review/{id}",
 *     summary="Get review by ID",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *     @OA\Response(response=200, description="Review details", @OA\JsonContent(ref="#/components/schemas/Review")),
 *     @OA\Response(response=404, description="Not found")
 * )
 */
Flight::route('GET /review/@id', function($id) {
    Flight::json(Flight::reviewService()->getById($id));
});

// Create review
/**
 * @OA\Post(
 *     path="/review",
 *     summary="Create a new review",
 *     @OA\RequestBody(@OA\JsonContent(ref="#/components/schemas/ReviewCreate")),
 *     @OA\Response(response=201, description="Review created", @OA\JsonContent(ref="#/components/schemas/Review"))
 * )
 */
Flight::route('POST /review', function() {
    $data = Flight::getRequestData();
    $created = Flight::reviewService()->create($data);
    Flight::response()->status(201);
    Flight::json($created);
});

// Replace review
/**
 * @OA\Put(
 *     path="/review/{id}",
 *     summary="Replace a review",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *     @OA\RequestBody(@OA\JsonContent(ref="#/components/schemas/ReviewCreate")),
 *     @OA\Response(response=200, description="Review updated", @OA\JsonContent(ref="#/components/schemas/Review"))
 * )
 */
Flight::route('PUT /review/@id', function($id) {
    $data = Flight::getRequestData();
    Flight::json(Flight::reviewService()->update($id, $data));
});

// Partial update review
/**
 * @OA\Patch(
 *     path="/review/{id}",
 *     summary="Partially update a review",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *     @OA\RequestBody(@OA\JsonContent(ref="#/components/schemas/ReviewPatch")),
 *     @OA\Response(response=200, description="Review updated", @OA\JsonContent(ref="#/components/schemas/Review"))
 * )
 */
Flight::route('PATCH /review/@id', function($id) {
    $data = Flight::getRequestData();
    Flight::json(Flight::reviewService()->update($id, $data));
});

// Delete review
/**
 * @OA\Delete(
 *     path="/review/{id}",
 *     summary="Delete a review",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *     @OA\Response(response=204, description="Deleted")
 * )
 */
Flight::route('DELETE /review/@id', function($id) {
    Flight::json(Flight::reviewService()->delete($id));
});

?>
