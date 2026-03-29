<?php
namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\CategoryModel;

class CategoryController extends ResourceController
{
    protected $modelName = CategoryModel::class;
    protected $format = 'json';

    // GET /api/categories
    public function index()
    {
        $categories = $this->model->orderBy('name','ASC')->findAll();
        // Return formatted for frontend compatibility
        $formatted = array_map(function($c){
            return [
                'id' => $c['id'],
                'name' => $c['name'],
                'subcategories' => is_string($c['subcategories']) ? json_decode($c['subcategories'], true) : $c['subcategories'],
                'image' => $c['image'],
                'createdAt' => $c['created_at'],
                'updatedAt' => $c['updated_at'],
            ];
        }, $categories);

        return $this->respond($formatted);
    }

    // POST /api/categories
    public function create()
    {
        $name = $this->request->getPost('name');
        
        // Check if exists
        if ($this->model->where('name', $name)->first()) {
            return $this->fail('Category already exists', 400);
        }

        $file = $this->request->getFile('image');
        $imagePath = '';
        if ($file && $file->isValid() && !$file->hasMoved()) {
            $newName = $file->getRandomName();
            $file->move(FCPATH . 'uploads/categories', $newName);
            $imagePath = '/uploads/categories/' . $newName;
        }

        $data = [
            'name'          => $name,
            'subcategories' => $this->parseArray($this->request->getPost('subcategories')),
            'image'         => $imagePath
        ];

        $this->model->insert($data);
        return $this->respondCreated(['message'=>'Category created','data'=>$data]);
    }

    // PUT /api/categories/(:id)
    public function update($id=null)
    {
        $category = $this->model->find($id);
        if(!$category) return $this->failNotFound('Category not found');

        $data = $this->request->getPost();
        $file = $this->request->getFile('image');
        
        $imagePath = $category['image'];
        if ($file && $file->isValid() && !$file->hasMoved()) {
            $newName = $file->getRandomName();
            $file->move(FCPATH . 'uploads/categories', $newName);
            $imagePath = '/uploads/categories/' . $newName;
        }

        $updateData = [
            'name'          => $data['name'] ?? $category['name'],
            'subcategories' => isset($data['subcategories']) ? $this->parseArray($data['subcategories']) : $category['subcategories'],
            'image'         => $imagePath
        ];

        $this->model->update($id, $updateData);
        return $this->respond(['message'=>'Category updated','data'=>$updateData]);
    }

    // DELETE /api/categories/(:id)
    public function delete($id=null)
    {
        if(!$this->model->find($id)) return $this->failNotFound('Category not found');

        $this->model->delete($id);
        return $this->respondDeleted(['message'=>'Category removed']);
    }

    private function parseArray($value)
    {
        if (is_array($value)) return $value;
        if (empty($value)) return [];
        return array_map('trim', explode(',', $value));
    }
}