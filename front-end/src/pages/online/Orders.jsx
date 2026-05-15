import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, FileDown, Eye, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyVND, formatDateTimeVN } from "@/lib/format";

const tabs = [
  { key: "ALL", label: "Tất cả" },
  { key: "ChoXuLy", label: "Chờ xử lý" },
  { key: "DangGiao", label: "Đang giao" },
  { key: "HoanThanh", label: "Đã hoàn thành" },
  { key: "HuyDon", label: "Đã hủy" },
];

const ordersSeed = [
  {
    id: "HD002",
    date: "2024-05-20T11:15:00",
    customer: "Trần Thị B",
    phone: "0987 654 321",
    address: "123 Trần Phú, Bắc Ninh",
    total: 285000,
    channel: "Website",
    status: "ChoXuLy",
    staff: "NV02",
  },
  {
    id: "HD003",
    date: "2024-05-21T09:05:00",
    customer: "Nguyễn Văn A",
    phone: "0912 345 678",
    address: "Khu phố 1, Bắc Ninh",
    total: 1040000,
    channel: "Facebook",
    status: "DangGiao",
    staff: "NV02",
  },
];

const channelBadge = (channel) => {
  if (channel === "Facebook") {
    return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Facebook</Badge>;
  }
  if (channel === "Website") {
    return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none">Website</Badge>;
  }
  return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Zalo</Badge>;
};

const statusBadge = (status) => {
  switch (status) {
    case "ChoXuLy":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none">Chờ xử lý</Badge>;
    case "DangGiao":
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Đang giao</Badge>;
    case "HoanThanh":
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Đã hoàn thành</Badge>;
    case "HuyDon":
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Đã hủy</Badge>;
    default:
      return <Badge variant="outline">—</Badge>;
  }
};

export default function Orders() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [query, setQuery] = useState("");

  const pendingCount = useMemo(() => ordersSeed.filter((o) => o.status === "ChoXuLy").length, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ordersSeed.filter((o) => {
      const tabOk = activeTab === "ALL" ? true : o.status === activeTab;
      const queryOk = !q ? true : o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q);
      return tabOk && queryOk;
    });
  }, [activeTab, query]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Đơn hàng Online</h2>
          <p className="text-sm text-muted-foreground mt-1">Xử lý đơn từ Facebook/Website</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={() => {}}>
            <FileDown />
            Xuất file Excel
          </Button>
          <Button asChild className="gap-2">
            <Link to="/online/new">
              <Plus />
              Tạo đơn thủ công
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Danh sách đơn hàng</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Đơn chờ xử lý</span>
              <Badge className="bg-destructive text-destructive-foreground border-none">{pendingCount}</Badge>
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
                placeholder="Tìm theo mã đơn hoặc tên khách"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Kênh</label>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option>Tất cả</option>
                <option>Facebook</option>
                <option>Website</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Ngày đặt</label>
              <input type="date" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Mã đơn</th>
                  <th className="px-4 py-3 text-left font-medium">Ngày đặt</th>
                  <th className="px-4 py-3 text-left font-medium">Tên khách</th>
                  <th className="px-4 py-3 text-left font-medium">SĐT</th>
                  <th className="px-4 py-3 text-left font-medium">Địa chỉ giao</th>
                  <th className="px-4 py-3 text-right font-medium">Tổng tiền</th>
                  <th className="px-4 py-3 text-left font-medium">Kênh</th>
                  <th className="px-4 py-3 text-left font-medium">Trạng thái</th>
                  <th className="px-4 py-3 text-left font-medium">NV xử lý</th>
                  <th className="px-4 py-3 text-right font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => (
                  <tr key={o.id} className="border-t border-border/60 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold">
                      <Link to={`/online/${o.id}`} className="hover:underline">
                        {o.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDateTimeVN(o.date)}</td>
                    <td className="px-4 py-3">{o.customer}</td>
                    <td className="px-4 py-3">{o.phone}</td>
                    <td className="px-4 py-3 min-w-[240px]">{o.address}</td>
                    <td className="px-4 py-3 text-right font-semibold text-primary">{formatCurrencyVND(o.total)}</td>
                    <td className="px-4 py-3">{channelBadge(o.channel)}</td>
                    <td className="px-4 py-3">{statusBadge(o.status)}</td>
                    <td className="px-4 py-3">{o.staff}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="icon" asChild>
                          <Link to={`/online/${o.id}`} aria-label="Xem">
                            <Eye />
                          </Link>
                        </Button>
                        <Button variant="outline" size="icon" aria-label="Hủy" onClick={() => {}}>
                          <XCircle />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={10}>
                      Không có đơn phù hợp.
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
