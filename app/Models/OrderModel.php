<?php
namespace App\Models;

use CodeIgniter\Model;

class OrderModel extends Model
{
    protected $table = 'orders';
    protected $primaryKey = 'id';
    protected $allowedFields = [
        'customer',
        'shipping_address',
        'items',
        'total_price',
        'status',
        'tracking_token'
    ];
    protected $returnType = 'array';
    protected $useTimestamps = true;

    // Encode customer, shipping address and items as JSON
    protected $beforeInsert = ['encodeFields'];
    protected $beforeUpdate = ['encodeFields'];
    protected $afterFind = ['decodeFields'];

    protected function encodeFields(array $data)
    {
        foreach (['customer', 'shipping_address', 'items'] as $field) {
            if (isset($data['data'][$field]) && is_array($data['data'][$field])) {
                $data['data'][$field] = json_encode($data['data'][$field]);
            }
        }
        return $data;
    }

    protected function decodeFields(array $data)
    {
        if (empty($data['data']))
            return $data;

        if ($data['singleton']) {
            $data['data'] = $this->decodeRow($data['data']);
        } else {
            foreach ($data['data'] as &$row) {
                $row = $this->decodeRow($row);
            }
        }
        return $data;
    }

    private function decodeRow($row)
    {
        foreach (['customer', 'shipping_address', 'items'] as $field) {
            if (isset($row[$field]) && is_string($row[$field])) {
                $row[$field] = json_decode($row[$field], true);
            }
        }
        return $row;
    }
}