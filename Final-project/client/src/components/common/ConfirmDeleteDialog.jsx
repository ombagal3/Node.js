import React from 'react';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import Modal from './Modal';

const ConfirmDeleteDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to permanently delete this item? This action cannot be undone.',
  itemName = '',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20 shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-slate-300">{message}</p>
          {itemName && (
            <div className="mt-2.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs font-mono text-slate-300 break-all">
              {itemName}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors disabled:opacity-50 shadow-sm shadow-rose-950"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </>
          )}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteDialog;
