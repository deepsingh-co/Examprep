import { AlertTriangle, X } from "lucide-react";

const ConfirmDialog = ({ open, onCancel, onConfirm, message }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="glass-panel p-6 w-full max-w-sm border-t-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.15)] transform transition-all">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            <AlertTriangle className="text-red-400" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-1 tracking-wide">Confirm Action</h3>
            <p className="text-sm text-gray-300">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium border border-white/10 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium bg-red-500/90 hover:bg-red-500 text-white rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.4)] transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;