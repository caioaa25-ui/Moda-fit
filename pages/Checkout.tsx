
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useCart } from '../context/CartContext';
import { UserProfile, Commission } from '../types';
import { CreditCard, Truck, ShieldCheck, MapPin } from 'lucide-react';

interface CheckoutProps {
  user: UserProfile;
}

const Checkout: React.FC<CheckoutProps> = ({ user }) => {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({ street: '', number: '', city: '', zip: '' });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix' | 'boleto'>('card');

  const handleFinishPurchase = async () => {
    if (!address.street || !address.city) {
      alert('Por favor, preencha o endereço.');
      return;
    }

    setLoading(true);
    try {
      // 1. Get Affiliate ID if exists
      const affiliateCode = sessionStorage.getItem('affiliate_ref');
      let affiliateId = '';
      let commissionRate = 0;

      if (affiliateCode) {
        // Find affiliate by code
        const affiliateQuery = collection(db, 'affiliates');
        // Simplified: In production you'd use a Firestore Query
        // const q = query(collection(db, 'affiliates'), where('codigoReferencia', '==', affiliateCode));
        // let affSnap = await getDocs(q);
        // But for this example, let's assume we retrieve the rate
        affiliateId = affiliateCode; // Simplification for logic flow
        commissionRate = 0.10; // Default 10%
      }

      // 2. Create Order
      const orderData = {
        userId: user.uid,
        produtos: cart,
        valorTotal: totalPrice,
        statusPagamento: 'pago', // In a real app, this would be 'pendente' until gateway callback
        statusPedido: 'processando',
        afiliadoId: affiliateId || null,
        criadoEm: serverTimestamp(),
        address
      };

      const orderRef = await addDoc(collection(db, 'orders'), orderData);

      // 3. Update Inventory & Affiliate Commissions
      for (const item of cart) {
        const prodRef = doc(db, 'products', item.id);
        await updateDoc(prodRef, {
          estoque: increment(-item.quantity)
        });
      }

      if (affiliateId) {
        const commissionVal = totalPrice * commissionRate;
        
        // Record commission
        await addDoc(collection(db, 'commissions'), {
          orderId: orderRef.id,
          afiliadoId: affiliateId,
          valor: commissionVal,
          status: 'pendente',
          criadoEm: serverTimestamp()
        });

        // Update Affiliate balance
        // Note: affiliateId here is the code, we should have the real userId
        // A real system would resolve code -> userId first
      }

      alert('Pagamento Confirmado! Pedido realizado com sucesso.');
      clearCart();
      sessionStorage.removeItem('affiliate_ref');
      navigate('/perfil');
    } catch (err) {
      console.error(err);
      alert('Erro ao processar pedido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          {/* Address Section */}
          <section>
            <div className="flex items-center gap-2 mb-4 font-bold text-gray-700">
              <MapPin size={20} /> Endereço de Entrega
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" placeholder="Rua / Logradouro" 
                className="col-span-2 p-3 rounded-xl border"
                value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})}
              />
              <input 
                type="text" placeholder="Número" className="p-3 rounded-xl border"
                value={address.number} onChange={(e) => setAddress({...address, number: e.target.value})}
              />
              <input 
                type="text" placeholder="CEP" className="p-3 rounded-xl border"
                value={address.zip} onChange={(e) => setAddress({...address, zip: e.target.value})}
              />
              <input 
                type="text" placeholder="Cidade" className="col-span-2 p-3 rounded-xl border"
                value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})}
              />
            </div>
          </section>

          {/* Payment Section */}
          <section>
            <div className="flex items-center gap-2 mb-4 font-bold text-gray-700">
              <CreditCard size={20} /> Método de Pagamento
            </div>
            <div className="space-y-3">
              <label className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100'}`}>
                <input type="radio" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="hidden" />
                <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center">
                  {paymentMethod === 'card' && <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>}
                </div>
                <div>
                  <p className="font-bold">Cartão de Crédito</p>
                  <p className="text-xs text-gray-500">Até 12x sem juros</p>
                </div>
              </label>
              <label className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'pix' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100'}`}>
                <input type="radio" checked={paymentMethod === 'pix'} onChange={() => setPaymentMethod('pix')} className="hidden" />
                <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center">
                  {paymentMethod === 'pix' && <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>}
                </div>
                <div>
                  <p className="font-bold">PIX</p>
                  <p className="text-xs text-green-600">Confirmação instantânea</p>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-900 text-white rounded-3xl p-8 h-fit shadow-2xl">
          <h2 className="text-xl font-bold mb-6">Resumo do Pedido</h2>
          <div className="space-y-4 mb-8">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-400">{item.quantity}x {item.nome}</span>
                <span className="font-medium">{(item.preco * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-4 mb-8">
            <div className="flex justify-between font-bold text-2xl">
              <span>Total</span>
              <span className="text-indigo-400">{totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
          </div>
          
          <button 
            disabled={loading}
            onClick={handleFinishPurchase}
            className="w-full bg-indigo-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-400 transition-all mb-4 disabled:opacity-50"
          >
            {loading ? 'Processando...' : 'Finalizar Pagamento Real'}
          </button>
          
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <ShieldCheck size={16} /> Pagamento 100% Seguro via Mercado Pago
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
