import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
        <p className="font-bold text-medical-900 mb-2">Ngày: {label}</p>
        
        <div className="mb-2">
            <p className="text-sm font-semibold" style={{ color: '#4A90E2' }}>{data.serviceName}:</p>
            <p className="text-sm text-gray-700 ml-2">{data.serviceCost.toLocaleString('vi-VN')} VNĐ</p>
        </div>

        {data.prescriptionDetails && data.prescriptionDetails.length > 0 && (
             <div className="mb-2">
                <p className="text-sm font-semibold" style={{ color: '#4DB6AC' }}>Tiền thuốc:</p>
                <ul className="list-disc list-inside ml-2">
                    {data.prescriptionDetails.map((detail, index) => (
                        <li key={index} className="text-sm text-gray-700">
                            {detail.medicine.name}: {detail.amount.toLocaleString('vi-VN')} VNĐ
                        </li>
                    ))}
                </ul>
            </div>
        )}
        
        <hr className="my-2" />
        <p className="font-bold text-medical-900">
          Tổng cộng: {data.totalAmount.toLocaleString('vi-VN')} VNĐ
        </p>
      </div>
    );
  }
  return null;
};

// Component biểu đồ chính
const CostDetailChart = ({ invoices }) => {
  const chartData = [...invoices]
    .sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate))
    .map(invoice => {
      const prescriptionDetails = invoice.patientMedicalRecord?.prescription?.prescriptionDetails || [];
      const totalPrescriptionCost = prescriptionDetails.reduce(
        (sum, detail) => sum + detail.amount, 0
      );
      
      return {
        date: format(new Date(invoice.paymentDate), 'dd/MM'),
        serviceCost: invoice.patientMedicalRecord?.appointment.medicalService.cost,
        prescriptionCost: totalPrescriptionCost,
        totalAmount: invoice.totalAmount,
        serviceName: invoice.patientMedicalRecord.appointments.medicalService.name,
        prescriptionDetails: invoice.patientMedicalRecord.prescription.prescriptionDetails,
      };
    });

  return (
    <div className="glass-effect rounded-2xl p-6">
      <h2 className="text-xl font-bold text-medical-900 mb-6">Chi tiết chi phí theo từng lần khám</h2>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            barCategoryGap="20%" 
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => `${(value / 1000).toLocaleString('vi-VN')}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="serviceCost" name="Phí dịch vụ" fill="#4A90E2" />
            <Bar dataKey="prescriptionCost" name="Tiền thuốc" fill="#4DB6AC" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center text-medical-600 h-[300px] flex items-center justify-center">
          <p>Chưa có dữ liệu hóa đơn để hiển thị.</p>
        </div>
      )}
    </div>
  );
};

export default CostDetailChart;