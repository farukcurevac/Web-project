<?php
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

Flight::group('/auth', function() {
   /**
    * @OA\Post(
    *     path="/auth/register",
    *     summary="Register new user.",
    *     description="Add a new user to the database.",
    *     tags={"auth"},
    *     security={
    *         {"ApiKey": {}}
    *     },
    *     @OA\RequestBody(
    *         description="Add new user",
    *         required=true,
    *         @OA\MediaType(
    *             mediaType="application/json",
    *             @OA\Schema(
    *                 required={"password", "email", "name"},
    *                 @OA\Property(
    *                     property="name",
    *                     type="string",
    *                     example="John Doe",
    *                     description="User full name"
    *                 ),
    *                 @OA\Property(
    *                     property="email",
    *                     type="string",
    *                     example="john@example.com",
    *                     description="User email"
    *                 ),
    *                 @OA\Property(
    *                     property="password",
    *                     type="string",
    *                     example="password123",
    *                     description="User password"
    *                 ),
    *                 @OA\Property(
    *                     property="phone",
    *                     type="string",
    *                     example="+1234567890",
    *                     description="User phone number (optional)"
    *                 ),
    *                 @OA\Property(
    *                     property="role",
    *                     type="string",
    *                     example="user",
    *                     description="User role (optional, defaults to 'user')"
    *                 )
    *             )
    *         )
    *     ),
    *     @OA\Response(
    *         response=200,
    *         description="User has been registered successfully."
    *     ),
    *     @OA\Response(
    *         response=500,
    *         description="Registration failed."
    *     )
    * )
    */
   Flight::route("POST /register", function () {
       $data = Flight::request()->data->getData();

       $response = Flight::authService()->register($data);
  
       if ($response['success']) {
           Flight::json([
               'message' => 'User registered successfully',
               'data' => $response['data']
           ]);
       } else {
           Flight::halt(500, $response['error']);
       }
   });

   /**
    * @OA\Post(
    *      path="/auth/login",
    *      tags={"auth"},
    *      summary="Login to system using email and password",
    *      @OA\Response(
    *           response=200,
    *           description="User data and JWT token"
    *      ),
    *      @OA\Response(
    *           response=500,
    *           description="Login failed"
    *      ),
    *      @OA\RequestBody(
    *          description="Credentials",
    *          @OA\JsonContent(
    *              required={"email","password"},
    *              @OA\Property(property="email", type="string", example="john@example.com", description="User email address"),
    *              @OA\Property(property="password", type="string", example="password123", description="User password")
    *          )
    *      )
    * )
    */
   Flight::route('POST /login', function() {
       $data = Flight::request()->data->getData();

       $response = Flight::authService()->login($data);
  
       if ($response['success']) {
           Flight::json([
               'message' => 'User logged in successfully',
               'data' => $response['data']
           ]);
       } else {
           Flight::halt(500, $response['error']);
       }
   });
});
?>
