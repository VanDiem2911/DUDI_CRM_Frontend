import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { 
  Search, 
  Globe, 
  MapPin, 
  Phone, 
  ExternalLink,
  Loader2,
  RefreshCw,
  Copy,
  Info,
  Briefcase,
  Clock,
  Activity,
  CheckCircle
} from 'lucide-react';

const STATUSES = [
  "Chưa xử lý", "Chặn người lạ", "Đã gửi tin nhắn", "Không có Zalo", "Trả lời"
];

const EmployeeData = () => {
  const [records, setRecords] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  // Thống kê dashboard
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pageSize, setPageSize] = useState(50);

  // Modals visibility
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [currentRecord, setCurrentRecord] = useState(null);

  // Status Change State
  const [statusChangeLoadingId, setStatusChangeLoadingId] = useState(null);
  
  // Copy phone notification state
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
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

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/employee');
      setStats(response.data);
    } catch (err) {
      console.error('Không thể tải dữ liệu thống kê:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    const effectiveSize = pageSize === 'all' ? 100000 : pageSize;
    try {
      const response = await api.get('/employee/data', {
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchStats();
  }, [statusFilter, searchTerm, pageSize]);

  const openDetailModal = (record) => {
    setCurrentRecord(record);
    setIsDetailModalOpen(true);
  };

  const handleStatusUpdateDirect = async (recordId, newStatus) => {
    setStatusChangeLoadingId(recordId);
    try {
      await api.patch(`/employee/data/${recordId}/status`, { status: newStatus });
      showNotification('Đã cập nhật trạng thái thành công!');
      // Update local records array to reflect change instantly
      setRecords(prev => prev.map(r => r.id === recordId ? { ...r, status: newStatus } : r));
      fetchStats();
    } catch (err) {
      console.error(err);
      showNotification('Không thể cập nhật trạng thái', 'error');
    } finally {
      setStatusChangeLoadingId(null);
    }
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case 'Chưa xử lý':
        return 'bg-slate-100 text-slate-600 border border-slate-200';
      case 'Chặn người lạ':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'Đã gửi tin nhắn':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Không có Zalo':
        return 'bg-red-600 text-white border border-red-700 font-bold';
      case 'Trả lời':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  const isWhiteTextStatus = (status) => status === 'Không có Zalo';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">Không gian làm việc của nhân viên</h1>
          <p className="text-sm text-slate-500 mt-1">Xem thống kê tiến trình và cập nhật tiến độ xử lý khách hàng được giao</p>
        </div>
        <button
          onClick={() => {
            fetchRecords();
            fetchStats();
          }}
          className="p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl transition shadow-sm"
          title="Tải lại dữ liệu"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Statistics and Status Progress */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Metrics Grid */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {[
              { title: 'Data được giao', value: stats.totalAssigned, icon: Briefcase, color: 'bg-primary-600' },
              { title: 'Chưa xử lý', value: stats.untreatedCount, icon: Clock, color: 'bg-slate-400' },
              { title: 'Đã gửi tin nhắn', value: stats.processingCount, icon: Activity, color: 'bg-primary-400' },
              { title: 'Trả lời', value: stats.completedCount, icon: CheckCircle, color: 'bg-primary-700' },
            ].map((card, index) => {
              const Icon = card.icon;
              return (
                <div key={index} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.title}</p>
                    <p className="text-2xl font-black text-slate-800">{card.value}</p>
                  </div>
                  <div className={`p-3.5 rounded-xl ${card.color} text-white shadow-md shadow-slate-100`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress detail status list */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Trạng thái chi tiết dữ liệu</h3>
            <div className="space-y-2.5 max-h-36 overflow-y-auto pr-1">
              {Object.entries(stats.statusCounts || {}).map(([status, count]) => {
                const percentage = stats.totalAssigned > 0 ? ((count / stats.totalAssigned) * 100).toFixed(1) : 0;
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{status}</span>
                      <span>{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
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
        </div>
      )}

      {/* Filter panel */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4">
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
        <div className="w-full sm:w-64">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-sm focus:outline-none focus:border-primary-500"
          >
            <option value="">Tất cả trạng thái</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="w-full sm:w-auto">
          <select
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-sm font-semibold focus:outline-none focus:border-primary-500"
          >
            <option value={50}>50 dòng</option>
            <option value={100}>100 dòng</option>
            <option value={200}>200 dòng</option>
            <option value="all">Tất cả</option>
          </select>
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-3" />
            <span className="text-sm font-semibold">Đang tải dữ liệu của bạn...</span>
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <h3 className="text-lg font-bold text-slate-700 mb-1">Không có data được giao</h3>
            <p className="text-sm text-slate-400">Hiện tại bạn chưa được giao dữ liệu nào để xử lý.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-2.5 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Tên doanh nghiệp</th>
                  <th className="py-2.5 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Loại hình</th>
                  <th className="py-2.5 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Địa chỉ</th>
                  <th className="py-2.5 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Khu vực</th>
                  <th className="py-2.5 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Số điện thoại</th>
                  <th className="py-2.5 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Website</th>
                  <th className="py-2.5 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Google Maps</th>
                  <th className="py-2.5 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition duration-150">
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
                      <select
                        value={record.status || 'Chưa xử lý'}
                        onChange={(e) => handleStatusUpdateDirect(record.id, e.target.value)}
                        disabled={statusChangeLoadingId === record.id}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition cursor-pointer appearance-none ${getStatusColorClass(record.status)}`}
                        style={{ 
                          paddingRight: '1.2rem', 
                          backgroundPosition: 'right 0.4rem center', 
                          backgroundRepeat: 'no-repeat', 
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${isWhiteTextStatus(record.status) ? '%23FFFFFF' : '%23475569'}' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, 
                          backgroundSize: '0.55rem' 
                        }}
                      >
                        {STATUSES.map(s => (
                          <option key={s} value={s} className="bg-white text-slate-800 font-normal">
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Info bar */}
        {!loading && records.length > 0 && (
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              Hiển thị <strong className="text-slate-600">{records.length}</strong> / {totalElements} data được giao
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



      {/* DETAIL VIEW MODAL */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Chi tiết Data khách hàng"
        size="lg"
      >
        {currentRecord && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{currentRecord.businessName}</h3>
                <span className="text-xs text-slate-400">Loại hình: {currentRecord.businessType || 'Không xác định'}</span>
              </div>
              <Badge status={currentRecord.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
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
                  <span className="block text-xs font-bold text-slate-400 uppercase">Địa chỉ chi tiết</span>
                  <span className="text-slate-800 text-sm">{currentRecord.address}</span>
                </div>
              </div>

              <div className="space-y-3 flex flex-col justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase">Trang web</span>
                  {currentRecord.website ? (
                    <a href={currentRecord.website} target="_blank" rel="noopener noreferrer" className="text-primary-500 text-sm font-semibold inline-flex items-center hover:underline mt-1">
                      <Globe className="w-4 h-4 mr-1" /> Mở website <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  ) : (
                    <span className="text-slate-400 text-sm italic">Không có website</span>
                  )}
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase">Bản đồ (Google Maps)</span>
                  {currentRecord.googleMapUrl ? (
                    <a href={currentRecord.googleMapUrl} target="_blank" rel="noopener noreferrer" className="text-primary-500 text-sm font-semibold inline-flex items-center hover:underline mt-1">
                      <MapPin className="w-4 h-4 mr-1" /> Định vị Maps <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  ) : (
                    <span className="text-slate-400 text-sm italic">Không có link bản đồ</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
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

export default EmployeeData;
