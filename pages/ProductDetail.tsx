
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ChevronLeft, ChevronRight, Check } from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      const docSnap = await getDoc(doc(db, 'products', id));
      if (docSnap.exists()) {
        const data = docSnap.data() as Product;
        setProduct({ ...data, id: docSnap.id });
        if (data.tamanhos?.length > 0) setSelectedSize(data.tamanhos[0]);
        if (data.cores?.length > 0) setSelectedColor(data.cores[0]);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="p-20 text-center">Carregando...</div>;
  if (!product) return <div className="p-20 text-center">Produto não encontrado.</div>;

  const handleAddToCart = () => {
    if (product.estoque <= 0) return;
    addToCart(product, selectedSize, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-8 font-medium">
        <ChevronLeft size={20} /> Voltar
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-gray-100">
            <img 
              src={product.imagens[mainImageIdx] || 'https://picsum.photos/800/1000?cloth'} 
              className="w-full h-full object-cover"
              alt={product.nome}
            />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {product.imagens.map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => setMainImageIdx(idx)}
                className={`w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${mainImageIdx === idx ? 'border-indigo-600 scale-105' : 'border-transparent opacity-70'}`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.nome}</h1>
            <p className="text-2xl font-bold text-indigo-600">
              {product.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Descrição</h3>
            <p className="text-gray-600 leading-relaxed">{product.descricao}</p>
          </div>

          {product.tamanhos?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Tamanho</h3>
              <div className="flex gap-3">
                {product.tamanhos.map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold border-2 transition-all ${selectedSize === size ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-600'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.cores?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Cor</h3>
              <div className="flex gap-4">
                {product.cores.map(color => (
                  <button 
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`h-10 w-10 rounded-full border-2 transition-all p-1 ${selectedColor === color ? 'border-indigo-600 scale-110' : 'border-gray-200'}`}
                  >
                    <div className="w-full h-full rounded-full" style={{ backgroundColor: color.toLowerCase() }}></div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto space-y-4">
            <button 
              disabled={product.estoque <= 0}
              onClick={handleAddToCart}
              className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${added ? 'bg-green-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200'}`}
            >
              {added ? (
                <> <Check size={24} /> Adicionado </>
              ) : (
                <> <ShoppingBag size={24} /> {product.estoque > 0 ? 'Adicionar ao Carrinho' : 'Indisponível'} </>
              )}
            </button>
            <p className="text-center text-sm text-gray-400">
              Estoque disponível: <span className="font-bold text-gray-600">{product.estoque} unidades</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
