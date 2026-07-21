import React from "react";
import { AlertTriangle } from "lucide-react";

export interface SubmitConfirmModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  containerMode?: "fixed" | "absolute";
  onConfirm: () => void;
  onCancel: () => void;
}

export const SubmitConfirmModal: React.FC<SubmitConfirmModalProps> = ({
  isOpen,
  title = "Submit & Lock Brief?",
  description = "This action is irreversible. Once submitted, your brief is locked for production and cannot be modified. Please confirm all details are correct.",
  confirmText = "Yes, Submit",
  cancelText = "Cancel",
  containerMode = "fixed",
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const isAbsolute = containerMode === "absolute";

  const overlayClasses = isAbsolute
    ? "absolute inset-0 bg-black/45 backdrop-blur-[12px] flex items-end justify-center z-50 rounded-[36px] overflow-hidden animate-in fade-in duration-300 select-none"
    : "fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-200 select-none";

  const cardClasses = isAbsolute
    ? "bg-white px-6 pt-4 pb-6 rounded-t-[32px] rounded-b-[34px] w-full shadow-2xl border-t border-gray-150 text-center animate-in slide-in-from-bottom-full fade-in duration-300"
    : "bg-white p-6 rounded-[24px] max-w-sm w-full mx-4 shadow-xl border border-gray-150 text-center animate-in zoom-in-95 duration-200";

  return (
    <div className={overlayClasses} onClick={onCancel}>
      <div className={cardClasses} onClick={(e) => e.stopPropagation()}>
        {isAbsolute && (
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
        )}
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-extrabold text-[#0F172A] tracking-tight">{title}</h3>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
          {description}
        </p>
        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 text-xs font-bold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer bg-white active:scale-95"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 text-xs font-extrabold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer active:scale-95"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitConfirmModal;
