import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

const DiagnosisDistributionChart = ({ medicalRecords }) => {
  const diagnosisData = medicalRecords.reduce((acc, record) => {
    const diagnosis = record.diagnosis;
    const existing = acc.find(item => item.name === diagnosis);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: diagnosis, value: 1 });
    }
    return acc;
  }, []);
  
  return (
    <div className="glass-effect rounded-2xl p-6">
      <h2 className="text-lg font-bold text-medical-900 mb-6">Phân loại chẩn đoán</h2>
      {diagnosisData.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={diagnosisData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {diagnosisData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-center text-medical-600 h-[250px] flex items-center justify-center">Chưa có dữ liệu chẩn đoán.</p>
      )}
    </div>
  );
};

export default DiagnosisDistributionChart;