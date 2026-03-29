<?php

namespace Config;

$routes = Services::routes();

// Default
$routes->get('/', 'Home::index');

// Handle OPTIONS preflight requests
$routes->options('(:any)', function() {});

// ---- AUTH ROUTES ----
$routes->post('api/admin/register', 'AuthController::registerAdmin'); // Only run once for default admin
$routes->post('api/admin/login', 'AuthController::loginAdmin');

// ---- CATEGORY ROUTES ----
$routes->get('api/categories', 'CategoryController::index'); // Public
$routes->group('api/categories', ['filter'=>'adminauth'], function($routes){
    $routes->post('', 'CategoryController::create');
    $routes->put('(:segment)', 'CategoryController::update/$1');
    $routes->delete('(:segment)', 'CategoryController::delete/$1');
});

// ---- PRODUCT ROUTES ----
$routes->get('api/products', 'ProductController::index'); // Public
$routes->get('api/products/(:segment)', 'ProductController::show/$1'); // Public
$routes->group('api/products', ['filter'=>'adminauth'], function($routes){
    $routes->post('', 'ProductController::create');
    $routes->put('(:segment)', 'ProductController::update/$1');
    $routes->delete('(:segment)', 'ProductController::delete/$1');
});

// ---- ORDER ROUTES ----
$routes->post('api/orders', 'OrderController::create'); // Public
$routes->get('api/orders/track/(:segment)', 'OrderController::track/$1'); // Public
$routes->group('api/orders', ['filter'=>'adminauth'], function($routes){
    $routes->get('', 'OrderController::index');
    $routes->put('(:segment)/status', 'OrderController::updateStatus/$1');
    $routes->delete('(:segment)', 'OrderController::delete/$1');
});