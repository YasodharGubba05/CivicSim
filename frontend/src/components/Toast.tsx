import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import type { Toast as ToastType, ToastVariant } from '../hooks/useToast';

const variantConfig: Record<ToastVariant, { icon: typeof CheckCircle; bg: string; border: string; text: string }> = {
  success: { icon: CheckCircle, bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  error:   { icon: AlertCircle, bg: 'bg-red-500/10',     border: 'border-red-500/30',     text: 'text-red-400' },
  info:    { icon: Info,        bg: 'bg-blue-500/10',     border: 'border-blue-500/30',    text: 'text-blue-400' },
};

interface ToastContainerProps {
  toasts: ToastType[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm">
      {toasts.map((toast) => {
        const config = variantConfig[toast.variant];
        const Icon = config.icon;

        return (
          <div
            key={toast.id}
            className={`${toast.exiting ? 'toast-exit' : 'toast-enter'} ${config.bg} ${config.border} border rounded-xl px-4 py-3 flex items-start gap-3 shadow-xl backdrop-blur-sm`}
          >
            <Icon className={`w-5 h-5 ${config.text} flex-shrink-0 mt-0.5`} />
            <p className="text-sm text-slate-200 flex-1">{toast.message}</p>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
