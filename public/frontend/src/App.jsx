import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ClientLayout from './components/ClientLayout';
import ScrollToTop from './components/ScrollToTop';
import NotFound from './pages/NotFound';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductList from './pages/ProductList';
import Customizer from './pages/Customizer';
import ProductView from './pages/ProductView';
import Checkout from './pages/Checkout';
import UserDashboard from './pages/UserDashboard';
import OrderTracking from './pages/OrderTracking';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductEdit from './pages/admin/AdminProductEdit';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCategories from './pages/admin/AdminCategories';

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<ClientLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/all-products" element={<ProductList />} />
          <Route path="/catalog/:category" element={<ProductList />} />
          <Route path="/search" element={<ProductList />} />
          <Route path="/product/:productId" element={<ProductView />} />
          <Route path="/customize/:productId" element={<Customizer />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/track/:token" element={<OrderTracking />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/product/add" element={<AdminProductEdit />} />
        <Route path="/admin/product/edit/:id" element={<AdminProductEdit />} />

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
