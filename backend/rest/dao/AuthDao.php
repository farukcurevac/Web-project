<?php
require_once __DIR__ . '/BaseDao.php';


class AuthDao extends BaseDao {
   protected $table_name;


   public function __construct() {
       $this->table_name = "USER";
       parent::__construct($this->table_name, 'user_id');
   }


   public function get_user_by_email($email) {
       $stmt = $this->connection->prepare(
            "SELECT * FROM USER WHERE email = :email LIMIT 1"
        );
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    
   }
}

?>
