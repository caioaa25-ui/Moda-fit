
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from './types';
import { CartProvider } from './context/CartContext';

// Pages
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AffiliateDashboard from './pages/AffiliateDashboard';
import Profile from './pages/Profile';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Tracking Affiliate Referrals
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const refCode = params.get('ref');
    if (refCode) {
      sessionStorage.setItem('affiliate_ref', refCode);
      // Increment clicks for the affiliate (simplified logic)
      // In a real app, we would debouce or check cookies to prevent spamming
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({ ...userDoc.data(), uid: firebaseUser.uid } as UserProfile);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar user={user} />
          <main className="flex-grow pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/produto/:id" element={<ProductDetail />} />
              <Route path="/carrinho" element={<Cart />} />
              <Route path="/checkout" element={user ? <Checkout user={user} /> : <Navigate to="/login" />} />
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
              <Route path="/registro" element={!user ? <Register /> : <Navigate to="/" />} />
              <Route path="/perfil" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />
              
              {/* Admin Routes */}
              <Route 
                path="/admin/*" 
                element={user?.tipo === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} 
              />

              {/* Affiliate Routes */}
              <Route 
                path="/dashboard-afiliado" 
                element={user?.tipo === 'afiliado' ? <AffiliateDashboard user={user} /> : <Navigate to="/" />} 
              />
            </Routes>
          </main>
          
          <footer className="bg-white border-t py-8 mt-12">
            <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
              <p>&copy; 2024 Moda Elite. Todos os direitos reservados.</p>
              <div className="mt-4 flex justify-center space-x-6">
                <a href="#" className="hover:text-indigo-600">Termos de Uso</a>
                <a href="#" className="hover:text-indigo-600">Privacidade</a>
                <a href="#" className="hover:text-indigo-600">Afiliados</a>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </CartProvider>
  );
};

export default App;
