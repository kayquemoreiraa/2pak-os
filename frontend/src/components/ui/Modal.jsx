import { X } from "lucide-react";

export default function Modal({ titulo, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-cortex-800 border border-cortex-border rounded-xl w-full max-w-lg animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-cortex-border">
          <h2 className="text-cortex-text font-semibold">{titulo}</h2>
          <button onClick={onClose} className="text-cortex-subtle hover:text-cortex-text transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
