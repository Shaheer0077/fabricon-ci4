<?php
namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\UserModel;
use Firebase\JWT\JWT;

class AuthController extends ResourceController
{
    protected $modelName = UserModel::class;
    protected $format = 'json';

    public function registerAdmin()
    {
        $data = $this->request->getJSON(true);

        $exists = $this->model->where('email', $data['email'])->first();
        if ($exists) return $this->fail('Admin already exists', 400);

        $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        $data['is_admin'] = 1;
        $this->model->insert($data);

        return $this->respondCreated(['message'=>'Admin created successfully']);
    }

    public function loginAdmin()
    {
        $data = $this->request->getJSON(true);

        $user = $this->model->where('email', $data['email'])->first();
        if (!$user) return $this->failNotFound('User not found');

        if (!password_verify($data['password'], $user['password'])) {
            return $this->fail('Wrong password', 401);
        }

        $payload = [
            'id' => $user['id'],
            'isAdmin' => (bool)$user['is_admin'],
            'iat' => time(),
            'exp' => time() + 604800 // 7 days
        ];

        $token = JWT::encode($payload, $_ENV['JWT_SECRET'], 'HS256');

        return $this->respond(['token'=>$token]);
    }
}