import React, { useEffect, useState } from 'react';
import api from '../../admins-layout/contexts/Api';
import PatientHeader from '../patient/PatientHeader';
import PatientStats from '../patient/PatientStats';
import UpcomingAppointments from '../patient/UpcomingAppointments';
import RecentMedicalRecords from '../patient/RecentMedicalRecords';
import MedicationReminders from '../patient/MedicationReminders';
import QuickActions from '../patient/QuickActions';
import CostTrendChart from '../patient/CostDetailChart';
import CostStructureChart from '../patient/CostStructureChart';
import DiagnosisDistributionChart from '../patient/DiagnosisDistributionChart';

const PatientDashboardContent = () => {
  const [patientInfo, setPatientInfo] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Sử dụng Promise.all để gọi các API song song
        const [accountRes, appointmentsRes, recordsRes, invoicesRes] = await Promise.all([
          api.get('/patients/accounts/me'),
          api.get('/patients/appointments/me'),
          api.get('/patients/medical-records/me'),
          api.get('/patients/invoices/me')
        ]);

        if (accountRes.data.status) {
          setPatientInfo(accountRes.data.data);
        }
        if (appointmentsRes.data.status) {
          setAppointments(appointmentsRes.data.data);
        }
        if (recordsRes.data.status) {
          setMedicalRecords(recordsRes.data.data);
        }
        if (invoicesRes.data.status) {
          setInvoices(invoicesRes.data.data);
        }
      } catch (err) {
        setError("Không thể tải dữ liệu từ server. Vui lòng thử lại sau.");
        console.error("API call failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center p-10">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-600">{error}</div>;
  }

  // Lấy ra đơn thuốc từ tất cả hồ sơ bệnh án
  const allPrescriptions = medicalRecords.flatMap(record =>
    record.prescriptions.flatMap(p => p.prescriptionDetails)
  );

  return (
    <>
      <PatientHeader patientInfo={patientInfo} />
      <PatientStats
        appointments={appointments}
        medicalRecords={medicalRecords}
        prescriptions={allPrescriptions}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CostTrendChart invoices={invoices} />
          <UpcomingAppointments appointments={appointments} />
          <RecentMedicalRecords medicalRecords={medicalRecords} />
        </div>

        <div className="space-y-6">
          <CostStructureChart invoices={invoices} />
          <DiagnosisDistributionChart medicalRecords={medicalRecords} />
          <MedicationReminders medicalRecords={medicalRecords} />
        </div>
      </div>
    </>
  );
};

export default PatientDashboardContent;