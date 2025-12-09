import React from 'react';

// Bạn có thể dùng một thư viện icon như 'react-icons' hoặc 'heroicons',
// hoặc dán trực tiếp SVG vào component.
// Dưới đây là ví dụ dùng SVG từ Heroicons (ExclamationTriangleIcon)
const WarningIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="h-12 w-12 text-red-500"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
    />
  </svg>
);

const ConfirmationModal = ({
  message,
  onConfirm,
  onCancel,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  confirmColor = 'bg-red-600 hover:bg-red-700',
  title = 'Xác nhận hành động', // Thêm prop cho title
  icon = <WarningIcon />, // Thêm prop cho icon
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4">
    {/* Thêm p-4 để đảm bảo modal không bị dính cạnh trên màn hình nhỏ */}
    <div className="bg-white rounded-2xl p-6 w-full max-w-sm relative shadow-2xl text-center">
      {/* Icon nền */}
      {icon && (
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
          {icon}
        </div>
      )}

      {/* Tiêu đề */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>

      {/* Tin nhắn */}
      <p className="text-sm text-gray-600 mb-8">{message}</p>

      {/* Nhóm nút bấm */}
      <div className="grid grid-cols-2 gap-3">
        {/* Nút Hủy (Phụ) */}
        <button
          onClick={onCancel}
          className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          {cancelText}
        </button>
        {/* Nút Xác nhận (Chính) */}
        <button
          onClick={onConfirm}
          className={`w-full px-4 py-2.5 text-white rounded-lg transition-colors font-medium ${confirmColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400`}
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmationModal;