import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { registerToast } from "../utils/toast";

const TOAST_VARIANTS = {
  success: {
    icon: "solar:check-circle-bold",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/80",
    borderColor: "border-emerald-500",
    textColor: "text-emerald-900 dark:text-emerald-200",
    iconColor: "text-emerald-500",
    barColor: "bg-emerald-500",
  },
  error: {
    icon: "solar:close-circle-bold",
    bgColor: "bg-rose-50 dark:bg-rose-950/80",
    borderColor: "border-rose-500",
    textColor: "text-rose-900 dark:text-rose-200",
    iconColor: "text-rose-500",
    barColor: "bg-rose-500",
  },
  danger: {
    icon: "solar:close-circle-bold",
    bgColor: "bg-rose-50 dark:bg-rose-950/80",
    borderColor: "border-rose-500",
    textColor: "text-rose-900 dark:text-rose-200",
    iconColor: "text-rose-500",
    barColor: "bg-rose-500",
  },
  warning: {
    icon: "solar:danger-triangle-bold",
    bgColor: "bg-amber-50 dark:bg-amber-950/80",
    borderColor: "border-amber-500",
    textColor: "text-amber-900 dark:text-amber-200",
    iconColor: "text-amber-500",
    barColor: "bg-amber-500",
  },
  info: {
    icon: "solar:info-circle-bold",
    bgColor: "bg-blue-50 dark:bg-blue-950/80",
    borderColor: "border-blue-500",
    textColor: "text-blue-900 dark:text-blue-200",
    iconColor: "text-blue-500",
    barColor: "bg-blue-500",
  },
};

export default function AppToast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    registerToast(({ message, variant = "info" }) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      const newToast = { id, message, variant };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    });
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((item) => {
        const style = TOAST_VARIANTS[item.variant] || TOAST_VARIANTS.info;
        return (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-top-4 ${style.bgColor} ${style.borderColor}`}
          >
            <div className="flex items-center gap-3 pr-2">
              <Icon icon={style.icon} className={`text-xl flex-shrink-0 ${style.iconColor}`} />
              <p className={`text-sm font-medium leading-snug ${style.textColor}`}>
                {item.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(item.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-md"
              aria-label="Close toast"
            >
              <Icon icon="solar:close-circle-outline" className="text-lg" />
            </button>
          </div>
        );
      })}
    </div>
  );
}