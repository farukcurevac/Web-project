<?php
require_once __DIR__ . '/../config.php';

class BaseDao {
    protected $table;
    protected $connection;
    protected $pk; // primary key column name

    /**
     * @param string $table table name
     * @param string $pk primary key column name (default 'id')
     */
    public function __construct($table, $pk = 'id') {
        $this->table = $table;
        $this->pk = $pk;
        $this->connection = Database::connect();
    }

    public function getAll() {
        $stmt = $this->connection->prepare("SELECT * FROM " . $this->table);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getById($id) {
        $sql = "SELECT * FROM " . $this->table . " WHERE " . $this->pk . " = :id";
        $stmt = $this->connection->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function insert($data) {
        $columns = implode(", ", array_keys($data));
        $placeholders = ":" . implode(", :", array_keys($data));
        $sql = "INSERT INTO " . $this->table . " ($columns) VALUES ($placeholders)";
        $stmt = $this->connection->prepare($sql);
        $ok = $stmt->execute($data);
        if (!$ok) return false;
        // Try to return the inserted row when possible (useful for APIs)
        try {
            $lastId = $this->connection->lastInsertId();
            if ($lastId) {
                return $this->getById($lastId);
            }
        } catch (Exception $e) {
            // ignore and fall back to returning boolean
        }
        return true;
    }

    public function update($id, $data) {
        $fields = "";
        foreach ($data as $key => $value) {
            $fields .= "$key = :$key, ";
        }
        $fields = rtrim($fields, ", ");
        $sql = "UPDATE " . $this->table . " SET $fields WHERE " . $this->pk . " = :id";
        $stmt = $this->connection->prepare($sql);
        $dataWithId = $data;
        $dataWithId['id'] = $id;
        return $stmt->execute($dataWithId);
    }

    public function delete($id) {
        $sql = "DELETE FROM " . $this->table . " WHERE " . $this->pk . " = :id";
        $stmt = $this->connection->prepare($sql);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
}
?>
