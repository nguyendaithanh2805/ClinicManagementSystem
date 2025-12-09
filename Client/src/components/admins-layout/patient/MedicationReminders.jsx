import React from 'react';
import { Pill, Clock } from 'lucide-react';

const MedicationReminders = ({ medicalRecords }) => {
  // Lấy đơn thuốc từ hồ sơ bệnh án gần nhất
  const latestRecord = medicalRecords.length > 0 ? medicalRecords[0] : null;
  const medications = latestRecord ? latestRecord.prescriptions.flatMap(p => p.prescriptionDetails) : [];

  return (
    <div className="glass-effect rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-medical-900">Đơn thuốc gần nhất</h2>
        <button className="btn-secondary text-sm">Xem tất cả đơn thuốc</button>
      </div>

      <div className="space-y-3">
        {medications.length > 0 ? (
          medications.map((medication, index) => (
            <div key={index} className={`border-l-4 border-l-blue-500 bg-blue-50 pl-4 py-3 rounded-r-lg`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600`}>
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-medium text-medical-900 text-sm">{medication.medicine.name}</h3>
                  <p className="text-xs text-medical-600">
                    {medication.dosage} - {medication.frequency}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-medical-600">
                <Clock className="w-3 h-3" />
                <span>Số lượng: {medication.quantity} {medication.medicine.unit}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-medical-600">Không có đơn thuốc nào.</p>
        )}
      </div>
    </div>
  );
};

export default MedicationReminders;