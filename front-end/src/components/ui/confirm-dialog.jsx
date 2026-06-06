import { Button } from "@/components/ui/button";
import { X, AlertTriangle, AlertCircle, Info } from "lucide-react";

export default function ConfirmDialog({
  isOpen,
  title = "Xác nhận thao tác",
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  onConfirm,
  onCancel,
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  variant = "danger" // "danger" | "warning" | "info" | "primary"
}) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (variant) {
      case "danger":
        return <AlertCircle className="text-red-500 h-6 w-6 animate-bounce" />;
      case "warning":
        return <AlertTriangle className="text-amber-500 h-6 w-6" />;
      case "primary":
      case "info":
      default:
        return <Info className="text-primary h-6 w-6" />;
    }
  };

  const getConfirmButtonStyles = () => {
    switch (variant) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white font-semibold";
      case "warning":
        return "bg-amber-500 hover:bg-amber-600 text-white font-semibold";
      case "primary":
        return "bg-primary hover:bg-primary/90 text-white font-semibold";
      case "info":
      default:
        return "bg-slate-800 hover:bg-slate-900 text-white font-semibold";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onCancel}
      />

      {/* Modal Card */}
      <div 
        className="relative bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-100 overflow-hidden z-10 transform transition-all duration-300 animate-in zoom-in-95"
      >
        {/* Header decoration */}
        <div className={`h-1.5 w-full ${
          variant === "danger" ? "bg-red-500" :
          variant === "warning" ? "bg-amber-500" :
          variant === "primary" ? "bg-primary" : "bg-slate-500"
        }`} />

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full ${
              variant === "danger" ? "bg-red-50" :
              variant === "warning" ? "bg-amber-50" :
              variant === "primary" ? "bg-primary/10" : "bg-slate-100"
            }`}>
              {getIcon()}
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight leading-none">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed pt-1.5">{message}</p>
            </div>
            <button 
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-2 border-t border-slate-100">
            <Button 
              variant="ghost" 
              onClick={onCancel}
              className="font-semibold text-slate-500 hover:bg-slate-50"
            >
              {cancelText}
            </Button>
            <Button 
              onClick={onConfirm}
              className={getConfirmButtonStyles()}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
