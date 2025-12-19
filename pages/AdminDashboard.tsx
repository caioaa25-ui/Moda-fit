
import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Category, Order } from '../types';
import { Plus, Trash2, Package, Users, ShoppingCart, DollarSign, Edit } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'orders'>('stats');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    nome: '', preco: 0, estoque: 0, descricao: '', categoria: '', imagens: [], ativo: true, tamanhos: ['P', 'M', 'G'], cores: ['Preto', 'Branco']
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const prodSnap = await getDocs(collection(db, 'products'));
    setProducts(prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    
    const orderSnap = await getDocs(collection(db, 'orders'));
    setOrders(orderSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
  };

  const handleAddProduct = async () => {
    if (!newProduct.nome || !newProduct.preco) return;
    await addDoc(collection(db, 'products'), {
      ...newProduct,
      criadoEm: serverTimestamp(),
      imagens: ['https://picsum.photos/400/500?fashion'] // Placeholder
    });
    setShowModal(false);
    fetchData();
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Deseja excluir este produto?')) {
      await deleteDoc(doc(db, 'products', id));
      fetchData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-2">
          <button 
            onClick={() => setActiveTab('stats')}
            className={`w-full text-left p-4 rounded-xl flex items-center gap-3 font-bold transition-all ${activeTab === 'stats' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <DollarSign size={20} /> Visão Geral
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full text-left p-4 rounded-xl flex items-center gap-3 font-bold transition-all ${activeTab === 'products' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <Package size={20} /> Produtos
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left p-4 rounded-xl flex items-center gap-3 font-bold transition-all ${activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <ShoppingCart size={20} /> Pedidos
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          {activeTab === 'stats' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold mb-6">Relatório de Vendas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 bg-indigo-50 rounded-2xl">
                  <p className="text-indigo-600 text-sm font-bold uppercase mb-2">Total Vendido</p>
                  <p className="text-3xl font-extrabold text-indigo-900">
                    {orders.reduce((acc, o) => acc + o.valorTotal, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                <div className="p-6 bg-green-50 rounded-2xl">
                  <p className="text-green-600 text-sm font-bold uppercase mb-2">Pedidos Concluídos</p>
                  <p className="text-3xl font-extrabold text-green-900">{orders.length}</p>
                </div>
                <div className="p-6 bg-purple-50 rounded-2xl">
                  <p className="text-purple-600 text-sm font-bold uppercase mb-2">Produtos Ativos</p>
                  <p className="text-3xl font-extrabold text-purple-900">{products.length}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Gerenciar Produtos</h2>
                <button 
                  onClick={() => setShowModal(true)}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-full flex items-center gap-2 font-bold hover:bg-indigo-700"
                >
                  <Plus size={20} /> Novo Produto
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b text-gray-400 text-sm uppercase">
                    <tr>
                      <th className="pb-4">Produto</th>
                      <th className="pb-4">Preço</th>
                      <th className="pb-4">Estoque</th>
                      <th className="pb-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 font-bold flex items-center gap-3">
                          <img src={p.imagens[0]} className="w-10 h-10 rounded-lg object-cover" />
                          {p.nome}
                        </td>
                        <td className="py-4">R$ {p.preco.toFixed(2)}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.estoque > 10 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {p.estoque} un
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            <button className="p-2 text-gray-400 hover:text-indigo-600"><Edit size={18} /></button>
                            <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Pedidos Recentes</h2>
              <div className="space-y-4">
                {orders.map(o => (
                  <div key={o.id} className="p-4 border rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="font-bold">Pedido #{o.id.slice(-6)}</p>
                      <p className="text-sm text-gray-500">{o.produtos.length} itens</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-indigo-600">R$ {o.valorTotal.toFixed(2)}</p>
                      <span className="text-[10px] uppercase font-extrabold text-green-500">PAGO</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simplified Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full animate-in zoom-in duration-300">
            <h3 className="text-2xl font-bold mb-6">Novo Produto</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Nome do Produto" className="w-full p-3 rounded-xl border" onChange={e => setNewProduct({...newProduct, nome: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Preço" className="w-full p-3 rounded-xl border" onChange={e => setNewProduct({...newProduct, preco: parseFloat(e.target.value)})} />
                <input type="number" placeholder="Estoque" className="w-full p-3 rounded-xl border" onChange={e => setNewProduct({...newProduct, estoque: parseInt(e.target.value)})} />
              </div>
              <textarea placeholder="Descrição" className="w-full p-3 rounded-xl border h-24" onChange={e => setNewProduct({...newProduct, descricao: e.target.value})}></textarea>
              <input type="text" placeholder="Categoria (Camisetas, Calças, etc)" className="w-full p-3 rounded-xl border" onChange={e => setNewProduct({...newProduct, categoria: e.target.value})} />
              
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 font-bold text-gray-500 hover:text-gray-800">Cancelar</button>
                <button onClick={handleAddProduct} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700">Criar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
