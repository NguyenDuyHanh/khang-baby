import { useMemo, useState } from "react";
import { Plus, FileDown, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyVND, formatDateVN } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";

const productsSeed = [
  {
    sku: "SP1S",
    name: "Sữa Nan Optipro 3",
    category: "Sữa",
    supplier: "Nestle VN",
    importPrice: 450000,
    salePrice: 620000,
    stock: 48,
    minStock: 10,
    expiry: "2025-06-30",
  },
  {
    sku: "SP2B",
    name: "Tã bỉm size M",
    category: "Tã bỉm",
    supplier: "Unicharm",
    importPrice: 210000,
    salePrice: 290000,
    stock: 8,
    minStock: 10,
    expiry: "",
  },
];

function stockStatus(stock, minStock) {
  if (stock <= 0 || stock <= minStock) return "OUT";
  if (stock <= minStock * 2) return "LOW";
  return "OK";
}

function statusBadge(stock, minStock) {
  const status = stockStatus(stock, minStock);
  if (status === "OK") {
    return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Còn hàng</Badge>;
  }
  if (status === "LOW") {
    return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">Sắp hết</Badge>;
  }
  return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Hết hàng</Badge>;
}

export default function Products() {
  const { user } = useAuth();
  const canEdit = user?.role === "MANAGER" || user?.role === "WAREHOUSE";

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [supplier, setSupplier] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return productsSeed.filter((p) => {
      const qOk = !q ? true : p.sku.toLowerCase().includes(q) || p.name.toLowerCase().includes(q);
      const catOk = category === "ALL" ? true : p.category === category;
      const supOk = supplier === "ALL" ? true : p.supplier === supplier;
      const st = stockStatus(p.stock, p.minStock);
      const stOk = status === "ALL" ? true : (status === "OK" ? st === "OK" : status === "LOW" ? st === "LOW" : st === "OUT");
      return qOk && catOk && supOk && stOk;
    });
  }, [query, category, supplier, status]);

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Danh sách hàng hóa</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2" onClick={() => {}}>
              <FileDown />
              Xuất file Excel
            </Button>
            {canEdit ? (
              <Button className="gap-2" onClick={() => {}}>
                <Plus />
                Thêm sản phẩm
              </Button>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 grid-cols-1 lg:grid-cols-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tìm kiếm</label>
            <input
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Tìm theo mã SP hoặc tên"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Danh mục</label>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="ALL">Tất cả</option>
              <option value="Sữa">Sữa</option>
              <option value="Tã bỉm">Tã bỉm</option>
              <option value="Đồ sơ sinh">Đồ sơ sinh</option>
              <option value="Chăm sóc">Chăm sóc</option>
              <option value="Phụ kiện">Phụ kiện</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nhà cung cấp</label>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            >
              <option value="ALL">Tất cả</option>
              <option value="Nestle VN">Nestle VN</option>
              <option value="Unicharm">Unicharm</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Trạng thái</label>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="ALL">Tất cả</option>
              <option value="OK">Còn hàng</option>
              <option value="LOW">Sắp hết</option>
              <option value="OUT">Hết hàng</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Mã SP</th>
                <th className="px-4 py-3 text-left font-medium">Tên sản phẩm</th>
                <th className="px-4 py-3 text-left font-medium">Danh mục</th>
                <th className="px-4 py-3 text-left font-medium">NCC</th>
                <th className="px-4 py-3 text-right font-medium">Giá nhập</th>
                <th className="px-4 py-3 text-right font-medium">Giá bán</th>
                <th className="px-4 py-3 text-right font-medium">Tồn</th>
                <th className="px-4 py-3 text-right font-medium">Tồn tối thiểu</th>
                <th className="px-4 py-3 text-left font-medium">HSD</th>
                <th className="px-4 py-3 text-left font-medium">Trạng thái</th>
                {canEdit ? <th className="px-4 py-3 text-right font-medium">Hành động</th> : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.sku} className="border-t border-border/60 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold">{p.sku}</td>
                  <td className="px-4 py-3 min-w-55">{p.name}</td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3">{p.supplier}</td>
                  <td className="px-4 py-3 text-right">{formatCurrencyVND(p.importPrice)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrencyVND(p.salePrice)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{p.stock}</td>
                  <td className="px-4 py-3 text-right">{p.minStock}</td>
                  <td className="px-4 py-3">{p.expiry ? formatDateVN(p.expiry) : "—"}</td>
                  <td className="px-4 py-3">{statusBadge(p.stock, p.minStock)}</td>
                  {canEdit ? (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="icon" aria-label="Sửa" onClick={() => {}}>
                          <Pencil />
                        </Button>
                        <Button variant="outline" size="icon" aria-label="Xóa" onClick={() => {}}>
                          <Trash2 />
                        </Button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-muted-foreground" colSpan={canEdit ? 11 : 10}>
                    Không có sản phẩm phù hợp.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
