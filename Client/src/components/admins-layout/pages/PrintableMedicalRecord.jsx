import React from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz';

const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;
const PrintableMedicalRecord = ({ record }) => {
  if (!record) {
    return <div className="text-center p-2 text-sm">Không có dữ liệu hồ sơ bệnh án để in.</div>;
  }

  // Placeholder cho ảnh bìa nếu không có từ record.image
  const coverImageUrl = "/images/avt_nguyendaithanh.png";

   return (
    <div className="printable-medical-record-container" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Trang Bìa - Trang 1 */}
      <div className="medical-record-cover" style={{
        position: 'relative',
        width: '210mm', // A4 width
        height: '297mm', // A4 height
        overflow: 'hidden',
        pageBreakAfter: 'always',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color: '#fff',
        backgroundImage: `url(${coverImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)' // Lớp phủ tối để chữ dễ đọc
        }}></div>
        <div style={{
          position: 'relative',
          zIndex: 10,
          padding: '2rem'
        }}>
          <h1 style={{ fontSize: '3.5em', fontWeight: 'bold', marginBottom: '1.5rem', textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
            HỒ SƠ BỆNH ÁN
          </h1>
          <p style={{ fontSize: '1.8em', marginBottom: '0.8rem', textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
            Bệnh viện Đa khoa MedCare
          </p>
          <p style={{ fontSize: '1.4em', marginBottom: '2.5rem', textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
            Mã hồ sơ: HS{String(record.id).padStart(3, '0')}
          </p>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '2rem 3rem',
            display: 'inline-block',
            textAlign: 'left'
          }}>
            <p style={{ fontSize: '1.3em', margin: '0.7rem 0', fontWeight: 'bold' }}>
              Bệnh nhân: {record.patientName || 'N/A'}
            </p>
            <p style={{ fontSize: '1.2em', margin: '0.7rem 0' }}>
              Ngày khám: {format(record.date, 'dd/MM/yyyy HH:mm', { locale: vi })}
            </p>
            <p style={{ fontSize: '1.2em', margin: '0.7rem 0' }}>
              Bác sĩ điều trị: {record.doctor || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Nội dung hồ sơ bệnh án - Từ trang 2 trở đi */}
      <div className="medical-record-content p-8" style={{ backgroundColor: '#ffffff', color: '#1f2937', fontSize: '11pt', lineHeight: '1.6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.2rem' }}>PHÒNG KHÁM ĐA KHOA</p>
            <p style={{ fontSize: '0.9em', color: '#4b5563' }}>123 Đường ABC, Quận XYZ, TP.HCM</p>
            <p style={{ fontSize: '0.9em', color: '#4b5563' }}>Điện thoại: (028) 1234 5678</p>
            <p style={{ fontSize: '0.9em', color: '#4b5563' }}>Email: info@medcare.com</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#1e40af', marginBottom: '0.5rem' }}>HỒ SƠ BỆNH ÁN</p>
            <p style={{ fontSize: '1em', color: '#4b5563' }}>Mã hồ sơ: <span style={{ fontWeight: '600', color: '#1f2937' }}>HS{String(record.id).padStart(3, '0')}</span></p>
            <p style={{ fontSize: '1em', color: '#4b5563' }}>Ngày khám: <span style={{ fontWeight: '600', color: '#1f2937' }}>{format(record.date, 'dd/MM/yyyy HH:mm', { locale: vi })}</span></p>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.8rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e7eb' }}>THÔNG TIN BỆNH NHÂN</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: '2.5rem', rowGap: '0.5rem', color: '#4b5563', fontSize: '1em' }}>
            <div>
              <p><strong style={{ color: '#1f2937' }}>Tên bệnh nhân:</strong> {record.patientName || 'N/A'}</p>
              <p><strong style={{ color: '#1f2937' }}>Ngày sinh:</strong> {record.patientDob ? format(parseISO(record.patientDob), 'dd/MM/yyyy', { locale: vi }) : 'N/A'}</p>
            </div>
            <div>
              <p><strong style={{ color: '#1f2937' }}>Email:</strong> {record.patientEmail || 'N/A'}</p>
              <p><strong style={{ color: '#1f2937' }}>Địa chỉ:</strong> {record.patientAddress || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.8rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e7eb' }}>CHI TIẾT HỒ SƠ BỆNH ÁN</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', color: '#4b5563', fontSize: '1em' }}>
            <p><strong style={{ color: '#1f2937' }}>Bác sĩ:</strong> {record.doctor || 'N/A'}</p>
            <p><strong style={{ color: '#1f2937' }}>Chuyên khoa:</strong> {record.department || 'N/A'}</p>
            <p><strong style={{ color: '#1f2937' }}>Chẩn đoán:</strong> <span style={{ whiteSpace: 'pre-wrap' }}>{record.diagnosis || 'N/A'}</span></p>
            <p><strong style={{ color: '#1f2937' }}>Phương pháp điều trị:</strong> <span style={{ whiteSpace: 'pre-wrap' }}>{record.treatmentMethod || 'N/A'}</span></p>
            <p><strong style={{ color: '#1f2937' }}>Yêu cầu xét nghiệm:</strong> {record.requiresTest ? 'Có' : 'Không'}</p>
          </div>
        </div>

        {record.symptoms && record.symptoms.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.8rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e7eb' }}>TRIỆU CHỨNG</h2>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.8rem', color: '#4b5563', fontSize: '1em', lineHeight: '1.5' }}>
              {record.symptoms.map((symptom, index) => (
                <li key={index}>{symptom.name}</li>
              ))}
            </ul>
          </div>
        )}

        {record.prescriptions && record.prescriptions.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.8rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e7eb' }}>ĐƠN THUỐC</h2>
            {record.prescriptions.map((prescription, pIndex) => (
              <div key={pIndex} style={{ marginBottom: '1.5rem', border: '1px solid #e5e7eb', padding: '1.2rem', borderRadius: '8px' }}>
                <p style={{ fontWeight: '600', color: '#1f2937', marginBottom: '1rem', fontSize: '1.1em' }}>Đơn thuốc ngày: {
                  prescription.prescriptionDate && isValid(parseISO(prescription.prescriptionDate))
                    ? formatInTimeZone(parseISO(prescription.prescriptionDate), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm', { locale: vi })
                    : 'N/A'
                }</p>
                <table style={{ minWidth: '100%', backgroundColor: '#ffffff', borderCollapse: 'collapse', border: '1px solid #d1d5db', borderRadius: '4px', overflow: 'hidden' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#eff6ff', textAlign: 'left', textTransform: 'uppercase', fontSize: '0.85em', lineHeight: 'normal', color: '#1e40af' }}>
                      <th style={{ padding: '0.8rem 1rem', borderBottom: '1px solid #d1d5db' }}>STT</th>
                      <th style={{ padding: '0.8rem 1rem', borderBottom: '1px solid #d1d5db' }}>Tên thuốc</th>
                      <th style={{ padding: '0.8rem 1rem', borderBottom: '1px solid #d1d5db' }}>Liều dùng</th>
                      <th style={{ padding: '0.8rem 1rem', borderBottom: '1px solid #d1d5db' }}>Tần suất</th>
                      <th style={{ padding: '0.8rem 1rem', borderBottom: '1px solid #d1d5db', textAlign: 'right' }}>Số lượng</th>
                      <th style={{ padding: '0.8rem 1rem', borderBottom: '1px solid #d1d5db', textAlign: 'right' }}>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody style={{ color: '#4b5563', fontSize: '0.95em' }}>
                    {prescription.prescriptionDetails && prescription.prescriptionDetails.length > 0 ? (
                      prescription.prescriptionDetails.map((detail, detIndex) => (
                        <tr key={detIndex} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '0.6rem 1rem' }}>{detIndex + 1}</td>
                          <td style={{ padding: '0.6rem 1rem' }}>{detail.medicine?.name || 'N/A'} ({detail.medicine?.category || 'N/A'})</td>
                          <td style={{ padding: '0.6rem 1rem' }}>{detail.dosage || 'N/A'}</td>
                          <td style={{ padding: '0.6rem 1rem' }}>{detail.frequency || 'N/A'}</td>
                          <td style={{ padding: '0.6rem 1rem', textAlign: 'right' }}>{detail.quantity} {detail.medicine?.unit || 'viên'}</td>
                          <td style={{ padding: '0.6rem 1rem', textAlign: 'right' }}>{(detail.amount || 0).toLocaleString('vi-VN')} VNĐ</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="6" style={{ textAlign: 'center', padding: '1rem', fontStyle: 'italic', color: '#6b7280' }}>Không có chi tiết đơn thuốc.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        {record.labTests && record.labTests.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.8rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e7eb' }}>KẾT QUẢ XÉT NGHIỆM</h2>
            {record.labTests.map((test, tIndex) => (
              <div key={tIndex} style={{ marginBottom: '1.5rem', border: '1px solid #e5e7eb', padding: '1.2rem', borderRadius: '8px' }}>
                <p style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem', fontSize: '1.05em' }}>Tên xét nghiệm: {test.name || 'N/A'}</p>
                <p style={{ fontSize: '1em', color: '#4b5563' }}>Mô tả: {test.description || 'N/A'}</p>
                <p style={{ fontSize: '1em', color: '#4b5563' }}>Thực hiện bởi: {test.staff?.fullName || 'N/A'} ({test.staff?.expertise || 'Kỹ thuật viên'})</p>
                <p style={{ fontSize: '1em', color: '#4b5563' }}>Ngày thực hiện: {test.createdAt && isValid(parseISO(test.createdAt)) ? format(parseISO(test.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi }) : 'N/A'}</p>
                {test.image && (
                  <div style={{ marginTop: '1rem' }}>
                    <p style={{ fontSize: '1em', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>Hình ảnh kết quả:</p>
                    <img src={`${IMAGE_URL}/${test.image}`} alt={test.name} style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'contain', border: '1px solid #eee', borderRadius: '4px' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {record.staff && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.8rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e7eb' }}>THÔNG TIN BÁC SĨ</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#4b5563', fontSize: '1em' }}>
              <p><strong style={{ color: '#1f2937' }}>Họ và tên:</strong> {record.staff.fullName || 'N/A'}</p>
              <p><strong style={{ color: '#1f2937' }}>Chuyên môn:</strong> {record.staff.expertise || 'N/A'}</p>
              <p><strong style={{ color: '#1f2937' }}>Email:</strong> {record.staff.account?.email || 'N/A'}</p>
              <p><strong style={{ color: '#1f2937' }}>Số điện thoại:</strong> {record.staff.account?.phoneNumber || 'N/A'}</p>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', color: '#6b7280', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb', fontSize: '0.9em' }}>
          <p style={{ marginBottom: '0.5rem' }}>Hồ sơ này được tạo tự động bởi hệ thống.</p>
        </div>
      </div>
    </div>
  );
};

export default PrintableMedicalRecord;