import { X } from "lucide-react";

const Modal = ({ open, onClose, title, children, width = "max-w-lg" }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div className={`bg-surface rounded-xl shadow-xl border border-gray-200 w-full ${width} max-h-[90vh] overflow-y-auto transform transition-all`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/50 rounded-t-xl">
          <h3 className="text-lg font-semibold text-gray-900 tracking-wide">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 hover:bg-gray-200 p-1.5 rounded-lg transition"
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