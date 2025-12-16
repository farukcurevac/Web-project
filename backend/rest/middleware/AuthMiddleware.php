<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../data/roles.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthMiddleware {
    
    /**
     * Verify JWT token
     * JWT Decoding: The verifyToken() method decodes the JWT token passed in the request header 
     * to extract user data, such as their ID and role. This step is very important because it 
     * ensures that only requests with valid tokens are processed, preventing unauthorized access.
     * 
     * @param string $token JWT token from header
     * @return bool true if token is valid
     * @throws Exception if token is invalid or expired
     */
    public function verifyToken($token) {
        if (!$token) {
            throw new Exception('Missing authentication token', 401);
        }

        try {
            $decoded = JWT::decode($token, new Key(Config::JWT_SECRET(), 'HS256'));
            
            // Store user data in Flight for use in routes
            if (isset($decoded->user)) {
                Flight::set('user', $decoded->user);
            }
            Flight::set('jwt_token', $token);
            
            return true;
        } catch (Exception $e) {
            throw new Exception('Invalid or expired token: ' . $e->getMessage(), 401);
        }
    }

    /**
     * Authorization Logic: Check if user has a specific role
     * The authorizeRole() method checks whether the user has the appropriate role to access the route.
     * If the user does not have the correct role, the request is halted, and a 403 Forbidden response is returned.
     * 
     * @param string $role The required role
     * @return bool true if user has the role
     * @throws Exception if user doesn't have required role
     */
    public function authorizeRole($role) {
        $user = Flight::get('user');
        if (!$user) {
            $token = Flight::request()->getHeader("Authentication");
            $this->verifyToken($token);
            $user = Flight::get('user');
        }
        
        if (!$user) {
            throw new Exception('User not authenticated', 401);
        }
        
        if (!isset($user->role)) {
            throw new Exception('User role not found', 403);
        }
        
        if ($user->role !== $role) {
            throw new Exception('Access denied. Required role: ' . $role, 403);
        }
        
        return true;
    }

    /**
     * Authorization Logic: Check if user has one of multiple roles
     * The authorizeRoles() method checks if the user has any of the allowed roles.
     * This is useful when multiple roles can access the same resource.
     * If the user does not have any of the correct roles, a 403 Forbidden response is returned.
     * 
     * @param array $roles Array of allowed roles
     * @return bool true if user has one of the roles
     * @throws Exception if user doesn't have any of the required roles
     */
    public function authorizeRoles($roles) {
        $user = Flight::get('user');
        if (!$user) {
            $token = Flight::request()->getHeader("Authentication");
            $this->verifyToken($token);
            $user = Flight::get('user');
        }
        
        if (!$user) {
            throw new Exception('User not authenticated', 401);
        }
        
        if (!isset($user->role)) {
            throw new Exception('User role not found', 403);
        }
        
        if (!in_array($user->role, $roles)) {
            throw new Exception('Access denied. Required roles: ' . implode(', ', $roles), 403);
        }
        
        return true;
    }
}
?>
