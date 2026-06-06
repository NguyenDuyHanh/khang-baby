import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { FileText } from "lucide-react";

import AppLayout from "@/layout/AppLayout";
import Overview from "@/pages/Overview";

import Login from "@/pages/staff/Login";
import Register from "@/pages/staff/Register";
import StaffList from "@/pages/staff/StaffList";
import StaffForm from "@/pages/staff/StaffForm";

import Invoices from "@/pages/pos/Invoices";
import InvoiceForm from "@/pages/pos/InvoiceForm";
import InvoiceView from "@/pages/pos/InvoiceView";

import InventoryLayout from "@/pages/inventory/InventoryLayout";
import Products from "@/pages/inventory/Products";
import Stock from "@/pages/inventory/Stock";
import Receipts from "@/pages/inventory/Receipts";
import ReceiptForm from "@/pages/inventory/ReceiptForm";
import ReceiptView from "@/pages/inventory/ReceiptView";
import Returns from "@/pages/inventory/Returns";
import Feedback from "@/pages/inventory/Feedback";

import Customers from "@/pages/customers/Customers";

import Orders from "@/pages/online/Orders";
import OrderForm from "@/pages/online/OrderForm";
import OrderView from "@/pages/online/OrderView";

import Reports from "@/pages/reports/Reports";

import RequireAuth from "@/components/auth/RequireAuth";
import RequireRole from "@/components/auth/RequireRole";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Overview />} />

        <Route
          path="pos"
          element={
            <RequireRole allow={["MANAGER", "SALES"]}>
              <Outlet />
            </RequireRole>
          }
        >
          <Route index element={<Invoices />} />
          <Route path="new" element={<InvoiceForm />} />
          <Route path=":id" element={<InvoiceView />} />
          <Route path=":id/edit" element={<InvoiceForm />} />
        </Route>

        <Route
          path="inventory"
          element={
            <RequireRole allow={["MANAGER", "WAREHOUSE", "SALES", "ONLINE_SALES"]}>
              <InventoryLayout />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to="stock" replace />} />
          <Route path="products" element={<Products />} />
          <Route path="stock" element={<Stock />} />
          <Route
            path="receipts"
            element={
              <RequireRole allow={["MANAGER", "WAREHOUSE"]}>
                <Receipts />
              </RequireRole>
            }
          />
          <Route
            path="receipts/new"
            element={
              <RequireRole allow={["MANAGER", "WAREHOUSE"]}>
                <ReceiptForm />
              </RequireRole>
            }
          />
          <Route
            path="receipts/:id"
            element={
              <RequireRole allow={["MANAGER", "WAREHOUSE"]}>
                <ReceiptView />
              </RequireRole>
            }
          />
          <Route
            path="receipts/:id/edit"
            element={
              <RequireRole allow={["MANAGER", "WAREHOUSE"]}>
                <ReceiptForm />
              </RequireRole>
            }
          />
          <Route
            path="returns"
            element={
              <RequireRole allow={["MANAGER", "WAREHOUSE"]}>
                <Returns />
              </RequireRole>
            }
          />
          <Route
            path="feedback"
            element={
              <RequireRole allow={["MANAGER", "WAREHOUSE"]}>
                <Feedback />
              </RequireRole>
            }
          />
        </Route>

        <Route
          path="online"
          element={
            <RequireRole allow={["MANAGER", "ONLINE_SALES"]}>
              <Outlet />
            </RequireRole>
          }
        >
          <Route index element={<Orders />} />
          <Route path="new" element={<OrderForm />} />
          <Route path=":id" element={<OrderView />} />
          <Route path=":id/edit" element={<OrderForm />} />
        </Route>

        <Route
          path="reports"
          element={
            <RequireRole allow={["MANAGER", "MARKETING"]}>
              <Reports />
            </RequireRole>
          }
        />

        <Route
          path="customers"
          element={
            <RequireRole allow={["MANAGER", "SALES", "ONLINE_SALES"]}>
              <Customers />
            </RequireRole>
          }
        />

        <Route
          path="staff"
          element={
            <RequireRole allow={["MANAGER"]}>
              <Outlet />
            </RequireRole>
          }
        >
          <Route index element={<StaffList />} />
          <Route path="new" element={<StaffForm />} />
          <Route path=":id/edit" element={<StaffForm />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
