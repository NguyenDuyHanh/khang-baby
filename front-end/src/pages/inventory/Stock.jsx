import { useMemo, useState } from "react";
import { FileDown, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyVND, formatDateVN } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";

const stockSeed = [
  {
    sku: "SP1S",
    name: "Sữa Nan Optipro 3",
    importPrice: 450000,
    salePrice: 620000,
    stock: 48,
    firstBatchDate: "2025-03-01",
    nearestExpiry: "2025-06-30",
  },
  {
    sku: "SP2B",
    name: "Tã bỉm size M",
    importPrice: 210000,
    salePrice: 290000,
    stock: 8,
    firstBatchDate: "2025-04-15",
    nearestExpiry: "",
  },
];

function statusBadge(p) {
  if (p.nearestExpiry) {
    const expiry = new Date(p.nearestExpiry);
    const in30 = new Date();
    in30.setDate(in30.getDate() + 30);
    if (!Number.isNaN(expiry.getTime()) && expiry <= in30) {
      return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">Sắp hết hạn</Badge>;
    }
  }

  if (p.stock <= 0) return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Hết hàng</Badge>;
  if (p.stock <= 10) return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">Sắp hết</Badge>;
  return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Còn hàng</Badge>;
}

export default function Stock() {
  const { user } = useAuth();
  const canEdit = user?.role === "MANAGER" || user?.role === "WAREHOUSE";

  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stockSeed.filter((p) => (!q ? true : p.sku.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)));
  }, [query]);

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Hàng tồn kho</CardTitle>
          <Button variant="outline" className="gap-2" onClick={() => {}}>
            <FileDown />
            Xuất file Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 grid-cols-1 lg:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tìm kiếm</label>
            <input
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Tìm theo mã/tên sản phẩm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Lọc trạng thái</label>
            <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option>Tất cả</option>
              <option>Còn hàng</option>
              <option>Sắp hết</option>
              <option>Sắp hết hạn</option>
            </select>
          </div>
          <div className="hidden lg:block" />
        </div>

        <div className="overflow-x-auto rounded-lg border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Mã SP</th>
                <th className="px-4 py-3 text-left font-medium">Tên sản phẩm</th>
                <th className="px-4 py-3 text-right font-medium">Giá nhập</th>
                <th className="px-4 py-3 text-right font-medium">Giá bán</th>
                <th className="px-4 py-3 text-right font-medium">Tồn kho</th>
                <th className="px-4 py-3 text-left font-medium">Ngày nhập (batch đầu)</th>
                <th className="px-4 py-3 text-left font-medium">HSD (gần nhất)</th>
                <th className="px-4 py-3 text-left font-medium">Trạng thái</th>
                {canEdit ? <th className="px-4 py-3 text-right font-medium">Hành động</th> : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.sku} className="border-t border-border/60 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold">{p.sku}</td>
                  <td className="px-4 py-3 min-w-55">{p.name}</td>
                  <td className="px-4 py-3 text-right">{formatCurrencyVND(p.importPrice)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrencyVND(p.salePrice)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{p.stock}</td>
                  <td className="px-4 py-3">{p.firstBatchDate ? formatDateVN(p.firstBatchDate) : "—"}</td>
                  <td className="px-4 py-3">{p.nearestExpiry ? formatDateVN(p.nearestExpiry) : "—"}</td>
                  <td className="px-4 py-3">{statusBadge(p)}</td>
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
<<<<<<< Updated upstream
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-muted-foreground" colSpan={canEdit ? 9 : 8}>
                    Không có dữ liệu.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
=======
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 flex-wrap gap-2">
                <span className="text-xs font-semibold text-slate-500">
                  Hiển thị {(page - 1) * 10 + 1} - {Math.min(page * 10, totalItems)} trong tổng số {totalItems} mặt hàng
                </span>
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    className="text-xs"
                  >
                    Trước
                  </Button>
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pNum = i + 1;
                    return (
                      <Button
                        key={pNum}
                        variant={page === pNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pNum)}
                        className={`w-8 h-8 p-0 text-xs font-semibold ${page === pNum ? "bg-primary text-white hover:bg-primary/95" : ""}`}
                      >
                        {pNum}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    className="text-xs"
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
>>>>>>> Stashed changes
      </CardContent>
    </Card>
  );
}
