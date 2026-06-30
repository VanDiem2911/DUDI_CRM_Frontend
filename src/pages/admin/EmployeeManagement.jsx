import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import axios from 'axios';
import Modal from '../../components/Modal';
import {
  AlertCircle,
  Download,
  Edit3,
  FileSpreadsheet,
  Info,
  Loader2,
  Lock,
  Key,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Trash2,
  Unlock,
  User,
  Users
} from 'lucide-react';

const defaultAddress = () => ({
  province: '-- Tỉnh/TP --',
  district: '-- Quận/Huyện --',
  ward: '-- Xã/Phường --',
  street: ''
});

const emptyEmployeeForm = () => ({
  username: '',
  fullName: '',
  avatarUrl: '',
  phone: '',
  email: '',
  gender: 'Nam',
  dob: '',
  cccd: '',
  cccdIssueDate: '',
  cccdIssuePlace: '',
  dept: '',
  job: '',
  contractType: '',
  status: 'Đang làm việc',
  start: '',
  endIntern: '',
  resignDate: '',
  university: '',
  bankName: '',
  bankAccount: '',
  note: '',
  currentAddress: defaultAddress(),
  hometown: defaultAddress(),
  cccdFrontUrl: '',
  cccdBackUrl: '',
});

const profileOf = (emp) => emp.profile || {};
const valueOrDash = (value) => (value && `${value}`.trim() ? value : 'Chưa cập nhật');
const employeeInitial = (emp) => (emp.fullName || emp.username || '?').charAt(0).toUpperCase();
const joinAddress = (address) => {
  if (!address) return '';
  if (typeof address === 'string') return address;

  return [address.street, address.ward, address.district, address.province]
    .map((part) => (part == null ? '' : `${part}`.trim()))
    .filter((part) => part && !part.startsWith('--'))
    .join(', ');
};
const toDateInputValue = (value) => {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : '';
};
const toBackendDate = (value) => {
  if (!value) return '';
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
};
const parseDateValue = (value) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};
const isAfterToday = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
};

const buildPayload = (formData) => ({
  username: formData.username.trim(),
  fullName: formData.fullName.trim(),
  name: formData.fullName.trim(),
  empName: formData.fullName.trim(),
  avatarUrl: formData.avatarUrl.trim(),
  phone: formData.phone.trim(),
  email: formData.email.trim(),
  gender: formData.gender,
  dob: toBackendDate(formData.dob),
  cccd: formData.cccd.trim(),
  cccdIssueDate: toBackendDate(formData.cccdIssueDate),
  cccdIssuePlace: formData.cccdIssuePlace.trim(),
  dept: formData.dept.trim(),
  job: formData.job.trim(),
  contractType: formData.contractType.trim(),
  status: formData.status.trim(),
  start: toBackendDate(formData.start),
  endIntern: toBackendDate(formData.endIntern),
  resignDate: toBackendDate(formData.resignDate),
  university: formData.university.trim(),
  bankName: formData.bankName.trim(),
  bankAccount: formData.bankAccount.trim(),
  note: formData.note.trim(),
  currentAddress: formData.currentAddress,
  hometown: formData.hometown,
  galleryImages: [formData.cccdFrontUrl || '', formData.cccdBackUrl || ''],
  workHistory: [{
    position: [formData.dept.trim(), formData.job.trim()].filter(Boolean).join(' - '),
    startDate: toBackendDate(formData.start),
    endDate: ''
  }]
});

const DetailItem = ({ label, value }) => (
  <div className="min-w-0 rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
    <p className="text-[10px] font-extrabold uppercase text-slate-400">{label}</p>
    <p className="text-xs font-semibold text-slate-700 break-words mt-1">{valueOrDash(value)}</p>
  </div>
);

