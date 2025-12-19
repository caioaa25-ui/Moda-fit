
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, LogOut, LayoutDashboard, TrendingUp } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { UserProfile } from '../types';
import { auth } from '../firebase';

interface NavbarProps {
  user: UserProfile | null;
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const { totalItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-indigo-600 tracking-tight">MODA ELITE</Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-indigo-600 transition-colors">Início</Link>
            {user?.tipo === 'admin' && (
              <Link to="/admin" className="text-gray-600 hover:text-indigo-600 flex items-center gap-1">
                <LayoutDashboard size={18} /> Admin
              </Link>
            )}
            {user?.tipo === 'afiliado' && (
              <Link to="/dashboard-afiliado" className="text-gray-600 hover:text-indigo-600 flex items-center gap-1">
                <TrendingUp size={18} /> Afiliado
              </Link>
            )}
            
            <Link to="/carrinho" className="relative text-gray-600 hover:text-indigo-600">
              <ShoppingBag size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/perfil" className="text-gray-600 hover:text-indigo-600 flex items-center gap-1">
                  <User size={20} />
                  <span className="text-sm font-medium">{user.nome.split(' ')[0]}</span>
                </Link>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-500">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 transition-all font-medium">
                Entrar
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/carrinho" className="relative text-gray-600">
              <ShoppingBag size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-gray-700 font-medium">Início</Link>
            {user?.tipo === 'admin' && (
              <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-indigo-600 font-medium">Painel Admin</Link>
            )}
            {user?.tipo === 'afiliado' && (
              <Link to="/dashboard-afiliado" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-indigo-600 font-medium">Painel Afiliado</Link>
            )}
            {user ? (
              <>
                <Link to="/perfil" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-gray-700">Meu Perfil</Link>
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-red-500 font-medium">Sair</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-indigo-600 font-bold underline">Fazer Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
