import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { 
  Search, 
  Plus, 
  SlidersHorizontal, 
  ExternalLink, 
  MapPin, 
  Trash2, 
  Edit3, 
  UserPlus, 
  CheckSquare, 
  Square,
  AlertCircle,
  Phone,
  Globe,
  Eye,
  Loader2,
  RefreshCw,
  MoreHorizontal,
  Copy,
  Info
} from 'lucide-react';

const STATUSES = [
  "Chưa xử lý", "Chặn người lạ", "Đã gửi tin nhắn", "Không có Zalo", "Trả lời"
];

const DataManagement = () => {
  // Data records list states
  const [records, setRecords] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [pageSize, setPageSize] = useState(50);

  // Selection states
  const [selectedIds, setSelectedIds] = useState([]);

  // Employees list for assignment
  const [employees, setEmployees] = useState([]);

  // Modals visibility and edit states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [currentRecord, setCurrentRecord] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  
  // Custom states
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

  const [notification, setNotification] = useState(null);

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

  // Load records
  const fetchRecords = async () => {
    setLoading(true);
    const effectiveSize = pageSize === 'all' ? 100000 : pageSize;
    try {
      const response = await api.get('/data', {
        params: {
          status: statusFilter,
          assignedTo: assignedFilter,
          area: areaFilter,
          search: searchTerm,
          page: 0,
          size: effectiveSize
        }
      });
      setRecords(response.data.content);
      setTotalElements(response.data.totalElements);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load employees list
  const fetchEmployees = async () => {
    try {
      const response = await api.get('/users');
      setEmployees(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [statusFilter, assignedFilter, areaFilter, searchTerm, pageSize]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Checkbox interactions
  const handleSelectAll = () => {
    if (selectedIds.length === records.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(records.map(r => r.id));
    }
  };

  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Form submit (Add / Edit)
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
      } else {
        // Create new record
        await api.post('/data', formData);
      }
      setIsFormModalOpen(false);
      fetchRecords();
    } catch (err) {
      console.error(err);
    } finally {
      setFormSubmitLoading(false);
    }
  };

  // Assign records
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeId) return;
    try {
      if (selectedIds.length > 0) {
        // Bulk assignment
        await api.post('/assignments/assign-bulk', {
          dataIds: selectedIds,
          employeeId: selectedEmployeeId
        });
      } else if (currentRecord) {
        // Single assignment
        await api.post('/assignments/assign', {
          dataId: currentRecord.id,
          employeeId: selectedEmployeeId
        });
      }
      setIsAssignModalOpen(false);
      setSelectedIds([]);
      setCurrentRecord(null);
      fetchRecords();
      fetchEmployees(); // refresh stats on employees
    } catch (err) {
      console.error(err);
    }
  };

  // Delete record
  const handleDeleteConfirm = async () => {
    if (!currentRecord) return;
    try {
      await api.delete(`/data/${currentRecord.id}`);
      setIsDeleteModalOpen(false);
      setCurrentRecord(null);
      fetchRecords();
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  // Open helper functions
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

  const openAssignModal = (record = null) => {
    if (record) {
      setCurrentRecord(record);
    }
    setSelectedEmployeeId('');
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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">Quản lý Data khách hàng</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý danh sách, gán quyền xử lý và chia data cho nhân viên</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={() => openAssignModal()}
              className="flex items-center px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-600/20 transition"
            >
              <UserPlus className="w-4 h-4 mr-2" /> Chia data hàng loạt ({selectedIds.length})
            </button>
          )}
          <button
            onClick={openAddModal}
            className="flex items-center px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 transition"
          >
            <Plus className="w-4 h-4 mr-2" /> Thêm data mới
          </button>
        </div>
      </div>

      {/* Search and Filters panel */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute inset-y-0 left-3 my-auto w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên doanh nghiệp, địa chỉ, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition text-sm"
            />
          </div>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-sm font-semibold focus:outline-none focus:border-primary-500"
          >
            <option value={50}>50 dòng</option>
            <option value={100}>100 dòng</option>
            <option value={200}>200 dòng</option>
            <option value="all">Tất cả</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold transition ${
              showFilters ? 'bg-slate-100 text-slate-800' : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" /> Bộ lọc nâng cao
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2 duration-150">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-sm focus:outline-none focus:border-primary-500"
              >
                <option value="">Tất cả trạng thái</option>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nhân viên phụ trách</label>
              <select
                value={assignedFilter}
                onChange={(e) => setAssignedFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-sm focus:outline-none focus:border-primary-500"
              >
                <option value="">Tất cả nhân viên</option>
                <option value="unassigned">Chưa chia (Chưa giao)</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Khu vực / Thành phố</label>
              <input
                type="text"
                placeholder="Nhập tên quận, thành phố..."
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-sm focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-3" />
            <span className="text-sm font-semibold">Đang tải danh sách data...</span>
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Database className="w-16 h-16 mb-4 stroke-1" />
            <h3 className="text-lg font-bold text-slate-700 mb-1">Không tìm thấy dữ liệu nào</h3>
            <p className="text-sm text-slate-400">Thử thay đổi bộ lọc hoặc thêm một data mới vào hệ thống.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-2.5 px-2 w-10">
                    <button onClick={handleSelectAll} className="text-slate-400 hover:text-slate-600 transition">
                      {selectedIds.length === records.length ? (
                        <CheckSquare className="w-4 h-4 text-primary-500" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-2.5 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Tên doanh nghiệp</th>
                  <th className="py-2.5 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Loại hình</th>
                  <th className="py-2.5 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Địa chỉ</th>
                  <th className="py-2.5 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Khu vực</th>
                  <th className="py-2.5 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Số điện thoại</th>
                  <th className="py-2.5 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Website</th>
                  <th className="py-2.5 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Google Maps</th>
                  <th className="py-2.5 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Trạng thái</th>
                  <th className="py-2.5 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Nhân viên phụ trách</th>
                  <th className="py-2.5 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap text-center w-20">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {records.map((record) => {
                  const isSelected = selectedIds.includes(record.id);
                  return (
                    <tr 
                      key={record.id} 
                      className={`hover:bg-slate-50/50 transition duration-150 ${isSelected ? 'bg-primary-50/20' : ''} ${activeDropdownId === record.id ? 'bg-slate-50/50' : ''}`}
                    >
                      <td className="py-2 px-2">
                        <button 
                          onClick={() => handleSelectRow(record.id)} 
                          className="text-slate-400 hover:text-slate-600 transition"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-primary-500" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-2 px-2 font-bold text-slate-800 text-xs min-w-[130px] max-w-[180px] break-words" title={record.businessName}>
                        {record.businessName}
                      </td>
                      <td className="py-2 px-2">
                        {record.businessType ? (
                          <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold border border-slate-200 max-w-[120px] break-words" title={record.businessType}>
                            {record.businessType}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-[10px] italic">-</span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-slate-700 text-xs min-w-[140px] max-w-[190px] break-words" title={record.address}>
                        {record.address}
                      </td>
                      <td className="py-2 px-2 text-slate-600 text-xs min-w-[100px] max-w-[140px] break-words">
                        {record.area}
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <a 
                            href={`tel:${record.phone}`} 
                            className="text-slate-700 text-xs font-bold hover:text-primary-600 flex items-center hover:underline whitespace-nowrap"
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
                      <td className="py-2 px-2 whitespace-nowrap text-xs">
                        {record.website ? (
                          <a 
                            href={record.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center text-primary-500 hover:text-primary-600 hover:underline font-semibold text-xs"
                          >
                            <Globe className="w-3 h-3 mr-1" /> Mở Web
                          </a>
                        ) : (
                          <span className="text-slate-300 italic">-</span>
                        )}
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap text-xs">
                        {record.googleMapUrl ? (
                          <a 
                            href={record.googleMapUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center text-primary-500 hover:text-primary-600 hover:underline font-semibold text-xs"
                          >
                            <MapPin className="w-3 h-3 mr-1" /> Bản đồ
                          </a>
                        ) : (
                          <span className="text-slate-300 italic">-</span>
                        )}
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        <Badge status={record.status} />
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        {record.assignedToName ? (
                          <div className="flex items-center text-xs font-semibold text-slate-700">
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Info bar */}
        {!loading && records.length > 0 && (
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              Hiển thị <strong className="text-slate-600">{records.length}</strong> / {totalElements} data
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

      {/* FORM MODAL (Add / Edit) */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={currentRecord ? 'Sửa thông tin Data' : 'Thêm Data khách hàng mới'}
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tên doanh nghiệp / Tên địa điểm *</label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className={`w-full px-3 py-2 border rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm ${
                  formErrors.businessName ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary-500'
                }`}
                placeholder="Ví dụ: Văn phòng cho thuê quận 5"
              />
              {formErrors.businessName && <p className="text-red-500 text-xs mt-1">{formErrors.businessName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Số điện thoại *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-3 py-2 border rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm ${
                  formErrors.phone ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary-500'
                }`}
                placeholder="Ví dụ: 0987110011"
              />
              {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Địa chỉ chi tiết *</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={`w-full px-3 py-2 border rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm ${
                formErrors.address ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary-500'
              }`}
              placeholder="Ví dụ: 86 Đ. Tản Đà"
            />
            {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Khu vực / Thành phố *</label>
              <input
                type="text"
                required
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className={`w-full px-3 py-2 border rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm ${
                  formErrors.area ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary-500'
                }`}
                placeholder="Ví dụ: Chợ Lớn, Hồ Chí Minh"
              />
              {formErrors.area && <p className="text-red-500 text-xs mt-1">{formErrors.area}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Loại hình kinh doanh</label>
              <input
                type="text"
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                placeholder="Ví dụ: Đại lý cho thuê văn phòng"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Website</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                placeholder="Ví dụ: https://www.example.com"
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
        title={selectedIds.length > 0 ? 'Chia data hàng loạt' : 'Chia data cho nhân viên'}
        size="sm"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Chọn nhân viên xử lý *</label>
            {employees.length === 0 ? (
              <p className="text-sm text-red-500">Chưa có tài khoản nhân viên nào hoạt động. Vui lòng tạo tài khoản nhân viên trước.</p>
            ) : (
              <select
                required
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-sm focus:outline-none focus:border-primary-500"
              >
                <option value="">Chọn nhân viên...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.username}) - Đang phụ trách {emp.assignedDataCount} data
                  </option>
                ))}
              </select>
            )}
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
        title="Chi tiết thông tin Data khách hàng"
        size="lg"
      >
        {currentRecord && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{currentRecord.businessName}</h3>
                <span className="text-xs text-slate-400">ID: {currentRecord.id}</span>
              </div>
              <Badge status={currentRecord.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="space-y-3">
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase">Số điện thoại</span>
                  <a href={`tel:${currentRecord.phone}`} className="text-slate-800 text-sm font-bold flex items-center hover:underline hover:text-primary-500">
                    <Phone className="w-4 h-4 mr-1 text-slate-400" /> {currentRecord.phone}
                  </a>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase">Khu vực / Thành phố</span>
                  <span className="text-slate-800 text-sm font-semibold">{currentRecord.area}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase">Địa chỉ cụ thể</span>
                  <span className="text-slate-800 text-sm">{currentRecord.address}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase">Loại hình kinh doanh</span>
                  <span className="text-slate-800 text-sm font-semibold">{currentRecord.businessType || 'Không xác định'}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase">Website</span>
                  {currentRecord.website ? (
                    <a href={currentRecord.website} target="_blank" rel="noopener noreferrer" className="text-primary-500 text-sm font-semibold flex items-center hover:underline">
                      <Globe className="w-4 h-4 mr-1" /> Mở website <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  ) : (
                    <span className="text-slate-400 text-sm italic">Chưa cập nhật</span>
                  )}
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase">Google Maps Link</span>
                  {currentRecord.googleMapUrl ? (
                    <a href={currentRecord.googleMapUrl} target="_blank" rel="noopener noreferrer" className="text-primary-500 text-sm font-semibold flex items-center hover:underline">
                      <MapPin className="w-4 h-4 mr-1" /> Định vị Maps <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  ) : (
                    <span className="text-slate-400 text-sm italic">Chưa cập nhật</span>
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
            <p className="text-slate-600 text-sm">
              Bạn có chắc chắn muốn xóa bản ghi data của doanh nghiệp <strong>{currentRecord.businessName}</strong>?
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
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-md shadow-red-600/20 transition"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        )}
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

      {/* Copy Notification Toast */}
      {notification && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center p-4 rounded-xl shadow-lg border transition animate-in slide-in-from-bottom duration-300 ${
          notification.type === 'error' 
            ? 'bg-red-50 text-red-800 border-red-100' 
            : 'bg-primary-50 text-primary-800 border-primary-100'
        }`}>
          <Info className="w-5 h-5 mr-2" />
          <span className="text-sm font-semibold">{notification.message}</span>
        </div>
      )}
    </div>
  );
};

export default DataManagement;
