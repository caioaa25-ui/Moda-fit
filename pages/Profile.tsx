
import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, Order } from '../types';
import { Package, Clock, Shield } from 'lucide-react';

const Profile: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const q = query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('criadoEm', 'desc'));
      const snap = await getDocs(q);
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl p-8 border mb-12 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold">
          {user.nome.charAt(0)}
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900">{user.nome}</h1>
          <p className="text-gray-500">{user.email}</p>
          <div className="mt-2 flex items-center gap-2 justify-center md:justify-start">
            <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full uppercase tracking-widest">{user.tipo}</span>
            <span className="px-3 py-1 bg-green-100 text-green-600 text-[10px] font-bold rounded-full uppercase tracking-widest">{user.status}</span>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Package className="text-indigo-600" /> Meus Pedidos</h2>

      <div className="space-y-6">
        {loading ? (
          <p>Carregando seus pedidos...</p>
        ) : orders.length > 0 ? (
          orders.map(order => (
            <div key={order.id} className="bg-white border rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">ID DO PEDIDO</p>
                  <p className="font-mono text-gray-700">#{order.id.slice(-8)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">DATA</p>
                  <p className="text-gray-700 font-medium">{new Date(order.criadoEm?.seconds * 1000).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-bold uppercase">TOTAL</p>
                  <p className="text-xl font-bold text-indigo-600">R$ {order.valorTotal.toFixed(2)}</p>
                </div>
              </div>
              <div className="p-6 bg-gray-50">
                <div className="flex items-center gap-2 text-sm font-bold text-indigo-600">
                  <Clock size={16} /> Status: {order.statusPedido.toUpperCase()}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Você ainda não realizou nenhum pedido.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
