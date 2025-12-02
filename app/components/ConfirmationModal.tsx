"use client";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Ya",
  cancelText = "Batal",
  isDanger = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-scale-up">
        <h3 className="text-lg font-bold text-[#561530] mb-2">{title}</h3>
        <p className="text-[#6C727C] text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-[#E0E0E0] text-[#561530] font-bold text-sm hover:bg-gray-50 transition cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-white font-bold text-sm transition cursor-pointer ${isDanger
                ? "bg-[#dc2626] hover:bg-[#b91c1c]"
                : "bg-[#9e1c60] hover:bg-[#811844]"
              }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
