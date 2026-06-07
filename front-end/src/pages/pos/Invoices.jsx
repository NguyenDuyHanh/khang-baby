import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, FileDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrencyVND, formatDateVN } from "@/lib/format";

const tabs = [
  { key: "ALL", label: "Tất cả" },
  { key: "PAID", label: "Đã thanh toán" },
  { key: "UNPAID", label: "Chưa thanh toán" },
  { key: "PENDING", label: "Chờ xác nhận" },
  { key: "CANCELED", label: "Đã hủy" },
];

const invoiceSeed = [
  {
    id: "HDB001",
    date: "2024-05-16T10:10:00",
    customer: "Khách lẻ",
    totalItems: 3,
    total: 3550000,
    status: "PAID",
  },
  {
    id: "HDB002",
    date: "2024-05-20T10:30:00",
    customer: "Nguyễn Văn A",
    totalItems: 2,
    total: 1040000,
    status: "UNPAID",
  },
];

const statusBadge = (status) => {
  switch (status) {
    case "PAID":
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Đã thanh toán</Badge>;
    case "UNPAID":
      return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">Chưa thanh toán</Badge>;
    case "PENDING":
      return <Badge variant="secondary" className="border-none">Chờ xác nhận</Badge>;
    case "CANCELED":
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Đã hủy</Badge>;
    default:
      return <Badge variant="outline">—</Badge>;
  }
};

export default function Invoices() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoiceSeed.filter((inv) => {
      const tabOk = activeTab === "ALL" ? true : inv.status === activeTab;
      const queryOk = !q ? true : inv.id.toLowerCase().includes(q);
      return tabOk && queryOk;
    });
  }, [activeTab, query]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Bán tại quầy</h2>
          <p className="text-sm text-muted-foreground mt-1">Danh sách hóa đơn bán</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => {}}>
          <FileDown />
          Xuất file Excel
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Hóa đơn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <Button
                key={t.key}
                type="button"
                variant={activeTab === t.key ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </Button>
            ))}
          </div>

          <div className="grid gap-3 grid-cols-1 lg:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Tìm kiếm</label>
              <input
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Tìm theo mã hóa đơn"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Ngày bán</label>
              <input
                type="date"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Mã NV / Mã KH</label>
              <input
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Nhập mã để lọc"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Mã HĐB</th>
                  <th className="px-4 py-3 text-left font-medium">Ngày bán</th>
                  <th className="px-4 py-3 text-left font-medium">Khách hàng</th>
                  <th className="px-4 py-3 text-right font-medium">Tổng SP</th>
                  <th className="px-4 py-3 text-right font-medium">Tổng tiền</th>
                  <th className="px-4 py-3 text-left font-medium">Trạng thái</th>
                  <th className="px-4 py-3 text-right font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((inv) => (
                  <tr key={inv.id} className="border-t border-border/60 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold">
                      <Link to={`/pos/${inv.id}`} className="hover:underline">
                        {inv.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDateVN(inv.date)}</td>
                    <td className="px-4 py-3">{inv.customer}</td>
                    <td className="px-4 py-3 text-right">{inv.totalItems}</td>
                    <td className="px-4 py-3 text-right font-semibold text-primary">{formatCurrencyVND(inv.total)}</td>
                    <td className="px-4 py-3">{statusBadge(inv.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="icon" asChild>
                          <Link to={`/pos/${inv.id}/edit`} aria-label="Sửa">
                            <Pencil />
                          </Link>
<<<<<<< Updated upstream
=======
                        </td>
                        <td className="px-4 py-3 text-slate-600">{formatDateVN(inv.ngay_ban)}</td>
                        <td className="px-4 py-3 font-medium text-slate-700">{inv.ten_khach_hang || "Khách lẻ"}</td>
                        <td className="px-4 py-3 text-slate-600">{inv.ten_nhan_vien || "Hệ thống"}</td>
                        <td className="px-4 py-3 text-right font-extrabold text-primary">{formatCurrencyVND(inv.tong_can_thanh_toan)}</td>
                        <td className="px-4 py-3">{statusBadge(inv.trang_thai)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="icon" asChild title="Chi tiết">
                              <Link to={`/pos/${inv.id}`} aria-label="Chi tiết">
                                <Pencil size={16} />
                              </Link>
                            </Button>
                            {inv.trang_thai !== "DA_HUY" && (
                              <Button
                                variant="outline"
                                size="icon"
                                aria-label="Hủy hóa đơn"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(inv.id)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {rows.length === 0 ? (
                      <tr>
                        <td className="px-4 py-8 text-center text-slate-400" colSpan={7}>
                          Không có hóa đơn phù hợp ở trang này.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 pt-4 flex-wrap gap-2">
                  <span className="text-xs font-semibold text-slate-500">
                    Hiển thị {(page - 1) * 10 + 1} - {Math.min(page * 10, totalItems)} trong tổng số {totalItems} hóa đơn
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
>>>>>>> Stashed changes
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Hủy"
                          className={cn("hover:text-destructive")}
                          onClick={() => {}}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

                {rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={7}>
                      Không có hóa đơn phù hợp.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Button
        asChild
        className="fixed bottom-6 right-6 shadow-lg"
        aria-label="Tạo hóa đơn"
      >
        <Link to="/pos/new">
          <Plus className="mr-2" />
          Tạo hóa đơn
        </Link>
      </Button>
    </div>
  );
}
