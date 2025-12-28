<?php

class Config
{
    // Fetch env var or fallback to default
    private static function env(string $key, $default)
    {
        $value = $_ENV[$key] ?? getenv($key);
        return ($value === false || $value === null || $value === '') ? $default : $value;
    }

    public static function DB_NAME()
    {
        return self::env('DB_NAME', 'farukcars');
    }

    public static function DB_PORT()
    {
        return (int) self::env('DB_PORT', 3306);
    }

    public static function DB_USER()
    {
        return self::env('DB_USER', 'root');
    }

    public static function DB_PASSWORD()
    {
        return self::env('DB_PASSWORD', '');
    }

    public static function DB_HOST()
    {
        return self::env('DB_HOST', 'localhost');
    }

    public static function DB_SSL_CA()
    {
        return self::env('DB_SSL_CA', null); // optional CA file path for managed DBs
    }

    public static function JWT_SECRET()
    {
        return self::env('JWT_SECRET', 'farukcars-jwt-secret-2025-milestone3-secure-key-9x2kL@pQrS#tUvWxYz');
    }
}

class Database {
   private static $connection = null;

   public static function connect() {
       if (self::$connection === null) {
           try {
               $dsn = "mysql:host=" . Config::DB_HOST() . ";dbname=" . Config::DB_NAME() . ";port=" . Config::DB_PORT() . ";charset=utf8mb4";

               // Base PDO options
               $options = [
                   PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                   PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
               ];

               // Attach SSL if provided (DigitalOcean managed DBs require TLS)
               $ca = Config::DB_SSL_CA();
               if (!empty($ca)) {
                   $options[PDO::MYSQL_ATTR_SSL_CA] = $ca;
                   // If CA is trusted system-wide, this remains safe; otherwise disable verification.
                   $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;
               }

               self::$connection = new PDO(
                   $dsn,
                   Config::DB_USER(),
                   Config::DB_PASSWORD(),
                   $options
               );
           } catch (PDOException $e) {
               die("Connection failed: " . $e->getMessage());
           }
       }
       return self::$connection;
   }
}
?>
