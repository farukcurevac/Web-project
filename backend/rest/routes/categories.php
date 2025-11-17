<?php
/**
 * Category routes (singular)
 */

// List categories
/**
 * @OA\Get(
 *     path="/category",
 *     summary="List categories",
 *     @OA\Response(response=200, description="A list of categories", @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/Category")))
 * )
 */
Flight::route('GET /category', function() {
    Flight::json(Flight::categoryService()->getAll());
});

// Get category by id
/**
 * @OA\Get(
 *     path="/category/{id}",
 *     summary="Get category by ID",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *     @OA\Response(response=200, description="Category details", @OA\JsonContent(ref="#/components/schemas/Category")),
 *     @OA\Response(response=404, description="Not found")
 * )
 */
Flight::route('GET /category/@id', function($id) {
    Flight::json(Flight::categoryService()->getById($id));
});

// Create category
/**
 * @OA\Post(
 *     path="/category",
 *     summary="Create a new category",
 *     @OA\RequestBody(@OA\JsonContent(ref="#/components/schemas/CategoryCreate")),
 *     @OA\Response(response=201, description="Category created", @OA\JsonContent(ref="#/components/schemas/Category"))
 * )
 */
Flight::route('POST /category', function() {
    $data = Flight::getRequestData();
    $created = Flight::categoryService()->create($data);
    Flight::response()->status(201);
    Flight::json($created);
});

// Replace category
/**
 * @OA\Put(
 *     path="/category/{id}",
 *     summary="Replace a category",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *     @OA\RequestBody(@OA\JsonContent(ref="#/components/schemas/CategoryCreate")),
 *     @OA\Response(response=200, description="Category updated", @OA\JsonContent(ref="#/components/schemas/Category"))
 * )
 */
Flight::route('PUT /category/@id', function($id) {
    $data = Flight::getRequestData();
    Flight::json(Flight::categoryService()->update($id, $data));
});

// Partial update category
/**
 * @OA\Patch(
 *     path="/category/{id}",
 *     summary="Partially update a category",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *     @OA\RequestBody(@OA\JsonContent(ref="#/components/schemas/CategoryPatch")),
 *     @OA\Response(response=200, description="Category updated", @OA\JsonContent(ref="#/components/schemas/Category"))
 * )
 */
Flight::route('PATCH /category/@id', function($id) {
    $data = Flight::getRequestData();
    Flight::json(Flight::categoryService()->update($id, $data));
});

// Delete category
/**
 * @OA\Delete(
 *     path="/category/{id}",
 *     summary="Delete a category",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *     @OA\Response(response=204, description="Deleted")
 * )
 */
Flight::route('DELETE /category/@id', function($id) {
    Flight::json(Flight::categoryService()->delete($id));
});

?>
