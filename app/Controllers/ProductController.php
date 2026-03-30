<?php
namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\ProductModel;

class ProductController extends ResourceController
{
    protected $modelName = ProductModel::class;
    protected $format = 'json';

    // GET /api/products
    public function index()
    {
        $products = $this->model->orderBy('created_at','DESC')->findAll();
        $formatted = array_map([$this, 'formatProduct'], $products);
        return $this->respond($formatted);
    }

    // GET /api/products/(:id)
    public function show($id=null)
    {
        $product = $this->model->find($id);
        if(!$product) return $this->failNotFound('Product not found');
        return $this->respond($this->formatProduct($product));
    }

    // POST /api/products
    public function create()
    {
        $data = $this->request->getPost();
        $files = $this->request->getFiles();

        // Handle General Images
        $imagePaths = [];
        if (isset($files['images'])) {
            $imageFiles = is_array($files['images']) ? $files['images'] : [$files['images']];
            foreach ($imageFiles as $file) {
                if ($file->isValid() && !$file->hasMoved()) {
                    $newName = $file->getRandomName();
                    $file->move(FCPATH . 'uploads/products', $newName);
                    $imagePaths[] = '/uploads/products/' . $newName;
                }
            }
        }

        // Handle View Images
        $views = [
            'front'       => $this->uploadView($files, 'viewFront'),
            'back'        => $this->uploadView($files, 'viewBack'),
            'leftSleeve'  => $this->uploadView($files, 'viewLeftSleeve'),
            'rightSleeve' => $this->uploadView($files, 'viewRightSleeve'),
            'insideLabel' => $this->uploadView($files, 'viewInsideLabel'),
            'outsideLabel'=> $this->uploadView($files, 'viewOutsideLabel'),
        ];

        $insertData = [
            'title'           => $data['title'] ?? '',
            'description'     => $data['description'] ?? '',
            'price'           => $data['price'] ?? 0,
            'category'        => $data['category'] ?? '',
            'subcategory'     => $data['subcategory'] ?? '',
            'colors'          => $this->parseArray($data['colors'] ?? []),
            'sizes'           => $this->parseArray($data['sizes'] ?? []),
            'images'          => $imagePaths,
            'views'           => $views,
            'default_color'   => $data['defaultColor'] ?? '',
            'customizable'    => isset($data['customizable']) ? ($data['customizable'] === 'true' || $data['customizable'] == 1) : true,
            'is_special_offer'=> isset($data['isSpecialOffer']) ? ($data['isSpecialOffer'] === 'true' || $data['isSpecialOffer'] == 1) : false,
            'is_eco_friendly' => isset($data['isEcoFriendly']) ? ($data['isEcoFriendly'] === 'true' || $data['isEcoFriendly'] == 1) : false,
        ];

        $id = $this->model->insert($insertData);
        $insertData['id'] = $id;

        return $this->respondCreated(['message'=>'Product created','data'=>$this->formatProduct($insertData)]);
    }

