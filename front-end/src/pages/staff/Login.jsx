import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from || "/";

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");

    login({ identity: email, password, remember }).then((res) => {
      if (!res.ok) {
        setError(res.message || "Đăng nhập không thành công.");
        return;
      }
      navigate(from, { replace: true });
    });
  };

  if (user) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-140 border-none shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">
            Đăng nhập vào hệ thống
          </CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            Hệ thống Quản lý KhangBaby
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <input
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vd: admin@khangbaby.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Mật khẩu</label>
              <input
                type="password"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-muted-foreground select-none">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Ghi nhớ mật khẩu
              </label>
              <button
                type="button"
                className="text-sm font-medium text-primary hover:underline"
                onClick={() => setError("Chức năng quên mật khẩu sẽ được tích hợp sau.")}
              >
                Quên mật khẩu?
              </button>
            </div>

            {error ? (
              <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <Button type="submit" className="w-full">
              Đăng nhập
            </Button>

            <div className="text-sm text-muted-foreground text-center">
              Chưa có tài khoản?{" "}
              <Link className="text-primary font-medium hover:underline" to="/register">
                Đăng ký
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
