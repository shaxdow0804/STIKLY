import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import Spinner from './components/ui/Spinner';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Categories from './pages/Categories';
import ProductDetail from './pages/ProductDetail';
import Custom from './pages/Custom';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import TrackOrder from './pages/TrackOrder';
import Wishlist from './pages/Wishlist';
import About from './pages/About';
import Contact from './pages/Contact';
import Policy from './pages/Policy';
import Auth from './pages/Auth';
import Account from './pages/Account';
import NotFound from './pages/NotFound';

// Admin code is split out so shoppers never download it.
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminCustom = lazy(() => import('./pages/admin/AdminCustom'));

export default function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="categories" element={<Categories />} />
          <Route path="product/:slug" element={<ProductDetail />} />
          <Route path="custom" element={<Custom />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success/:orderNumber" element={<OrderSuccess />} />
          <Route path="track-order" element={<TrackOrder />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="policies/:slug" element={<Policy />} />
          <Route path="login" element={<Auth mode="login" />} />
          <Route path="register" element={<Auth mode="register" />} />
          <Route path="account" element={<ProtectedAccount />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="custom" element={<AdminCustom />} />
          <Route path="reviews" element={<AdminReviews />} />
        </Route>
      </Routes>
    </Suspense>
  );
}


function ProtectedAccount() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? <Account /> : <Navigate to="/login" state={{ from: '/account' }} replace />;
}
