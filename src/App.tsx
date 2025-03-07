import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { AdminRoute } from './components/AdminRoute';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { MagazineList } from './pages/MagazineList';
import { MagazineGrid } from './pages/MagazineGrid';
import { MagazineDetail } from './pages/MagazineDetail';
import { MagazinePublicDetail } from './pages/MagazinePublicDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Orders } from './pages/Orders';
import { OrderDetail } from './pages/OrderDetail';
import { AdminDashboard } from './pages/AdminDashboard';
import { UsersList } from './pages/UsersList';
import { AdminChat } from './pages/AdminChat';
import { Auth } from './pages/Auth';
import { Profile } from './pages/Profile';
import { About } from './pages/About';
import { TermsOfService } from './pages/TermsOfService';
import { useAuth } from './lib/auth';

function ProtectedCartRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isAdmin = user?.email === 'cynemos@gmail.com';

  if (isAdmin) {
    return <Navigate to="/collection" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/collection" element={<MagazineGrid />} />
            <Route path="/collection/:id" element={<MagazinePublicDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/magazines" element={
              <AdminRoute>
                <MagazineList />
              </AdminRoute>
            } />
            <Route path="/magazines/:id" element={
              <AdminRoute>
                <MagazineDetail />
              </AdminRoute>
            } />
            <Route path="/cart" element={
              <ProtectedCartRoute>
                <Cart />
              </ProtectedCartRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedCartRoute>
                <Checkout />
              </ProtectedCartRoute>
            } />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/admin/users" element={
              <AdminRoute>
                <UsersList />
              </AdminRoute>
            } />
            <Route path="/admin/chat" element={
              <AdminRoute>
                <AdminChat />
              </AdminRoute>
            } />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/cgv" element={<TermsOfService />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
