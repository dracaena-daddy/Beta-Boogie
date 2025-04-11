// components/ConfirmDialog.tsx
import React from "react";

type ConfirmDialogProps = {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({ open, message, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#2A2A50] text-[#F4F4F4] p-6 rounded-xl shadow-xl w-full max-w-sm space-y-4">
        <h3 className="text-lg font-bold">⚠️ Confirm Action</h3>
        <p className="text-sm">{message}</p>
        <div className="flex justify-end gap-3 pt-4">
          <button
            className="px-4 py-1 text-sm rounded bg-gray-500 text-white hover:bg-gray-600"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700"
            onClick={onConfirm}
          >
            Yes, Clear
          </button>
        </div>
      </div>
    </div>
  );
}
