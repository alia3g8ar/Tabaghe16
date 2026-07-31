"use client";

import { TriangleAlert, X } from "lucide-react";
import { useEffect } from "react";
import type { ReactNode } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "تأیید",
  cancelLabel = "انصراف",
  danger = true,
  confirmDisabled = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="animate-backdrop-in fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <div className="animate-popup-in relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d]/95 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <div className="h-px w-full bg-gradient-to-l from-transparent via-white/20 to-transparent" />

        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 left-4 flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition-all duration-300 hover:bg-white/[0.06] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 active:scale-90"
          aria-label="بستن"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 pt-8">
          <div
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
              danger ? "bg-red-500/10 text-red-400" : "bg-white/[0.06] text-gray-300"
            }`}
          >
            <TriangleAlert className="h-7 w-7" />
          </div>

          <h2
            id="confirm-dialog-title"
            className="mt-4 text-center text-lg font-bold text-white"
          >
            {title}
          </h2>

          <div className="mt-2 text-center text-sm leading-6 text-gray-400">
            {message}
          </div>
        </div>

        <div className="flex gap-3 border-t border-white/10 p-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-gray-200 transition-all duration-300 hover:bg-white/[0.08] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 active:scale-[0.98]"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            disabled={confirmDisabled}
            onClick={onConfirm}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 active:scale-[0.98] disabled:opacity-50 ${
              danger
                ? "bg-red-500/15 text-red-300 hover:bg-red-500/25 hover:text-red-200"
                : "bg-white/[0.08] hover:bg-white/[0.12]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
