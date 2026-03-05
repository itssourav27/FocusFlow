"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type ToastVariant = "success" | "error" | "info";

type ToastPayload = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
};

type ToastItem = ToastPayload & {
  id: string;
};

type ToastContextValue = {
  pushToast: (toast: ToastPayload) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

function getToastStyles(variant: ToastVariant) {
  if (variant === "success") {
    return "border-emerald-200 bg-emerald-50 text-emerald-900";
  }

  if (variant === "error") {
    return "border-rose-200 bg-rose-50 text-rose-900";
  }

  return "border-slate-200 bg-white text-slate-900";
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    ({
      title,
      description,
      variant = "info",
      actionLabel,
      onAction,
      durationMs = 3500,
    }: ToastPayload) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

      setToasts((current) => [
        ...current,
        { id, title, description, variant, actionLabel, onAction },
      ]);

      window.setTimeout(() => {
        removeToast(id);
      }, durationMs);
    },
    [removeToast],
  );

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl border px-4 py-3 shadow-sm ${getToastStyles(toast.variant ?? "info")}`}
          >
            <p className="text-sm font-semibold">{toast.title}</p>
            {toast.description ? (
              <p className="mt-1 text-xs opacity-90">{toast.description}</p>
            ) : null}
            {toast.actionLabel && toast.onAction ? (
              <button
                type="button"
                onClick={() => {
                  toast.onAction?.();
                  removeToast(toast.id);
                }}
                className="mt-2 inline-flex rounded-md border border-current px-2 py-1 text-xs font-semibold opacity-90 hover:opacity-100"
              >
                {toast.actionLabel}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
