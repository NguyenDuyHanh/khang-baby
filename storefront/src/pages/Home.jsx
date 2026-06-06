import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchProducts, fetchCategories, fetchVouchers } from "../lib/api";
import ProductCard from "../components/ProductCard";
import { Ticket } from "lucide-react";

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
};

export default function Home() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const [category, setCategory] = useState("");
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [savedVouchers, setSavedVouchers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('savedVouchers')) || [];
    } catch {
      return [];
    }
  });

  const handleSaveVoucher = (code) => {
    if (!savedVouchers.includes(code)) {
      const newSaved = [...savedVouchers, code];
      setSavedVouchers(newSaved);
      localStorage.setItem('savedVouchers', JSON.stringify(newSaved));
      alert("Đã lưu mã giảm giá: " + code);
    }
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [prodRes, catRes, voucherRes] = await Promise.all([
          fetchProducts(search, category),
          fetchCategories(),
          fetchVouchers().catch(() => ({ data: [] }))
        ]);
        setProducts(prodRes.data || []);
        setCategories(catRes.data || []);
        setVouchers(voucherRes?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [search, category]);

  return (
    <div>
      {/* Banner Section */}
      {!search && !category && (
        <section className="bg-gradient-to-r from-pink-100 to-pink-50 py-12 mb-12 border-b border-pink-100">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div className="max-w-xl">
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                Mẹ khỏe con ngoan <br/> <span className="text-[var(--color-primary)]">Khang Baby</span> đồng hành
              </h1>
              <p className="text-gray-600 text-lg mb-8">
                Cung cấp các sản phẩm Mẹ & Bé chính hãng, an toàn và chất lượng nhất cho sự phát triển toàn diện của bé yêu.
              </p>
              <button className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-full font-bold hover:bg-pink-600 transition-colors shadow-lg shadow-pink-200">
                Mua Sắm Ngay
              </button>
            </div>
            <div className="hidden md:block w-1/3">
               {/* Decorative Element */}
               <div className="aspect-square bg-white rounded-full shadow-2xl flex items-center justify-center p-8 border-4 border-pink-200">
                  <div className="text-[var(--color-primary)] text-6xl font-black opacity-20">KHANG BABY</div>
               </div>
            </div>
          </div>
        </section>
      )}

      {/* Promotions / Vouchers Section */}
      {!search && vouchers.length > 0 && (
        <div className="container mx-auto px-4 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[var(--color-primary)] rounded-full inline-block"></span>
            Khuyến mại đặc biệt
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
            {vouchers.map(v => {
              const isSaved = savedVouchers.includes(v.ma_voucher);
              return (
                <div key={v.id} className="min-w-[300px] snap-center bg-white border border-pink-200 rounded-xl shadow-sm flex overflow-hidden shrink-0">
                  <div className="bg-[var(--color-primary)] text-white w-20 flex flex-col items-center justify-center border-r border-dashed border-white shrink-0 relative">
                    <div className="absolute -top-3 -right-3 w-6 h-6 bg-white rounded-full"></div>
                    <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-white rounded-full"></div>
                    <Ticket size={28} className="mb-1 opacity-80" />
                    <span className="text-xs font-bold rotate-180" style={{ writingMode: 'vertical-rl' }}>VOUCHER</span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">
                        {v.phan_tram_giam ? `Giảm ${v.phan_tram_giam}%` : `Giảm ${formatPrice(v.gia_tri_giam)}`}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">Đơn tối thiểu {formatPrice(v.gia_toi_thieu)}</p>
                      <div className="inline-block bg-pink-50 text-pink-700 text-xs font-bold px-2 py-1 rounded border border-pink-100">
                        Mã: {v.ma_voucher}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">HSD: {v.han_su_dung_den ? new Date(v.han_su_dung_den).toLocaleDateString('vi-VN') : 'Không hạn'}</span>
                      <button 
                        onClick={() => handleSaveVoucher(v.ma_voucher)}
                        disabled={isSaved}
                        className={`text-xs font-bold px-4 py-1.5 rounded-full transition-colors ${isSaved ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[var(--color-primary)] text-white hover:bg-pink-600 shadow-sm'}`}
                      >
                        {isSaved ? "Đã lưu" : "Lưu"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4">
        {/* Category Filters */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[var(--color-primary)] rounded-full inline-block"></span>
            Danh mục sản phẩm
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
            <button 
              onClick={() => setCategory("")}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full font-medium transition-all ${!category ? 'bg-[var(--color-primary)] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'}`}
            >
              Tất cả
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full font-medium transition-all ${category === cat.id ? 'bg-[var(--color-primary)] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'}`}
              >
                {cat.ten_danh_muc}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
               <span className="w-1.5 h-6 bg-[var(--color-primary)] rounded-full inline-block"></span>
               {search ? `Kết quả tìm kiếm cho "${search}"` : 'Sản phẩm nổi bật'}
            </h2>
            <span className="text-gray-500 text-sm font-medium">{products.length} sản phẩm</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-pink-200 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-gray-500 mb-4">Không tìm thấy sản phẩm nào phù hợp.</p>
              {search && (
                <button 
                  onClick={() => window.location.href = '/'}
                  className="text-[var(--color-primary)] font-medium hover:underline"
                >
                  Xóa tìm kiếm
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
