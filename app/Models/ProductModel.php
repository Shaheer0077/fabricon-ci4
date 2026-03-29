<?php
namespace App\Models;

use CodeIgniter\Model;

class ProductModel extends Model
{
    protected $table = 'products';
    protected $primaryKey = 'id';
    protected $allowedFields = [
        'title', 'description', 'price', 'category', 'subcategory',
        'colors', 'sizes', 'images', 'views', 'default_color',
        'customizable', 'is_special_offer', 'is_eco_friendly'
    ];
    protected $returnType = 'array';
    protected $useTimestamps = true;

    // Encode arrays and views
    protected $beforeInsert = ['encodeFields'];
    protected $beforeUpdate = ['encodeFields'];
    protected $afterFind = ['decodeFields'];

    protected function encodeFields(array $data)
    {
        foreach(['colors','sizes','images','views'] as $field){
            if(isset($data['data'][$field]) && is_array($data['data'][$field])){
                $data['data'][$field] = json_encode($data['data'][$field]);
            }
        }
        return $data;
    }

    protected function decodeFields(array $data)
    {
        foreach(['colors','sizes','images','views'] as $field){
            if(isset($data['data'][$field])){
                $data['data'][$field] = json_decode($data['data'][$field], true);
            }
        }
        return $data;
    }
}