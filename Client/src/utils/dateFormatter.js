import { isValid, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { vi } from 'date-fns/locale';

/**
 * Chuyển đổi chuỗi timestamp UTC (không có 'Z') từ DB sang
 * định dạng ngày giờ Việt Nam (UTC+7).
 * @param {string | null | undefined} dbUtcString - Chuỗi ngày giờ từ DB (ví dụ: "2025-10-21 18:54:02.430")
 * @returns {string} - Chuỗi đã định dạng (ví dụ: "22/10/2025 01:54") hoặc "N/A".
 */
export const formatDbUtcToVnTime = (dbUtcString) => {
  // 1. Kiểm tra đầu vào
  if (!dbUtcString) {
    return 'N/A';
  }

  // 2. Thêm 'Z' để parseISO hiểu đây là giờ UTC
  const dateObj = parseISO(dbUtcString + 'Z');

  // 3. Kiểm tra ngày tháng có hợp lệ không
  if (!isValid(dateObj)) {
    return 'N/A';
  }

  // 4. Định dạng sang múi giờ Việt Nam
  try {
    return formatInTimeZone(
      dateObj,
      'Asia/Ho_Chi_Minh',
      'dd/MM/yyyy HH:mm',
      { locale: vi }
    );
  } catch (error) {
    console.error("Lỗi format ngày:", error);
    return 'N/A';
  }
};