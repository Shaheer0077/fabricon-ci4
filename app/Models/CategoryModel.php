<?php
namespace App\Models;

use CodeIgniter\Model;

class CategoryModel extends Model
{
    protected $table = 'categories';
    protected $primaryKey = 'id';
    protected $allowedFields = ['name', 'subcategories', 'image'];
    protected $returnType = 'array';
    protected $useTimestamps = true;

    // Convert subcategories array to JSON string
    protected $beforeInsert = ['encodeSubcategories'];
    protected $beforeUpdate = ['encodeSubcategories'];
    protected $afterFind = ['decodeSubcategories'];

    protected function encodeSubcategories(array $data)
    {
        if(isset($data['data']['subcategories']) && is_array($data['data']['subcategories'])){
            $data['data']['subcategories'] = json_encode($data['data']['subcategories']);
        }
        return $data;
    }

    protected function decodeSubcategories(array $data)
    {
        if(isset($data['data']['subcategories'])){
            $data['data']['subcategories'] = json_decode($data['data']['subcategories'], true);
        }
        return $data;
    }
}