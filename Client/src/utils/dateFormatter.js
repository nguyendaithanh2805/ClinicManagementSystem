import { isValid, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { vi } from 'date-fns/locale';

/**
 * Chuyển đổi chuỗi timestamp UTC (có dấu cách) từ DB sang
 * định dạng ngày giờ Việt Nam (UTC+7).
 * @param {string | null | undefined} dbUtcString - Chuỗi ngày giờ từ DB (ví dụ: "2025-10-26 21:09:19.407")
 * @returns {string} - Chuỗi đã định dạng (ví dụ: "27/10/2025 04:09") hoặc "N/A".
 */
export const formatDbUtcToVnTime = (dbUtcString) => {
  // 1. Kiểm tra đầu vào
  if (!dbUtcString || typeof dbUtcString !== 'string') { // Thêm kiểm tra kiểu string
    return 'N/A';
  }

  // 2. Thay thế dấu cách bằng 'T' để tạo chuỗi ISO hợp lệ
  const isoCompliantString = dbUtcString.replace(' ', 'T');

  // 3. Thêm 'Z' để parseISO hiểu đây là giờ UTC
  //   Quan trọng: Chỉ thêm 'Z' nếu chuỗi chưa có thông tin múi giờ
  const utcString = isoCompliantString.endsWith('Z') ? isoCompliantString : isoCompliantString + 'Z';

  // 4. Parse chuỗi UTC
  const dateObj = parseISO(utcString);

  // 5. Kiểm tra ngày tháng có hợp lệ không
  if (!isValid(dateObj)) {
    console.error("formatDbUtcToVnTime: Invalid date object after parsing", utcString, dateObj);
    return 'N/A';
  }

  // 6. Định dạng sang múi giờ Việt Nam
  try {
    return formatInTimeZone(
      dateObj,
      'Asia/Ho_Chi_Minh', // Múi giờ Việt Nam
      'dd/MM/yyyy HH:mm', // Định dạng mong muốn
      { locale: vi }
    );
  } catch (error) {
    console.error("formatDbUtcToVnTime: Error formatting date", error);
    return 'N/A';
  }
};