<?php
namespace App\Filters;

use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\Filters\FilterInterface;
use Firebase\JWT\JWT;

class AdminAuth implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $header = $request->getHeaderLine('Authorization');
        if(!$header) return service('response')->setStatusCode(401)->setJSON(['message'=>'Unauthorized']);

        try {
            $token = null;
            if (preg_match('/Bearer\s(\S+)/', $header, $matches)) $token = $matches[1];

            if(!$token) return service('response')->setStatusCode(401)->setJSON(['message'=>'Unauthorized']);
            
            $decoded = JWT::decode($token, new \Firebase\JWT\Key($_ENV['JWT_SECRET'], 'HS256'));
            
            if(!$decoded->isAdmin) return service('response')->setStatusCode(403)->setJSON(['message'=>'Admin access required']);
            
        } catch (\Exception $e){
            return service('response')->setStatusCode(401)->setJSON(['message'=>'Invalid token']);
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // Nothing after request
    }
}