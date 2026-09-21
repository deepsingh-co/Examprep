import { X } from "lucide-react";

const Modal = ({ open, onClose, title, children, width = "max-w-lg" }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className={`glass-panel border-t-primary/50 w-full ${width} max-h-[90vh] overflow-y-auto transform transition-all shadow-[0_0_40px_rgba(139,92,246,0.15)]`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
          <h3 className="text-lg font-semibold text-white tracking-wide">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;