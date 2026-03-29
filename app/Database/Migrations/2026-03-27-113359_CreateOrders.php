<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateOrders extends Migration
{
     public function up()
    {
        $this->forge->addField([
            'id'              => ['type'=>'INT','constraint'=>11,'unsigned'=>true,'auto_increment'=>true],
            'customer'        => ['type'=>'JSON','null'=>false],
            'shipping_address'=> ['type'=>'JSON','null'=>false],
            'items'           => ['type'=>'JSON','null'=>false],
            'total_price'     => ['type'=>'DECIMAL','constraint'=>'10,2','default'=>0.00],
            'status'          => ['type'=>'ENUM', 'constraint'=>['Pending','Processing','Shipped','Delivered','Cancelled'], 'default'=>'Pending'],
            'tracking_token'  => ['type'=>'VARCHAR','constraint'=>191, 'unique'=>true,'charset' => 'utf8'],
            'created_at'      => ['type'=>'DATETIME','null'=>true],
            'updated_at'      => ['type'=>'DATETIME','null'=>true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->createTable('orders');
    }

    public function down()
    {
        $this->forge->dropTable('orders');
    }
}
