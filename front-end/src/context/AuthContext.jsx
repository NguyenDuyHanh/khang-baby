import { createContext, useContext, useMemo, useState } from "react";

import { apiRequest } from "@/lib/api";

const STORAGE_KEYS = {
  SESSION: "kb_session",
};

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const ROLE_LABEL = {
  MANAGER: "Quản lý",
  WAREHOUSE: "Thủ kho",
  SALES: "Sales",
  ONLINE_SALES: "Sale Online",
  MARKETING: "Marketing",
};

const safeJsonParse = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const mapStaff = (staff) => {
  if (!staff) return null;

  return {
    id: staff.id,
    name: staff.ho_ten,
    email: staff.email,
    phone: staff.so_dien_thoai || "",
    role: staff.vai_tro,
    active: staff.trang_thai === "HOAT_DONG",
    createdAt: staff.ngay_tao || null,
  };
};

const loadSession = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;

    const session = safeJsonParse(raw, null);
    if (!session?.token || !session?.user || !session?.expiresAt) return null;
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      return null;
    }

    return session;
  } catch {
    return null;
  }
};

const saveSession = (session) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  } catch {
    // ignore
  }
};

const clearSession = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  } catch {
    // ignore
  }
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => loadSession());
  const currentUser = session?.user || null;

  const login = async ({ identity, password, remember }) => {
    const email = (identity || "").trim().toLowerCase();
    if (!email || !password) {
      return { ok: false, message: "Vui lòng nhập đầy đủ thông tin đăng nhập." };
    }

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      const user = mapStaff(data.staff);
      const nextSession = {
        token: data.token,
        user,
        expiresAt: Date.now() + (remember ? SESSION_TTL_MS : 8 * 60 * 60 * 1000),
      };

      setSession(nextSession);
      saveSession(nextSession);

      return { ok: true, user };
    } catch (error) {
      return { ok: false, message: error.message || "Đăng nhập không thành công." };
    }
  };

  const logout = () => {
    setSession(null);
    clearSession();
  };

  const register = async ({ name, email, phone, role, password }) => {
    const trimmedEmail = (email || "").trim().toLowerCase();

    if (!trimmedEmail || !password || !name?.trim() || !role) {
      return { ok: false, message: "Vui lòng nhập đầy đủ thông tin." };
    }
    if (password.length < 8) {
      return { ok: false, message: "Mật khẩu tối thiểu 8 ký tự." };
    }

    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: {
          email: trimmedEmail,
          password,
          ho_ten: name.trim(),
          so_dien_thoai: (phone || "").trim(),
          vai_tro: role,
        },
      });

      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message || "Đăng ký không thành công." };
    }
  };

  const value = useMemo(
    () => ({
      user: currentUser,
      login,
      logout,
      register,
      token: session?.token || null,
      roleLabel: (role) => ROLE_LABEL[role] || role,
    }),
    [currentUser, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