    // PUT /api/products/(:id)
    public function update($id=null)
    {
        $product = $this->model->find($id);
        if(!$product) return $this->failNotFound('Product not found');

        $data = $this->request->getPost();
        $files = $this->request->getFiles();

        // Handle General Images
        $existingImages = $this->parseArray($data['existingImages'] ?? []);
        $newImages = [];
        if (isset($files['images'])) {
            $imageFiles = is_array($files['images']) ? $files['images'] : [$files['images']];
            foreach ($imageFiles as $file) {
                if ($file->isValid() && !$file->hasMoved()) {
                    $newName = $file->getRandomName();
                    $file->move(FCPATH . 'uploads/products', $newName);
                    $newImages[] = '/uploads/products/' . $newName;
                }
            }
        }
        $imagePaths = array_merge($existingImages, $newImages);

        // Handle Views
        $views = $product['views'] ?? [];
        $viewKeys = ['front', 'back', 'leftSleeve', 'rightSleeve', 'insideLabel', 'outsideLabel'];
        foreach ($viewKeys as $key) {
            $capitalizedKey = ucfirst($key);
            $fileKey = 'view' . $capitalizedKey;
            $existingKey = 'existingView' . $capitalizedKey;

            if (isset($files[$fileKey]) && $files[$fileKey]->isValid()) {
                $views[$key] = $this->uploadView($files, $fileKey);
            } elseif (isset($data[$existingKey])) {
                $views[$key] = $data[$existingKey];
            } else {
                $views[$key] = '';
            }
        }

        $updateData = [
            'title'           => $data['title'] ?? $product['title'],
            'description'     => $data['description'] ?? $product['description'],
            'price'           => $data['price'] ?? $product['price'],
            'category'        => $data['category'] ?? $product['category'],
            'subcategory'     => $data['subcategory'] ?? $product['subcategory'],
            'colors'          => isset($data['colors']) ? $this->parseArray($data['colors']) : $product['colors'],
            'sizes'           => isset($data['sizes']) ? $this->parseArray($data['sizes']) : $product['sizes'],
            'images'          => $imagePaths,
            'views'           => $views,
            'default_color'   => $data['defaultColor'] ?? $product['default_color'],
            'customizable'    => isset($data['customizable']) ? ($data['customizable'] === 'true' || $data['customizable'] == 1) : $product['customizable'],
            'is_special_offer'=> isset($data['isSpecialOffer']) ? ($data['isSpecialOffer'] === 'true' || $data['isSpecialOffer'] == 1) : $product['is_special_offer'],
            'is_eco_friendly' => isset($data['isEcoFriendly']) ? ($data['isEcoFriendly'] === 'true' || $data['isEcoFriendly'] == 1) : $product['is_eco_friendly'],
        ];

        $this->model->update($id, $updateData);
        $updateData['id'] = $id;

        return $this->respond(['message'=>'Product updated','data'=>$this->formatProduct($updateData)]);
    }

    // DELETE /api/products/(:id)
    public function delete($id=null)
    {
        if(!$this->model->find($id)) return $this->failNotFound('Product not found');

        $this->model->delete($id);
        return $this->respondDeleted(['message'=>'Product removed']);
    }

    private function uploadView($files, $key)
    {
        if (isset($files[$key]) && $files[$key]->isValid() && !$files[$key]->hasMoved()) {
            $newName = $files[$key]->getRandomName();
            $files[$key]->move(FCPATH . 'uploads/products', $newName);
            return '/uploads/products/' . $newName;
        }
        return '';
    }

    private function parseArray($value)
    {
        if (is_array($value)) return $value;
        if (empty($value)) return [];
        return array_map('trim', explode(',', $value));
    }

    private function formatProduct($product)
    {
        if (!$product) return $product;

        // Decode JSON fields if they are strings
        $product['colors'] = is_string($product['colors']) ? json_decode($product['colors'], true) : $product['colors'];
        $product['sizes'] = is_string($product['sizes']) ? json_decode($product['sizes'], true) : $product['sizes'];
        $product['images'] = is_string($product['images']) ? json_decode($product['images'], true) : $product['images'];
        $product['views'] = is_string($product['views']) ? json_decode($product['views'], true) : $product['views'];

        // Ensure they are at least empty arrays if decode fails
        $product['colors'] = $product['colors'] ?? [];
        $product['sizes'] = $product['sizes'] ?? [];
        $product['images'] = $product['images'] ?? [];
        $product['views'] = $product['views'] ?? (object)[];

        // Map snake_case to camelCase
        $product['defaultColor'] = $product['default_color'] ?? '';
        $product['isSpecialOffer'] = (bool)($product['is_special_offer'] ?? false);
        $product['isEcoFriendly'] = (bool)($product['is_eco_friendly'] ?? false);
        
        return $product;
    }
}