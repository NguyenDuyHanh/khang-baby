import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("khangbaby_cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("khangbaby_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      const currentQty = existing ? existing.quantity : 0;
      
      if (currentQty + quantity > product.ton_kho) {
        toast.error(`Rất tiếc, sản phẩm này chỉ còn ${product.ton_kho} cái trong kho!`);
        return prev;
      }

      if (existing) {
        toast.success(`Đã cập nhật số lượng ${product.ten_sp}`);
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      toast.success(`Đã thêm ${product.ten_sp} vào giỏ hàng`);
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity === '') {
      setCart((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: '' } : item)));
      return;
    }
    
    const val = parseInt(quantity, 10);
    if (isNaN(val)) return;
    const finalVal = val < 1 ? 1 : val;

    setCart((prev) => {
      const item = prev.find(i => i.id === id);
      if (item && finalVal > item.ton_kho) {
        toast.error(`Rất tiếc, sản phẩm này chỉ còn ${item.ton_kho} cái trong kho!`);
        return prev.map(i => i.id === id ? { ...i, quantity: item.ton_kho } : i);
      }
      return prev.map((item) => (item.id === id ? { ...item, quantity: finalVal } : item));
    });
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  const cartTotal = cart.reduce((total, item) => total + item.gia_ban * (Number(item.quantity) || 0), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
