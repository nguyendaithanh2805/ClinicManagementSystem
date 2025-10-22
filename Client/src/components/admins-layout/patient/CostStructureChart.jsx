import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#00C49F', '#FFBB28']; // Màu cho Phí dịch vụ và Tiền thuốc

const CostStructureChart = ({ invoices }) => {
  // 1. Tính tổng chi phí dịch vụ và chi phí thuốc từ tất cả hóa đơn
  const totalCosts = invoices.reduce(
    (acc, invoice) => {
      const serviceCost = invoice.appointment.medicalService.cost;
      const prescriptionCost = Math.max(0, invoice.totalAmount - serviceCost);
      acc.service += serviceCost;
      acc.prescription += prescriptionCost;
      return acc;
    },
    { service: 0, prescription: 0 }
  );

  // 2. Chuẩn bị dữ liệu cho biểu đồ
  const chartData = [
    { name: 'Phí dịch vụ', value: totalCosts.service },
    { name: 'Tiền thuốc', value: totalCosts.prescription },
  ].filter(item => item.value > 0); // Lọc ra các khoản chi có giá trị > 0

  return (
    <div className="glass-effect rounded-2xl p-6">
      <h2 className="text-lg font-bold text-medical-900 mb-6">Cơ cấu chi phí tổng thể</h2>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60} // -> Tạo thành biểu đồ Donut
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')} VNĐ`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center text-medical-600 h-[250px] flex items-center justify-center">
          <p>Chưa có dữ liệu chi phí.</p>
        </div>
      )}
    </div>
  );
};

export default CostStructureChart;