import React from 'react';
import DashboardLayout from '../DashboardLayout';
import LabHeader from '../lab/LabHeader';
import LabStats from '../lab/LabStats';
import TestQueue from '../lab/TestQueue';
import SampleTracking from '../lab/SampleTracking';
import QualityControl from '../lab/QualityControl';
import EquipmentStatus from '../lab/EquipmentStatus';
import ResultsReview from '../lab/ResultsReview';

const LabDashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <LabHeader />
        <LabStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TestQueue />
            <ResultsReview />
          </div>
          
          <div className="space-y-6">
            <SampleTracking />
            <QualityControl />
            <EquipmentStatus />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LabDashboard;