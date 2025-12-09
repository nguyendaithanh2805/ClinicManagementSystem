import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DollarSign, Zap, TrendingUp, BarChart, Users, BriefcaseMedical, ChevronDown, Clock, Calendar as CalendarIcon, CornerDownRight, ThumbsUp } from 'lucide-react';
import api from "../../admins-layout/contexts/Api";
import { toast } from "react-toastify";
import { 
    ResponsiveContainer, 
    BarChart as RechartsBarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts';
// 

// Component con cho các thẻ thống kê
const StatisticCard = ({ title, value, icon: Icon, colorClass, details }) => (
    <div className={`bg-white rounded-xl shadow-lg p-5 border-t-4 ${colorClass}`}>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-opacity-20 ${colorClass.replace('border-t-4 ', '').replace('-600', '-100')}`}>
                    <Icon className={`w-6 h-6 ${colorClass.replace('border-t-4 ', '')}`} />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
        {details && <p className="mt-3 text-sm text-gray-600">{details}</p>}
    </div>
);

// Component cho Biểu đồ Thanh (Doanh thu)
const RevenueBarChart = ({ data }) => {
    // Chuyển đổi dữ liệu để hiển thị theo ngày/tuần/tháng
    const chartData = useMemo(() => {
        // Gom nhóm và tính tổng doanh thu theo ngày
        const grouped = data.reduce((acc, invoice) => {
            // Sử dụng toLocaleDateString để chuẩn hóa ngày hiển thị
            const date = new Date(invoice.invoiceDate || invoice.paymentDate).toLocaleDateString('vi-VN');
            acc[date] = (acc[date] || 0) + (invoice.totalAmount || 0);
            return acc;
        }, {});

        // Chuyển đổi thành mảng cho Recharts
        return Object.keys(grouped).map(date => ({
            date: date,
            revenue: grouped[date]
        })).sort((a, b) => new Date(a.date.split('/').reverse().join('-')) - new Date(b.date.split('/').reverse().join('-')));
    }, [data]);

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-600" /> Biểu đồ Doanh thu (VNĐ)</h3>
            <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#6b7280" tickFormatter={(value) => value.toLocaleString('vi-VN')} />
                    <Tooltip 
                        formatter={(value) => [`${value.toLocaleString('vi-VN')} VNĐ`, 'Doanh thu']} 
                        labelFormatter={(label) => `Ngày: ${label}`}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#10B981" name="Doanh thu" />
                </RechartsBarChart>
            </ResponsiveContainer>
        </div>
    );
};

// Component cho Biểu đồ Tròn (Tỷ lệ Trạng thái Lịch hẹn)
const AppointmentStatusPieChart = ({ data }) => {
    const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#6B7280', '#A855F7']; // Blue, Amber, Green, Red, Gray, Purple
    
    // Ánh xạ trạng thái và tính toán số lượng
    const statusCounts = data.reduce((acc, appointment) => {
        let statusName;
        switch(appointment.status) {
            case 0: statusName = 'Chờ xác nhận'; break;
            case 1: statusName = 'Đã xác nhận'; break;
            case 2: statusName = 'Đã check-in'; break;
            case 3: statusName = 'Đang khám'; break;
            case 4: statusName = 'Đã hoàn thành'; break;
            case 5: statusName = 'Đã hủy'; break;
            default: statusName = 'Khác';
        }
        acc[statusName] = (acc[statusName] || 0) + 1;
        return acc;
    }, {});

    const pieData = Object.keys(statusCounts).map((key, index) => ({
        name: key,
        value: statusCounts[key],
    }));

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight="bold">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-blue-600" /> Tỷ lệ Trạng thái Lịch hẹn</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        labelLine={false}
                        label={renderCustomizedLabel}
                    >
                        {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip 
                        formatter={(value, name, props) => [`${value} lượt`, name]}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                    />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '10px' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

// Component cho Biểu đồ Đường (Hiệu suất)
const PerformanceLineChart = ({ filteredAppointments }) => {
    const chartData = useMemo(() => {
        // Chuyển đổi và gom nhóm dữ liệu theo ngày
        const dailyData = filteredAppointments.reduce((acc, apt) => {
            const date = new Date(apt.appointmentDate).toLocaleDateString('vi-VN');
            if (!acc[date]) {
                acc[date] = { total: 0, completed: 0, confirmed: 0, checkedIn: 0 };
            }
            acc[date].total += 1;
            if (apt.status === 4) acc[date].completed += 1;
            if (apt.status === 1) acc[date].confirmed += 1;
            if (apt.status === 2) acc[date].checkedIn += 1;
            return acc;
        }, {});

        // Tính toán các tỷ lệ
        return Object.keys(dailyData).map(date => {
            const day = dailyData[date];
            const completionRate = day.total > 0 ? parseFloat(((day.completed / day.total) * 100).toFixed(1)) : 0;
            const attendanceRate = day.confirmed > 0 ? parseFloat(((day.checkedIn / day.confirmed) * 100).toFixed(1)) : 0;
            
            return {
                date,
                'Tỷ lệ Hoàn thành': completionRate,
                'Tỷ lệ Đến khám': attendanceRate,
            };
        }).sort((a, b) => {
            // Chuyển đổi ngày tháng năm (dd/mm/yyyy) sang Date object để sắp xếp
            const dateA = new Date(a.date.split('/').reverse().join('-'));
            const dateB = new Date(b.date.split('/').reverse().join('-'));
            return dateA - dateB;
        });
    }, [filteredAppointments]);

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-purple-600" /> Biểu đồ Hiệu suất (%)</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} stroke="#6b7280" tickFormatter={(value) => `${value}%`} />
                    <Tooltip 
                        formatter={(value) => [`${value}%`, value === 'Tỷ lệ Hoàn thành' ? 'Hoàn thành' : 'Đến khám']}
                        labelFormatter={(label) => `Ngày: ${label}`}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="Tỷ lệ Hoàn thành" stroke="#9333ea" strokeWidth={2} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="Tỷ lệ Đến khám" stroke="#06b6d4" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const AdminDashboardContent = () => {
    const [invoices, setInvoices] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Đã loại bỏ useState cho timeFilter

    // Hàm fetchAllData chỉ chạy 1 lần khi component mount
    const fetchAllData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Giả định API endpoint trả về dữ liệu hóa đơn có trường invoiceDate
            const invoicesResponse = await api.get('/staff/invoices');
            // Cập nhật lại dữ liệu hóa đơn để thêm invoiceDate nếu chỉ có paymentDate
            const processedInvoices = invoicesResponse.data.status ? invoicesResponse.data.data.map(inv => ({
                ...inv,
                // Dùng paymentDate nếu có, không thì dùng createAt của medical record, sau đó loại bỏ item không có ngày
                invoiceDate: inv.paymentDate || inv.patientMedicalRecord?.createAt 
            })).filter(inv => inv.invoiceDate) : [];
            
            if (invoicesResponse.data.status) setInvoices(processedInvoices);
            else {
                toast.error(invoicesResponse.data.message || 'Không thể tải dữ liệu hóa đơn.');
                setInvoices([]);
            }

            const appointmentsResponse = await api.get('/staff/appointments');
            if (appointmentsResponse.data.status) setAppointments(appointmentsResponse.data.data);
            else {
                toast.error(appointmentsResponse.data.message || 'Không thể tải dữ liệu lịch hẹn.');
                setAppointments([]);
            }
        } catch (err) {
            setError('Lỗi khi kết nối đến máy chủ.');
            toast.error(err.response?.data?.message || 'Lỗi hệ thống khi tải dữ liệu.');
        } finally {
            setLoading(false);
        }
    }, []); // Dependency rỗng, chỉ chạy 1 lần

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]); // Chạy fetchAllData khi component mount

    /**
     * HÀM NÀY ĐÃ ĐƯỢC ĐƠN GIẢN HÓA ĐỂ CHỈ TRẢ VỀ TẤT CẢ DỮ LIỆU
     * Đồng thời, các biến lọc liên quan trong component gốc đã được loại bỏ.
     */
    const filterDataByTime = (data, dateKey) => {
        // Luôn trả về tất cả dữ liệu theo yêu cầu mới
        return data; 
    };

    // UseMemo để tính toán các tập dữ liệu, hiện tại chỉ là đổi tên
    const filteredInvoices = useMemo(() => filterDataByTime(invoices, 'invoiceDate'), [invoices]);
    const filteredAppointments = useMemo(() => filterDataByTime(appointments, 'appointmentDate'), [appointments]);

    // Tính toán các chỉ số thống kê
    const totalRevenue = filteredInvoices.reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);
    const completedInvoices = filteredInvoices.filter(inv => inv.status === true).length; // Giả sử status=true là Paid
    const averageInvoiceValue = completedInvoices > 0 ? (totalRevenue / completedInvoices).toFixed(0) : 0; // Làm tròn

    const totalAppointments = filteredAppointments.length;
    const completedAppointments = filteredAppointments.filter(apt => apt.status === 4).length; // 4 là Đã hoàn thành
    const confirmedAppointments = filteredAppointments.filter(apt => apt.status === 1).length; // 1 là Đã xác nhận
    const inProgressAppointments = filteredAppointments.filter(apt => apt.status === 3).length; // 3 là Đang khám
    const checkedInAppointments = filteredAppointments.filter(apt => apt.status === 2).length; // 2 là Đã check-in

    const completionRate = totalAppointments > 0 ? ((completedAppointments / totalAppointments) * 100).toFixed(1) : 0;
    const attendanceRate = confirmedAppointments > 0 ? ((checkedInAppointments / confirmedAppointments) * 100).toFixed(1) : 0;

    const formatCurrency = (amount) => `${parseFloat(amount).toLocaleString('vi-VN')} VNĐ`;
    const formatCount = (count) => parseFloat(count).toLocaleString('vi-VN');

    if (loading) return <div className="text-center py-10 text-gray-600">Đang tải dữ liệu thống kê...</div>;
    if (error) return <div className="text-center py-10 text-red-600">{error}</div>;

    return (
        <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <BarChart className="w-7 h-7 text-blue-600" /> Thống kê Hiệu suất cá nhân
                </h1>
                {/* Đã loại bỏ phần chọn bộ lọc thời gian (select) */}
            </div>

            {/* Thẻ Thống kê */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatisticCard
                    title="Tổng Doanh thu"
                    value={formatCurrency(totalRevenue)}
                    icon={DollarSign}
                    colorClass="text-green-600 border-t-4 border-green-600"
                    details={`Đã thanh toán: ${formatCount(completedInvoices)} hóa đơn.`}
                />
                <StatisticCard
                    title="Giá trị TB Hóa đơn"
                    value={formatCurrency(averageInvoiceValue)}
                    icon={TrendingUp}
                    colorClass="text-orange-600 border-t-4 border-orange-600"
                    details={`Tổng: ${formatCount(filteredInvoices.length)} hóa đơn được ghi nhận.`}
                />
                <StatisticCard
                    title="Hoàn thành dịch vụ"
                    value={`${formatCount(completedAppointments)} lượt`}
                    icon={BriefcaseMedical}
                    colorClass="text-purple-600 border-t-4 border-purple-600"
                    details={`Đang khám: ${formatCount(inProgressAppointments)} lượt.`}
                />
                <StatisticCard
                    title="Tổng số lịch hẹn"
                    value={formatCount(totalAppointments)}
                    icon={Users}
                    colorClass="text-blue-600 border-t-4 border-blue-600"
                    details={`Đã xác nhận: ${formatCount(confirmedAppointments)} lượt.`}
                />
                <StatisticCard
                    title="Tỷ lệ hoàn thành khám"
                    value={`${completionRate}%`}
                    icon={Zap}
                    colorClass="text-cyan-600 border-t-4 border-cyan-600"
                    details={`Hiệu suất: ${completionRate >= 80 ? 'Rất tốt 👍' : 'Cần cải thiện ⚠️'}.`}
                />
                <StatisticCard
                    title="Tỷ lệ bệnh nhân đến"
                    value={`${attendanceRate}%`}
                    icon={CalendarIcon}
                    colorClass="text-pink-600 border-t-4 border-pink-600"
                    details={`(Đã đến / Đã xác nhận: ${formatCount(checkedInAppointments)}/${formatCount(confirmedAppointments)}).`}
                />
            </div>

            {/* Biểu đồ */}
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mt-10 mb-5 border-b pb-2"><CornerDownRight className="w-6 h-6 text-indigo-600" /> Biểu đồ Trực quan hóa dữ liệu</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <AppointmentStatusPieChart data={filteredAppointments} />
                <RevenueBarChart data={filteredInvoices} />
            </div>

            <div className="mb-8">
                <PerformanceLineChart filteredAppointments={filteredAppointments} />
            </div>

        </div>
    );
};

export default AdminDashboardContent;