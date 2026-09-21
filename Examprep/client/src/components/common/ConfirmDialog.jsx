import { AlertTriangle, X } from "lucide-react";

const ConfirmDialog = ({ open, onCancel, onConfirm, message }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div className="bg-surface rounded-xl shadow-xl border border-gray-200 p-6 w-full max-w-sm transform transition-all">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="text-red-600" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1 tracking-wide">Confirm Action</h3>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="btn-secondary text-sm px-4 py-2"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-gray-900 shadow-sm px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;