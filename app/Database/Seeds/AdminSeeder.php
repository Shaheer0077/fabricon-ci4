<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;
use App\Models\UserModel;

class AdminSeeder extends Seeder
{
    public function run()
    {
        $model = new UserModel();

        // Check if admin already exists
        $admin = $model->where('email', 'admin@fabricon.com')->first();
        if (!$admin) {
            $model->insert([
                'name' => 'Fabricon Admin',
                'email' => 'admin@fabricon.com',
                'password' => 'admin123',
                'is_admin' => 1
            ]);
        } else {
            $model->update($admin['id'], [
                'password' => 'admin123'
            ]);
        }
    }
}
