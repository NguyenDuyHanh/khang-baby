import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, FileDown, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const tabs = [
  { key: "ALL", label: "Tất cả phiếu nhập" },
  { key: "PAID", label: "Đã thanh toán hết" },
  { key: "UNPAID", label: "Chưa thanh toán hết" },
];

const receiptsSeed = [
  {
    id: "PN1",
    orderId: "PD1",
    paymentId: "PTT01",
    qtyOrdered: 100,
    qtyReceived: 100,
    missing: 0,
    status: "PAID",
  },
  {
    id: "PN2",
    orderId: "PD2",
    paymentId: "",
    qtyOrdered: 210,
    qtyReceived: 200,
    missing: 10,
    status: "UNPAID",
  },
];

const statusBadge = (status) => {
  if (status === "PAID") return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Đã thanh toán hết</Badge>;
  return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">Chưa thanh toán hết</Badge>;
};

export default function Receipts() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return receiptsSeed.filter((r) => {
      const tabOk = activeTab === "ALL" ? true : r.status === activeTab;
      const queryOk = !q ? true : r.id.toLowerCase().includes(q) || r.orderId.toLowerCase().includes(q);
      return tabOk && queryOk;
    });
  }, [activeTab, query]);

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Phiếu nhập hàng</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="gap-2" onClick={() => {}}>
                <FileDown />
                Xuất file Excel
              </Button>
              <Button asChild className="gap-2">
                <Link to="/inventory/receipts/new">
                  <Plus />
                  Thêm phiếu
                </Link>
              </Button>
            </div>
          </div>
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
                placeholder="Tìm theo mã HDN, mã HDD"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Ngày nhập</label>
              <input type="date" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Mã NV / Mã NCC</label>
              <input className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Nhập mã để lọc" />
            </div>
          </div>

<<<<<<< Updated upstream
          <div className="overflow-x-auto rounded-lg border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Mã HDN</th>
                  <th className="px-4 py-3 text-left font-medium">Mã HDD</th>
                  <th className="px-4 py-3 text-left font-medium">Mã HDTT</th>
                  <th className="px-4 py-3 text-right font-medium">SL đặt</th>
                  <th className="px-4 py-3 text-right font-medium">SL nhận</th>
                  <th className="px-4 py-3 text-right font-medium">Còn thiếu</th>
                  <th className="px-4 py-3 text-left font-medium">Trạng thái TT</th>
                  <th className="px-4 py-3 text-right font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border/60 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold">
                      <Link to={`/inventory/receipts/${r.id}`} className="hover:underline">
                        {r.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{r.orderId}</td>
                    <td className="px-4 py-3">{r.paymentId || "—"}</td>
                    <td className="px-4 py-3 text-right">{r.qtyOrdered}</td>
                    <td className="px-4 py-3 text-right">{r.qtyReceived}</td>
                    <td className={"px-4 py-3 text-right font-semibold " + (r.missing > 0 ? "text-destructive" : "text-green-700")}>{r.missing}</td>
                    <td className="px-4 py-3">{statusBadge(r.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="icon" asChild>
                          <Link to={`/inventory/receipts/${r.id}/edit`} aria-label="Sửa">
                            <Pencil />
                          </Link>
=======
          {/* Table */}
          {loading ? (
            <div className="text-center py-8 text-slate-500">Đang tải dữ liệu...</div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-lg border border-border/60">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Mã Nhập</th>
                      <th className="px-4 py-3 text-left font-semibold">Ngày nhập</th>
                      <th className="px-4 py-3 text-left font-semibold">Nhà cung cấp</th>
                      <th className="px-4 py-3 text-left font-semibold">Nhân viên</th>
                      <th className="px-4 py-3 text-right font-semibold">SL đặt</th>
                      <th className="px-4 py-3 text-right font-semibold">SL nhận</th>
                      <th className="px-4 py-3 text-right font-semibold">Tổng tiền</th>
                      <th className="px-4 py-3 text-left font-semibold">Trạng thái TT</th>
                      <th className="px-4 py-3 text-right font-semibold">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {rows.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          <button 
                            onClick={() => handleViewDetails(r.id)} 
                            className="hover:underline text-left text-primary font-bold"
                          >
                            {r.ma_pnh}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{formatDateVN(r.ngay_nhap)}</td>
                        <td className="px-4 py-3 text-slate-700">{r.ten_ncc}</td>
                        <td className="px-4 py-3 text-slate-700">{r.ten_nhan_vien}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{r.so_luong_dat}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{r.so_luong_thuc_nhan}</td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatCurrencyVND(r.tong_tien)}</td>
                        <td className="px-4 py-3">{statusBadge(r.trang_thai_thanh_toan)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleViewDetails(r.id)} title="Xem chi tiết">
                              <Eye size={16} />
                            </Button>
                            <Button variant="outline" size="icon" asChild>
                              <Link to={`/inventory/receipts/${r.id}/edit`} aria-label="Sửa">
                                <Pencil size={16} />
                              </Link>
                            </Button>
                            <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(r.id)} aria-label="Xóa">
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {rows.length === 0 ? (
                      <tr>
                        <td className="px-4 py-8 text-center text-slate-400" colSpan={9}>
                          Không có phiếu nhập nào ở trang này.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              {/* Pagination UI Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 pt-4 flex-wrap gap-2">
                  <span className="text-xs font-semibold text-slate-500">
                    Hiển thị {(page - 1) * 10 + 1} - {Math.min(page * 10, totalItems)} trong tổng số {totalItems} phiếu nhập
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
                        <Button variant="outline" size="icon" aria-label="Xóa" onClick={() => {}}>
                          <Trash2 />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={8}>
                      Không có phiếu phù hợp.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
