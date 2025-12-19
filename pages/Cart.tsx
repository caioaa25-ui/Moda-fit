
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ArrowRight, ShoppingCart } from 'lucide-react';

const Cart: React.FC = () => {
  const { cart, removeFromCart, totalPrice, totalItems } = useCart();

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 text-gray-400 mb-6">
          <ShoppingCart size={48} />
        </div>
        <h2 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h2>
        <p className="text-gray-500 mb-8">Parece que você ainda não adicionou nada ao carrinho.</p>
        <Link to="/" className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold">Explorar Produtos</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Meu Carrinho ({totalItems})</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <img src={item.imagens[0]} className="w-24 h-32 object-cover rounded-lg" alt={item.nome} />
              <div className="flex-grow">
                <div className="flex justify-between">
                  <h3 className="font-bold text-gray-900">{item.nome}</h3>
                  <button onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={20} />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-2">Tamanho: {item.selectedSize} | Cor: {item.selectedColor}</p>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-indigo-600 font-bold">
                    {item.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                  <p className="text-gray-600">Qtd: {item.quantity}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border p-6 h-fit shadow-xl shadow-gray-100">
          <h2 className="text-xl font-bold mb-6">Resumo</h2>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Frete</span>
              <span className="text-green-500 font-bold">Grátis</span>
            </div>
            <div className="border-t pt-4 flex justify-between font-bold text-xl">
              <span>Total</span>
              <span>{totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
          </div>
          <Link 
            to="/checkout"
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Finalizar Compra <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
