<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateUsers extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id'         => ['type'=>'INT', 'constraint'=>11, 'unsigned'=>true, 'auto_increment'=>true],
            'name'       => ['type'=>'VARCHAR', 'constraint'=>191],
            'email'      => ['type'=>'VARCHAR', 'constraint'=>191, 'unique'=>true],
            'password'   => ['type'=>'VARCHAR', 'constraint'=>191],
            'is_admin'   => ['type'=>'TINYINT', 'constraint'=>1, 'default'=>0],
            'created_at' => ['type'=>'DATETIME', 'null'=>true],
            'updated_at' => ['type'=>'DATETIME', 'null'=>true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->createTable('users');
    }

    public function down()
    {
        $this->forge->dropTable('users');
    }
}
