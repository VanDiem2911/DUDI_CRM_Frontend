import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { 
  Search, 
  Plus, 
  ExternalLink, 
  MapPin, 
  Trash2, 
  Edit3, 
  UserPlus, 
  AlertCircle,
  Phone,
  Globe,
  Eye,
  Loader2,
  RefreshCw,
  Database,
  UserCheck,
  UserMinus,
  Send,
  MessageSquare,
  FileSpreadsheet,
  Download,
  Info,
  Users,
  MoreHorizontal,
  Copy
} from 'lucide-react';

const STATUSES = [
  "Chưa xử lý", "Chặn người lạ", "Đã gửi tin nhắn", "Không có Zalo", "Trả lời"
];

const AdminDashboard = () => {
  // Stats state
  const [stats, setStats] = useState({
    totalData: 0,
    unassignedData: 0,
    assignedData: 0,
    processingData: 0,
    completedData: 0,
    statusCounts: {},
    totalEmployees: 0,
    employeeProgress: []
  });

  // Data records list states
  const [records, setRecords] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pageSize, setPageSize] = useState(50);
  
  // Employees list for assignment & status display
  const [employees, setEmployees] = useState([]);
  const [activeEmployees, setActiveEmployees] = useState([]);

  // Toast / Alert notifications
  const [notification, setNotification] = useState(null);

  // Modals visibility
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [currentRecord, setCurrentRecord] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  // Form input states
  const [formData, setFormData] = useState({
    businessName: '',
    address: '',
    area: '',
    phone: '',
    website: '',
    businessType: '',
    googleMapUrl: '',
    status: 'Chưa xử lý'
  });
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);

  // Auto assign loading state
  const [autoAssignLoading, setAutoAssignLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  // Dropdown actions menu state
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [activeDropdownRecord, setActiveDropdownRecord] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  const handleDropdownToggle = (e, record) => {
    e.stopPropagation();
    if (activeDropdownId === record.id) {
      setActiveDropdownId(null);
      setActiveDropdownRecord(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const dropdownHeight = 145;
      const spaceBelow = window.innerHeight - rect.bottom;
      let topPosition = rect.bottom + 4;
      if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
        topPosition = rect.top - dropdownHeight - 4;
      }
      setDropdownPos({
        top: topPosition,
        left: Math.max(10, rect.right - 192)
      });
      setActiveDropdownId(record.id);
      setActiveDropdownRecord(record);
    }
  };

  // Confirm Auto Assign state
  const [isConfirmAutoAssignOpen, setIsConfirmAutoAssignOpen] = useState(false);
  const [autoAssignResult, setAutoAssignResult] = useState(null);
  const [isAutoAssignResultOpen, setIsAutoAssignResultOpen] = useState(false);

  // Data Import states
  const [isImportDataModalOpen, setIsImportDataModalOpen] = useState(false);
  const [selectedDataFile, setSelectedDataFile] = useState(null);
  const [importDataLoading, setImportDataLoading] = useState(false);
  const [importDataResult, setImportDataResult] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleCopyPhone = (phone) => {
    if (!phone) return;
    navigator.clipboard.writeText(phone)
      .then(() => {
        showNotification('Đã copy số điện thoại!');
      })
      .catch((err) => {
        console.error(err);
        showNotification('Không thể copy số điện thoại', 'error');
      });
  };

  // Load dashboard stats
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await api.get('/dashboard/admin');
      setStats(response.data);
    } catch (err) {
      console.error('Lỗi tải stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Load data records matching search & filters
  const fetchRecords = async (size) => {
    setLoading(true);
    const effectiveSize = (size ?? pageSize) === 'all' ? 100000 : (size ?? pageSize);
    try {
      const response = await api.get('/data', {
        params: {
          status: statusFilter,
          search: searchTerm,
          page: 0,
          size: effectiveSize
        }
      });
      setRecords(response.data.content);
      setTotalElements(response.data.totalElements);
    } catch (err) {
      console.error('Lỗi tải records:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load employees list
  const fetchEmployees = async () => {
    try {
      const response = await api.get('/users');
      setEmployees(response.data);
      // Filter out active employees
      setActiveEmployees(response.data.filter(emp => emp.active));
    } catch (err) {
      console.error('Lỗi tải danh sách nhân viên:', err);
    }
  };

  // Reload all data
  const handleRefresh = async () => {
    await Promise.all([fetchStats(), fetchRecords(), fetchEmployees()]);
  };

  useEffect(() => {
    handleRefresh();
  }, [statusFilter, searchTerm, pageSize]);

  // Sync data mock handler
  const handleSyncData = async () => {
    setSyncLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // mock delay
      await handleRefresh();
      showNotification('Đã tải và đồng bộ dữ liệu mới từ Google Sheets thành công!');
    } catch (err) {
      console.error(err);
      showNotification('Lỗi đồng bộ dữ liệu từ Google Sheets', 'error');
    } finally {
      setSyncLoading(false);
    }
  };

  // Auto Assign records
  const handleAutoAssign = () => {
    if (activeEmployees.length === 0) {
      showNotification('Không có nhân viên đang hoạt động để chia data!', 'error');
      return;
    }
    setIsConfirmAutoAssignOpen(true);
  };

  const executeAutoAssign = async () => {
    setIsConfirmAutoAssignOpen(false);
    setAutoAssignLoading(true);
    try {
      const response = await api.post('/admin/data/auto-assign');
      setAutoAssignResult(response.data);
      setIsAutoAssignResultOpen(true);
      showNotification(`Tự động chia thành công ${response.data.assignedCount} data!`);
      await handleRefresh();
    } catch (err) {
      console.error(err);
      showNotification(err.response?.data?.message || 'Có lỗi xảy ra khi tự động chia data.', 'error');
    } finally {
      setAutoAssignLoading(false);
    }
  };

  const handleDownloadSampleDataCSV = () => {
    const csvContent = '\uFEFF' + 'Tên doanh nghiệp,Địa chỉ,Khu vực,Số điện thoại,Website,Loại hình,Google Maps\n' +
      '"Công ty TNHH Hudi","123 Nguyễn Huệ, Quận 1, TP. HCM","Hồ Chí Minh","0901234567","https://hudi.vn","Công nghệ","https://maps.google.com/..."\n' +
      '"Cà phê Góc Phố","456 Lê Lợi, Quận 1, TP. HCM","Hồ Chí Minh","0907654321","","Quán ăn/Uống",""\n';
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'DUDI_CRM_Sample_Data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportDataSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDataFile) return;
    setImportDataLoading(true);
    setImportDataResult(null);
    
    const formData = new FormData();
    formData.append('file', selectedDataFile);
    
    try {
      const response = await api.post('/admin/data/import-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setImportDataResult(response.data);
      showNotification(`Import dữ liệu thành công ${response.data.successCount} dòng!`);
      await handleRefresh();
    } catch (err) {
      console.error(err);
      showNotification(err.response?.data?.message || 'Lỗi khi import file CSV', 'error');
    } finally {
      setImportDataLoading(false);
    }
  };

  // Export records to Excel (CSV)
  const handleExportCSV = () => {
    try {
      if (records.length === 0) {
        showNotification('Không có dữ liệu để xuất!', 'error');
        return;
      }

      // Define header
      let csvContent = '\uFEFF'; // UTF-8 BOM for Vietnamese character support
      csvContent += 'Tên doanh nghiệp,Đường,Khu vực,Số điện thoại,Website,Danh mục,Google Maps,Trạng thái,Nhân viên\n';

      // Map rows
      records.forEach(r => {
        const row = [
          `"${(r.businessName || '').replace(/"/g, '""')}"`,
          `"${(r.address || '').replace(/"/g, '""')}"`,
          `"${(r.area || '').replace(/"/g, '""')}"`,
          `"${(r.phone || '').replace(/"/g, '""')}"`,
          `"${(r.website || '').replace(/"/g, '""')}"`,
          `"${(r.businessType || '').replace(/"/g, '""')}"`,
          `"${(r.googleMapUrl || '').replace(/"/g, '""')}"`,
          `"${r.status || 'Chưa xử lý'}"`,
          `"${r.assignedToName || 'Chưa giao'}"`
        ];
        csvContent += row.join(',') + '\n';
      });

      // Trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `DUDI_CRM_Export_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('Xuất dữ liệu Excel (CSV) thành công!');
    } catch (err) {
      console.error(err);
      showNotification('Không thể xuất dữ liệu.', 'error');
    }
  };

  // Form validations & handlers
  const validateForm = () => {
    const errors = {};
    const phoneTrim = formData.phone.trim();
    if (!formData.businessName.trim()) errors.businessName = 'Tên doanh nghiệp không được để trống';
    if (!formData.address.trim()) errors.address = 'Địa chỉ không được để trống';
    if (!formData.area.trim()) errors.area = 'Khu vực không được để trống';
    
    if (!phoneTrim) {
      errors.phone = 'Số điện thoại không được để trống';
    } else if (!/^(\+84|0)(\s*\d){9,11}$/.test(phoneTrim)) {
      errors.phone = 'Số điện thoại không hợp lệ (phải có 10-11 số)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setFormSubmitLoading(true);
    try {
      if (currentRecord) {
        // Edit record
        await api.put(`/data/${currentRecord.id}`, formData);
        showNotification('Cập nhật dữ liệu thành công!');
      } else {
        // Create new record
        await api.post('/data', formData);
        showNotification('Thêm dữ liệu thành công!');
      }
      setIsFormModalOpen(false);
      await handleRefresh();
    } catch (err) {
      console.error(err);
      showNotification('Có lỗi xảy ra khi lưu dữ liệu.', 'error');
    } finally {
      setFormSubmitLoading(false);
    }
  };

  // Manual assign logic
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeId) return;
    try {
      await api.post('/assignments/assign', {
        dataId: currentRecord.id,
        employeeId: selectedEmployeeId
      });
      setIsAssignModalOpen(false);
      setCurrentRecord(null);
      showNotification('Chia dữ liệu thành công!');
      await handleRefresh();
    } catch (err) {
      console.error(err);
      showNotification('Lỗi khi chia dữ liệu.', 'error');
    }
  };

  // Delete handler
  const handleDeleteConfirm = async () => {
    if (!currentRecord) return;
    try {
      await api.delete(`/data/${currentRecord.id}`);
      setIsDeleteModalOpen(false);
      setCurrentRecord(null);
      showNotification('Đã xóa dữ liệu thành công!');
      await handleRefresh();
    } catch (err) {
      console.error(err);
      showNotification('Không thể xóa dữ liệu.', 'error');
    }
  };

  // Helper values for modal triggers
  const openAddModal = () => {
    setCurrentRecord(null);
    setFormData({
      businessName: '',
      address: '',
      area: '',
      phone: '',
      website: '',
      businessType: '',
      googleMapUrl: '',
      status: 'Chưa xử lý'
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const openEditModal = (record) => {
    setCurrentRecord(record);
    setFormData({
      businessName: record.businessName || '',
      address: record.address || '',
      area: record.area || '',
      phone: record.phone || '',
      website: record.website || '',
      businessType: record.businessType || '',
      googleMapUrl: record.googleMapUrl || '',
      status: record.status || 'Chưa xử lý'
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const openAssignModal = (record) => {
    setCurrentRecord(record);
    setSelectedEmployeeId(record.assignedTo || '');
    setIsAssignModalOpen(true);
  };

  const openDetailModal = (record) => {
    setCurrentRecord(record);
    setIsDetailModalOpen(true);
  };

  const openDeleteModal = (record) => {
    setCurrentRecord(record);
    setIsDeleteModalOpen(true);
  };

  // Calculations for additional metrics in layout
  const statusCounts = stats.statusCounts || {};
  const sentData = stats.totalData - (statusCounts['Chưa xử lý'] || 0);
  const repliedData = statusCounts['Trả lời'] || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-slate-800">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center">
          Dashboard
        </h1>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center p-4 rounded-xl shadow-lg border transition animate-in slide-in-from-bottom duration-300 ${
          notification.type === 'error' 
            ? 'bg-red-50 text-red-800 border-red-100' 
            : 'bg-emerald-50 text-emerald-800 border-emerald-100'
        }`}>
          <Info className="w-5 h-5 mr-2" />
          <span className="text-sm font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Service Account Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs md:text-sm text-slate-600 gap-3">
        <div className="flex items-center">
          <FileSpreadsheet className="w-4 h-4 mr-2 text-primary-500" />
          <span>Đang dùng <strong>Service Account</strong> để đọc/ghi dữ liệu</span>
          <span className="ml-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-50 text-primary-700 border border-primary-200">
            Có quyền ghi
          </span>
        </div>
      </div>

      {/* Five Metrics Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1 relative overflow-hidden">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng dữ liệu</p>
          <p className="text-2xl font-black text-slate-800">{stats.totalData}</p>
          <div className="absolute right-3 bottom-3 p-1.5 rounded-lg bg-slate-50 text-slate-400">
            <Database className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1 relative overflow-hidden">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đã chia</p>
          <p className="text-2xl font-black text-slate-800">{stats.assignedData}</p>
          <div className="absolute right-3 bottom-3 p-1.5 rounded-lg bg-slate-50 text-slate-400">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1 relative overflow-hidden">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chưa chia</p>
          <p className="text-2xl font-black text-slate-800">{stats.unassignedData}</p>
          <div className="absolute right-3 bottom-3 p-1.5 rounded-lg bg-slate-50 text-slate-400">
            <UserMinus className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1 relative overflow-hidden">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đã gửi</p>
          <p className="text-2xl font-black text-slate-800">{sentData}</p>
          <div className="absolute right-3 bottom-3 p-1.5 rounded-lg bg-slate-50 text-slate-400">
            <Send className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 5 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1 relative overflow-hidden">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trả lời</p>
          <p className="text-2xl font-black text-slate-800">{repliedData}</p>
          <div className="absolute right-3 bottom-3 p-1.5 rounded-lg bg-slate-50 text-slate-400">
            <MessageSquare className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* Active Employees Working Banner */}
      <div className="p-4 bg-primary-50/20 border border-primary-100/30 rounded-2xl text-xs md:text-sm text-slate-700 leading-relaxed flex items-start gap-3">
        <Users className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-bold text-primary-800">
            Nhân viên phòng Kinh doanh - Marketing (đang làm việc): {activeEmployees.length}
          </span>
          <span className="mx-2 text-slate-300">|</span>
          <span className="text-slate-500">
            {activeEmployees.length === 0 
              ? 'Không có nhân viên hoạt động.' 
              : activeEmployees.map(emp => emp.fullName).join(', ')}
          </span>
        </div>
      </div>

      {/* Visual Statistics Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Thống kê trạng thái xử lý</h3>
          <div className="space-y-4">
            {STATUSES.map((status) => {
              const count = stats.statusCounts?.[status] || 0;
              const percentage = stats.totalData > 0 ? ((count / stats.totalData) * 100).toFixed(1) : 0;
              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{status}</span>
                    <span>{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        status === 'Chưa xử lý' ? 'bg-slate-300' :
                        status === 'Chặn người lạ' ? 'bg-amber-400' :
                        status === 'Đã gửi tin nhắn' ? 'bg-blue-400' :
                        status === 'Không có Zalo' ? 'bg-red-500' :
                        status === 'Trả lời' ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Employee Progress List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Tiến độ theo từng nhân viên</h3>
          {stats.employeeProgress?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Users className="w-12 h-12 mb-3 stroke-1" />
              <p className="text-sm">Chưa có nhân viên nào.</p>
            </div>
          ) : (
            <div className="space-y-6 max-h-[260px] overflow-y-auto pr-2">
              {stats.employeeProgress?.map((emp) => {
                const completedPct = emp.totalAssigned > 0 ? ((emp.completedCount / emp.totalAssigned) * 100).toFixed(0) : 0;
                const processingPct = emp.totalAssigned > 0 ? ((emp.processingCount / emp.totalAssigned) * 100).toFixed(0) : 0;
                return (
                  <div key={emp.employeeId} className="border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{emp.employeeName}</p>
                        <p className="text-xs text-slate-400">Tổng được giao: {emp.totalAssigned}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary-700 text-white">
                          Trả lời: {emp.completedCount}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-200 ml-2">
                          Đã gửi: {emp.processingCount}
                        </span>
                      </div>
                    </div>
                    {/* Stacked Progress Bar */}
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                      <div
                        className="bg-primary-700 h-full"
                        style={{ width: `${completedPct}%` }}
                        title={`Trả lời: ${completedPct}%`}
                      />
                      <div
                        className="bg-primary-300 h-full"
                        style={{ width: `${processingPct}%` }}
                        title={`Đã gửi tin nhắn: ${processingPct}%`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
      </div>

      {/* Control panel and actions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-6">
        
        {/* Search, spreadsheet dropdown, and actions */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm công ty, địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm transition"
            />
          </div>

          {/* Action options */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Sheet Tabs mock dropdown */}
            <select
              className="px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-sm font-semibold focus:outline-none focus:border-primary-500"
              defaultValue="Trang tính1"
            >
              <option value="Trang tính1">Trang tính1</option>
              <option value="Trang tính2">Trang tính2</option>
            </select>

            {/* Sync sheets button */}
            <button
              onClick={handleSyncData}
              disabled={syncLoading}
              className="flex items-center px-4 py-2.5 bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 rounded-xl text-sm font-bold transition disabled:opacity-50"
            >
              {syncLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Tải dữ liệu
            </button>

            {/* Auto Assign button */}
            <button
              onClick={handleAutoAssign}
              disabled={autoAssignLoading}
              className="flex items-center px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-md shadow-primary-600/20 transition disabled:opacity-50"
            >
              {autoAssignLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              Chia tự động
            </button>

            {/* Add new button */}
            <button
              onClick={openAddModal}
              className="flex items-center px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-bold shadow-md shadow-primary-500/20 transition"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm mới
            </button>

            {/* Import Data CSV button */}
            <button
              onClick={() => {
                setSelectedDataFile(null);
                setImportDataResult(null);
                setIsImportDataModalOpen(true);
              }}
              className="flex items-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold border border-slate-200 transition"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2 text-primary-500" />
              Import Data CSV
            </button>

            {/* Export excel button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold border border-slate-200 transition"
            >
              <Download className="w-4 h-4 mr-2" />
              Xuất Excel
            </button>

          </div>

        </div>

        {/* Filter Selection Row & Table Info */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-4 gap-4 text-xs md:text-sm font-semibold">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 uppercase tracking-wider text-xs">Lọc:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none"
            >
              <option value="">Tất cả trạng thái</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <span className="text-slate-300">|</span>
            <span className="text-slate-400 uppercase tracking-wider text-xs">Hiển thị:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none font-semibold"
            >
              <option value={50}>50 dòng</option>
              <option value={100}>100 dòng</option>
              <option value={200}>200 dòng</option>
              <option value="all">Tất cả</option>
            </select>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-primary-400 mr-1.5"></span>
              Đã chia: <strong className="text-slate-700 ml-1">{stats.assignedData}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-slate-300 mr-1.5"></span>
              Chưa chia: <strong className="text-slate-700 ml-1">{stats.unassignedData}</strong>
            </span>
          </div>
        </div>

        {/* Unified Table */}
        <div className="border border-slate-100 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-3" />
              <span className="text-sm font-semibold">Đang tải danh sách dữ liệu...</span>
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Info className="w-12 h-12 mb-3 stroke-1" />
              <h3 className="text-sm font-bold text-slate-700">Không tìm thấy dữ liệu nào</h3>
              <p className="text-xs text-slate-400">Vui lòng thay đổi từ khóa hoặc bộ lọc của bạn.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="py-2.5 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Tên doanh nghiệp</th>
                    <th className="py-2.5 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Đường</th>
                    <th className="py-2.5 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Khu vực</th>
                    <th className="py-2.5 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Số điện thoại</th>
                    <th className="py-2.5 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Website</th>
                    <th className="py-2.5 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Danh mục</th>
                    <th className="py-2.5 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Google Maps</th>
                    <th className="py-2.5 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Trạng thái</th>
                    <th className="py-2.5 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Nhân viên</th>
                    <th className="py-2.5 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap text-center w-20">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {records.map((record) => (
                    <tr 
                      key={record.id} 
                      className={`hover:bg-slate-50/30 transition duration-150 ${activeDropdownId === record.id ? 'bg-slate-50/50' : ''}`}
                    >
                      <td className="py-2 px-2 font-bold text-slate-800 text-xs min-w-[130px] max-w-[180px] break-words" title={record.businessName}>
                        {record.businessName}
                      </td>
                      <td className="py-2 px-2 text-slate-600 text-xs min-w-[140px] max-w-[190px] break-words" title={record.address}>
                        {record.address}
                      </td>
                      <td className="py-2 px-2 text-slate-600 text-xs min-w-[100px] max-w-[140px] break-words">
                        {record.area}
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <a 
                            href={`tel:${record.phone}`} 
                            className="text-slate-700 font-bold hover:text-primary-600 flex items-center hover:underline text-xs whitespace-nowrap"
                          >
                            <Phone className="w-3 h-3 mr-1 text-slate-400 flex-shrink-0" />
                            {record.phone}
                          </a>
                          <button
                            onClick={() => handleCopyPhone(record.phone)}
                            className="p-1 text-slate-400 hover:text-primary-500 rounded hover:bg-slate-100 transition"
                            title="Sao chép số điện thoại"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        {record.website ? (
                          <a 
                            href={record.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center text-primary-500 hover:text-primary-600 hover:underline font-semibold text-xs"
                          >
                            <Globe className="w-3 h-3 mr-1" /> Website
                          </a>
                        ) : (
                          <span className="text-slate-300 italic text-[10px]">N/A</span>
                        )}
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        {record.businessType ? (
                          <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold border border-slate-200 max-w-[120px] break-words" title={record.businessType}>
                            {record.businessType}
                          </span>
                        ) : (
                          <span className="text-slate-300 italic text-[10px]">-</span>
                        )}
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        {record.googleMapUrl ? (
                          <a 
                            href={record.googleMapUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center p-1 bg-primary-50 hover:bg-primary-100 text-primary-600 border border-primary-200 rounded-lg transition"
                            title="Mở Google Maps"
                          >
                            <MapPin className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-300 italic text-[10px]">-</span>
                        )}
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        <Badge status={record.status} />
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        {record.assignedToName ? (
                          <div className="flex items-center font-semibold text-slate-700 text-xs">
                            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center mr-1.5 text-[10px] text-slate-500 border border-slate-200">
                              {record.assignedToName.charAt(0).toUpperCase()}
                            </div>
                            {record.assignedToName}
                          </div>
                        ) : (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-50 text-slate-400 border border-dashed border-slate-200">
                            Chưa giao
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap text-center">
                        <button
                          onClick={(e) => handleDropdownToggle(e, record)}
                          className="inline-flex items-center p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                          title="Hành động"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info bar */}
        {!loading && records.length > 0 && (
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 rounded-b-xl flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              Hiển thị <strong className="text-slate-600">{records.length}</strong> / {totalElements} bản ghi
            </span>
            {totalElements > records.length && (
              <button
                onClick={() => setPageSize('all')}
                className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline transition"
              >
                Xem tất cả {totalElements} →
              </button>
            )}
          </div>
        )}

      </div>

      {/* FORM MODAL (Add/Edit data) */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={currentRecord ? "Cập nhật dữ liệu khách hàng" : "Thêm dữ liệu khách hàng mới"}
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tên doanh nghiệp *</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className={`w-full px-3 py-2 border rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm ${
                  formErrors.businessName ? 'border-primary-500 focus:border-primary-500' : 'border-slate-200 focus:border-primary-500'
                }`}
                placeholder="Nhập tên doanh nghiệp..."
              />
              {formErrors.businessName && <p className="text-xs text-primary-600 mt-1 font-semibold">{formErrors.businessName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Danh mục / Loại hình</label>
              <input
                type="text"
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                placeholder="Ví dụ: Nhà hàng, Quán cà phê..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Số điện thoại *</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-3 py-2 border rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm ${
                  formErrors.phone ? 'border-primary-500 focus:border-primary-500' : 'border-slate-200 focus:border-primary-500'
                }`}
                placeholder="Ví dụ: +84987..."
              />
              {formErrors.phone && <p className="text-xs text-primary-600 mt-1 font-semibold">{formErrors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Khu vực / Thành phố *</label>
              <input
                type="text"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className={`w-full px-3 py-2 border rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm ${
                  formErrors.area ? 'border-primary-500 focus:border-primary-500' : 'border-slate-200 focus:border-primary-500'
                }`}
                placeholder="Ví dụ: Quận 1, Hồ Chí Minh..."
              />
              {formErrors.area && <p className="text-xs text-primary-600 mt-1 font-semibold">{formErrors.area}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Địa chỉ chi tiết *</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={`w-full px-3 py-2 border rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm ${
                formErrors.address ? 'border-primary-500 focus:border-primary-500' : 'border-slate-200 focus:border-primary-500'
              }`}
              placeholder="Ví dụ: 12 Đ. Alexandre de Rhodes..."
            />
            {formErrors.address && <p className="text-xs text-primary-600 mt-1 font-semibold">{formErrors.address}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Website</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                placeholder="Ví dụ: https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Link Google Maps</label>
              <input
                type="text"
                value={formData.googleMapUrl}
                onChange={(e) => setFormData({ ...formData, googleMapUrl: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                placeholder="Ví dụ: https://maps.google.com/..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-sm focus:outline-none focus:border-primary-500"
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl font-semibold text-slate-600 text-sm transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={formSubmitLoading}
              className="flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold text-sm shadow-md shadow-primary-500/20 transition disabled:opacity-50"
            >
              {formSubmitLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Lưu dữ liệu
            </button>
          </div>
        </form>
      </Modal>

      {/* ASSIGN MODAL */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Phân chia data khách hàng"
        size="md"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          {currentRecord && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500">
              <p className="font-bold text-slate-800 mb-0.5 text-sm">{currentRecord.businessName}</p>
              <p>{currentRecord.address}, {currentRecord.area}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Chọn nhân viên xử lý *</label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-sm focus:outline-none focus:border-primary-500"
              required
            >
              <option value="">-- Chọn nhân viên --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.username}) - {emp.active ? 'Đang hoạt động' : 'Bị khóa'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl font-semibold text-slate-600 text-sm transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!selectedEmployeeId}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm shadow-md transition disabled:opacity-50"
            >
              Chia data
            </button>
          </div>
        </form>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Chi tiết thông tin doanh nghiệp"
        size="lg"
      >
        {currentRecord && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{currentRecord.businessName}</h3>
                <span className="text-xs text-slate-400">Danh mục: {currentRecord.businessType || 'Không xác định'}</span>
              </div>
              <Badge status={currentRecord.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm">
              <div className="space-y-3">
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase">Số điện thoại</span>
                  <a href={`tel:${currentRecord.phone}`} className="text-slate-800 font-bold flex items-center hover:underline hover:text-primary-500">
                    <Phone className="w-4 h-4 mr-1 text-slate-400" /> {currentRecord.phone}
                  </a>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase">Khu vực / Thành phố</span>
                  <span className="text-slate-800 font-semibold">{currentRecord.area}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase">Địa chỉ chi tiết</span>
                  <span className="text-slate-800">{currentRecord.address}</span>
                </div>
              </div>

              <div className="space-y-3 flex flex-col justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase">Trang web</span>
                  {currentRecord.website ? (
                    <a href={currentRecord.website} target="_blank" rel="noopener noreferrer" className="text-primary-500 font-semibold inline-flex items-center hover:underline mt-1">
                      <Globe className="w-4 h-4 mr-1" /> Mở website <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Không có website</span>
                  )}
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase">Bản đồ (Google Maps)</span>
                  {currentRecord.googleMapUrl ? (
                    <a href={currentRecord.googleMapUrl} target="_blank" rel="noopener noreferrer" className="text-primary-500 font-semibold inline-flex items-center hover:underline mt-1">
                      <MapPin className="w-4 h-4 mr-1" /> Định vị Maps <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Không có link bản đồ</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-bold text-slate-400 uppercase">Nhân viên phụ trách hiện tại</span>
              {currentRecord.assignedToName ? (
                <div className="flex items-center p-3 bg-primary-50/50 rounded-xl border border-primary-100/50 text-primary-900 text-sm font-semibold">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3 text-sm text-primary-600 border border-primary-200">
                    {currentRecord.assignedToName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{currentRecord.assignedToName}</p>
                    <p className="text-xs text-slate-400">ID nhân viên: {currentRecord.assignedTo}</p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm">
                  Chưa giao cho ai xử lý. Bạn có thể bấm Chia data để gán nhân viên.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm transition"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Xác nhận xóa Data"
        size="sm"
      >
        {currentRecord && (
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>Hành động này không thể khôi phục!</span>
            </div>
            <p className="text-sm text-slate-600">
              Bạn có chắc chắn muốn xóa dữ liệu của doanh nghiệp <strong>{currentRecord.businessName}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl font-semibold text-slate-600 text-sm transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* CONFIRM AUTO ASSIGN MODAL */}
      <Modal
        isOpen={isConfirmAutoAssignOpen}
        onClose={() => setIsConfirmAutoAssignOpen(false)}
        title="Xác nhận chia data tự động"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-amber-50 text-amber-700 rounded-xl text-sm border border-amber-100">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>Hành động này sẽ thay đổi người quản lý của các data chưa được gán!</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Hệ thống sẽ tự động phân chia tất cả dữ liệu <strong>chưa được giao</strong> cho các nhân viên đang hoạt động bằng thuật toán vòng tròn (Round Robin).
          </p>
          <p className="text-sm font-semibold text-primary-700">
            Ưu tiên hàng đầu cho nhân viên thuộc phòng ban "Marketing".
          </p>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsConfirmAutoAssignOpen(false)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl font-semibold text-slate-600 text-sm transition"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={executeAutoAssign}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition"
            >
              Đồng ý chia
            </button>
          </div>
        </div>
      </Modal>

      {/* AUTO ASSIGN RESULTS REPORT MODAL */}
      <Modal
        isOpen={isAutoAssignResultOpen}
        onClose={() => setIsAutoAssignResultOpen(false)}
        title="Báo cáo kết quả chia tự động"
        size="md"
      >
        {autoAssignResult && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-center">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Data chưa chia</span>
                <span className="text-lg font-black text-slate-800">{autoAssignResult.totalUnassignedData}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Nhân viên nhận</span>
                <span className="text-lg font-black text-slate-800">{autoAssignResult.totalEmployees}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Đã chia</span>
                <span className="text-lg font-black text-primary-600">{autoAssignResult.assignedCount}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phân phối chi tiết</h4>
              <div className="border border-slate-100 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="py-2.5 px-4 font-bold text-slate-500">Nhân viên</th>
                      <th className="py-2.5 px-4 font-bold text-slate-500 text-right">Số data đã gán</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {autoAssignResult.result && autoAssignResult.result.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-4 font-semibold text-slate-700">{r.employeeName}</td>
                        <td className="py-2 px-4 text-right font-bold text-slate-800">{r.assignedCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAutoAssignResultOpen(false)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm transition"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* IMPORT DATA CSV MODAL */}
      <Modal
        isOpen={isImportDataModalOpen}
        onClose={() => setIsImportDataModalOpen(false)}
        title="Import dữ liệu khách hàng từ CSV"
        size="lg"
      >
        <div className="space-y-4">
          <form onSubmit={handleImportDataSubmit} className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                Chuẩn bị file CSV/Excel có các cột: <strong className="text-slate-700">Tên doanh nghiệp, Địa chỉ, Khu vực, Số điện thoại, Website, Loại hình, Google Maps</strong>. Trong đó Tên doanh nghiệp và Số điện thoại là bắt buộc. Số điện thoại trùng lặp sẽ bị báo lỗi. Dữ liệu mới được import mặc định sẽ ở trạng thái <span className="font-bold text-primary-600">Chưa xử lý</span> và chưa gán cho ai phụ trách.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSampleDataCSV}
                  className="inline-flex items-center text-xs text-primary-600 font-bold hover:underline"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Tải file CSV mẫu
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Chọn file CSV hoặc Excel *</label>
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                required
                onChange={(e) => setSelectedDataFile(e.target.files[0])}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsImportDataModalOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl font-semibold text-slate-600 text-sm transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={importDataLoading || !selectedDataFile}
                className="flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold text-sm shadow-md transition disabled:opacity-50"
              >
                {importDataLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Bắt đầu Import
              </button>
            </div>
          </form>

          {importDataResult && (
            <div className="border-t border-slate-100 pt-4 space-y-4">
              <h4 className="text-sm font-bold text-slate-800">Kết quả Import:</h4>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="block text-slate-400 font-semibold uppercase text-[10px]">Tổng số dòng</span>
                  <span className="text-sm font-bold text-slate-800">{importDataResult.totalRows}</span>
                </div>
                <div className="bg-emerald-50 text-emerald-800 p-2 rounded-lg border border-emerald-100">
                  <span className="block text-emerald-400 font-semibold uppercase text-[10px]">Thành công</span>
                  <span className="text-sm font-bold">{importDataResult.successCount}</span>
                </div>
                <div className="bg-red-50 text-red-800 p-2 rounded-lg border border-red-100">
                  <span className="block text-red-400 font-semibold uppercase text-[10px]">Thất bại</span>
                  <span className="text-sm font-bold">{importDataResult.failedCount}</span>
                </div>
              </div>

              {importDataResult.errors && importDataResult.errors.length > 0 && (
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-red-600 uppercase tracking-wider">Danh sách lỗi chi tiết:</span>
                  <div className="border border-red-100 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-red-50 border-b border-red-100">
                          <th className="py-2 px-4 font-bold text-red-800 w-16">Dòng</th>
                          <th className="py-2 px-4 font-bold text-red-800">Chi tiết lỗi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-red-100 text-red-700 bg-red-50/10">
                        {importDataResult.errors.map((err, idx) => (
                          <tr key={idx}>
                            <td className="py-1.5 px-4 font-bold">{err.row}</td>
                            <td className="py-1.5 px-4">{err.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* GLOBAL DROPDOWN ACTION MENU */}
      {activeDropdownId && activeDropdownRecord && (
        <>
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={() => {
              setActiveDropdownId(null);
              setActiveDropdownRecord(null);
            }}
          />
          
          {/* Dropdown Options */}
          <div 
            className="fixed w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-100 text-left"
            style={{ top: `${dropdownPos.top}px`, left: `${dropdownPos.left}px` }}
          >
            <div className="py-1">
              <button
                onClick={() => {
                  const record = activeDropdownRecord;
                  setActiveDropdownId(null);
                  setActiveDropdownRecord(null);
                  openEditModal(record);
                }}
                className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center transition"
              >
                <Edit3 className="w-4.5 h-4.5 mr-2 text-slate-400" />
                Chỉnh sửa
              </button>
              <button
                onClick={() => {
                  const record = activeDropdownRecord;
                  setActiveDropdownId(null);
                  setActiveDropdownRecord(null);
                  openAssignModal(record);
                }}
                className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center transition"
              >
                <UserPlus className="w-4.5 h-4.5 mr-2 text-slate-400" />
                Chia cho nhân viên
              </button>
              <hr className="border-slate-100 my-1" />
              <button
                onClick={() => {
                  const record = activeDropdownRecord;
                  setActiveDropdownId(null);
                  setActiveDropdownRecord(null);
                  openDeleteModal(record);
                }}
                className="w-full px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 flex items-center transition font-semibold"
              >
                <Trash2 className="w-4.5 h-4.5 mr-2 text-primary-500" />
                Xóa data
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
