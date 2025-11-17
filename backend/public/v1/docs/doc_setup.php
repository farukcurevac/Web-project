<?php

/**
 * @OA\Info(
 *     title="FarukCars API",
 *     description="API documentation for FarukCars - manages cars, categories, orders, reviews and users.",
 *     version="1.0.0",
 *     @OA\Contact(
 *         email="it2001webprogramming@gmail.com",
 *         name="FarukCars Team"
 *     )
 * )
 */

/**
 * @OA\Server(
 *     url="http://localhost/WEB_PROJEKAT.1/backend/rest",
 *     description="Local development server (XAMPP) - includes /rest prefix"
 * )
 */

// OpenAPI metadata only. Component schemas below describe common models used by routes.
/**
 * @OA\Schema(
 *   schema="Car",
 *   type="object",
 *   @OA\Property(property="car_id", type="integer"),
 *   @OA\Property(property="title", type="string"),
 *   @OA\Property(property="description", type="string", nullable=true),
 *   @OA\Property(property="price", type="number", format="float"),
 *   @OA\Property(property="category_id", type="integer"),
 *   @OA\Property(property="seller_id", type="integer"),
 *   @OA\Property(property="image_url", type="string", nullable=true),
 *   @OA\Property(property="status", type="string"),
 *   example={"car_id":17,"title":"Hyundai i20 2016","description":null,"price":5500,"category_id":3,"seller_id":33,"image_url":null,"status":"AVAILABLE"}
 * )
 *
 * @OA\Schema(
 *   schema="CarCreate",
 *   required={"title","category_id","seller_id"},
 *   @OA\Property(property="title", type="string"),
 *   @OA\Property(property="description", type="string", nullable=true),
 *   @OA\Property(property="price", type="number", format="float"),
 *   @OA\Property(property="category_id", type="integer"),
 *   @OA\Property(property="seller_id", type="integer"),
 *   @OA\Property(property="image_url", type="string", nullable=true),
 *   @OA\Property(property="status", type="string"),
 *   example={"title":"BMW 3 Series 2018","description":"Well maintained","price":12000,"category_id":2,"seller_id":36,"image_url":null,"status":"AVAILABLE"}
 * )
 *
 * @OA\Schema(
 *   schema="CarPatch",
 *   @OA\Property(property="title", type="string"),
 *   @OA\Property(property="description", type="string"),
 *   @OA\Property(property="price", type="number", format="float")
 * )
 *
 * @OA\Schema(
 *   schema="Category",
 *   type="object",
 *   @OA\Property(property="id", type="integer"),
 *   @OA\Property(property="name", type="string")
 * )
 *
 * @OA\Schema(
 *   schema="CategoryCreate",
 *   required={"name"},
 *   @OA\Property(property="name", type="string")
 * )
 *
 * @OA\Schema(
 *   schema="CategoryPatch",
 *   @OA\Property(property="name", type="string")
 * )
 *
 * @OA\Schema(
 *   schema="Order",
 *   type="object",
 *   @OA\Property(property="id", type="integer"),
 *   @OA\Property(property="user_id", type="integer"),
 *   @OA\Property(property="car_id", type="integer"),
 *   @OA\Property(property="total", type="number", format="float"),
 *   @OA\Property(property="created_at", type="string", format="date-time")
 * )
 *
 * @OA\Schema(
 *   schema="OrderCreate",
 *   required={"user_id","car_id"},
 *   @OA\Property(property="user_id", type="integer"),
 *   @OA\Property(property="car_id", type="integer"),
 *   @OA\Property(property="total", type="number", format="float")
 * )
 *
 * @OA\Schema(
 *   schema="OrderPatch",
 *   @OA\Property(property="total", type="number", format="float")
 * )
 *
 * @OA\Schema(
 *   schema="Review",
 *   type="object",
 *   @OA\Property(property="id", type="integer"),
 *   @OA\Property(property="car_id", type="integer"),
 *   @OA\Property(property="user_id", type="integer"),
 *   @OA\Property(property="rating", type="integer"),
 *   @OA\Property(property="comment", type="string")
 * )
 *
 * @OA\Schema(
 *   schema="ReviewCreate",
 *   required={"car_id","user_id","rating"},
 *   @OA\Property(property="car_id", type="integer"),
 *   @OA\Property(property="user_id", type="integer"),
 *   @OA\Property(property="rating", type="integer"),
 *   @OA\Property(property="comment", type="string")
 * )
 *
 * @OA\Schema(
 *   schema="ReviewPatch",
 *   @OA\Property(property="rating", type="integer"),
 *   @OA\Property(property="comment", type="string")
 * )
 *
 * @OA\Schema(
 *   schema="User",
 *   type="object",
 *   @OA\Property(property="id", type="integer"),
 *   @OA\Property(property="name", type="string"),
 *   @OA\Property(property="email", type="string")
 * )
 *
 * @OA\Schema(
 *   schema="UserCreate",
 *   required={"name","email"},
 *   @OA\Property(property="name", type="string"),
 *   @OA\Property(property="email", type="string")
 * )
 *
 * @OA\Schema(
 *   schema="UserPatch",
 *   @OA\Property(property="name", type="string"),
 *   @OA\Property(property="email", type="string")
 * )
 *
 * To generate the JSON later use the CLI: php vendor/bin/openapi -o public/v1/openapi.json rest/ services/ dao/
 */


