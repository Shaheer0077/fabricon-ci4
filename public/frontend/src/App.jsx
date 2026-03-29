import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminPath && <Navbar />}
      <main className="flex-grow">
        <Routes>
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

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/product/add" element={<AdminProductEdit />} />
          <Route path="/admin/product/edit/:id" element={<AdminProductEdit />} />
        </Routes>
      </main>
      {!isAdminPath && <Footer />}
    </div>
  );
}

export default App;
