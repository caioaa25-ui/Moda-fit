
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100">
      <div className="relative aspect-[3/4] overflow-hidden">
        <img 
          src={product.imagens[0] || 'https://picsum.photos/400/500?cloth'} 
          alt={product.nome}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Link 
            to={`/produto/${product.id}`}
            className="bg-white text-gray-900 p-3 rounded-full shadow-lg hover:bg-indigo-600 hover:text-white transition-colors"
          >
            <Eye size={24} />
          </Link>
        </div>
        {product.estoque < 5 && product.estoque > 0 && (
          <span className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">
            Últimas peças
          </span>
        )}
        {product.estoque === 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-gray-800 text-white px-3 py-1 rounded text-sm font-bold uppercase">
              Esgotado
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">{product.categoria}</p>
        <h3 className="text-gray-900 font-semibold mb-2 truncate">{product.nome}</h3>
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-gray-900">
            {product.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <button className="text-indigo-600 text-xs font-bold hover:underline">Ver detalhes</button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
