<?php
namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\OrderModel;

class OrderController extends ResourceController
{
    protected $modelName = OrderModel::class;
    protected $format = 'json';

    // POST /api/orders
    public function create()
    {
        $input = $this->request->getJSON(true);

        $data = [
            'customer'         => $input['customer'] ?? null,
            'shipping_address' => $input['shippingAddress'] ?? ($input['shipping_address'] ?? null),
            'items'            => $input['items'] ?? null,
            'total_price'      => $input['totalPrice'] ?? ($input['total_price'] ?? 0),
            'status'           => 'Pending',
            'tracking_token'   => strtoupper(bin2hex(random_bytes(4)))
        ];

        $id = $this->model->insert($data);
        $data['id'] = $id;

        // Return with camelCase for frontend compatibility
        $response = $data;
        $response['shippingAddress'] = $data['shipping_address'];
        $response['totalPrice'] = $data['total_price'];
        $response['trackingToken'] = $data['tracking_token'];

        return $this->respondCreated(['message'=>'Order created','data'=>$response]);
    }

    // GET /api/orders/track/(:token)
    public function track($token=null)
    {
        $order = $this->model->where('tracking_token', strtoupper($token))->first();
        if(!$order) return $this->failNotFound('Order not found');
        return $this->respond($this->formatOrder($order));
    }

    // GET /api/orders
    public function index()
    {
        $orders = $this->model->findAll();

        // Sort in PHP to avoid "Out of sort memory" MySQL error
        usort($orders, function($a, $b) {
            $dateA = $a['created_at'] ?? '0';
            $dateB = $b['created_at'] ?? '0';
            return strcmp($dateB, $dateA);
        });

        $formatted = array_map([$this, 'formatOrder'], $orders);
        return $this->respond($formatted);
    }

    // PUT /api/orders/(:id)/status
    public function updateStatus($id=null)
    {
        $data = $this->request->getJSON(true);
        $order = $this->model->find($id);
        if(!$order) return $this->failNotFound('Order not found');

        $order['status'] = $data['status'] ?? $order['status'];
        $this->model->update($id,$order);
        return $this->respond(['message'=>'Order status updated','data'=>$this->formatOrder($order)]);
    }

    // DELETE /api/orders/(:id)
    public function delete($id=null)
    {
        if(!$this->model->find($id)) return $this->failNotFound('Order not found');

        $this->model->delete($id);
        return $this->respondDeleted(['message'=>'Order removed']);
    }

    private function formatOrder($order)
    {
        if (!$order) return $order;
        $order['shippingAddress'] = $order['shipping_address'] ?? null;
        $order['totalPrice'] = (float)($order['total_price'] ?? 0);
        $order['trackingToken'] = $order['tracking_token'] ?? null;
        $order['createdAt'] = $order['created_at'] ?? null;
        $order['updatedAt'] = $order['updated_at'] ?? null;
        return $order;
    }
}