const Field = ({ label, value, onChange, required = false, disabled = false, type = 'text', error, placeholder = '' }) => (
  <div>
    <label className="block text-xs font-bold text-slate-600 mb-1">{label}{required ? ' *' : ''}</label>
    <input
      type={type}
      required={required}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm disabled:opacity-60 disabled:cursor-not-allowed ${
        error ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary-500'
      }`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const ImageUploadField = ({ label, value, onUpload, uploading, isAvatar = false }) => (
  <div>
    <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-4 flex flex-col items-center">
      {value ? (
        <div className={`relative overflow-hidden border border-slate-200 bg-white shadow-sm flex items-center justify-center ${
          isAvatar ? 'w-28 h-28 rounded-full' : 'w-full aspect-[1.58/1] rounded-lg'
        }`}>
          <img src={value} alt={label} className={`w-full h-full object-cover ${isAvatar ? 'rounded-full' : 'rounded-lg'}`} />
        </div>
      ) : (
        <div className={`border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-xs font-semibold text-slate-400 shadow-inner ${
          isAvatar ? 'w-28 h-28 rounded-full' : 'w-full aspect-[1.58/1] rounded-lg'
        }`}>
          <span className="text-xl mb-1">{isAvatar ? '👤' : '🪪'}</span>
          <span>Chưa có ảnh</span>
        </div>
      )}
      <div className="w-full">
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = '';
          }}
          className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-primary-700 hover:file:bg-primary-100 disabled:opacity-60 cursor-pointer"
        />
        {uploading && <p className="text-xs font-semibold text-primary-600 mt-2 text-center animate-pulse">Đang upload ảnh...</p>}
      </div>
    </div>
  </div>
);

const TextAreaField = ({ label, value, onChange, rows = 3, placeholder = '' }) => (
  <div>
    <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm resize-y"
    />
  </div>
);

const SectionTitle = ({ children }) => (
  <h3 className="text-sm font-extrabold text-slate-800 pt-3 border-t border-slate-100 first:border-t-0 first:pt-0">{children}</h3>
);

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [activeDropdownRecord, setActiveDropdownRecord] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [expandedEmployeeId, setExpandedEmployeeId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [notification, setNotification] = useState(null);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);
  const [formData, setFormData] = useState(emptyEmployeeForm());
  const [uploadingField, setUploadingField] = useState('');
  const [importTab, setImportTab] = useState('file');
  const [pastedJsonText, setPastedJsonText] = useState('');
  const [jsonTextError, setJsonTextError] = useState('');
  const [isImportAccountsModalOpen, setIsImportAccountsModalOpen] = useState(false);
  const [accountsImportTab, setAccountsImportTab] = useState('file');
  const [pastedAccountsJsonText, setPastedAccountsJsonText] = useState('');
  const [accountsJsonTextError, setAccountsJsonTextError] = useState('');
  const [accountsImportLoading, setAccountsImportLoading] = useState(false);
  const [accountsImportResult, setAccountsImportResult] = useState(null);
  const [accountsSelectedFile, setAccountsSelectedFile] = useState(null);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSelectEmployee = (id) => {
    if (selectedEmployeeIds.includes(id)) {
      setSelectedEmployeeIds(selectedEmployeeIds.filter(x => x !== id));
    } else {
      setSelectedEmployeeIds([...selectedEmployeeIds, id]);
    }
  };

  const handleSelectAllVisible = () => {
    const visibleIds = filteredEmployees.map(emp => emp.id);
    const allVisibleSelected = visibleIds.every(id => selectedEmployeeIds.includes(id));
    
    if (allVisibleSelected) {
      setSelectedEmployeeIds(selectedEmployeeIds.filter(id => !visibleIds.includes(id)));
    } else {
      const newSelections = [...selectedEmployeeIds];
      visibleIds.forEach(id => {
        if (!newSelections.includes(id)) {
          newSelections.push(id);
        }
      });
      setSelectedEmployeeIds(newSelections);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    setBulkDeleteLoading(true);
    try {
      await api.post('/users/delete-multiple', selectedEmployeeIds);
      showNotification(`Xóa thành công ${selectedEmployeeIds.length} nhân viên!`);
      setSelectedEmployeeIds([]);
      setIsBulkDeleteModalOpen(false);
      fetchEmployees();
    } catch (err) {
      console.error(err);
      showNotification('Không thể xóa hàng loạt nhân viên.', 'error');
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users');
      setEmployees(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateAddressField = (addressKey, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [addressKey]: { ...prev[addressKey], [field]: value }
    }));
  };

  const uploadImage = async (field, file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showNotification('Chỉ hỗ trợ ảnh jpg, jpeg, png, webp', 'error');
      return;
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    const folder = import.meta.env.VITE_CLOUDINARY_FOLDER;

    if (!cloudName || !uploadPreset) {
      showNotification('Chưa cấu hình thông tin Cloudinary ở frontend (.env)', 'error');
      return;
    }

    const imageData = new FormData();
    imageData.append('file', file);
    imageData.append('upload_preset', uploadPreset);
    if (folder) {
      imageData.append('folder', folder);
    }

    setUploadingField(field);
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        imageData
      );
      updateField(field, response.data.secure_url);
    } catch (err) {
      console.error(err);
      showNotification(err.response?.data?.error?.message || 'Upload ảnh thất bại', 'error');
    } finally {
      setUploadingField('');
    }
  };

  const handleDropdownToggle = (e, emp) => {
    e.stopPropagation();
    if (activeDropdownId === emp.id) {
      setActiveDropdownId(null);
      setActiveDropdownRecord(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const dropdownHeight = 145;
    const spaceBelow = window.innerHeight - rect.bottom;
    setDropdownPos({
      top: spaceBelow < dropdownHeight && rect.top > dropdownHeight ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
      left: Math.max(10, rect.right - 192)
    });
    setActiveDropdownId(emp.id);
    setActiveDropdownRecord(emp);
  };

  const handleDownloadSampleEmployeeCSV = () => {
    const csvContent = '\uFEFF' + 'Họ và tên,Email,Username,Số điện thoại,Phòng ban,Mật khẩu\n' +
      '"Nguyễn Văn A","nguyenvana@gmail.com","vana123","0901234567","marketing","1234"\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'DUDI_CRM_Sample_Employees.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSampleEmployeeJSON = () => {
    const jsonSample = [
      {
        "id": "2026061034",
        "name": "Ngô Trần Văn Điềm",
        "email": "vandiem2004@gmail.com",
        "phone": "0398752911",
        "gender": "Nam",
        "dob": "29/11/2004",
        "cccd": "080204000746",
        "cccdIssueDate": "07/04/2021",
        "cccdIssuePlace": "CCS",
        "dept": "Kỹ thuật",
        "job": "Intern",
        "contractType": "Thử việc",
        "status": "Đang làm việc",
        "start": "08/06/2026",
        "university": "Đại học Công Nghiệp Thành phố Hồ Chí Minh (IUH)",
        "bankName": "TP Bank",
        "bankAccount": "07114433601",
        "avatarUrl": "https://res.cloudinary.com/dzltwrydv/image/upload/v1781065819/quanlynhansu/axuwobms0lys5oowxci5.jpg",
        "currentAddress": {
          "province": "Thành phố Hồ Chí Minh",
          "district": "Thành phố Thủ Đức",
          "ward": "Hiệp Bình Chánh",
          "street": "107/6/26A Đường số 38"
        },
        "hometown": {
          "province": "Tỉnh Tây Ninh",
          "district": "Huyện Bến Cầu",
          "ward": "Khánh Hưng",
          "street": "Ấp Thái Vĩnh"
        },
        "galleryImages": [
          "https://res.cloudinary.com/dzltwrydv/image/upload/v1781065831/quanlynhansu/szcqhmdb9heries8zrui.jpg",
          "https://res.cloudinary.com/dzltwrydv/image/upload/v1781065834/quanlynhansu/oulvqjehrqdjlmxsgsxi.jpg"
        ],
        "workHistory": [
          {
            "position": "Kỹ thuật - Intern",
            "startDate": "08/06/2026",
            "endDate": ""
          }
        ]
      }
    ];
    const jsonContent = JSON.stringify(jsonSample, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'DUDI_CRM_Sample_Employees.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    setImportResult(null);
    setJsonTextError('');

    let fileToUpload = selectedFile;
    if (importTab === 'text') {
      const textVal = pastedJsonText.trim();
      if (!textVal) {
        setJsonTextError('Vui lòng dán nội dung JSON');
        return;
      }
      try {
        const parsed = JSON.parse(textVal);
        if (typeof parsed !== 'object' || parsed === null) {
          setJsonTextError('JSON phải là một đối tượng hoặc mảng danh sách nhân viên');
          return;
        }
      } catch (err) {
        setJsonTextError('Định dạng JSON không hợp lệ. Vui lòng kiểm tra lại');
        return;
      }
      fileToUpload = new File([textVal], 'import.json', { type: 'application/json' });
    } else {
      if (!selectedFile) return;
    }

    setImportLoading(true);
    const uploadData = new FormData();
    uploadData.append('file', fileToUpload);

    try {
      const response = await api.post('/admin/employees/import-csv', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImportResult(response.data);
      showNotification(`Import thành công ${response.data.successCount} nhân viên!`);
      fetchEmployees();
    } catch (err) {
      console.error(err);
      showNotification(err.response?.data?.message || 'Có lỗi xảy ra khi import file', 'error');
    } finally {
      setImportLoading(false);
    }
  };

  const handleDownloadSampleAccountsJSON = () => {
    const sample = {
      "2026061034": {
        "createdAt": Date.now(),
        "password": "1234",
        "role": "employee",
        "username": "2026061034"
      }
    };
    const jsonContent = JSON.stringify(sample, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'DUDI_CRM_Sample_Accounts.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAccountsImportSubmit = async (e) => {
    e.preventDefault();
    setAccountsImportResult(null);
    setAccountsJsonTextError('');

    let fileToUpload = accountsSelectedFile;
    if (accountsImportTab === 'text') {
      const textVal = pastedAccountsJsonText.trim();
      if (!textVal) {
        setAccountsJsonTextError('Vui lòng dán nội dung JSON');
        return;
      }
      try {
        const parsed = JSON.parse(textVal);
        if (typeof parsed !== 'object' || Array.isArray(parsed)) {
          setAccountsJsonTextError('JSON phải là một Object chứa danh sách tài khoản.');
          return;
        }
      } catch (err) {
        setAccountsJsonTextError('Định dạng JSON không hợp lệ. Vui lòng kiểm tra lại');
        return;
      }
      fileToUpload = new File([textVal], 'accounts.json', { type: 'application/json' });
    } else {
      if (!accountsSelectedFile) return;
    }

    setAccountsImportLoading(true);
    const uploadData = new FormData();
    uploadData.append('file', fileToUpload);

    try {
      const response = await api.post('/admin/employees/import-accounts', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAccountsImportResult(response.data);
      showNotification(`Import thành công ${response.data.successCount} tài khoản!`);
      fetchEmployees();
    } catch (err) {
      console.error(err);
      showNotification(err.response?.data?.message || 'Có lỗi xảy ra khi import tài khoản', 'error');
    } finally {
      setAccountsImportLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    const usernameTrim = formData.username.trim();
    const fullNameTrim = formData.fullName.trim();
    const emailTrim = formData.email.trim();
    const phoneTrim = formData.phone.trim();

    if (!usernameTrim) {
      errors.username = 'Mã nhân viên không được để trống';
    } else if (usernameTrim.length < 3) {
      errors.username = 'Mã nhân viên tối thiểu 3 ký tự';
    } else if (!/^[a-zA-Z0-9_-]{3,20}$/.test(usernameTrim)) {
      errors.username = 'Mã nhân viên chỉ gồm chữ, số, gạch dưới và gạch ngang';
    }

    if (!fullNameTrim) {
      errors.fullName = 'Họ tên không được để trống';
    } else if (!/^[\p{L}\s]{2,50}$/u.test(fullNameTrim)) {
      errors.fullName = 'Họ tên chỉ được chứa chữ cái, khoảng trắng và dài từ 2 đến 50 ký tự';
    }

    if (!emailTrim) {
      errors.email = 'Email không được để trống';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailTrim)) {
      errors.email = 'Email không hợp lệ (ví dụ: name@company.com)';
    }

    if (!phoneTrim) {
      errors.phone = 'Số điện thoại không được để trống';
    } else if (!/^(\+84|0)(\s*\d){9,11}$/.test(phoneTrim)) {
      errors.phone = 'Số điện thoại không hợp lệ (phải có 10-11 số)';
    }

    if (formData.cccd.trim() && !/^\d{12}$/.test(formData.cccd.trim())) {
      errors.cccd = 'CCCD phải gồm đúng 12 số';
    }

    if (formData.bankAccount.trim() && !/^\d+$/.test(formData.bankAccount.trim())) {
      errors.bankAccount = 'Số tài khoản chỉ được nhập số';
    }

    if (!formData.dept.trim()) errors.dept = 'Phòng ban không được để trống';
    if (!formData.job.trim()) errors.job = 'Chức vụ không được để trống';
    if (!formData.status.trim()) errors.status = 'Trạng thái không được để trống';
    if (!formData.start.trim()) errors.start = 'Ngày bắt đầu không được để trống';

    const dob = parseDateValue(formData.dob);
    const cccdIssueDate = parseDateValue(formData.cccdIssueDate);
    const start = parseDateValue(formData.start);
    if (formData.dob && !dob) errors.dob = 'Ngày sinh không hợp lệ';
    else if (dob && isAfterToday(dob)) errors.dob = 'Ngày sinh không được lớn hơn ngày hiện tại';
    if (formData.cccdIssueDate && !cccdIssueDate) errors.cccdIssueDate = 'Ngày cấp CCCD không hợp lệ';
    else if (cccdIssueDate && isAfterToday(cccdIssueDate)) errors.cccdIssueDate = 'Ngày cấp CCCD không được lớn hơn ngày hiện tại';
    if (formData.start && !start) errors.start = 'Ngày bắt đầu không hợp lệ';
    if (dob && cccdIssueDate && cccdIssueDate < dob) errors.cccdIssueDate = 'Ngày cấp CCCD không được trước ngày sinh';
    if (dob && start && start < dob) errors.start = 'Ngày bắt đầu không được trước ngày sinh';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setFormSubmitLoading(true);

    try {
      const payload = buildPayload(formData);
      if (currentEmployee) {
        await api.put(`/users/${currentEmployee.id}`, payload);
      } else {
        await api.post('/users', payload);
        showNotification('Đã thêm nhân viên và tạo tài khoản mặc định mật khẩu 1234');
      }
      setIsFormModalOpen(false);
      fetchEmployees();
    } catch (err) {
      console.error(err);
      setFormErrors({ server: err.response?.data?.message || 'Không lưu được nhân viên' });
    } finally {
      setFormSubmitLoading(false);
    }
  };

  const handleLockToggle = async (emp) => {
    try {
      await api.patch(`/users/${emp.id}/lock`);
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentEmployee) return;
    try {
      await api.delete(`/users/${currentEmployee.id}`);
      setIsDeleteModalOpen(false);
      setCurrentEmployee(null);
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setCurrentEmployee(null);
    setFormData(emptyEmployeeForm());
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const openEditModal = (emp) => {
    const profile = profileOf(emp);
    const work = profile.workHistory?.[0] || {};
    setCurrentEmployee(emp);
    setFormData({
      username: emp.username || '',
      fullName: emp.fullName || profile.empName || profile.name || '',
      avatarUrl: profile.avatarUrl || emp.avatarUrl || '',
      phone: profile.phone || emp.phone || '',
      email: profile.email || emp.email || '',
      gender: profile.gender || 'Nam',
      dob: toDateInputValue(profile.dob),
      cccd: profile.cccd || '',
      cccdIssueDate: toDateInputValue(profile.cccdIssueDate),
      cccdIssuePlace: profile.cccdIssuePlace || '',
      dept: profile.dept || emp.department || '',
      job: profile.job || emp.job || '',
      contractType: profile.contractType || '',
      status: profile.status || emp.status || 'Đang làm việc',
      start: toDateInputValue(profile.start),
      endIntern: toDateInputValue(profile.endIntern),
      resignDate: toDateInputValue(profile.resignDate),
      university: profile.university || '',
      bankName: profile.bankName || '',
      bankAccount: profile.bankAccount || '',
      note: profile.note || '',
      currentAddress: profile.currentAddress || defaultAddress(),
      hometown: profile.hometown || defaultAddress(),
      cccdFrontUrl: profile.galleryImages?.[0] || '',
      cccdBackUrl: profile.galleryImages?.[1] || '',
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (emp) => {
    setCurrentEmployee(emp);
    setIsDeleteModalOpen(true);
  };

  const filteredEmployees = employees.filter((emp) => {
    const profile = profileOf(emp);
    const haystack = [
      emp.fullName,
      emp.username,
      emp.email,
      emp.phone,
      profile.cccd,
      profile.dept,
      profile.job,
      profile.university,
      profile.bankName,
      profile.bankAccount
    ].join(' ').toLowerCase();
    return haystack.includes(searchTerm.toLowerCase());
  });

  const renderAddressFields = (addressKey, title) => (
    <div className="space-y-3">
      <SectionTitle>{title}</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Field label="Tỉnh/TP" value={formData[addressKey].province} onChange={(value) => updateAddressField(addressKey, 'province', value)} />
        <Field label="Quận/Huyện" value={formData[addressKey].district} onChange={(value) => updateAddressField(addressKey, 'district', value)} />
        <Field label="Xã/Phường" value={formData[addressKey].ward} onChange={(value) => updateAddressField(addressKey, 'ward', value)} />
        <Field label="Đường/Số nhà" value={formData[addressKey].street} onChange={(value) => updateAddressField(addressKey, 'street', value)} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">Quản lý Nhân viên</h1>
        </div>
        <div className="flex flex-wrap gap-2 self-start sm:self-auto">
          {selectedEmployeeIds.length > 0 && (
            <button
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="flex items-center px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-red-600/20 transition"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Xóa đã chọn ({selectedEmployeeIds.length})
            </button>
          )}
          <button
            onClick={() => {
              setSelectedFile(null);
              setImportResult(null);
              setIsImportModalOpen(true);
            }}
            className="flex items-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold border border-slate-200 transition"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2 text-primary-500" /> Import nhân viên
          </button>
          <button
            onClick={() => {
              setAccountsSelectedFile(null);
              setAccountsImportResult(null);
              setPastedAccountsJsonText('');
              setAccountsJsonTextError('');
              setIsImportAccountsModalOpen(true);
            }}
            className="flex items-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold border border-slate-200 transition"
          >
            <Key className="w-4 h-4 mr-2 text-primary-500" /> Import tài khoản
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-primary-500/20 transition"
          >
            <Plus className="w-4 h-4 mr-2" /> Thêm nhân viên mới
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
        <div className="relative">
          <Search className="absolute inset-y-0 left-3 my-auto w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo họ tên, mã nhân viên, email, CCCD, phòng ban..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-3" />
            <span className="text-sm font-semibold">Đang tải danh sách nhân viên...</span>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Users className="w-16 h-16 mb-4 stroke-1" />
            <h3 className="text-lg font-bold text-slate-700 mb-1">Không có nhân viên nào</h3>
            <p className="text-sm text-slate-400">Thêm nhân viên mới để bắt đầu chia data xử lý.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-3 px-3.5 text-xs font-bold text-slate-500 uppercase w-10 text-center">
                    <input
                      type="checkbox"
                      checked={filteredEmployees.length > 0 && filteredEmployees.every(emp => selectedEmployeeIds.includes(emp.id))}
                      onChange={handleSelectAllVisible}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-3.5 text-xs font-bold text-slate-500 uppercase">Nhân viên</th>
                  <th className="py-3 px-3.5 text-xs font-bold text-slate-500 uppercase">Liên hệ</th>
                  <th className="py-3 px-3.5 text-xs font-bold text-slate-500 uppercase">Công việc</th>
                  <th className="py-3 px-3.5 text-xs font-bold text-slate-500 uppercase">Trạng thái</th>
                  <th className="py-3 px-3.5 text-xs font-bold text-slate-500 uppercase">Data</th>
                  <th className="py-3 px-3.5 text-xs font-bold text-slate-500 uppercase text-center w-36">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => {
                  const profile = profileOf(emp);
                  const work = profile.workHistory?.[0] || {};
                  return (
                    <React.Fragment key={emp.id}>
                      <tr className={`hover:bg-slate-50/50 transition ${activeDropdownId === emp.id ? 'bg-slate-50/50' : ''}`}>
                        <td className="py-3 px-3.5 align-middle text-center">
                          <input
                            type="checkbox"
                            checked={selectedEmployeeIds.includes(emp.id)}
                            onChange={() => handleSelectEmployee(emp.id)}
                            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-3.5 align-top">
                          <div className="flex items-center gap-3">
                            {profile.avatarUrl ? (
                              <img src={profile.avatarUrl} alt={emp.fullName} className="w-11 h-11 rounded-full object-cover border border-slate-200" />
                            ) : (
                              <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold">
                                {employeeInitial(emp)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 text-sm">{emp.fullName}</p>
                              <p className="text-xs text-slate-500">Mã NV: {emp.employeeId || emp.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3.5 align-top">
                          <p className="text-sm text-slate-700 flex items-center"><Mail className="w-3.5 h-3.5 mr-1 text-slate-400" />{valueOrDash(emp.email)}</p>
                          <p className="text-sm text-slate-700 flex items-center mt-1"><Phone className="w-3.5 h-3.5 mr-1 text-slate-400" />{valueOrDash(emp.phone)}</p>
                        </td>
                        <td className="py-3 px-3.5 align-top">
                          <p className="text-sm font-semibold text-slate-700">{valueOrDash(profile.dept || emp.department)}</p>
                          <p className="text-xs text-slate-500">{valueOrDash(profile.job || emp.job)}</p>
                        </td>
                        <td className="py-3 px-3.5 align-top">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            emp.active ? 'bg-primary-50 text-primary-700 border-primary-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            {emp.active ? 'Đang hoạt động' : 'Bị khóa'}
                          </span>
                          <p className="text-xs text-slate-500 mt-1">{valueOrDash(profile.status)}</p>
                        </td>
                        <td className="py-3 px-3.5 align-top">
                          <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-800 text-xs font-extrabold border border-slate-200">
                            {emp.assignedDataCount} data
                          </span>
                        </td>
                        <td className="py-3 px-3.5 align-top whitespace-nowrap text-center">
                          <button
                            onClick={() => setExpandedEmployeeId(expandedEmployeeId === emp.id ? null : emp.id)}
                            className="inline-flex items-center px-3 py-1.5 mr-2 text-xs font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-100 rounded-lg transition"
                          >
                            {expandedEmployeeId === emp.id ? 'Ẩn' : 'Chi tiết'}
                          </button>
                          <button
                            onClick={(e) => handleDropdownToggle(e, emp)}
                            className="inline-flex items-center p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                            title="Hành động"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                      {expandedEmployeeId === emp.id && (
                      <tr className="bg-slate-50/70">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                            <DetailItem label="Giới tính" value={profile.gender} />
                            <DetailItem label="Ngày sinh" value={profile.dob} />
                            <DetailItem label="CCCD" value={profile.cccd} />
                            <DetailItem label="Ngày cấp CCCD" value={profile.cccdIssueDate} />
                            <DetailItem label="Nơi cấp CCCD" value={profile.cccdIssuePlace} />
                            <DetailItem label="Loại hợp đồng" value={profile.contractType} />
                            <DetailItem label="Ngày bắt đầu" value={profile.start} />
                            <DetailItem label="Kết thúc intern" value={profile.endIntern} />
                            <DetailItem label="Ngày nghỉ việc" value={profile.resignDate} />
                            <DetailItem label="Trường đại học" value={profile.university} />
                            <DetailItem label="Ngân hàng" value={profile.bankName} />
                            <DetailItem label="Số tài khoản" value={profile.bankAccount} />
                            <DetailItem label="Địa chỉ hiện tại" value={joinAddress(profile.currentAddress)} />
                            <DetailItem label="Quê quán" value={joinAddress(profile.hometown)} />
                            <DetailItem label="Lịch sử làm việc" value={[work.position, work.startDate, work.endDate].filter(Boolean).join(' - ')} />
                            <DetailItem label="Ghi chú" value={profile.note} />
                          </div>
                          {(profile.galleryImages?.[0] || profile.galleryImages?.[1]) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 max-w-xl">
                              {profile.galleryImages?.[0] && (
                                <div className="rounded-lg border border-slate-100 bg-white p-3">
                                  <p className="text-[10px] font-extrabold uppercase text-slate-400 mb-2">CCCD mặt trước</p>
                                  <img src={profile.galleryImages[0]} alt="CCCD mặt trước" className="h-32 w-full object-cover rounded-lg border border-slate-200" />
                                </div>
                              )}
                              {profile.galleryImages?.[1] && (
                                <div className="rounded-lg border border-slate-100 bg-white p-3">
                                  <p className="text-[10px] font-extrabold uppercase text-slate-400 mb-2">CCCD mặt sau</p>
                                  <img src={profile.galleryImages[1]} alt="CCCD mặt sau" className="h-32 w-full object-cover rounded-lg border border-slate-200" />
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={currentEmployee ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'}
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-5 max-h-[72vh] overflow-y-auto pr-1">
          {formErrors.server && (
            <div className="flex items-center p-3 bg-red-50 text-red-700 rounded-lg text-xs border border-red-100">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span>{formErrors.server}</span>
            </div>
          )}

          <div className="space-y-3">
            <SectionTitle>Thông tin cơ bản</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Mã nhân viên / Username" required disabled={!!currentEmployee} value={formData.username} error={formErrors.username} onChange={(value) => updateField('username', value)} placeholder="2026061034" />
              <Field label="Họ tên" required value={formData.fullName} error={formErrors.fullName} onChange={(value) => updateField('fullName', value)} />
              <div className="md:col-span-3">
                <ImageUploadField label="Ảnh đại diện nhân viên" value={formData.avatarUrl} uploading={uploadingField === 'avatarUrl'} onUpload={(file) => uploadImage('avatarUrl', file)} isAvatar={true} />
              </div>
              <Field label="Số điện thoại" required value={formData.phone} error={formErrors.phone} onChange={(value) => updateField('phone', value)} />
              <Field label="Email" required type="email" value={formData.email} error={formErrors.email} onChange={(value) => updateField('email', value)} />
              <Field label="Giới tính" value={formData.gender} onChange={(value) => updateField('gender', value)} />
              <Field label="Ngày sinh" type="date" value={formData.dob} error={formErrors.dob} onChange={(value) => updateField('dob', value)} />
              <Field label="CCCD" value={formData.cccd} error={formErrors.cccd} onChange={(value) => updateField('cccd', value)} />
              <Field label="Ngày cấp CCCD" type="date" value={formData.cccdIssueDate} error={formErrors.cccdIssueDate} onChange={(value) => updateField('cccdIssueDate', value)} />
              <Field label="Nơi cấp CCCD" value={formData.cccdIssuePlace} onChange={(value) => updateField('cccdIssuePlace', value)} />
            </div>
          </div>

          <div className="space-y-3">
            <SectionTitle>Công việc</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Phòng ban" required value={formData.dept} error={formErrors.dept} onChange={(value) => updateField('dept', value)} />
              <Field label="Chức vụ" required value={formData.job} error={formErrors.job} onChange={(value) => updateField('job', value)} />
              <Field label="Loại hợp đồng" value={formData.contractType} onChange={(value) => updateField('contractType', value)} />
              <Field label="Trạng thái" required value={formData.status} error={formErrors.status} onChange={(value) => updateField('status', value)} />
              <Field label="Ngày bắt đầu" required type="date" value={formData.start} error={formErrors.start} onChange={(value) => updateField('start', value)} />
              <Field label="Kết thúc intern" type="date" value={formData.endIntern} onChange={(value) => updateField('endIntern', value)} />
              <Field label="Ngày nghỉ việc" type="date" value={formData.resignDate} onChange={(value) => updateField('resignDate', value)} />
            </div>
          </div>

          <div className="space-y-3">
            <SectionTitle>Học vấn và ngân hàng</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Trường đại học" value={formData.university} onChange={(value) => updateField('university', value)} />
              <Field label="Ngân hàng" value={formData.bankName} onChange={(value) => updateField('bankName', value)} />
              <Field label="Số tài khoản" value={formData.bankAccount} error={formErrors.bankAccount} onChange={(value) => updateField('bankAccount', value)} />
            </div>
          </div>

          {renderAddressFields('currentAddress', 'Địa chỉ hiện tại')}
          {renderAddressFields('hometown', 'Quê quán')}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ImageUploadField label="CCCD mặt trước" value={formData.cccdFrontUrl} uploading={uploadingField === 'cccdFrontUrl'} onUpload={(file) => uploadImage('cccdFrontUrl', file)} />
            <ImageUploadField label="CCCD mặt sau" value={formData.cccdBackUrl} uploading={uploadingField === 'cccdBackUrl'} onUpload={(file) => uploadImage('cccdBackUrl', file)} />
          </div>

          <div className="grid grid-cols-1 gap-3">
            <TextAreaField label="Ghi chú" value={formData.note} onChange={(value) => updateField('note', value)} rows={4} />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg font-semibold text-slate-600 text-sm transition">
              Hủy
            </button>
            <button type="submit" disabled={formSubmitLoading} className="flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-bold text-sm shadow-md transition disabled:opacity-50">
              {formSubmitLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Lưu nhân viên
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Xác nhận xóa nhân viên" size="sm">
        {currentEmployee && (
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>Xóa nhân viên sẽ thu hồi toàn bộ data đã giao cho họ.</span>
            </div>
            <p className="text-slate-600 text-sm">
              Bạn có chắc chắn muốn xóa tài khoản nhân viên <strong>{currentEmployee.fullName}</strong> ({currentEmployee.username})?
            </p>
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg font-semibold text-slate-600 text-sm transition">
                Hủy
              </button>
              <button type="button" onClick={handleDeleteConfirm} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm shadow-md transition">
                Xác nhận xóa
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Import nhân viên từ CSV, Excel hoặc JSON" size="lg">
        <div className="space-y-4 text-slate-800">
          {/* Tabs header */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => {
                setImportTab('file');
                setImportResult(null);
              }}
              className={`flex-1 py-2 text-center text-sm font-bold border-b-2 transition ${
                importTab === 'file'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              📁 Nhập từ file (CSV, Excel, JSON)
            </button>
            <button
              type="button"
              onClick={() => {
                setImportTab('text');
                setImportResult(null);
              }}
              className={`flex-1 py-2 text-center text-sm font-bold border-b-2 transition ${
                importTab === 'text'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              ✍️ Dán nội dung JSON
            </button>
          </div>

          <form onSubmit={handleImportSubmit} className="space-y-4">
            {importTab === 'file' ? (
              <>
                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-lg space-y-3">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Hỗ trợ file CSV, Excel (.xlsx, .xls) hoặc JSON (.json). Cột/Thuộc tính hỗ trợ: Họ tên, Email, Username, Số điện thoại, Phòng ban, Mật khẩu.
                  </p>
                  <div className="flex gap-4">
                    <button type="button" onClick={handleDownloadSampleEmployeeCSV} className="inline-flex items-center text-xs text-primary-600 font-bold hover:underline text-left">
                      <Download className="w-3.5 h-3.5 mr-1" /> Tải file CSV mẫu
                    </button>
                    <button type="button" onClick={handleDownloadSampleEmployeeJSON} className="inline-flex items-center text-xs text-primary-600 font-bold hover:underline text-left">
                      <Download className="w-3.5 h-3.5 mr-1" /> Tải file JSON mẫu
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Chọn file *</label>
                  <input
                    type="file"
                    accept=".csv, .xlsx, .xls, .json"
                    required
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-lg space-y-3">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Dán mảng danh sách nhân viên dạng JSON trực tiếp vào ô nhập liệu dưới đây.
                  </p>
                  <button type="button" onClick={handleDownloadSampleEmployeeJSON} className="inline-flex items-center text-xs text-primary-600 font-bold hover:underline text-left">
                    <Download className="w-3.5 h-3.5 mr-1" /> Xem mẫu JSON
                  </button>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Nội dung JSON *</label>
                  <textarea
                    rows={8}
                    value={pastedJsonText}
                    onChange={(e) => {
                      setPastedJsonText(e.target.value);
                      setJsonTextError('');
                    }}
                    placeholder={`[\n  {\n    "id": "2026061034",\n    "name": "Ngô Trần Văn Điềm",\n    "email": "vandiem2004@gmail.com",\n    "phone": "0398752911",\n    "dept": "Kỹ thuật"\n  }\n]`}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-y"
                  />
                  {jsonTextError && <p className="text-red-500 text-xs mt-1 font-bold">{jsonTextError}</p>}
                </div>
              </>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => { setIsImportModalOpen(false); setPastedJsonText(''); setJsonTextError(''); }} className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg font-semibold text-slate-600 text-sm transition">
                Hủy
              </button>
              <button type="submit" disabled={importLoading || (importTab === 'file' ? !selectedFile : !pastedJsonText.trim())} className="flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-bold text-sm shadow-md transition disabled:opacity-50">
                {importLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Bắt đầu Import
              </button>
            </div>
          </form>
          {importResult && (
            <div className="border-t border-slate-100 pt-4 space-y-4">
              <h4 className="text-sm font-bold text-slate-800">Kết quả Import:</h4>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100"><span className="block text-slate-400 font-semibold uppercase text-[10px]">Tổng dòng</span><span className="text-sm font-bold text-slate-800">{importResult.totalRows}</span></div>
                <div className="bg-emerald-50 text-emerald-800 p-2 rounded-lg border border-emerald-100"><span className="block text-emerald-400 font-semibold uppercase text-[10px]">Thành công</span><span className="text-sm font-bold">{importResult.successCount}</span></div>
                <div className="bg-amber-50 text-amber-800 p-2 rounded-lg border border-amber-100"><span className="block text-amber-400 font-semibold uppercase text-[10px]">Bỏ qua</span><span className="text-sm font-bold">{importResult.skippedNotMarketing}</span></div>
                <div className="bg-red-50 text-red-800 p-2 rounded-lg border border-red-100"><span className="block text-red-400 font-semibold uppercase text-[10px]">Thất bại</span><span className="text-sm font-bold">{importResult.failedCount}</span></div>
              </div>
              {importResult.errors && importResult.errors.length > 0 && (
                <div className="bg-red-50 text-red-800 p-3 rounded-lg border border-red-100 text-xs space-y-1 max-h-40 overflow-y-auto font-medium">
                  <p className="font-bold mb-1">Chi tiết lỗi:</p>
                  {importResult.errors.map((err, idx) => (
                    <p key={idx}>- Mục {err.row}: {err.message}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      <Modal isOpen={isImportAccountsModalOpen} onClose={() => setIsImportAccountsModalOpen(false)} title="Import tài khoản từ JSON" size="lg">
        <div className="space-y-4 text-slate-800">
          {/* Tabs header */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => {
                setAccountsImportTab('file');
                setAccountsImportResult(null);
              }}
              className={`flex-1 py-2 text-center text-sm font-bold border-b-2 transition ${
                accountsImportTab === 'file'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              📁 Nhập từ file JSON
            </button>
            <button
              type="button"
              onClick={() => {
                setAccountsImportTab('text');
                setAccountsImportResult(null);
              }}
              className={`flex-1 py-2 text-center text-sm font-bold border-b-2 transition ${
                accountsImportTab === 'text'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              ✍️ Dán nội dung JSON
            </button>
          </div>

          <form onSubmit={handleAccountsImportSubmit} className="space-y-4">
            {accountsImportTab === 'file' ? (
              <>
                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-lg space-y-3">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Hỗ trợ tải lên file chứa thông tin tài khoản dạng JSON (.json) với cấu trúc các tài khoản được liên kết theo tên đăng nhập.
                  </p>
                  <button type="button" onClick={handleDownloadSampleAccountsJSON} className="inline-flex items-center text-xs text-primary-600 font-bold hover:underline text-left">
                    <Download className="w-3.5 h-3.5 mr-1" /> Tải file JSON tài khoản mẫu
                  </button>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Chọn file JSON *</label>
                  <input
                    type="file"
                    accept=".json"
                    required
                    onChange={(e) => setAccountsSelectedFile(e.target.files[0])}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-lg space-y-3">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Dán đối tượng JSON chứa thông tin tài khoản trực tiếp vào ô nhập liệu dưới đây.
                  </p>
                  <button type="button" onClick={handleDownloadSampleAccountsJSON} className="inline-flex items-center text-xs text-primary-600 font-bold hover:underline text-left">
                    <Download className="w-3.5 h-3.5 mr-1" /> Xem mẫu JSON
                  </button>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Nội dung JSON tài khoản *</label>
                  <textarea
                    rows={8}
                    value={pastedAccountsJsonText}
                    onChange={(e) => {
                      setPastedAccountsJsonText(e.target.value);
                      setAccountsJsonTextError('');
                    }}
                    placeholder={`{\n  "2026061034": {\n    "createdAt": 1781066218478,\n    "password": "1234",\n    "role": "employee",\n    "username": "2026061034"\n  }\n}`}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-y"
                  />
                  {accountsJsonTextError && <p className="text-red-500 text-xs mt-1 font-bold">{accountsJsonTextError}</p>}
                </div>
              </>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => { setIsImportAccountsModalOpen(false); setPastedAccountsJsonText(''); setAccountsJsonTextError(''); }} className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg font-semibold text-slate-600 text-sm transition">
                Hủy
              </button>
              <button type="submit" disabled={accountsImportLoading || (accountsImportTab === 'file' ? !accountsSelectedFile : !pastedAccountsJsonText.trim())} className="flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-bold text-sm shadow-md transition disabled:opacity-50">
                {accountsImportLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Bắt đầu Import tài khoản
              </button>
            </div>
          </form>
          {accountsImportResult && (
            <div className="border-t border-slate-100 pt-4 space-y-4">
              <h4 className="text-sm font-bold text-slate-800">Kết quả Import tài khoản:</h4>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100"><span className="block text-slate-400 font-semibold uppercase text-[10px]">Tổng tài khoản</span><span className="text-sm font-bold text-slate-800">{accountsImportResult.totalRows}</span></div>
                <div className="bg-emerald-50 text-emerald-800 p-2 rounded-lg border border-emerald-100"><span className="block text-emerald-400 font-semibold uppercase text-[10px]">Thành công</span><span className="text-sm font-bold">{accountsImportResult.successCount}</span></div>
                <div className="bg-red-50 text-red-800 p-2 rounded-lg border border-red-100"><span className="block text-red-400 font-semibold uppercase text-[10px]">Thất bại</span><span className="text-sm font-bold">{accountsImportResult.failedCount}</span></div>
              </div>
              {accountsImportResult.errors && accountsImportResult.errors.length > 0 && (
                <div className="bg-red-50 text-red-800 p-3 rounded-lg border border-red-100 text-xs space-y-1 max-h-40 overflow-y-auto font-medium">
                  <p className="font-bold mb-1">Chi tiết lỗi:</p>
                  {accountsImportResult.errors.map((err, idx) => (
                    <p key={idx}>- Dòng {err.row}: {err.message}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {activeDropdownId && activeDropdownRecord && (
        <>
          <div className="fixed inset-0 z-40 bg-transparent" onClick={() => {
            setActiveDropdownId(null);
            setActiveDropdownRecord(null);
          }} />
          <div className="fixed w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-100 text-left" style={{ top: `${dropdownPos.top}px`, left: `${dropdownPos.left}px` }}>
            <div className="py-1">
              <button
                onClick={() => {
                  const emp = activeDropdownRecord;
                  setActiveDropdownId(null);
                  setActiveDropdownRecord(null);
                  handleLockToggle(emp);
                }}
                className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center transition"
              >
                {activeDropdownRecord.active ? <Lock className="w-4.5 h-4.5 mr-2 text-slate-400" /> : <Unlock className="w-4.5 h-4.5 mr-2 text-slate-400" />}
                {activeDropdownRecord.active ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
              </button>
              <button
                onClick={() => {
                  const emp = activeDropdownRecord;
                  setActiveDropdownId(null);
                  setActiveDropdownRecord(null);
                  openEditModal(emp);
                }}
                className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center transition"
              >
                <Edit3 className="w-4.5 h-4.5 mr-2 text-slate-400" />
                Sửa thông tin
              </button>
              <hr className="border-slate-100 my-1" />
              <button
                onClick={() => {
                  const emp = activeDropdownRecord;
                  setActiveDropdownId(null);
                  setActiveDropdownRecord(null);
                  openDeleteModal(emp);
                }}
                className="w-full px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 flex items-center transition font-semibold"
              >
                <Trash2 className="w-4.5 h-4.5 mr-2 text-primary-500" />
                Xóa tài khoản
              </button>
            </div>
          </div>
        </>
      )}

      <Modal isOpen={isBulkDeleteModalOpen} onClose={() => setIsBulkDeleteModalOpen(false)} title="Xác nhận xóa hàng loạt nhân viên" size="sm">
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>Hành động này sẽ xóa {selectedEmployeeIds.length} nhân viên đã chọn và thu hồi toàn bộ data của họ.</span>
          </div>
          <p className="text-slate-600 text-sm">
            Bạn có chắc chắn muốn xóa tất cả nhân viên đã chọn?
          </p>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsBulkDeleteModalOpen(false)} className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg font-semibold text-slate-600 text-sm transition">
              Hủy
            </button>
            <button type="button" disabled={bulkDeleteLoading} onClick={handleBulkDeleteConfirm} className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm shadow-md transition disabled:opacity-50">
              {bulkDeleteLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Xác nhận xóa
            </button>
          </div>
        </div>
      </Modal>

      {notification && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center p-4 rounded-lg shadow-lg border transition animate-in slide-in-from-bottom duration-300 ${
          notification.type === 'error' ? 'bg-red-50 text-red-800 border-red-100' : 'bg-primary-50 text-primary-800 border-primary-100'
        }`}>
          <Info className="w-5 h-5 mr-2" />
          <span className="text-sm font-semibold">{notification.message}</span>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
