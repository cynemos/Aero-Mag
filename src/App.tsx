import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { AdminRoute } from './components/AdminRoute';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Collection } from './pages/Collection';
import { MagazineView } from './pages/MagazineView';
import { MagazineEdit } from './pages/MagazineEdit';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import { About } from './pages/About';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/collection/:id" element={<MagazineView />} />
            <Route path="/a-propos" element={<About />} />
            <Route path="/connexion" element={<Login />} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/admin/revues/:id" element={<AdminRoute><MagazineEdit /></AdminRoute>} />
            {/* Anciennes adresses */}
            <Route path="/about" element={<Navigate to="/a-propos" replace />} />
            <Route path="/auth" element={<Navigate to="/connexion" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
