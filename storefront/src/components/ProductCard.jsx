import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
      <div className="relative aspect-square overflow-hidden bg-gray-50 flex items-center justify-center p-4">
        {product.hinh_anh ? (
          <img 
            src={`http://localhost:4000${product.hinh_anh}`} 
            alt={product.ten_sp} 
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-full bg-pink-50 rounded-lg flex items-center justify-center text-[var(--color-primary)] opacity-50 font-bold">
            {product.ten_sp.substring(0, 2).toUpperCase()}
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          {product.id % 3 === 0 && (
             <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">HOT</span>
          )}
          {product.id % 4 === 0 && product.id % 3 !== 0 && (
             <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">NEW</span>
          )}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-medium text-gray-800 mb-2 line-clamp-2 text-sm flex-grow group-hover:text-[var(--color-primary)] transition-colors">
          {product.ten_sp}
        </h3>
        <div className="flex items-end justify-between mt-2">
          <div>
            <p className="text-[var(--color-price)] font-bold text-lg">{formatPrice(Number(product.gia_ban))}</p>
            {Number(product.gia_nhap) > 0 && (
               <p className="text-gray-400 text-xs line-through">{formatPrice(Number(product.gia_ban) + 50000)}</p>
            )}
          </div>
          <button 
            onClick={() => addToCart(product)}
            className="w-10 h-10 rounded-full bg-pink-50 text-[var(--color-primary)] flex items-center justify-center hover:bg-[var(--color-primary)] hover:text-white transition-colors"
            title="Thêm vào giỏ"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
