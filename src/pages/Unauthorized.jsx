import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoHome = () => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'ROLE_ADMIN') {
      navigate('/admin');
    } else {
      navigate('/employee');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 text-red-500 mb-6">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Không có quyền truy cập</h1>
        <p className="text-slate-500 text-sm mb-6">
          Bạn không có quyền truy cập vào trang này. Vui lòng quay lại hoặc liên hệ quản trị viên để biết thêm chi tiết.
        </p>
        <button
          onClick={handleGoHome}
          className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 transition duration-200"
        >
          Quay lại trang chủ
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
