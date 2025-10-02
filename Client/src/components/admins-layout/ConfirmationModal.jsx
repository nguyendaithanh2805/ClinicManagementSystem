const ConfirmationModal = ({ message, onConfirm, onCancel, confirmText = 'Xóa', cancelText = 'Hủy', confirmColor = 'bg-red-600 hover:bg-red-700' }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100]"> {/* Increased z-index */}
    <div className="bg-white rounded-xl p-6 w-full max-w-sm relative shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Xác nhận</h3>
      <p className="text-gray-700 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 text-white rounded-lg transition-colors ${confirmColor}`}
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
);
export default ConfirmationModal;