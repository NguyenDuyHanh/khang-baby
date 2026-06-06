import { useState, useEffect } from "react";
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrencyVND } from "@/lib/format";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Search, UserCircle, Calendar } from "lucide-react";

export default function Customers() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCustomers = async (query = "") => {
    try {
      setLoading(true);
      const res = await apiRequest(`/customers?search=${encodeURIComponent(query)}&limit=50`, { token });
      if (res.ok) {
        setCustomers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(search);
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Khách Hàng</h1>
          <p className="text-muted-foreground mt-1">Quản lý thông tin và lịch sử mua hàng của khách</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle>Danh sách khách hàng</CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Tìm theo tên hoặc SĐT..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[250px] font-semibold text-slate-600">Khách hàng</TableHead>
                <TableHead className="font-semibold text-slate-600">Địa chỉ</TableHead>
                <TableHead className="text-center font-semibold text-slate-600">Số đơn hàng</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Tổng chi tiêu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-slate-500">Đang tải dữ liệu...</TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <UserCircle className="h-10 w-10 text-slate-300 mb-2" />
                      <p>Không tìm thấy khách hàng nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((c) => (
                  <TableRow key={c.id} className="group hover:bg-slate-50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {c.ho_ten ? c.ho_ten.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-primary transition-colors">{c.ho_ten || 'Khách chưa có tên'}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                              {c.so_dien_thoai}
                            </span>
                            {c.ngay_tao && (
                              <span className="text-[10px] text-slate-400 flex items-center gap-1" title="Ngày tham gia">
                                <Calendar className="h-3 w-3" />
                                {new Date(c.ngay_tao).toLocaleDateString("vi-VN")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 align-middle">
                      {c.dia_chi || <span className="text-slate-400 italic">Chưa cập nhật</span>}
                    </TableCell>
                    <TableCell className="text-center align-middle">
                      <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-sm border border-slate-200">
                        {c.tong_don_hang}
                      </span>
                    </TableCell>
                    <TableCell className="text-right align-middle">
                      <span className="font-semibold text-primary">
                        {formatCurrencyVND(c.tong_chi_tieu)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
