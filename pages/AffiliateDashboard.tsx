
import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, Affiliate, Commission } from '../types';
import { Share2, DollarSign, MousePointer2, Award, Copy, CheckCircle } from 'lucide-react';

interface AffiliateDashboardProps {
  user: UserProfile;
}

const AffiliateDashboard: React.FC<AffiliateDashboardProps> = ({ user }) => {
  const [affiliateData, setAffiliateData] = useState<Affiliate | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchAffiliate = async () => {
      const affDoc = await getDoc(doc(db, 'affiliates', user.uid));
      if (affDoc.exists()) {
        setAffiliateData(affDoc.data() as Affiliate);
      }
      
      const q = query(collection(db, 'commissions'), where('afiliadoId', '==', user.uid));
      const commSnap = await getDocs(q);
      setCommissions(commSnap.docs.map(d => ({ id: d.id, ...d.data() } as Commission)));
      
      setLoading(false);
    };
    fetchAffiliate();
  }, [user]);

  const affiliateLink = `${window.location.origin}/#/?ref=${affiliateData?.codigoReferencia}`;

  const copyLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="p-20 text-center">Carregando painel...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Painel do Afiliado</h1>
        <p className="text-gray-500">Acompanhe seu desempenho e gerencie seus links.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
            <DollarSign size={24} />
          </div>
          <p className="text-gray-500 text-sm font-medium uppercase">Saldo a Receber</p>
          <p className="text-2xl font-bold text-gray-900">R$ {affiliateData?.saldo.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4">
            <Award size={24} />
          </div>
          <p className="text-gray-500 text-sm font-medium uppercase">Vendas Realizadas</p>
          <p className="text-2xl font-bold text-gray-900">{affiliateData?.totalVendas}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-4">
            <MousePointer2 size={24} />
          </div>
          <p className="text-gray-500 text-sm font-medium uppercase">Cliques totais</p>
          <p className="text-2xl font-bold text-gray-900">{affiliateData?.totalCliques}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <Share2 size={24} />
          </div>
          <p className="text-gray-500 text-sm font-medium uppercase">Comissão</p>
          <p className="text-2xl font-bold text-gray-900">{(affiliateData?.percentualComissao || 0) * 100}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Link Generation */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-xl">
            <h3 className="text-xl font-bold mb-4">Seu Link de Divulgação</h3>
            <p className="text-indigo-200 text-sm mb-6">Compartilhe este link em suas redes sociais e ganhe comissão por cada venda realizada através dele.</p>
            <div className="flex gap-2 p-2 bg-indigo-800 rounded-2xl border border-indigo-700">
              <input 
                type="text" 
                readOnly 
                value={affiliateLink} 
                className="bg-transparent flex-grow px-3 text-sm focus:outline-none"
              />
              <button 
                onClick={copyLink}
                className="bg-white text-indigo-900 px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-100 transition-all"
              >
                {copied ? <><CheckCircle size={18} /> Copiado</> : <><Copy size={18} /> Copiar</>}
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100">
            <h3 className="text-xl font-bold mb-6">Histórico de Comissões</h3>
            <div className="space-y-4">
              {commissions.length > 0 ? (
                commissions.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-4 border rounded-2xl">
                    <div>
                      <p className="font-bold text-gray-900">Comissão Pedido #{c.orderId.slice(-6)}</p>
                      <p className="text-xs text-gray-500">Gerada em: {new Date(c.criadoEm?.seconds * 1000).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-indigo-600">R$ {c.valor.toFixed(2)}</p>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${c.status === 'pago' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {c.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 py-10">Nenhuma comissão registrada ainda.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Help */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h4 className="font-bold text-lg mb-4">Dicas de Sucesso</h4>
            <ul className="space-y-4 text-sm text-gray-600">
              <li className="flex gap-3">
                <div className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-[10px]">1</div>
                Use o Instagram para postar fotos dos looks.
              </li>
              <li className="flex gap-3">
                <div className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-[10px]">2</div>
                Crie grupos no WhatsApp de ofertas exclusivas.
              </li>
              <li className="flex gap-3">
                <div className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-[10px]">3</div>
                Foque nos produtos que estão em tendência.
              </li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 rounded-3xl text-white">
            <h4 className="font-bold text-lg mb-2">Precisa de Ajuda?</h4>
            <p className="text-indigo-100 text-sm mb-4">Nosso suporte ao afiliado está disponível 24/7 para tirar suas dúvidas.</p>
            <button className="w-full bg-white text-indigo-600 py-3 rounded-xl font-bold text-sm">Falar no WhatsApp</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateDashboard;
