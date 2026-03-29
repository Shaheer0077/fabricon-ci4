<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateProducts extends Migration
{
 public function up()
    {
        $this->forge->addField([
            'id'              => ['type'=>'INT','constraint'=>11,'unsigned'=>true,'auto_increment'=>true],
            'title'           => ['type'=>'VARCHAR','constraint'=>255],
            'description'     => ['type'=>'TEXT'],
            'price'           => ['type'=>'DECIMAL','constraint'=>'10,2'],
            'category'        => ['type'=>'VARCHAR','constraint'=>255],
            'subcategory'     => ['type'=>'VARCHAR','constraint'=>255,'null'=>true],
            'colors'          => ['type'=>'JSON','null'=>true],
            'sizes'           => ['type'=>'JSON','null'=>true],
            'images'          => ['type'=>'JSON','null'=>true],
            'views'           => ['type'=>'JSON','null'=>true],
            'default_color'   => ['type'=>'VARCHAR','constraint'=>255,'null'=>true],
            'customizable'    => ['type'=>'TINYINT','constraint'=>1,'default'=>1],
            'is_special_offer'=> ['type'=>'TINYINT','constraint'=>1,'default'=>0],
            'is_eco_friendly' => ['type'=>'TINYINT','constraint'=>1,'default'=>0],
            'created_at'      => ['type'=>'DATETIME','null'=>true],
            'updated_at'      => ['type'=>'DATETIME','null'=>true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->createTable('products');
    }

    public function down()
    {
        $this->forge->dropTable('products');
    }
}
