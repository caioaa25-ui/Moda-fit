
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User, Mail, Lock, UserPlus, TrendingUp } from 'lucide-react';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({ nome: '', email: '', password: '', role: 'cliente' as 'cliente' | 'afiliado' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Save user profile
      await setDoc(doc(db, 'users', user.uid), {
        nome: formData.nome,
        email: formData.email,
        tipo: formData.role,
        status: 'ativo',
        criadoEm: serverTimestamp()
      });

      // If affiliate, create affiliate profile
      if (formData.role === 'afiliado') {
        const refCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        await setDoc(doc(db, 'affiliates', user.uid), {
          userId: user.uid,
          codigoReferencia: refCode,
          percentualComissao: 0.10,
          saldo: 0,
          totalVendas: 0,
          totalCliques: 0
        });
      }

      navigate('/');
    } catch (err: any) {
      setError(err.message === 'auth/email-already-in-use' ? 'E-mail já cadastrado.' : 'Erro ao cadastrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Criar Conta</h2>
          <p className="text-gray-500 mt-2">Escolha seu tipo de acesso abaixo</p>
        </div>

        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setFormData({...formData, role: 'cliente'})}
            className={`flex-1 p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${formData.role === 'cliente' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-100 text-gray-400 grayscale'}`}
          >
            <User size={24} />
            <span className="text-xs font-bold uppercase">Cliente</span>
          </button>
          <button 
            onClick={() => setFormData({...formData, role: 'afiliado'})}
            className={`flex-1 p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${formData.role === 'afiliado' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-100 text-gray-400 grayscale'}`}
          >
            <TrendingUp size={24} />
            <span className="text-xs font-bold uppercase">Afiliado</span>
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-6 text-sm font-medium">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input 
              type="text" placeholder="Nome Completo" required
              value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input 
              type="email" placeholder="E-mail" required
              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input 
              type="password" placeholder="Senha" required
              value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? 'Cadastrando...' : <><UserPlus size={20} /> Criar Conta</>}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t text-center">
          <p className="text-gray-500">Já tem uma conta? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Entrar</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
