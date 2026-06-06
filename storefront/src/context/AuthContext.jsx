import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("khangbaby_storefront_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem("khangbaby_storefront_token") || null;
  });

  const login = async (email, password) => {
    try {
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message);
      
      setToken(data.token);
      setUser(data.staff);
      localStorage.setItem("khangbaby_storefront_token", data.token);
      localStorage.setItem("khangbaby_storefront_user", JSON.stringify(data.staff));
      
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };

  const register = async (name, email, phone, password, role) => {
    try {
      const res = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ho_ten: name, email, so_dien_thoai: phone, password, vai_tro: role }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message);
      
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("khangbaby_storefront_token");
    localStorage.removeItem("khangbaby_storefront_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
