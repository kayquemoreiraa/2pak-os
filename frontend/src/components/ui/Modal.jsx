import { X } from "lucide-react";

export default function Modal({ titulo, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-raised border border-surface-border rounded-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
          <h2 className="text-gray-100 font-semibold">{titulo}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
