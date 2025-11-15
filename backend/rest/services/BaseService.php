<?php
require_once __DIR__ . '/../dao/BaseDao.php';

/**
 * BaseService - generic service wrapper around a DAO
 * @property BaseDao $dao
 */
class BaseService {
   /** @var BaseDao */
   protected $dao;

   public function __construct(BaseDao $dao) {
       $this->dao = $dao;
   }
   /**
    * Alias used by existing services
    */
   public function list() {
       return $this->dao->getAll();
   }

   public function getAll() {
       return $this->dao->getAll();
   }

   public function getById($id) {
       return $this->dao->getById($id);
   }

   public function create(array $data) {
       return $this->dao->insert($data);
   }

   public function update($id, array $data) {
       return $this->dao->update($id, $data);
   }
   public function delete($id) {
       return $this->dao->delete($id);
   }
}
?>
