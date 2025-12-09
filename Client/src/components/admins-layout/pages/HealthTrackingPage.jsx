import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Activity, Heart, Thermometer, Scale, TrendingUp, TrendingDown, Calendar, Plus, BarChart3, Target, Award, Clock } from 'lucide-react';
import { format, subDays, subWeeks, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';

const HealthTrackingPage = () => {
  const { user } = useAuth();
  const [selectedMetric, setSelectedMetric] = useState('bloodPressure');
  const [timeRange, setTimeRange] = useState('1month');

  const healthMetrics = {
    bloodPressure: {
      name: 'Huyết áp',
      icon: Heart,
      color: 'red',
      unit: 'mmHg',
      target: { systolic: 120, diastolic: 80 },
      data: [
        { date: new Date(), systolic: 135, diastolic: 85, time: '08:00' },
        { date: subDays(new Date(), 1), systolic: 140, diastolic: 90, time: '08:00' },
        { date: subDays(new Date(), 2), systolic: 138, diastolic: 88, time: '08:00' },
        { date: subDays(new Date(), 3), systolic: 142, diastolic: 92, time: '08:00' },
        { date: subDays(new Date(), 4), systolic: 136, diastolic: 86, time: '08:00' },
        { date: subDays(new Date(), 5), systolic: 134, diastolic: 84, time: '08:00' },
        { date: subDays(new Date(), 6), systolic: 139, diastolic: 89, time: '08:00' }
      ]
    },
    weight: {
      name: 'Cân nặng',
      icon: Scale,
      color: 'blue',
      unit: 'kg',
      target: 65,
      data: [
        { date: new Date(), value: 68.2 },
        { date: subDays(new Date(), 7), value: 68.5 },
        { date: subDays(new Date(), 14), value: 68.8 },
        { date: subDays(new Date(), 21), value: 69.1 },
        { date: subDays(new Date(), 28), value: 69.4 }
      ]
    },
    heartRate: {
      name: 'Nhịp tim',
      icon: Activity,
      color: 'green',
      unit: 'bpm',
      target: { min: 60, max: 100 },
      data: [
        { date: new Date(), value: 78, type: 'resting' },
        { date: subDays(new Date(), 1), value: 82, type: 'resting' },
        { date: subDays(new Date(), 2), value: 76, type: 'resting' },
        { date: subDays(new Date(), 3), value: 80, type: 'resting' },
        { date: subDays(new Date(), 4), value: 79, type: 'resting' },
        { date: subDays(new Date(), 5), value: 77, type: 'resting' },
        { date: subDays(new Date(), 6), value: 81, type: 'resting' }
      ]
    },
    temperature: {
      name: 'Nhiệt độ',
      icon: Thermometer,
      color: 'orange',
      unit: '°C',
      target: { min: 36.1, max: 37.2 },
      data: [
        { date: new Date(), value: 36.5 },
        { date: subDays(new Date(), 1), value: 36.6 },
        { date: subDays(new Date(), 2), value: 36.4 },
        { date: subDays(new Date(), 3), value: 36.7 },
        { date: subDays(new Date(), 4), value: 36.5 },
        { date: subDays(new Date(), 5), value: 36.3 },
        { date: subDays(new Date(), 6), value: 36.6 }
      ]
    }
  };

  const healthGoals = [
    {
      id: 'bp_control',
      title: 'Kiểm soát huyết áp',
      description: 'Duy trì huyết áp dưới 130/80 mmHg',
      progress: 75,
      target: 'Đạt được trong 2 tháng',
      status: 'on_track'
    },
    {
      id: 'weight_loss',
      title: 'Giảm cân',
      description: 'Giảm 3kg trong 3 tháng',
      progress: 40,
      target: 'Còn 1.8kg nữa',
      status: 'on_track'
    },
    {
      id: 'exercise',
      title: 'Tập thể dục',
      description: 'Tập thể dục 30 phút/ngày, 5 ngày/tuần',
      progress: 60,
      target: 'Tuần này: 3/5 ngày',
      status: 'behind'
    },
    {
      id: 'medication',
      title: 'Uống thuốc đều đặn',
      description: 'Không bỏ lỡ liều thuốc nào',
      progress: 95,
      target: 'Tháng này: 28/30 ngày',
      status: 'excellent'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'measurement',
      title: 'Đo huyết áp',
      value: '135/85 mmHg',
      time: new Date(),
      status: 'normal'
    },
    {
      id: 2,
      type: 'medication',
      title: 'Uống thuốc Amlodipine',
      value: '5mg',
      time: subDays(new Date(), 0, -2),
      status: 'completed'
    },
    {
      id: 3,
      type: 'exercise',
      title: 'Đi bộ',
      value: '30 phút',
      time: subDays(new Date(), 0, -4),
      status: 'completed'
    },
    {
      id: 4,
      type: 'measurement',
      title: 'Cân nặng',
      value: '68.2 kg',
      time: subDays(new Date(), 1),
      status: 'normal'
    }
  ];

  const getMetricTrend = (metric) => {
    const data = healthMetrics[metric].data;
    if (data.length < 2) return 'stable';
    
    const latest = metric === 'bloodPressure' ? data[0].systolic : data[0].value;
    const previous = metric === 'bloodPressure' ? data[1].systolic : data[1].value;
    
    if (latest > previous) return 'up';
    if (latest < previous) return 'down';
    return 'stable';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'on_track':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'behind':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'measurement':
        return Activity;
      case 'medication':
        return Target;
      case 'exercise':
        return Award;
      default:
        return Clock;
    }
  };

  const currentMetric = healthMetrics[selectedMetric];
  const trend = getMetricTrend(selectedMetric);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-medical-900 mb-2">
              Theo dõi sức khỏe
            </h1>
            <p className="text-medical-600">
              Giám sát các chỉ số sức khỏe và tiến độ điều trị của bạn
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="btn-secondary inline-flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Báo cáo
            </button>
            <button className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Thêm đo lường
            </button>
          </div>
        </div>
      </div>

      {/* Health Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(healthMetrics).map(([key, metric]) => {
          const Icon = metric.icon;
          const trend = getMetricTrend(key);
          const latestData = metric.data[0];
          const latestValue = key === 'bloodPressure' 
            ? `${latestData.systolic}/${latestData.diastolic}`
            : latestData.value;

          return (
            <div
              key={key}
              onClick={() => setSelectedMetric(key)}
              className={`glass-effect rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-soft ${
                selectedMetric === key ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-${metric.color}-100 rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${metric.color}-600`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-2xl font-bold text-medical-900">
                      {latestValue}
                    </p>
                    {trend === 'up' && <TrendingUp className="w-4 h-4 text-red-500" />}
                    {trend === 'down' && <TrendingDown className="w-4 h-4 text-green-500" />}
                  </div>
                  <p className="text-sm font-medium text-medical-700 mb-1">
                    {metric.name}
                  </p>
                  <p className="text-xs text-medical-500">
                    {format(latestData.date, 'dd/MM HH:mm', { locale: vi })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Chart */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <currentMetric.icon className={`w-6 h-6 text-${currentMetric.color}-600`} />
            <h2 className="text-xl font-bold text-medical-900">
              {currentMetric.name}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-medical-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            >
              <option value="1week">1 tuần</option>
              <option value="1month">1 tháng</option>
              <option value="3months">3 tháng</option>
              <option value="6months">6 tháng</option>
            </select>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-8 mb-6">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-medical-900 mb-2">
              Biểu đồ {currentMetric.name}
            </h3>
            <p className="text-medical-600">
              Biểu đồ chi tiết sẽ hiển thị xu hướng {currentMetric.name.toLowerCase()} theo thời gian
            </p>
          </div>
        </div>

        {/* Recent Measurements */}
        <div>
          <h3 className="font-medium text-medical-900 mb-4">Đo lường gần đây</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentMetric.data.slice(0, 6).map((data, index) => (
              <div key={index} className="bg-white rounded-lg border border-medical-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-medical-600">
                    {format(data.date, 'dd/MM/yyyy', { locale: vi })}
                  </span>
                  {data.time && (
                    <span className="text-xs text-medical-500">{data.time}</span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-medical-900">
                    {selectedMetric === 'bloodPressure' 
                      ? `${data.systolic}/${data.diastolic}`
                      : data.value
                    }
                  </span>
                  <span className="text-sm text-medical-600">{currentMetric.unit}</span>
                </div>
                {selectedMetric === 'bloodPressure' && (
                  <div className="mt-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      data.systolic <= 120 && data.diastolic <= 80
                        ? 'bg-green-100 text-green-700'
                        : data.systolic <= 140 && data.diastolic <= 90
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {data.systolic <= 120 && data.diastolic <= 80
                        ? 'Bình thường'
                        : data.systolic <= 140 && data.diastolic <= 90
                        ? 'Cao nhẹ'
                        : 'Cao'
                      }
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Health Goals */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-medical-900">Mục tiêu sức khỏe</h2>
          <button className="btn-secondary text-sm">
            Thêm mục tiêu
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {healthGoals.map((goal) => (
            <div key={goal.id} className="bg-white rounded-xl border border-medical-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-medical-900 mb-1">{goal.title}</h3>
                  <p className="text-sm text-medical-600">{goal.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(goal.status)}`}>
                  {goal.status === 'excellent' ? 'Xuất sắc' :
                   goal.status === 'on_track' ? 'Đúng tiến độ' :
                   goal.status === 'behind' ? 'Chậm tiến độ' : 'Cần chú ý'}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-medical-600 mb-2">
                  <span>Tiến độ</span>
                  <span>{goal.progress}%</span>
                </div>
                <div className="w-full bg-medical-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      goal.status === 'excellent' ? 'bg-green-500' :
                      goal.status === 'on_track' ? 'bg-blue-500' :
                      goal.status === 'behind' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </div>

              <p className="text-sm text-medical-600">{goal.target}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-medical-900">Hoạt động gần đây</h2>
          <button className="btn-secondary text-sm">
            Xem tất cả
          </button>
        </div>

        <div className="space-y-3">
          {recentActivities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-medical-200">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-medical-900">{activity.title}</h4>
                    <span className="text-sm text-medical-500">
                      {format(activity.time, 'HH:mm', { locale: vi })}
                    </span>
                  </div>
                  <p className="text-sm text-medical-600">{activity.value}</p>
                </div>
                
                <div className={`w-3 h-3 rounded-full ${
                  activity.status === 'completed' ? 'bg-green-500' :
                  activity.status === 'normal' ? 'bg-blue-500' : 'bg-gray-400'
                }`}></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HealthTrackingPage;